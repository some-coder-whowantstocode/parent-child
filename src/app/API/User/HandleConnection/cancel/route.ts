"use server";
import { NextApiRequest } from "next";
import { NextResponse } from "next/server";
import { ReadStream } from "@/app/lib/streamReader";
import { User } from "@/app/lib/models/mongoose_models/user";
import mongoose from "mongoose";
import { verifyToken } from "@/app/lib/middleware/verifyToken";
import dbconnect from "@/app/lib/db";

export async function POST(req: NextApiRequest) {
    try {
        const token = req.cookies._parsed.get("authToken").value;
        if (!token) {
            return NextResponse.json(
                {
                    err: "Unauthorized access",
                },
                { status: 401 }
            );
        }
        const secretKey = process.env.SECRET_KEY;
        if (!secretKey) {
            throw new Error("Secret key is not defined");
        }

        const decoded = await verifyToken(token);
        if (!decoded) {
            return NextResponse.json(
                {
                    err: "invalid token",
                },
                { status: 401 }
            );
        }

        const data = await ReadStream(req.body);
        const { identifier, action } = data;
        if (!identifier || !action) {
            return NextResponse.json(
                {
                    err: "identifier and action are required!",
                },
                { status: 400 }
            );
        }

        let issame = false;
        const isobjectid = mongoose.Types.ObjectId.isValid(identifier);
       
        if(!isobjectid){
            return NextResponse.json({err:"invalid identifier"},{status:400});
        }
        
        issame = identifier === decoded._id;
        if (issame) {
            return NextResponse.json(
                {
                    err: "What are you doing? trying to connect your self ?",
                },
                { status: 400 }
            );
        }

        await dbconnect();

        const user = await User.updateOne({_id:identifier},{$pull:{connectionRequested:decoded.id}});
        if(!user ||user.modifiedCount == 0){
            return NextResponse.json({err:"Invalid request"},{status:400});
        }

        const requestor = await User.updateOne({_id:decoded.id},{$pull:{connectionRequests:identifier}});

        return NextResponse.json({message:"connection request canceled"},{status:200})

    } catch (error) {
        return NextResponse.json(
            {
                err: error.message || "Something went wrong",
            },
            { status: 500 }
        );
    }
}
