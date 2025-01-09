"use client"

import { errorhandler } from "@/app/lib/errorhandler";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import style from './style.module.css';
import { useDispatch } from "react-redux";
import { setMessage } from "@/app/lib/slices/popupSlice";

interface userdata {
    username: string; 
    role: string; 
    isdeleted:boolean; 
    connectionCount:number; 
    samplePaperCount:number; 
    activityCount:number;
    _id:string;
}

const page = ()=>{

    const [info, setinfo] = useState<userdata|null>(null);
    const [completed, setcompletion] = useState(false);
    const {username} = useParams();
    const dispatch = useDispatch();

    const getdata = async(user : string)=>{
        const url = `Api/User/Getprofile?u=${user}`
        const streamdata = await fetch(url);
        const jsondata = await streamdata.json();
        if(jsondata.success && jsondata.user){
            setinfo(jsondata.user);
            dispatch(setMessage("user data retrieved."))
        }
        // setcompletion(true);
    }

    useEffect(()=>{
        if(typeof(username) !== 'string') return;
       errorhandler(getdata,username);
    },[])

    return (
        <>
        {
            completed 
            ?
                info 
                ?
                        <></>
                :
                        <></>
            :
                <div
                className={style.skeleton}
                >
                    <div
                    className={style.userinfo}
                    >
                        <div>img</div>
                        <div>user info</div>
                    </div>
                    <div
                    className={style.userdetails}
                    >
                        <div>samplepaer</div>
                        <div>solved</div>
                    </div>
                </div>
        }
        </>
    )
}

export default page;