"use server"
import { NextApiRequest } from "next";
import { NextResponse } from "next/server";
import { ReadStream } from "@/app/lib/streamReader";
import { User } from "@/app/lib/models/mongoose_models/user";
import mongoose from 'mongoose';
import { verifyToken } from "@/app/lib/middleware/verifyToken";


export async function POST(req:NextApiRequest){
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
        
        const decoded = await verifyToken(token);
        if(!decoded){
            return NextResponse.json({
                err:"invalid token"
            },{status:401})
        }
        
        const data = await ReadStream(req.body);
        const {identifier, type, action} = data;
        if(!identifier || !type || !action){
            return NextResponse.json({
                err:"identifier ,type and action are required!"
            },{status:400})
        }

        let query : {email?:string,_id?:string,username ?:string,type?:string,id?:string};
        const regex =/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/g;
        const isEmail = regex.test(identifier);
        const isobjectid = mongoose.Types.ObjectId.isValid(identifier);
        
        if(isEmail){
            query = {email:identifier};
        }
        else if(isobjectid){
            query = {_id:identifier};
        }
        else{
            query = {username:identifier};
        }

        switch (action) {
            case "accept":
                {
                    const result = await User.updateOne(query,{$pull:{connectionRequests:{id:decoded.id,type:decoded.type}}});

                    if(result.matchedCount === 0){
                        return NextResponse.json({
                            err:"Invalid action."
                        },{status:400})
                    }
                    let req ;
                    if(decoded.type === "guardian"){
                        req = {$push:{guardianConnections:{id:decoded.id}}};
                    }else{
                        req = {$push:{childConnections:{id:decoded.id}}};
                    }
                    await User.updateOne(query,req);

                    const query2 = {...query};
                    if(isobjectid){
                        delete query2._id;
                        query2.id = identifier;
                    }
                    query2.type = type;
                    const result2 = await User.updateOne({_id:decoded.id},{$pull:{connectionRequested:query2}});

                    if(result2.matchedCount === 0){
                        const req2 = req;
                        req2.$pull = req2.$push;
                        delete req2.$push;
                        await User.updateOne(query,req);
                        return NextResponse.json({
                            err:"Invalid action."
                        },{status:400})
                    }
                    
                    let request2 ;
                    if(decoded.type === "guardian"){
                        request2 = {$push:{guardianConnections:{id:decoded.id}}};
                    }else{
                        request2 = {$push:{childConnections:{id:decoded.id}}};
                    }
                    await User.updateOne(query,request2);

                    return NextResponse.json({
                        message:"connection accepted"
                    },{status:200})

                }
                break;
            
            case "reject":
                {
                    await User.updateOne(query,{$pull:{connectionRequests:{id:decoded.id,type:decoded.type}}});

                    const query2 = {...query};
                    if(isobjectid){
                        delete query2._id;
                        query2.id = identifier;
                    }
                    query2.type = type;
                    await User.updateOne({_id:decoded.id},{$pull:{connectionRequested:query2}});
                    
                    return NextResponse.json({
                        message:"connection rejected"
                    },{status:200})
                }
                break;

            case "cancel":
                {
                    await User.updateOne(query,{$pull:{connectionRequests:{id:decoded.id,type:decoded.type}}});

                    const query2 = {...query};
                    if(isobjectid){
                        delete query2._id;
                        query2.id = identifier;
                    }
                    query2.type = type;
                    await User.updateOne({_id:decoded.id},{$pull:{connectionRequested:query2}});
                    
                    return NextResponse.json({
                        message:"connection rejected"
                    },{status:200})
                }
                break;

            case "request":
                {
                    let updated ;
                    
                        updated = await User.updateOne(query,{$push:{connectionRequested:{id:decoded.id,type:"guardian"}}});
            
                    if(!updated.acknowledged || updated.matchedCount === 0){
                        return NextResponse.json({
                            err:"No such user exists."
                        },{status:404})
                    }else{
                            await User.updateOne({email:decoded.email},{$push:{connectionRequests:{id:decoded.id,type:"child"}}});
                    }
            
                    return NextResponse.json({
                        msg:"Connection request sent"
                    },{status:200})
                }
                break;
            default:
                break;
        }
        
        
    } catch (error : Error | any) {
        return NextResponse.json({
            err: error.message ? error.message: "something went wrong"
        },{status:500})
    }
}