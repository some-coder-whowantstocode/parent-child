import { NextApiRequest } from "next";
import { NextResponse } from "next/server";
import jwt from 'jsonwebtoken';

import { ReadStream } from "@/app/lib/streamReader";
import { Samplepaper } from "@/app/lib/models/mongoose_models/problem";
import { Guardian } from "@/app/lib/models/mongoose_models/user";
import dbconnect from "@/app/lib/db";

export async function POST(req:NextApiRequest){
    try {
        const data = await ReadStream(req.body);
        const {title, questions} = data;
        const token = req.cookies._parsed.get('authToken');
        if(!token) {
            return NextResponse.json({
                err:"Unauthorized access"
            },{status:401})
        }
        
        const secretKey = process.env.SECRET_KEY;
        if(!secretKey){
            throw new Error("Secret key is not defined");
        }
        const decoded = await jwt.verify(token.value, secretKey);
        const { email } = decoded;

        await dbconnect();
        const user = await Guardian.findOne({email});

        if(!user || !user.isverified){
            return NextResponse.json({
                err:"No user with such user exists or user is not verified yet"
            },{status:400})
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

        const paper = await samplepaper.save();
        await Guardian.updateOne({email},{$push:{samplePapers:paper._id}})

        return NextResponse.json({
            message:"sample paper created successfully"
        },{status:201})
    } catch (error) {
        return NextResponse.json({
            err:error.message ? error.message :"something went wrong "
        },{status:500})
    }
}