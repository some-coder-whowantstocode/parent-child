import { NextApiRequest } from "next";
import { NextResponse } from "next/server";
import jwt from 'jsonwebtoken';

import { ReadStream } from "@/app/lib/streamReader";
import { Samplepaper } from "@/app/lib/models/mongoose_models/problem";
import { Guardian } from "@/app/lib/models/mongoose_models/user";

export async function POST(req:NextApiRequest){
    try {
        const data = await ReadStream(req.body);
        const {title, questions} = data;
        const token = req.cookies.authToken;
        if(!token) {
            return NextResponse.json({
                err:"Unauthorized access"
            },{status:401})
        }
        
        const secretKey = process.env.SECRET_KEY;
        if(!secretKey){
            throw new Error("Secret key is not defined");
        }
        const decoded = await jwt.verify(token, secretKey);
        const { email } = decoded;

        const user = await Guardian.findOne({email});

        if(!user){
            return NextResponse.json({
                err:"Unauthorized access"
            },{status:401})
        }

        if(!title || !questions){
            return NextResponse.json({
                err:"title and questions are required"
            },{status:400})
        }

        const samplepaper = new Samplepaper({
            title,
            questions,
            createdBy:user._id
        })

        samplepaper.save();

        return NextResponse.json({
            message:"sample paper created successfully"
        },{status:201})
    } catch (error) {
        return NextResponse.json({
            err:"something went wrong "
        },{status:500})
    }
}