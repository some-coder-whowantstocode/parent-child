'use client'
import { useEffect, useState } from "react";
import { useAuth } from "../lib/slices/authSlice";
import { useSelector } from "react-redux";
import style from './style.module.css';
import { v4 } from "uuid";
import { useRouter } from "next/navigation";

interface papers {
    title:string,
    _id:string,
    responseCount:number,
    createdAt:string,
    totalScore:number,
    passingMark:number
}
const page =()=>{
    //retrieve all sample papers 
    const {loggedIn} = useSelector(useAuth);
    const [samplepapers, setpapers] = useState<papers[]>([]);
    const [loading, setloading] = useState(false);
    const router = useRouter();

    const getSamplePapersForGuardian =async()=>{
        try {
            if(loggedIn){
                const url = 'API/Sample_papers/Getallsamplepapers';
                const data = await fetch(url);
                const jsondata = await data.json();
                let arr = jsondata.samplePapers as papers[];
                arr = arr.map((data)=>{
                    let date = new Date(data.createdAt);
                    let newdate = `${date.getDate()} ${date.toLocaleString('default',{month:'short'})} `
                    data.createdAt = newdate;
                    return data;
                })
                setpapers(arr)
                console.log(jsondata)
            }    
        } catch (error) {
            console.log(error);
        }
        
    }

    useEffect(()=>{
            getSamplePapersForGuardian()
       
    },[])

    useEffect(()=>{
        if(loggedIn){
            getSamplePapersForGuardian()

        }
    },[loggedIn])

    return(
        <>
        <div 
        className={style.controller}
        >
            <button
            className={style.create}
            onClick={()=>router.push('/Samplepapers/create')}
            >create</button>
        </div>
        <div
        className={style.header}
        >
            <p>slno</p>
            <p>title</p>
            <p>totalScore</p>
            <p>passingMark</p>
            <p>responseCount</p>
            <p>Date</p>
        </div>
        {
            (samplepapers && samplepapers.length>0) && 
            samplepapers.map(({title,_id,responseCount,createdAt,totalScore,passingMark},i)=>(
                <div 
                key={_id}
                className={style.data}
                >
                    <p>{i+1}</p>
                    <p>{title.slice(0,8) + '...'}</p>
                    <p>{totalScore}</p>
                    <p>{passingMark}</p>
                    <p>{responseCount}</p>
                    <p>{createdAt}</p>
                </div>
            ))
        }
        {
            // loading && 
            <div
            className={style.paperSkeleton}
            >
                {
                    new Array(20).fill(null).map((_,i)=>(
                        <div
                        key={v4()}
                        ></div>
                    ))
                }
            </div>
        }
        </>
    )
}

export default page;