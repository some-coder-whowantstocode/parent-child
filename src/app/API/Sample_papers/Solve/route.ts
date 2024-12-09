import { NextApiRequest } from "next";
import { NextResponse } from "next/server";
import jwt from 'jsonwebtoken';

import { ReadStream } from "@/app/lib/streamReader";
import { Samplepaper } from "@/app/lib/models/mongoose_models/problem";
import { Child } from "@/app/lib/models/mongoose_models/user";

export async function POST(req:NextApiRequest){
    try {
        const data = await ReadStream(req.body);
        const {questionid, answers, timeSpent} = data;
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

        const user = await Child.findOne({email});

        if(!user){
            return NextResponse.json({
                err:"Unauthorized access"
            },{status:401})
        }

        const question = await Samplepaper.exists({_id:questionid});

        if(!question){
            return NextResponse.json({
                err:"NO such question exists"
            },{status:400})
        }

        if(!questionid || !answers || !timeSpent){
            return NextResponse.json({
                err:"questionid, timeSpent and answers are required"
            },{status:400})
        }

        const samplepaper = new Samplepaper({
            child: user._id,
            samplePaper:questionid,
            answers,
            timeSpent
        })

        samplepaper.save();

        return NextResponse.json({
            message:"answer submitted successfully"
        },{status:201})
    } catch (error) {
        return NextResponse.json({
            err:"something went wrong "
        },{status:500})
    }
}