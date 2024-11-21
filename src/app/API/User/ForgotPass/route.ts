import { NextApiRequest } from 'next';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

import { Child, Guardian } from '@/app/lib/models/mongoose_models/user';
import handleEmailVerification from '@/app/lib/emailverification';

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

        if(!generate){
            return NextResponse.json({
                err:"please provide all required data"
            },{status:400})
        }

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

            if(type === "guardian"){
                user = await Guardian.findOne({email});
            }else{
                user = await Child.findOne({email});
            }
    
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

            const decodedtoken = jwt.verify(token,secretKey);

            if(!decodedtoken.email){
                return NextResponse.json({
                    err:"invalid token"
                },{status:400})
            }

            const hashedpass = await bcrypt.hash(password,10);

            if(type === "guardian"){
                user = await Guardian.findOne({email:decodedtoken.email});

                if(!user){
                    return NextResponse.json({
                        err:"invalid token"
                    },{status:400})
                }

                await Guardian.updateOne({email:decodedtoken.email},{password:hashedpass})
            }else{
                user = await Child.findOne({email:decodedtoken.email});
                if(!user){
                    return NextResponse.json({
                        err:"invalid token"
                    },{status:400})
                }

                await Child.updateOne({email:decodedtoken.email},{password:hashedpass})
            }

            return NextResponse.json({success:true, message:"password updated successfully"},{status:200})
        }
        
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
        return NextResponse.json({err:"token expired"},{status:500})
        }
        return NextResponse.json({err:"something went wrong"},{status:500})
    }
}