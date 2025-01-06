import { NextApiRequest } from 'next';
import { NextResponse } from 'next/server';

import { Samplepaper } from '@/app/lib/models/mongoose_models/problem';
import dbconnect from '@/app/lib/db';
import { ObjectId } from 'mongodb';
import { errorHandler } from '@/app/lib/middleware/errorhandler';

export const GET = errorHandler(async(req: NextApiRequest)=> {
        const {searchParams} = new URL(req.url||"");
        const id = searchParams.get('id');
        const page = Number(searchParams.get("p")||1);
        const limit = Number(searchParams.get('l') || 10);
        if(!id){
            return NextResponse.json({ err: "question id is required" }, { status: 400 });
        }

        const skip = limit * (page - 1)

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
                },
                {
                    $lookup:{
                        from:"activities",
                        localField:"responses",
                        foreignField:"_id",
                        as:"responses"
                    }
                },
                {
                    $lookup:{
                        from:"users",
                        localField:"responses.child",
                        foreignField:"_id",
                        as:"persons"
                    }
                },
                {
                    $project:{
                        "title":1,
                        "questions":1,
                        "responses.createdAt":1,
                        "responses.status":1,
                        "responses.timeSpent":1,
                        "responses.totalScore":1,
                        "responses._id":1,
                        "persons.username":1,
                    }
                }
            ])
           
            if (!samplePaper) {
                return NextResponse.json({ err: "Sample paper not found" }, { status: 404 });
            }

            return NextResponse.json({ samplePaper:samplePaper[0], success:true }, { status: 200 });
       

})