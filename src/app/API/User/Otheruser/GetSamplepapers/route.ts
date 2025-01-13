import { errorHandler } from "@/app/lib/middleware/errorhandler";
import { NextApiRequest } from "next";
import { cookies } from "next/headers";
import { BadRequest, NotFound, Unauthorized } from "../../../responses/errors";
import { verifyToken } from "@/app/lib/middleware/verifyToken";
import dbconnect from "@/app/lib/db";
import { User } from "@/app/lib/models/mongoose_models/user";
import { NextResponse } from "next/server";

export const GET = errorHandler(async(req:NextApiRequest)=>{
    const cookie = await cookies();
    // const token = cookie.get("authToken")?.value;
    const user = new URL(req.url||"").searchParams.get('u');
    // // console.log(url)
    // if(!user){
    //     throw new BadRequest('No user was found you need to add u parameter in the url with username')
    // }
    

    // if(!token){
    //     throw new Unauthorized("Please log in to access this information")
    // }

    // await verifyToken(token);
    
    await dbconnect();

    
    const samplepaper = await User.aggregate([
        {$match:{username:user}},
        {$project:{$slice:["samplePapers",10],"isdeleted":1}},
        {$lookup:{
            from:"samplepapers",
            localField:"samplePapers",
            foreignField:"_id",
            as:"samplePapers"
        }},
        {$project:{
            "samplePapers.title":1,
            "samplePapers.createdAt":1,
            "samplePapers.isdeleted":1,
            "isdeleted":1
        }}
    ])
    
    await User.findOne({username:user}).select("username role isdeleted connectionCount samplePaperCount activityCount")

    if(!samplepaper[0]){
        throw new NotFound("No such user exists")
    }
    

    return NextResponse.json({success:true,samplepapers:samplepaper[0]},{status:200})
})