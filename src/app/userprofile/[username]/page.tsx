"use client"

import { errorhandler } from "@/app/lib/errorhandler";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import style from './style.module.css';
import { useDispatch } from "react-redux";
import { setMessage } from "@/app/lib/slices/popupSlice";
import { FaRegUserCircle } from "react-icons/fa";


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
        const url = `/API/User/Getprofile?u=${user}`
        const streamdata = await fetch(url);
        const jsondata = await streamdata.json();
        if(jsondata.success && jsondata.user){
            setinfo(jsondata.user);
            dispatch(setMessage("user data retrieved."))
        }
        setcompletion(true);
        console.log(jsondata)
        return jsondata
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
                <div
                className={style.skeleton}
                >
                    <div
                    className={style.userinfo}
                    >
                        <FaRegUserCircle
                        className={style.img}
                        />
                        <div
                        >
                            <div>
                            <div>username</div>
                            <div>
                            {info.username}
                            </div>
                            </div>
                            <div
                            >
                                <div>role</div>
                                <div>
                                {info.role}
                                </div>
                                </div>
                            <div
                            >
                                {info.connectionCount}
                                <div>connections</div>
                                </div>
                        </div>
                    </div>
                    <div
                    >
                        <div></div>
                        <div></div>
                    </div>
                </div>
                :
                        <>no such user found</>
            :
                <div
                className={style.skeleton}
                >
                    <div
                    className={style.userinfo}
                    >
                        <div
                        className={style.img}
                        ></div>
                        <div
                        className={style.infobox}
                        >
                            <div
                            className={style.username}
                            ></div>
                            <div
                            className={style.fullname}
                            ></div>
                            <div
                            className={style.connections}
                            ></div>
                        </div>
                    </div>
                    <div
                    className={style.userdetails}
                    >
                        <div></div>
                        <div></div>
                    </div>
                </div>
        }
        </>
    )
}

export default page;