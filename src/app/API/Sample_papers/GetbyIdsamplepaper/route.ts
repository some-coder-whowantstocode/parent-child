import { NextApiRequest } from 'next';
import { NextResponse } from 'next/server';

import { Samplepaper } from '@/app/lib/models/mongoose_models/problem';
import dbconnect from '@/app/lib/db';
import { ObjectId } from 'mongodb';

export async function GET(req: NextApiRequest) {
    try {
        const {searchParams} = new URL(req.url||"");
        const id = searchParams.get('id');
        const page = Number(searchParams.get("p")||1);
        const limit = Number(searchParams.get('l') || 10);
        if(!id){
            return NextResponse.json({ err: "question id is required" }, { status: 400 });
        }

        const skip = limit * (page - 1)
        console.log(id)

        await dbconnect();
            const samplePaper = await Samplepaper.aggregate([
                {
                    $match:{
                        _id:new ObjectId(id)
                    }
                },
                {
                    $project:{
                            "title":1,
                            "questions":1,
                            "responses":{$slice:['$responses',skip, limit]},

                    }
                }
            ])
           
            if (!samplePaper) {
                return NextResponse.json({ err: "Sample paper not found" }, { status: 404 });
            }

            return NextResponse.json({ samplePaper:samplePaper[0], success:true }, { status: 200 });
       
    } catch (error ) {
        console.error(error);
        return NextResponse.json({ err: error.message ? error.message :"Something went wrong" }, { status: 500 });
    }
}
