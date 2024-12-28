import { BadRequest } from "@/app/API/responses/errors";
import { errorHandler } from "@/app/lib/middleware/errorhandler";
import { verifyToken } from "@/app/lib/middleware/verifyToken";
import { User } from "@/app/lib/models/mongoose_models/user";
import { Connection } from "mongoose";
import { NextApiRequest } from "next";
import { NextResponse } from "next/server";

export const GET =  errorHandler(
    async function GET(req: NextApiRequest) {
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
       

        const requrl = new URL(req.url);
        const page = Math.floor(Math.max(Number(requrl.searchParams.get('page')) || 1,1));
        const limit = Math.abs(Number(requrl.searchParams.get('limit') || 10));
        const skip = ((page -1 ) * limit);
        console.log(skip)

        const userdata = await User.aggregate([
            {$match:{username:decoded.username}},
            {$project:{Connections:{$slice:['$Connections',skip,limit]}, isdeleted:1, isverified:1}},
            {$lookup:{from:"User",localField:"Connections",foreignField:'_id',as:'Connections'}},
            {$project:{Connections:{username:1},isdeleted:1,isverified:1}}
        ])

        const user = userdata[0]

        console.log(user,user.verified)
    
        if (user.isdeleted) {
          throw new BadRequest("user is already deleted");
        }
    
        if(!user.isverified){
          throw new BadRequest("user is not verified");
        }
    
        return NextResponse.json({
            success:true,
            message:"connections retrieved successfully",
            connections:user.Connections
        })
    
    
    }    
)