import { NextApiRequest } from "next";
import { NextResponse } from "next/server";

import { ReadStream } from "@/app/lib/streamReader";
import { Samplepaper } from "@/app/lib/models/mongoose_models/problem";
import { User } from "@/app/lib/models/mongoose_models/user";
import dbconnect from "@/app/lib/db";
import { verifyToken } from "@/app/lib/middleware/verifyToken";
import { errorHandler } from "@/app/lib/middleware/errorhandler";
import { BadRequest, Unauthorized } from "../../responses/errors";

export const POST = errorHandler(async(req:NextApiRequest)=>{

        const token = req.cookies._parsed.get('authToken').value;
        if(!token) {
            throw new Unauthorized("Unauthorized access");
        }
        
        const secretKey = process.env.SECRET_KEY;
        if(!secretKey){
            throw new Error("Secret key is not defined");
        }
        const decoded = await verifyToken(token);
        
        const data = await ReadStream(req.body);
        const {title, questions, correctAnswer, passingMark} = data;
        
        await dbconnect();
        const user = await User.findOne({username:decoded?.username}).select("role isverified isdeleted");

        if(user.role !== "guardian"){
            throw new BadRequest("you do not have the authority for this action")
        }

        if(!user ){
            throw new BadRequest("No user with such user exists ")
        }

        if(!user.isverified ){
            throw new BadRequest("You are not verified")
        }

        if(user.isdeleted ){
            throw new BadRequest("What are you trying to acheive here rise from dead?")
        }
        
        let totalScore = 0;
        
        questions.map((i)=>totalScore +=i.score);

        const samplepaper = new Samplepaper({
            title,
            questions,
            totalScore,
            createdBy:user._id,
            correctAnswer,
            passingPercent:passingMark
        })

        const paper = await samplepaper.save();
        await User.updateOne({username:decoded?.username},{$push:{samplePapers:paper._id}})

        return NextResponse.json({
            message:"sample paper created successfully",
            success:true
        },{status:201})
})