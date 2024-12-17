'use server'
import { NextApiRequest } from "next";
import jwt, { JwtPayload } from 'jsonwebtoken';
import { NextResponse } from "next/server";
import bcrypt from 'bcrypt';

import dbconnect from '../../../lib/db';
import { User } from "@/app/lib/models/mongoose_models/user";
import handleEmailVerification from "@/app/lib/emailverification";
import { verifyToken } from "@/app/lib/middleware/verifyToken";

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
        const data = JSON.parse(chunks);
        await dbconnect();

        const {init, confirm, password, token} = data;
        
        const secretKey = process.env.SECRET_KEY;
            if (!secretKey) { 
                throw new Error('Secret key is not defined. Please set JWT_SECRET_KEY in your .env.local file.'); 
            }

        if(confirm){
            if( !token){
                return NextResponse.json({
                    err:"password and token is requried"
                },{status:401})
            }
            const actualtoken  = jwt.verify(token,secretKey);
            if(actualtoken.deletion && actualtoken.token){
                const decodedtoken = await verifyToken(actualtoken.token.value);
                const currenttime = Date.now();
                const user = await User.updateOne({
                    email:decodedtoken?.email,
                    verificationToken:token,
                    tokenExpires:{$gt:currenttime}
                },{
                    $unset: { fullname: "", email: "", password: "", role: "", Connections: "", connectionRequests: "", connectionRequested: "", isverified: "", verificationToken: "", tokenExpires: "", samplePapers: "", activities: "" },
                    isdeleted:true
                })
                
                if(user.modifiedCount > 0){
                    return NextResponse.json({
                        message:"successfully delted the user."
                    },{status:201})
                }

                return NextResponse.json({
                    message:"no such user exists"
                },{status:400})
            }

            return NextResponse.json({
                err:"invalid token"
            },{status:401})
        }

        if(init){

            const token = req.cookies._parsed.get('authToken');
            const decodedtoken = await verifyToken(token.value);
            if(!decodedtoken || !password){
                return NextResponse.json({
                    err:"token and password are requierd"
                },{status:400})
            }

            
            const vtoken = jwt.sign(
                {token, deletion:true},
                secretKey,
                {expiresIn:'24h'}
            )

            const userdata = await User.findOne({email:decodedtoken.email}).select("password");

            const issame = await bcrypt.compare(password, userdata.password);

            if(!issame){
                return NextResponse.json({
                    err:"wrong password"
                },{status:400})
            }

            const user = await User.updateOne({email:decodedtoken.email},{verificationToken:vtoken,tokenExpires:Date.now() + 24 * 60 * 60 * 1000});
            if(user.matchedCount == 0){
                return NextResponse.json({
                    err:"invalid token"
                },{status:401})
            }

            const sub = "Deleting user account";
            const text = 'please click here to remove your account'
            handleEmailVerification(sub,text,decodedtoken.email,text);

            return NextResponse.json({
                message:"please check your email for confirmaition"
            },{status:200})
        }


        return NextResponse.json({
            err:"request is without intent please clear the intent"
        },{status:400})
        
    } catch (error : Error | any) {
        
        return NextResponse.json({
            err:error.message || 'something went wrong while creating account.',
        },{status:500})
    }
}