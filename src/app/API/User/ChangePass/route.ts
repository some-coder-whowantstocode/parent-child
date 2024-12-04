import { NextApiRequest } from 'next';
import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { Child, Guardian } from '@/app/lib/models/mongoose_models/user';
import dbconnect from '@/app/lib/db';


export async function POST(req: NextApiRequest){
    try {
        const token = req.cookies._parsed.get('authToken');
        if(!token) {
            return NextResponse.json({
                err:"Unauthorized access"
            },{status:401})
        }
        
        const secretKey = process.env.SECRET_KEY;
        if(!secretKey){
            throw new Error("Secret key is not defined");
        }
        const decoded = await jwt.verify(token.value, secretKey);
        const { email } = decoded;

        await dbconnect();
        
        const streamdata = req.body;
        const reader = streamdata.getReader();
        const decoder = new TextDecoder('utf-8');
        let chunk = "";
        while(true){
            const {done, value} = await reader.read();
            if(done){
                break;
            }
            chunk += decoder.decode(value,{stream:true});
        }
        const data = JSON.parse(chunk);
        const { oldpass, newpass, type} = data;
        
        if(!oldpass || !newpass || !type){
            return NextResponse.json({
                err:"provide all the necessary information"
            },{status:400})
        }

        if(oldpass === newpass){
            return NextResponse.json({
                err:"Dont try to fool me niggesh, both the passwords are same"
            },{status:400})
        }

        const hashedpassword = await bcrypt.hash(newpass, 10);
        let user;
        if(type==='guardian'){
                user = await Guardian.findOne({email});
            }else{
                user = await Child.findOne({email});
            }

        if(!user || !user.isverified){
            return NextResponse.json({
                err:"No user with such user exists or user is not verified yet"
            },{status:400})
        }

        const issame =await bcrypt.compare(oldpass, user.password);

        if(!issame){
            return NextResponse.json({
                err:"invalid password "
            },{status:400})
        }

            if(type==='guardian'){
                user = await Guardian.updateOne({email},{password:hashedpassword});
            }else{
                user = await Child.updateOne({email},{password:hashedpassword});
            }

        return NextResponse.json({
            success:true,
            message:"password changed successfully"
        },{status:200})


    } catch (error) {
        console.log(error)
        return NextResponse.json({err:"something went wrong"},{status:500})
    }
}