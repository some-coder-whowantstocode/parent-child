import { NextApiRequest } from 'next';
import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { Child, Guardian } from '@/app/lib/models/mongoose_models/user';


export async function POST(req: NextApiRequest){
    try {
        const token = req.cookies._parsed.get('authToken').value;
        if(!token) {
            return NextResponse.json({
                err:"Unauthorized access"
            },{status:401})
        }
        
        const secretKey = process.env.SECRET_KEY;
        if(!secretKey){
            throw new Error("Secret key is not defined");
        }
        const decoded = await jwt.verify(token, secretKey);
        const { email } = decoded;

        const streamdata = req.body;
        const reader = streamdata.getReader();
        const decoder = new TextDecoder('utf-8');
        let chunk = "";
        while(true){
            const {done, value} =await reader.read();
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

        const hashedpassword = await bcrypt.hash(newpass, 10);
        // const regex = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/g;
        let user;
            if(type==='guardian'){
                console.log('hi')
                user = await Guardian.find({email});
            }else{
                user = await Child.findOne({email});
            }

        if(!user){
            return NextResponse.json({
                err:"No such user exists"
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