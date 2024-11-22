import { NextApiRequest } from 'next';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

import { Guardian } from "@/app/lib/models/mongoose_models/user";
import { Samplepaper } from '@/app/lib/models/mongoose_models/problem';

export async function GET(req: NextApiRequest) {
    try {
        const { id } = req.query;
        const token = req.cookies.authToken;

        if (!token) {
            return NextResponse.json({ err: "Unauthorized access" }, { status: 401 });
        }

        const secretKey = process.env.SECRET_KEY;
        if (!secretKey) {
            throw new Error("Secret key is not defined");
        }

        const decoded = jwt.verify(token, secretKey);
        const { email } = decoded;

        const guardian = await Guardian.findOne({ email });
        if (!guardian) {
            return NextResponse.json({ err: "Guardian not found" }, { status: 404 });
        }

        if (id) {
            const samplePaper = await Samplepaper.findById(id);
            if (!samplePaper) {
                return NextResponse.json({ err: "Sample paper not found" }, { status: 404 });
            }

            if (samplePaper.createdBy.toString() !== guardian._id.toString()) {
                return NextResponse.json({ err: "Forbidden: Sample paper does not belong to this guardian" }, { status: 403 });
            }

            return NextResponse.json({ samplePaper }, { status: 200 });
        } else {
            const samplePapers = await Samplepaper.find({ createdBy: guardian._id });
            return NextResponse.json({ samplePapers }, { status: 200 });
        }
    } catch (error) {
        console.error(error);
        return NextResponse.json({ err: "Something went wrong" }, { status: 500 });
    }
}
