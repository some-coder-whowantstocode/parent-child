"use server";
import { NextApiRequest } from "next";
import { NextResponse } from "next/server";
import { ReadStream } from "@/app/lib/streamReader";
import { User } from "@/app/lib/models/mongoose_models/user";
import mongoose from "mongoose";
import { verifyToken } from "@/app/lib/middleware/verifyToken";
import dbconnect from "@/app/lib/db";
import { errorHandler } from "@/app/lib/middleware/errorhandler";

export const POST = errorHandler(async(req: NextApiRequest)=> {
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

        let query: {
            email?: string;
            _id?: string;
            username?: string;
            id?: string;
            verificationToken?: string;
            tokenExpires?: object;
        };
        const regex =
            /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/g;
        const isEmail = regex.test(identifier);
        const isobjectid = mongoose.Types.ObjectId.isValid(identifier);
        let issame = false;
        if (isEmail) {
            query = { email: identifier };
            issame = identifier === decoded.email;
        } else if (isobjectid) {
            query = { _id: identifier };
            issame = identifier === decoded._id;
        } else {
            query = { username: identifier };
            console.log(identifier, decoded.username)
            issame = identifier === decoded.username;
        }

        if (issame) {
            return NextResponse.json(
                {
                    err: "What are you doing? trying to connect your self ?",
                },
                { status: 400 }
            );
        }

        await dbconnect();

        let updated;
        query.connectionRequested = { $nin: [ decoded.id ] };
        query.connectionRequests = { $nin: [decoded.id ] };
        query.Connections = { $nin: [decoded.id ] };
        const user = await User.findOne(query).select("_id");
        if(!user){
            return NextResponse.json(
                {
                    err: "The person you are trying to connect does not exist.",
                },
                { status: 400 }
            );
        }
        updated = await User.updateOne(query, {
            $addToSet: {
                connectionRequested: decoded.id ,
            },
        });

        if (!updated.acknowledged || updated.matchedCount === 0) {
            return NextResponse.json(
                {
                    err: "unsuccessful requeset.",
                },
                { status: 404 }
            );
        }
        
            await User.updateOne(
                { email: decoded.email },
                { $push: { connectionRequests:  user._id  } }
            );

        return NextResponse.json(
            {
                msg: "Connection request sent",
            },
            { status: 200 }
        );

   
})

