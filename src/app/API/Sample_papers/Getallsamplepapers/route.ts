import { NextApiRequest } from 'next';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

import { Guardian } from "@/app/lib/models/mongoose_models/user";

export async function GET(req: NextApiRequest) {
    try {
        const token = req.cookies.authToken;
        if (!token) {
            return NextResponse.json({ err: "Unauthorized access" },{status:401});
        }

        const secretKey = process.env.SECRET_KEY;
        if (!secretKey) {
            throw new Error("Secret key is not defined");
        }

        const decoded = jwt.verify(token, secretKey);
        const { email } = decoded;

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
