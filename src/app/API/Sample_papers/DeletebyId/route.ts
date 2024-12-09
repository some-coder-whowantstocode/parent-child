import { NextApiRequest } from "next";
import { NextResponse } from "next/server";
import jwt from 'jsonwebtoken';

import { Activities, Samplepaper } from "@/app/lib/models/mongoose_models/problem";
import { Guardian } from "@/app/lib/models/mongoose_models/user";
import dbconnect from "@/app/lib/db";

export async function GET(req: NextApiRequest) {
    try {
        const { searchParams } = new URL(req.url || "");
        const id = searchParams.get('id');
        if (!id) {
            return NextResponse.json({ err: "question id is required" }, { status: 400 });
        }
        const token = req.cookies._parsed.get('authToken');
        if (!token) {
            return NextResponse.json({
                err: "Unauthorized access"
            }, { status: 401 })
        }

        const secretKey = process.env.SECRET_KEY;
        if (!secretKey) {
            throw new Error("Secret key is not defined");
        }
        const decoded = await jwt.verify(token.value, secretKey);
        const { email } = decoded;

        if (!id) {
            return NextResponse.json({
                err: "id is required"
            }, { status: 400 })
        }

        await dbconnect();

        const readablestream = new ReadableStream({
            start(controller) {
                (async function () {
                    const encoder = new TextEncoder();
                    controller.enqueue(encoder.encode('searching for the sample paper...'));
                    const samplepaper = await Samplepaper.findById(id);
                    if (!samplepaper) {
                        controller.enqueue(encoder.encode('NO such sample paper exists'));
                        controller.close();
                        return;
                    }
                    controller.enqueue(encoder.encode('sample paper found initializing delete...'));
                    await Samplepaper.deleteOne({ _id: id });
                    controller.enqueue(encoder.encode("sample paper delted, searching for metadata...."));
                    await Guardian.findOneAndUpdate({ email }, { $pull: { samplePapers: id } }, { new: true });
                    controller.enqueue(encoder.encode("metadata found, removed metadata....."));
                    controller.enqueue(encoder.encode("removing responses....."));
                    await Activities.deleteMany({ samplePaper: id });
                    controller.enqueue(encoder.encode("deleted completely....."));
                    controller.close();

                })()
            }
        })


        return new NextResponse(readablestream, {
            headers: {
                'Content-Type': "text/plain",
                'Transfer-Encoding': 'chunked'
            }
        })
    } catch (error) {
        console.log(error)
        return NextResponse.json({
            err: "something went wrong "
        }, { status: 500 })
    }
}