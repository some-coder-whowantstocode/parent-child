"use server";
import { NextApiRequest } from "next";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

import { reqbody } from "@/app/lib/models/Auth/signup";
import dbconnect from "../../../lib/db";
import { User } from "@/app/lib/models/mongoose_models/user";
import handleEmailVerification from "@/app/lib/emailverification";
import { BadRequest, Unauthorized } from "../../responses/errors";
import { serialize } from "cookie";
import { verifyToken } from "@/app/lib/middleware/verifyToken";
import { errorHandler } from "@/app/lib/middleware/errorhandler";
import { cookies } from "next/headers";

interface USER {
  isverified: boolean;
  password: string;
  role: string;
  email: string;
  _id: string;
  username: string;
  fullname: string;
  type: string;
}

export const POST = errorHandler( async (req: NextApiRequest)=> {
    if (!req.body) {
      throw new BadRequest("body is required please provide a body");
    }
    const streamdata = req.body;
    const reader = streamdata.getReader();
    const decoder = new TextDecoder("utf-8");
    let chunks = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      chunks += decoder.decode(value, { stream: true });
    }
    if (!chunks) {
      throw new BadRequest("body is missing in the request");
    }

    const secretKey = process.env.SECRET_KEY;
    if (!secretKey) {
      throw new Error(
        "Secret key not found."
      );
    }
    const data: reqbody = JSON.parse(chunks);
    await dbconnect();

    if (data.create) {
      let user;
      const { fullname, username, email, password, type } = data;

      if (!fullname || !username || !email || !password || !type) {
      throw new BadRequest("please provide all required data.fullname, username, email, password and type.");
      }

      if(password.length < 6 || password.length > 20){
      throw new BadRequest("The password must be in between the range of 6 to 20");
      }

      const hashedpassword = await bcrypt.hash(password, 10);

      const verificationToken = jwt.sign({ fullname, email }, secretKey, {
        expiresIn: "24h",
      });
      user = new User({
        fullname,
        username,
        email,
        password: hashedpassword,
        connections: [],
        verificationToken,
        role: type,
      });
      await user.save();
      const url = process.env.ORIGIN+"/verify/"+verificationToken;
      const encodeurl = encodeURI(url);
      let text = `visit this link:${encodeurl} to verify your mail link`;
      handleEmailVerification("verification of email", text, email, text);
      return NextResponse.json(
        {
          success: true,
          message:
            "User created successfully, please verify the account through your email.",
        },
        { status: 200 }
      );
    }

    if (data.verify) {
      let user;
      const { token } = data;
      if (!token) {
        throw new BadRequest("please provide all required data")
      }

      const decodedtoken = await jwt.verify(token, secretKey) as {email:string, fullname:string}
      if (!decodedtoken || !decodedtoken.email || !decodedtoken.fullname) {
        throw new Unauthorized("invalid token");
      }
      const currentTime = Date.now();
      user = await User.findOne({
        email: decodedtoken.email,
        verificationToken: token,
        tokenExpires: { $gt: currentTime },
      });

      if (!user) {
        throw new Unauthorized("Wrong credentials or the link has expired.");
      }

      if (Date.now() > user.tokenExpires) {
        const secretKey = process.env.SECRET_KEY;
        if (!secretKey) {
          throw new Error(
            "Secret key is not defined. Please set JWT_SECRET_KEY in your .env.local file."
          );
        }
        const verificationToken = jwt.sign(
          { fullname: user.fullname, email: user.email },
          secretKey,
          { expiresIn: "24h" }
        );
        let text = `visit this link to verify your mail link`;
        handleEmailVerification(
          "verification of email",
          text,
          decodedtoken.email,
          text
        );
        await User.updateOne(
          { email: decodedtoken.email },
          { verificationToken, tokenExpires: Date.now() + 24 * 60 * 60 * 1000 }
        );
        throw new BadRequest("token expired resending link to user");
      }

      if (!user.isVerified) {
        await User.updateOne(
          { email: decodedtoken.email },
          { isverified: true, verificationToken: null, tokenExpires: null }
        );
      }

      return NextResponse.json(
        {
          success:true,
          message:"successfully verified"
        },
        { status: 200 }
      );
    }

    if (data.login) {
      const { identifier, password, rememberme } = data;
      const regex =
        /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/g;
      if (!identifier || !password) {
        throw new BadRequest("please provide identifier and password.");
      }

      if (typeof identifier != "string" && typeof password != "string") {
        throw new BadRequest("The type of the data provided are incorrect");
      }

      let query;
      if (regex.test(identifier)) {
        query = { email: identifier };
      } else {
        query = { username: identifier };
      }

      const projection = "isverified password _id email username fullname role";
      let user = await (async (): Promise<USER | null> => {
        let userdata = await User.findOne(query).lean().select(projection);
        let data = userdata as unknown;
        if (data && typeof data === "object") {
          return data as USER;
        }
        return null;
      })();
      if (!user) {
        throw new BadRequest("invalid user information");
      }
      if (!user.isverified) {
        throw new Unauthorized("user is not verified, please verify first");
      }
      const issame = await bcrypt.compare(password, user.password);

      if (!issame) {
        throw new BadRequest("invalid user information");
      }
      const secretKey = process.env.SECRET_KEY;
      if (!secretKey) {
        throw new Error(
          "Secret key is not defined. Please set JWT_SECRET_KEY in your .env.local file."
        );
      }
      const verificationToken = jwt.sign(
        {
          type: user.role,
          email: user.email,
          id: user._id,
          auth: true,
          username: user.username,
        },
        secretKey,
        { expiresIn: "24h" }
      );
       
      const cookie = serialize('authToken',verificationToken,{
        httpOnly:true,
        secure:process.env.NODE_ENV === "production",
        maxAge: rememberme ? 60 * 60 * 24 * 30 : 60 * 60 * 24,
        path:"/",
        sameSite:'strict'
      })
      const response =  NextResponse.json(
        {
          success: true,
          message:"loggedin successfully",
          username: user.username,
          fullname: user.fullname,
          email: user.email,
          type: user.role,
          token: verificationToken,
        },
        { status: 200 }
      );
      response.headers.set('Set-Cookie',cookie);
      return response;
    }

    if (data.retrieve){
        const cookiestore = await cookies();
        const token = cookiestore.get("authToken")?.value;        
        if(!token){
          throw new BadRequest("no token was found");
        }
        const decoded = await verifyToken(token);
        const user = await User.findOne({username:decoded?.username}).select("isdeleted fullname email")
        return NextResponse.json({
          success: true,
          username:decoded?.username,
          fullname:user.fullname,
          email:user.email,
          type:decoded?.type,
          message:"logged in successfully"
        },{status:200})
    }

    throw new BadRequest("Please add one type of intent create, verify, login or retrieve. Adding intent is as follows: create:true in request body.")

})
