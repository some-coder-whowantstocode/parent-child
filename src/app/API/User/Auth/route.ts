'use server'
import { NextApiRequest } from "next";
import jwt from 'jsonwebtoken';
import { NextResponse } from "next/server";
import bcrypt from 'bcrypt';

import { reqbody } from "@/app/lib/models/Auth/signup";
import dbconnect from '../../../lib/db';
import { Child, Guardian } from "@/app/lib/models/mongoose_models/user";
import handleEmailVerification from "@/app/lib/emailverification";

export async function POST(req: NextApiRequest){
    try {
        const streamdata = req.body;
        const reader = streamdata.getReader();
        const decoder = new TextDecoder('utf-8');
        let chunks = '';
        while(true){
            const {done, value} = await reader.read();
            if(done){
                break;
            }
            chunks += decoder.decode(value, {stream:true});
        }
        if(!chunks){
            return NextResponse.json({
                err:'body is missing in the request'
            },{status:400})
        }
        const data : reqbody = JSON.parse(chunks);
        await dbconnect();
        if(data.create){
            let user;
            const { fullname, username, email, password, type } = data;
            const hashedpassword = await bcrypt.hash(password,10);
            const secretKey = process.env.SECRET_KEY;
            if (!secretKey) { 
                throw new Error('Secret key is not defined. Please set JWT_SECRET_KEY in your .env.local file.'); 
            }
            const verificationToken = jwt.sign(
                {fullname, email},
                secretKey,
                {expiresIn:'24h'}
            )
            if(type === 'guardian'){
                user = new Guardian({ fullname, username, email, password:hashedpassword, children:[], verificationToken });
            }else{
                user = new Child({ fullname, username, email, password:hashedpassword, guardian:[], verificationToken });
            }
            await user.save();
            let text = `visit this link to verify your mail link`;
            handleEmailVerification('verification of email', text, email, text);
            return NextResponse.json({ 
                success: true, 
                message: 'User created successfully, please verify the account through your email.' 
            },{status:200});
        }
        
        if(data.verify){
            let user;
            const { token, type} = data;
            
            if(! token || ! type){
                return NextResponse.json({
                    err:'please provide all required data'
                },{status:400})
            }

            const secretKey = process.env.SECRET_KEY;
            if (!secretKey) { 
                throw new Error('Secret key is not defined. Please set JWT_SECRET_KEY in your .env.local file.'); 
            }

            const decodedtoken = await jwt.verify(token,secretKey);
            if(!decodedtoken.email){
                return NextResponse.json({
                    err:'invalid token'
                },{status:403})
            }
            
            if(type === 'guardian'){
                user = await Guardian.findOne({email:decodedtoken.email});
            }else{
                user = await Child.findOne({email:decodedtoken.email});
            }

            if(!user){
                return NextResponse.json({
                    err:"Invalid token"
                },{status:400})
            }
            
            if(Date.now() > user.tokenExpires){
                const secretKey = process.env.SECRET_KEY;
                if (!secretKey) { 
                    throw new Error('Secret key is not defined. Please set JWT_SECRET_KEY in your .env.local file.'); 
                }
                const verificationToken = jwt.sign(
                    {fullname: user.fullname, email:user.email},
                    secretKey,
                    {expiresIn:'24h'}
                )
                let text = `visit this link to verify your mail link`;
                handleEmailVerification('verification of email', text, decodedtoken.email, text);
                if(type === 'guardian'){
                    await Guardian.updateOne({email:decodedtoken.email},{verificationToken, tokenExpires:Date.now() + 24*60*60*1000,})
                }else{
                    await Child.updateOne({email:decodedtoken.email},{ verificationToken, tokenExpires:Date.now() + 24*60*60*1000,})
                }
                return NextResponse.json({
                    err:"token expired resending link to user"
                },{status:400})
            }

            if(!user.isVerified){
                if(type === 'guardian'){
                    await Guardian.updateOne({email:decodedtoken.email},{isverified:true, verificationToken: null, tokenExpires:null})
                }else{
                    await Child.updateOne({email:decodedtoken.email},{isverified:true, verificationToken: null, tokenExpires:null})
                }
            }

            return NextResponse.json({
                verified:true
            },{status:200})
        }

        if(data.login){
            let user;
            const {identifier, password, type} = data;
            const regex =/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/g
            if(!identifier || ! password || ! type){
                return NextResponse.json({
                    err:'please provide all required data'
                },{status:400})
            }
            if(regex.test(identifier)){
                if(type === 'guardian'){
                    user = await Guardian.findOne({email:identifier});
                }else{
                    user = await Child.findOne({email:identifier});
                }
            }else{
                if(type === 'guardian'){
                    user = await Guardian.findOne({username:identifier});
                }else{
                    user = await Child.findOne({username:identifier});
                }
            }
            console.log(user)
            if(!user){
                return NextResponse.json({
                    err:'invalid user information'
                },{status:400})
            }
            if(!user.isVerified){
                return NextResponse.json({
                    err:'user is not verified, please verify first'
                },{status:403})
            }
            const issame = await bcrypt.compare(password,user.password);
            
            if(!issame){
                return NextResponse.json({
                    err:'invalid user information'
                },{status:400})
            }

            return NextResponse.json({
                success:true,
                username:user.username,
                fullname:user.fullname,
                email:user.email,
                type:user.type
            },{status:200})
        }

        return NextResponse.json({
            err:"request is without intent please clear the intent"
        },{status:400})
        
    } catch (error) {
        console.log(error)
        return NextResponse.json({
            err:error.message || 'something went wrong while creating account.',
        },{status:500})
    }
}