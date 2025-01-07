import { NextApiRequest } from "next";
import { NextResponse } from "next/server";

import { ReadStream } from "@/app/lib/streamReader";
import { Activities, Samplepaper } from "@/app/lib/models/mongoose_models/problem";
import { User } from "@/app/lib/models/mongoose_models/user";
import { verifyToken } from "@/app/lib/middleware/verifyToken";
import dbconnect from "@/app/lib/db";
import { errorHandler } from "@/app/lib/middleware/errorhandler";
import { cookies } from "next/headers";
import { BadRequest } from "../../responses/errors";
import mongoose from 'mongoose'

interface pres{
    question:string,
    answer:string,
    correctans:string,
    score:number,
    mark:number,
    pos:number
}

export const POST = errorHandler(async (req: NextApiRequest) => {
        const data = await ReadStream(req.body);
        const { questionid, answers, timeSpent, distractiontime, timesgotdistracted } = data;
        const cookie = await cookies();
        const token = cookie.get("authToken")?.value

        if (!token) {
            return NextResponse.json({ err: "Unauthorized access" }, { status: 401 });
        }


        const decoded = await verifyToken(token);


        await dbconnect();
        const user = await User.findOne({ username: decoded?.username }).select("isdeleted");

        if (!user || user.isdeleted) {
            return NextResponse.json({ err: "Unauthorized access" }, { status: 401 });
        }

        if (!questionid || !answers || !timeSpent) {
            return NextResponse.json({ err: "questionid, timeSpent and answers are required" }, { status: 400 });
        }

        const { questions, isdeleted, passingPercent, totalScore } = await Samplepaper.findOne({ _id: questionid }).select("questions isdeleted passingPercent,totalScore");

        
        if (!questions || isdeleted) {
            return NextResponse.json({ err: "No such question exists" }, { status: 400 });
        }

        if(questions.length < answers.length){
            throw new BadRequest("Answer is bigger than the question");
        }
        

        let score = 0;
        let status = 0;

        const promptList : pres[] = []
        

        for (let i = 0; i < answers.length && i < questions.length; i++) {
            switch (questions[i].questionType) {
                case 'multiple-choice': {
                    if (questions[i].correctAnswer === answers[i].answer) {
                        const mark = questions[i].score;
                        answers[i].score = mark;
                        score += mark;
                    } else {
                        answers[i].score = 0;
                    }
                    break;
                }
                case 'match-up': {
                    if (JSON.stringify(answers[i].answer) === JSON.stringify(questions[i].correctAnswer)) {
                        const mark = questions[i].score;
                        answers[i].score = mark;
                        score += mark;
                    } else {
                        answers[i].score = 0;
                    }
                    break;
                }
                case 'chronological-order': {
                    if( !answers[i].answer?.length) {
                        throw new BadRequest(`answer no${i+1}'s answer should be an array.`)
                    }
                    let correct = true;
                    for (let j = 0; j < questions[i].correctAnswer.length; j++) {
                        if (answers[i].answer[j] !== questions[i].chronologicalOrder[questions[i].correctAnswer[j]]) {
                            correct = false;
                            break;
                        }
                    }
                    if (correct) {
                        const mark = questions[i].score;
                        answers[i].score = mark;
                        score += mark;
                    } else {
                        answers[i].score = 0;
                    }
                    break;
                }
                case 'true-false': {
                    if (questions[i].correctAnswer === answers[i].answer) {
                        const mark = questions[i].score;
                        answers[i].score = mark;
                        score += mark;
                    } else {
                        answers[i].score = 0;
                    }
                    break;
                }
                default: {
                    const p = {
                        question: questions[i].questionText,
                        correctans: questions[i].correctAnswer,
                        answer: answers[i].answer,
                        score: questions[i].score,
                        pos: i,
                        mark: 0
                    }
                    promptList.push(p);
                    break;
                }
            }
        }
        if (promptList.length > 0) {
            const { GoogleGenerativeAI } = require("@google/generative-ai");
            const genAI = await new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            const model = await genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            let prompt = `Assume you are the teacher ans now you will check some answers by a student for some questions, now i will provide you with some questions with the format of 'question, correct Answer, Given Answer, score', the question holds the question, correct answer is what the answer should be or simmilar to it , given answer holds the answer given by the student and finally score holds the maximum mark that can be given to the student on the question you can give mark between 0 to score.`
            for (let i = 0; i < promptList.length; i++) {
                prompt += `
                question${i + 1} : ${promptList[i].question},
                correct Answer : ${promptList[i].correctans},
                Given Answer : ${promptList[i].answer},
                score : ${promptList[i].score}
                `
            }
            prompt += `Now return me the response in the format i give you ex: 1,3,5,2 where each number represent the score for each question only return me the marks divided by comma and do not return my anything else not a single letter.`
            const response = await model.generateContent(prompt)

                const scores = response.response.text(); 
                const scoreslist = scores.split(',');
                for(let i=0;i<promptList.length;i++){
                    let mark = Number(scoreslist[i]) ;
                    if(!mark) mark = 0;
                    answers[promptList[i].pos].score = mark;
                    score += mark;
                }
                console.log(scores); 
                if(score >= totalScore * (passingPercent/100)){
                    status = 1;
                }else{
                    status = 2;
                }

                const session = await mongoose.startSession();
                session.startTransaction();
                try {
                    const activity = new Activities({
                        child: user._id,
                        samplePaper: questionid,
                        answers,
                        timeSpent,
                        totalScore: score,
                        status
                    });
        
                    await activity.save();

                    await Samplepaper.updateOne({_id:questionid},{$push:{responses:activity._id}})
        
                    await User.updateOne({ username: decoded?.username }, { $push: { activities: activity._id } })
        
                    await session.commitTransaction();
                    session.endSession();
                } catch (error) {
                    console.log(error)
                    await session.abortTransaction();
                    session.endSession();
                    throw new BadRequest('something went wrong at solve');
                }
      
            return NextResponse.json({ message: "Answer submitted successfully", status, success:true }, { status: 201 });
        }
    }
)