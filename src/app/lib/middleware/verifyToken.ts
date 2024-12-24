'use server'

import { JwtPayload } from 'jsonwebtoken';
import jwt from 'jsonwebtoken';

interface TOKEN extends JwtPayload { 
    id: string; 
    email: string; 
    type: string; 
    auth: true;
    username: string;
}

export async function verifyToken(token: string): Promise<TOKEN | null> {
    try {
        const secretKey = process.env.SECRET_KEY;
        if (!secretKey) { 
            throw new Error('Secret key is not defined. Please set JWT_SECRET_KEY in your .env.local file.'); 
        }
        
        const decodedtoken = jwt.verify(token, secretKey) as TOKEN;
        console.log(decodedtoken)
        if (decodedtoken && decodedtoken.id && decodedtoken.email && decodedtoken.type && decodedtoken.auth && decodedtoken.username) {
            return decodedtoken;
        }
        
        throw new Error('Token missing required claims');
    } catch (error: any) {
        if (error.name === 'TokenExpiredError') {
            console.error('Token expired:', error);
            throw new Error('Token expired');
        } else if (error.name === 'JsonWebTokenError') {
            console.error('Invalid token:', error);
            throw new Error('Invalid token');
        } else {
            console.error('Token verification error:', error);
            throw new Error('Token verification failed');
        }
    }
}
