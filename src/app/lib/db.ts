'use server'
import mongoose from "mongoose";

const MONGODB_URI : string  = process.env.MONGODB_URI || '';

if(MONGODB_URI === ''){
    throw new Error(
        'please define the MONGODB_URI environment variable inside .env.local'
    );
};

let cached = global.mongoose;


async function dbconnect(){
    if(!cached){
        cached = global.mongoose = {conn: null, promise:null};
    }    
    if(cached.conn){
        return cached.conn;
    }
    if(!cached.promise){
        const options = {
            bufferCommands: false,
        }
        cached.promise = mongoose.connect(MONGODB_URI,options).then((mongoose)=>{
            console.log(mongoose);
            return mongoose;
        })
    }
    try {
        cached.conn = await cached.promise;
        cached.promise = null;
    } catch (error) {
        cached.promise = null;
        throw error;
    }
}

export default dbconnect;