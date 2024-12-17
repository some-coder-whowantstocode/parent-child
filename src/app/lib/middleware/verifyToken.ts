"use server"

import { JwtPayload } from 'jsonwebtoken';
import jwt from 'jsonwebtoken';

interface TOKEN extends JwtPayload { 
    id: string; 
    email: string; 
    type: string; 
    auth: true;
    username: string;
}
export async function verifyToken(token : string) : Promise<TOKEN | null> {
    const secretKey = process.env.SECRET_KEY;
    if (!secretKey) { 
        throw new Error('Secret key is not defined. Please set JWT_SECRET_KEY in your .env.local file.'); 
    }
    
    const decodedtoken = jwt.verify(token,secretKey);
    if(typeof(decodedtoken) === "object" && decodedtoken.id && decodedtoken.email && decodedtoken.type && decodedtoken.auth && decodedtoken.username ){
        return decodedtoken as TOKEN;
    }
    return null;
} 