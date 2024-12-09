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
                user = await User.findOne({email});
    
            if(!user || !user.isverified){
                return NextResponse.json({
                    err:"No user with such user exists or user is not verified yet"
                },{status:400})
            }
            
            const token = await jwt.sign({email},secretKey,{expiresIn:'24h'});
            
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

            if(!decodedtoken.email){
                return NextResponse.json({
                    err:"invalid token"
                },{status:400})
            }

            const hashedpass = await bcrypt.hash(password,10);

                user = await User.findOne({email:decodedtoken.email});

                if(!user){
                    return NextResponse.json({
                        err:"invalid token"
                    },{status:400})
                }

                await User.updateOne({email:decodedtoken.email},{password:hashedpass})

            return NextResponse.json({success:true, message:"password updated successfully"},{status:200})
        }
        
    } catch (error) {
        console.log(error)
        if (error.name === 'TokenExpiredError') {
        return NextResponse.json({err:"token expired"},{status:401})
        }
        return NextResponse.json({err:"something went wrong"},{status:500})
    }
}