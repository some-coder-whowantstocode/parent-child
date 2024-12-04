import { NextApiRequest } from 'next';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

import { Guardian } from "@/app/lib/models/mongoose_models/user";
import dbconnect from '@/app/lib/db';

export async function GET(req: NextApiRequest) {
    try {
        const token = req.cookies._parsed.get('authToken');
        if (!token) {
            return NextResponse.json({ err: "Unauthorized access" },{status:401});
        }

        const secretKey = process.env.SECRET_KEY;
        if (!secretKey) {
            throw new Error("Secret key is not defined");
        }

        const decoded = jwt.verify(token.value, secretKey);
        const { email } = decoded;
        await dbconnect();
        const guardian = await Guardian.findOne({ email });
        if (!guardian) {
            return NextResponse.json({ err: "Guardian not found" },{status:404});
        }

        return NextResponse.json({ samplePapers:guardian.samplePapers},{status:200});
    } catch (error) {
        console.error(error);
        return NextResponse.json({ err: "Something went wrong" },{status:500});
    }
}
