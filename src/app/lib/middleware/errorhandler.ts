import { NextApiRequest } from "next";
import { NextResponse } from "next/server";

export function errorHandler(handler:Function) {
    return async function(req:NextApiRequest) {
        try {
            const res = await handler(req); 
            return res;
        } catch (error : any) {
            console.log(error);
            let errmsg = null;
            let errstatus = 500;

            switch (error.name) {
                case "MongoNetworkError":
                    errmsg = "Network error: " + error.message;
                    break;
                case "MongoTimeoutError":
                    errmsg = "Timeout error: " + error.message;
                    break;
                case "ValidationError":
                    const verr : any = Object.values(error.errors)[0];
                    errmsg = verr.message;
                    break;
                case "TokenExpiredError":
                    errmsg = 'Token expired: ' + error.message;
                    break;
                case "JsonWebTokenError":
                    errmsg = 'Invalid token: ' + error.message;
                    break;
               
            }

            if (error.code === 11000) {
                errstatus = 409;
                errmsg = `${
                    Object.keys(error.keyValue)[0]
                } already exists, please choose another.`;
            }

            return NextResponse.json(
                {
                    error: errmsg || error.message || "Something went wrong while processing your request.",
                    success: false,
                    statusCode: errstatus,
                },
                { status: errstatus }
            );
        }
    }
}
