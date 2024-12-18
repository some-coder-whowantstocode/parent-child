import { NextApiRequest } from 'next';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

import { User } from '@/app/lib/models/mongoose_models/user';
import { verifyToken } from '@/app/lib/middleware/verifyToken';

export async function GET(req: NextApiRequest) {
    try {
        const token = req.cookies._parsed.get('authToken').value;
        if (!token) {
            return NextResponse.json({ err: "Unauthorized access" }, { status: 401 });
        }

        const secretKey = process.env.SECRET_KEY;
        if (!secretKey) {
            throw new Error("Secret key is not defined");
        }

        const decoded = await verifyToken(token);
        // const { username } = decoded;

        const child = await User.findOne({ username:decoded?.username }).select("activities isdeleted");
        if (!child || child.isdeleted) {
            return NextResponse.json({ err: "Login to see this." }, { status: 404 });
        }

        return NextResponse.json({ activities: child.activities}, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ err: "Something went wrong" }, { status: 500 });
    }
}
