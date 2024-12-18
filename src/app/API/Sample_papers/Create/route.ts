import { NextApiRequest } from "next";
import { NextResponse } from "next/server";

import { ReadStream } from "@/app/lib/streamReader";
import { Samplepaper } from "@/app/lib/models/mongoose_models/problem";
import { User } from "@/app/lib/models/mongoose_models/user";
import dbconnect from "@/app/lib/db";
import { verifyToken } from "@/app/lib/middleware/verifyToken";

export async function POST(req:NextApiRequest){
    try {

        const token = req.cookies._parsed.get('authToken').value;
        if(!token) {
            return NextResponse.json({
                err:"Unauthorized access"
            },{status:401})
        }
        
        const secretKey = process.env.SECRET_KEY;
        if(!secretKey){
            throw new Error("Secret key is not defined");
        }
        const decoded = await verifyToken(token);
        
        const data = await ReadStream(req.body);
        const {title, questions, correctAnswer} = data;
            
        if(!title || !questions){
            return NextResponse.json({
                err:"title and questions are required"
            },{status:400})
        }

        await dbconnect();
        const user = await User.findOne({username:decoded?.username}).select("role isverified isdeleted");

        if(user.role !== "guardian"){
            return NextResponse.json({
                err:"you do not have the authority for this action"
            },{status:400})
        }

        if(!user ){
            return NextResponse.json({
                err:"No user with such user exists "
            },{status:400})
        }

        if(!user.isverified ){
            return NextResponse.json({
                err:"You are not verified"
            },{status:400})
        }

        if(user.isdeleted ){
            return NextResponse.json({
                err:"What are you trying to acheive here rise from dead?"
            },{status:400})
        }
        
        let totalScore = 0;
        
        questions.map((i)=>totalScore +=i.score);

        const samplepaper = new Samplepaper({
            title,
            questions,
            totalScore,
            createdBy:user._id,
            correctAnswer
        })

        const paper = await samplepaper.save();
        await User.updateOne({username:decoded?.username},{$push:{samplePapers:paper._id}})

        return NextResponse.json({
            message:"sample paper created successfully"
        },{status:201})
    } catch (error) {
        return NextResponse.json({
            err:error.message ? error.message :"something went wrong "
        },{status:500})
    }
}