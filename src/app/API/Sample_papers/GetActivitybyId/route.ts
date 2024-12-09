import { NextApiRequest } from 'next';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

import { Guardian } from '@/app/lib/models/mongoose_models/user';
import { Activities } from '@/app/lib/models/mongoose_models/problem';

export async function GET(req: NextApiRequest) {
    try {
        const {id} = req.query;
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
            return NextResponse.json({ err: "guardian not found" }, { status: 404 });
        }
        const activity = await Activities.findById(id);
        if(!activity){
            return NextResponse.json({ err: "No such activity exists" }, { status: 404 });
        }
        if(activity.createdBy.toString() !== guardian._id.toString()){
            return NextResponse.json({ err: "This response was not submitted to you" }, { status: 400 });
        }
        return NextResponse.json({ activity }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ err: "Something went wrong" }, { status: 500 });
    }
}
