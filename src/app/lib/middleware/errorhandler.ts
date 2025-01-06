import { NextApiRequest, NextApiResponse } from "next"
import { NextResponse } from "next/server";

export function errorHandler(handler:Function){
    return async function(req:NextApiRequest, resp:NextResponse){
        try {
            const res = await handler(req, resp); 
            return res;
        } catch (error : Error | any) {
          console.log(error)
            let errmsg = null;
            let errstatus = 500;

            if (error.name === "MongoNetworkError") {
              errmsg = "Network error: " + error.message;
            } else if (error.name === "MongoTimeoutError") {
              errmsg = "Timeout error: " + error.message;
            } else if (error.name === "ValidationError") {
              let verr: Error | any = Object.values(error.errors)[0];
              errmsg = verr.message;
            } else if (error.code === 11000) {
              errstatus = 409;
              errmsg = `${
                Object.keys(error.errorResponse.keyValue)[0]
              } already exists, please choose another.`;
            }
            
            return NextResponse.json(
              {
                error:
                  errmsg ||
                  error.message ||
                  "something went wrong while creating account.",
                success: false,
                statusCode: error.statusCode || errstatus,
              },
              { status: error.statusCode || errstatus }
            );
        }
    }
}