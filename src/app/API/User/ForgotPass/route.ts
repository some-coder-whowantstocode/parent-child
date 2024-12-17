import { NextApiRequest } from 'next';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

import { User } from '@/app/lib/models/mongoose_models/user';
import handleEmailVerification from '@/app/lib/emailverification';
import dbconnect from '@/app/lib/db';
import { verifyToken } from '@/app/lib/middleware/verifyToken';

export async function POST(req: NextApiRequest){
    try {
        const streamdata = req.body;
        const reader = streamdata.getReader();
        const decoder = new TextDecoder('utf-8');
        let chunk = "";
        while(true){
            const {done, value} = await reader.read();
            if(done){
                break;
            }
            chunk += decoder.decode(value, {stream: true});
        }
        const data = JSON.parse(chunk);

        const {generate} = data;

        const secretKey = process.env.SECRET_KEY;
        if(!secretKey){
            throw new Error('no secretkey available');
        }

        if(generate){
            const {email, type} = data;
            let user ;
            
            if(!email || !type){
                return NextResponse.json({
                    err:"please provide all required data"
                },{status:400})
            }
            await dbconnect();
            const token = jwt.sign({email},secretKey,{expiresIn:'24h'});
            const extime = Date.now() + 24 * 60 * 60 * 1000;
                user = await User.updateOne({
                    email,
                    isVerified:true,
                },{verificationToken:token,tokenExpires:extime});
    
            if(user.modifiedCount == 0){
                return NextResponse.json({
                    err:"invalid request"
                },{status:400})
            }
            
            let text = `visit this link to verify your mail link ${token}`;
            handleEmailVerification('verification of email', text, email, text);
            return NextResponse.json({
                err:"check your email to reset the password"
            },{status:200})
        }else{
            const {password, type, token} = data;
            let user ;

            if(!password || !type || !token){
                return NextResponse.json({
                    err:"please provide all required data"
                },{status:400})
            }

            const decodedtoken = await verifyToken(token);
            if(!decodedtoken){
                return NextResponse.json({
                    err:"invalid token"
                },{status:401})
            }

            const hashedpass = await bcrypt.hash(password,10);
            const currentTime = Date.now();
            await dbconnect();
                user = await User.updateOne({
                    email:decodedtoken.email,
                    verificationToken:token,
                    tokenExpires:{$gt:currentTime}
                },{
                    password:hashedpass
                });

                if(user.modifiedCount == 0){
                    return NextResponse.json({
                        err:"invalid request or timeout please try to fogot token once more"
                    },{status:400})
                }


            return NextResponse.json({success:true, message:"password updated successfully"},{status:200})
        }
        
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
        return NextResponse.json({err:"token expired"},{status:401})
        }
        return NextResponse.json({err:"something went wrong"},{status:500})
    }
}