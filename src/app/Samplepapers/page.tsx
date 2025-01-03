'use client'
import { useEffect, useState } from "react";
import { useAuth } from "../lib/slices/authSlice";
import { useDispatch, useSelector } from "react-redux";
import style from './style.module.css';
import { v4 } from "uuid";
import { useRouter } from "next/navigation";
import { setError, setMessage } from "../lib/slices/popupSlice";
import { useSample } from "../lib/contexts/samplepaperContext";
import { papers } from "../lib/contexts/samplepaperContext";


const page =()=>{
    //retrieve all sample papers 
    const {loggedIn} = useSelector(useAuth);
    const [loading, setloading] = useState(false);
    const router = useRouter();
    const dispatch = useDispatch();
    const {samplepapers, setpapers, dataloaded} = useSample();

    const getSamplePapersForGuardian =async()=>{
        try {
            setloading(true);
            if(loggedIn){
                const url = 'API/Sample_papers/Getallsamplepapers';
                const data = await fetch(url);
                const jsondata = await data.json();
                if(!jsondata.success){
                    dispatch(setError(jsondata.error))
                    return;
                }
                let arr = jsondata.samplePapers as papers[];
                arr = arr.map((data)=>{
                    let date = new Date(data.createdAt);
                    let newdate = `${date.getDate()} ${date.toLocaleString('default',{month:'short'})} `
                    data.createdAt = newdate;
                    return data;
                })
                setpapers(arr)
                dispatch(setMessage(jsondata.message || 'sample papers retrieved successfully'))
                console.log(jsondata)
            }    
        } catch (error : Error | any) {
            console.log(error);
            dispatch(setError(error.message ? error.message : 'failed to retrieve samplepapers'))
        }finally{
            setloading(false);
        }
        
    }


    useEffect(()=>{
        if(dataloaded) return;
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
            loading && 
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