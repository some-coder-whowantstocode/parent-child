import { NextApiRequest } from 'next';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

import { User } from "@/app/lib/models/mongoose_models/user";
import dbconnect from '@/app/lib/db';
import { verifyToken } from '@/app/lib/middleware/verifyToken';
import { BadRequest, Unauthorized } from '../../responses/errors';
import { errorHandler } from '@/app/lib/middleware/errorhandler';

export const GET = errorHandler(async(req: NextApiRequest)=> {
        const token = req.cookies._parsed.get('authToken').value;
        if (!token) {
            return NextResponse.json({ err: "Unauthorized access" },{status:401});
        }

        const secretKey = process.env.SECRET_KEY;
        if(!secretKey){
            throw new Error("Secret key is not defined");
        }
        const decoded = await verifyToken(token);
        if(!decoded){
            throw new Unauthorized('invalid token');
        }

        if(decoded.type !== 'guardian'){
            throw new BadRequest('you do not have the authority to access this data')
        }
        
        const userdata = await User.aggregate([
            {$match:{username:decoded.username}},
            {$project:{isverified:1, isdeleted:1, samplePapers:{$slice:['$samplePapers',10]}}},
            {$lookup:{from:'samplepapers',localField:'samplePapers',foreignField:'_id',as:'samplePapers'}},
            {$addFields:{
                samplePapers:{
                $map:{
                    input:'$samplePapers',
                    as:'samplePapers',
                    in:{
                        _id:'$$samplePapers._id',
                        title:'$$samplePapers.title',
                        createdAt:'$$samplePapers.createdAt',
                        totalScore:'$$samplePapers.totalScore',
                        passingMark:'$$samplePapers.passingMark',
                        responseCount:{$size:{$ifNull : ['$$samplePapers.responses',[]]}}
                    }
                }}
            }},
            {$project:{isverified:1, isdeleted:1, samplePapers:1}}
        ]) 
        
        const user = userdata[0];
        
        if(!user ){
            throw new BadRequest("No user with such user exists ")
        }

        if(!user.isverified ){
            throw new BadRequest("You are not verified")
        }

        if(user.isdeleted ){
            throw new BadRequest("What are you trying to acheive here rise from dead?");
        }
        await dbconnect();

        return NextResponse.json({ success:true, samplePapers:user.samplePapers},{status:200});
   
})
