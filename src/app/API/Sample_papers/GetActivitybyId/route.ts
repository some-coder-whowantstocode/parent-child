import { NextApiRequest } from 'next';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

import { Activities } from '@/app/lib/models/mongoose_models/problem';

export async function GET(req: NextApiRequest) {
    try {
        const {id} = req.query;
    
        const activity = await Activities.findById(id);
        if(!activity){
            return NextResponse.json({ err: "No such activity exists" }, { status: 404 });
        }
        return NextResponse.json({ activity }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ err: "Something went wrong" }, { status: 500 });
    }
}
