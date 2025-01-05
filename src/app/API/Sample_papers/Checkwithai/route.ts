'use client'
import dbconnect from "@/app/lib/db";
import { errorHandler } from "@/app/lib/middleware/errorhandler";
import { verifyToken } from "@/app/lib/middleware/verifyToken";
import { NextApiRequest } from "next";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const GET = errorHandler(async(req: NextApiRequest)=>{
    const cookie = await cookies();
    const token = cookie.get('authToken')?.value;
    
    if (!token) {
        return NextResponse.json({ err: "Unauthorized access" }, { status: 401 });
    }

    const decoded = await verifyToken(token);

 

    await dbconnect();
})