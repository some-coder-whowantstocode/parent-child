import { errorHandler } from "@/app/lib/middleware/errorhandler";
import { NextApiRequest } from "next";
import { cookies } from "next/headers";
import { BadRequest, NotFound, Unauthorized } from "../../../responses/errors/index";
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

    
    const userdata = await User.aggregate([
        {$match:{}}
    ])

    if(!userdata){
        throw new NotFound("No such user exists")
    }
    

    return NextResponse.json({success:true,user:userdata},{status:200})
})