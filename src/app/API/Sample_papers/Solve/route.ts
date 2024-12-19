import { NextApiRequest } from "next";
import { NextResponse } from "next/server";

import { ReadStream } from "@/app/lib/streamReader";
import { Activities, Samplepaper } from "@/app/lib/models/mongoose_models/problem";
import { User } from "@/app/lib/models/mongoose_models/user";
import { verifyToken } from "@/app/lib/middleware/verifyToken";
import dbconnect from "@/app/lib/db";

export async function POST(req: NextApiRequest) {
    try {
        const data = await ReadStream(req.body);
        const { questionid, answers, timeSpent } = data;
        const token = req.cookies._parsed.get("authToken").value;

        if (!token) {
            return NextResponse.json({ err: "Unauthorized access" }, { status: 401 });
        }

        const decoded = await verifyToken(token);
        
        await dbconnect();
        const user = await User.findOne({ username: decoded?.username }).select("isdeleted");

        if (!user || user.isdeleted) {
            return NextResponse.json({ err: "Unauthorized access" }, { status: 401 });
        }

        const { questions, isdeleted } = await Samplepaper.findOne({ _id: questionid }).select("questions isdeleted");

        if (!questions || isdeleted) {
            return NextResponse.json({ err: "No such question exists" }, { status: 400 });
        }

        if (!questionid || !answers || !timeSpent) {
            return NextResponse.json({ err: "questionid, timeSpent and answers are required" }, { status: 400 });
        }

        let score = 0;

        const { GoogleGenerativeAI } = require("@google/generative-ai");
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        for (let i = 0; i < answers.length && i < questions.length; i++) {
            switch (questions[i].questionType) {
                case 'multiple-choice': {
                    if (questions[i].correctAnswer === answers[i].answer) {
                        const mark = questions[i].score;
                        answers[i].score = mark;
                        score += mark;
                    }
                    break;
                }
                case 'match-up': {
                    if (JSON.stringify(answers[i].answer) === JSON.stringify(questions[i].correctAnswer)) {
                        const mark = questions[i].score;
                        answers[i].score = mark;
                        score += mark;
                    }
                    break;
                }
                case 'chronological-order': {
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
                    }
                    break;
                }
                case 'true-false': {
                    if (questions[i].correctAnswer === answers[i].answer) {
                        const mark = questions[i].score;
                        answers[i] = {...answers[i],score:mark};
                        // answers[i].score = mark;
                        score += mark;
                    }
                    break;
                }
                default: {
                    const prompt = `Question: ${questions[i].questionText} 
                                    Correct Answer: ${questions[i].correctAnswer} 
                                    Given Answer: ${answers[i].answer} 
                                    Match the given answer to the correct answer and grade the similarity. 
                                    Only return a number between 0 and ${questions[i].score}. 
                                    If the given answer is empty, return 0. 
                                    Question Type: ${questions[i].questionType}`;
                    const result = await model.generateContent(prompt);
                    let mark = Number(result.response.text());
                    console.log(answers[i]);
                    answers[i].score = mark;
                    score += mark;
                    break;
                }
            }
        }

        const activity = new Activities({
            child: user._id,
            samplePaper: questionid,
            answers,
            timeSpent,
            totalScore:score,
            status:1
        });

        await activity.save();

        return NextResponse.json({ message: "Answer submitted successfully" }, { status: 201 });
    } catch (error) {
        console.log(error)
        return NextResponse.json({ err: "Something went wrong" }, { status: 500 });
    }
}
