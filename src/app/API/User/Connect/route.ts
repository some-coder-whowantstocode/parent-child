"use server"
import { NextApiRequest } from "next";
import { NextResponse } from "next/server";
import jwt from 'jsonwebtoken';
import { ReadStream } from "@/app/lib/streamReader";
import { Child, Guardian } from "@/app/lib/models/mongoose_models/user";
import mongoose from 'mongoose';

export async function POST(req:NextApiRequest){
    try {
        const token = req.cookies.authToken;
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
        const {email} = decoded;
        if(!email){
            return NextResponse.json({
                err:"Invalid token"
            },{status:400})
        }
        const data = await ReadStream(req.body);
        const {identifier, type} = data;
        if(!identifier || !type){
            return NextResponse.json({
                err:"id and type are required!"
            },{status:400})
        }
        
        // let exists: boolean|null = false;
        let updated, query ;
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

        if(type === "Guardian"){
            updated = await Guardian.updateOne(query,{$push:{connectionRequested:{id:decoded.id,type:"guardian"}}});
        }else{
            updated = await Child.updateOne(query,{$push:{connectionRequested:{id:decoded.id,type:"child"}}});
        }

        if(!updated.acknowledged || updated.matchedCount === 0){
            return NextResponse.json({
                err:"No such user exists."
            },{status:404})
        }else{
            if(decoded.type === "Guardian"){
                await Guardian.updateOne({email:email},{$push:{connectionRequests:{id,type:"guardian"}}});
            }else{
                await Child.updateOne({email:email},{$push:{connectionRequests:{id,type:"child"}}});
            }
        }

        return NextResponse.json({
            msg:"Connection request sent"
        },{status:200})
        // await 

    } catch (error) {
        return NextResponse.json({
            err: error.message ? error.message: "something went wrong"
        },{status:500})
    }
}