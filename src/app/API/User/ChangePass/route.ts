import { NextApiRequest } from 'next';
import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';

import { Child, Guardian } from '@/app/lib/models/mongoose_models/user';


export async function POST(req: NextApiRequest){
    try {
        const streamdata = req.body;
        const reader = streamdata.getReader();
        const decoder = new TextDecoder('utf-8');
        let chunk = "";
        while(true){
            const {done, value} = reader.read();
            if(done){
                break;
            }
            chunk += decoder.decode(value,{stream:true});
        }
        const data = JSON.parse(chunk);

        const {identifier, oldpass, newpass, type} = data;
        
        if(!identifier || !oldpass || !newpass || !type){
            return NextResponse.json({
                err:"provide all the necessary information"
            },{status:400})
        }

        const hashedpassword = await bcrypt.hash(newpass, 10);

        const regex = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/g;
        let user;
        if(regex.test(identifier)){
            if(type==='guardian'){
                user = await Guardian.findOne({email:identifier});
            }else{
                user = await Child.findOne({email:identifier});
            }
        }else{
            if(type==='guardian'){
                user = await Guardian.findOne({username:identifier});
            }else{
                user = await Child.findOne({username:identifier});
            }
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

        if(regex.test(identifier)){
            if(type==='guardian'){
                user = await Guardian.updateOne({email:identifier},{password:hashedpassword});
            }else{
                user = await Child.updateOne({email:identifier},{password:hashedpassword});
            }
        }else{
            if(type==='guardian'){
                user = await Guardian.updateOne({username:identifier},{password:hashedpassword});
            }else{
                user = await Child.updateOne({username:identifier},{password:hashedpassword});
            }
        }

        return NextResponse.json({
            success:true,
            message:"password changed successfully"
        },{status:200})


    } catch (error) {
        return NextResponse.json({err:"something went wrong"},{status:500})
    }
}