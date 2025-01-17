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

        const isobjectid = mongoose.Types.ObjectId.isValid(identifier);
        let issame = false;

        if(!isobjectid){
            return NextResponse.json({err:"invalid identifier"},{status:400});
        }

        issame = identifier === decoded.id;
        console.log(identifier,decoded)

        if (issame) {
            return NextResponse.json(
                {
                    err: "What are you doing? trying to connect your self ?",
                },
                { status: 400 }
            );
        }

        await dbconnect();

        const removefromlreqd = await User.updateOne({_id:identifier},{$pull:{connectionRequested:{id:decoded.id}}});  
        
        if(removefromlreqd.modifiedCount == 0){
            return NextResponse.json(
                {
                    err: "Invalid action.",
                },
                { status: 400 }
            );
        }

        await User.updateOne({_id:identifier},{$addToSet:{Connections:decoded.id}});

        await User.updateOne({_id:decoded.id},{$pull:{connectionRequests:identifier}, $addToSet:{Connections:{id:identifier}}});  

        return NextResponse.json(
            {
                message: "connection accepted",
            },
            { status: 200 }
        );



    } catch (error) {
        return NextResponse.json(
            {
                err: error.message || "Something went wrong",
            },
            { status: 500 }
        );
    }
}
