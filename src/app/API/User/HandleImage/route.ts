'use server';
import { errorHandler } from "@/app/lib/middleware/errorhandler";
import { verifyToken } from "@/app/lib/middleware/verifyToken";
import { NextApiRequest, NextApiResponse } from "next";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { BadRequest } from "../../responses/errors";
import dbconnect from "@/app/lib/db";
import mongoose from "mongoose";
import Grid from 'gridfs-stream';
import { GridFsStorage } from "multer-gridfs-storage";
import multer from "multer";
import busboy from 'busboy';
import {ImageMetadata} from "@/app/lib/models/mongoose_models/image";

const storage = new GridFsStorage({
  url: process.env.MONGODB_URI,
  options: { useNewUrlParser: true, useUnifiedTopology: true },
  file: (req, file) => {
    return {
      bucketName: "profileimg",
      filename: `file_${Date.now()}_${file.originalname}`,
    };
  }
});

const upload = multer({ storage });

let gfs;
mongoose.connection.once('open', () => {
  gfs = Grid(mongoose.connection.db, mongoose.mongo);
  gfs.collection('profileimg');
});

const apiConfig = {
  api: {
    bodyParser: false,
  },
};

export const POST = errorHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  const maxsizeallowed = 10485760; // 10MB

  const contentLength = parseInt(req.headers["content-length"] || "");
  if (contentLength > maxsizeallowed) {
    return res.status(413).json(
      { success: false, error: "size exceeds the limit" }
    );
  }

  const cookiestore = await cookies();
  const token = cookiestore.get("authToken")?.value;
  if (!token) {
    return res.status(401).json({ success: false, error: "Unauthorized" });
  }
  const decoded = await verifyToken(token);

  const data = await req.formData();
  const file = data.get('img');
  const bufferdata = await file.arrayBuffer();
  const buffer = Buffer.from(bufferdata);
  console.log(buffer);
  
  return NextResponse.json({message:'good', success:true},{status:200})
});

// export { apiConfig as config };
