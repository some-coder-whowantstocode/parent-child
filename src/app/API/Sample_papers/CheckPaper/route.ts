import { NextApiRequest } from "next";
import { NextResponse } from "next/server";

import { ReadStream } from "@/app/lib/streamReader";
import { Activities } from "@/app/lib/models/mongoose_models/problem";
import { User } from "@/app/lib/models/mongoose_models/user";
import { verifyToken } from "@/app/lib/middleware/verifyToken";
import dbconnect from "@/app/lib/db";
import { errorHandler } from "@/app/lib/middleware/errorhandler";
import { cookies } from "next/headers";

export const POST = errorHandler(async(req: NextApiRequest)=> {
        const data = await ReadStream(req.body);
        const { activityid, scores } = data;
        const cookie = await cookies();
        const token = cookie.get("authToken")?.value;

        if(!activityid || !scores){
            return NextResponse.json({ err: "activityid and scores are required" }, { status: 400 });
        }

        if(!Array.isArray(scores)){
            return NextResponse.json({ err: "the scores must be and array with 2 elements first one is position and 2nd one is the mark" }, { status: 400 });
        }

        if (!token) {
            return NextResponse.json({ err: "Unauthorized access" }, { status: 401 });
        }

        const decoded = await verifyToken(token);
        
        await dbconnect();
        const user = await User.findOne({ username: decoded?.username }).select("isdeleted");

        if (!user || user.isdeleted) {
            return NextResponse.json({ err: "Unauthorized access" }, { status: 401 });
        }

        const answers = await Activities.findOne({ _id: activityid })
    .select("answers totalScore")
    .populate({ path: 'samplePaper', select: 'createdBy'});

        if(!answers){
            return NextResponse.json({err:"invalid action no such answerpaper found"},{status:404})
        }

        if(answers.samplePaper.createdBy.toString() !== decoded?.id){
            return NextResponse.json({err:"unauthorized access"},{status:401})
        }

        let totalScore = answers.totalScore ;

        for(let i=0;i<scores.length;i++){
            let updatedmark = scores[i][1], pos = scores[i][0], lastmark = answers.answers[pos].score ;
            totalScore += updatedmark - lastmark;
            answers.answers[pos].score = updatedmark;
        }
 
        await Activities.updateOne({_id:activityid},{answers:answers.answers,totalScore});

        

        return NextResponse.json({ message: "Score updated successfully", success:true }, { status: 200 });
  
}
)