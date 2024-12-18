import { NextApiRequest } from 'next';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

import { User } from "@/app/lib/models/mongoose_models/user";
import dbconnect from '@/app/lib/db';
import { verifyToken } from '@/app/lib/middleware/verifyToken';

export async function GET(req: NextApiRequest) {
    try {
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
            return NextResponse.json({err:"invalid token"},{status:401});
        }
        
        const user = await User.findOne({username:decoded?.username}).select("role isverified isdeleted samplePapers");

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
        await dbconnect();
        // const user = await User.findOne({ email });
        // if (!user) {
        //     return NextResponse.json({ err: "Guardian not found" },{status:404});
        // }

        return NextResponse.json({ samplePapers:user.samplePapers},{status:200});
    } catch (error) {
        console.error(error);
        return NextResponse.json({ err: "Something went wrong" },{status:500});
    }
}
