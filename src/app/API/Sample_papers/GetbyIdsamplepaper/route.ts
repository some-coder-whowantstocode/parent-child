import { NextApiRequest } from 'next';
import { NextResponse } from 'next/server';

import { Samplepaper } from '@/app/lib/models/mongoose_models/problem';
import dbconnect from '@/app/lib/db';

export async function GET(req: NextApiRequest) {
    try {
        const {searchParams} = new URL(req.url||"");
        const id = searchParams.get('id');
        if(!id){
            return NextResponse.json({ err: "question id is required" }, { status: 400 });
        }

        await dbconnect();
            const samplePaper = await Samplepaper.findById(id);
            if (!samplePaper) {
                return NextResponse.json({ err: "Sample paper not found" }, { status: 404 });
            }

            return NextResponse.json({ samplePaper }, { status: 200 });
       
    } catch (error) {
        console.error(error);
        return NextResponse.json({ err: error.message ? error.message :"Something went wrong" }, { status: 500 });
    }
}
