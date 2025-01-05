'use client'
import { headers } from "next/headers";
import React, { ReactNode, createContext, useContext, useState } from "react";
import { useDispatch } from "react-redux";
import { setError, setMessage } from "../slices/popupSlice";

interface samplectx {
    children:ReactNode
}

interface sendval {
    QUESTION_TYPES:string[];
    questions:question[];
    setquestions:Function;
    createSamplePaper:Function;
    title:string;
    settitle:Function;
    samplepapers:papers[];
    setpapers:Function;
    dataloaded:boolean,
    setload:Function,
    getSamplePaper:Function
}

interface match{
    left:string,
    right:string
}

export interface question {
    questionText :string,
    questionType:string,
    options?: string[],
    correctAnswer:string,
    matchPairs?:match[],
        score:number
}
export interface papers {
    title:string,
    _id:string,
    responseCount:number,
    createdAt:string,
    totalScore:number,
    passingPercent:number
}

const samplePaperContext = createContext<sendval | undefined>(undefined);

const SampleProvider: React.FC<samplectx> = ({children})=>{

    const [ questions, setquestions ] = useState<question[]>([]);
    const [title, settitle] = useState('question paper');
    const QUESTION_TYPES = [
        'question-answer',
        'multiple-choice', 
        'match-up',
        'true-false',
    ]
    const [samplepapers, setpapers] = useState<papers[]>([]);
    const [dataloaded, setload] = useState(false);



    const dispatch = useDispatch();

    const createSamplePaper =async(func:Function)=>{
            const url = '/API/Sample_papers/Create';
            const objectdata = {
                questions,
                title,
                passingMark:30
            }
            const stringdata = JSON.stringify(objectdata);
            const data = await fetch(
                url,
                {
                    method:"POST",
                    headers:{
                        
                    },
                    body:stringdata
                }
            )
            const jsondata = await data.json();
            console.log(jsondata.success)
            if(jsondata.success){
                dispatch(setMessage('paper created successfully'))
                setquestions([]);
                func();
            }
            setload(true);
            return jsondata;
    }

    const getSamplePaper = async(id : string, setpaper:Function)=>{
        const url = `/API/Sample_papers/GetbyIdsamplepaper?id=${id}`;
        const data = await fetch(url);
        const jsondata = await data.json()
        console.log(jsondata)
        if(jsondata.success){
            setpaper(jsondata.samplePaper)
        }

        return jsondata;
    }


    return(
        <samplePaperContext.Provider
        value ={{QUESTION_TYPES,samplepapers,dataloaded,getSamplePaper, setload, setpapers ,questions, setquestions, createSamplePaper, title, settitle}}
        >
            {children}
        </samplePaperContext.Provider>
    )
}

const useSample = ()=>{
    const ctx = useContext(samplePaperContext);
    if(!ctx){
        throw new Error('no ctx found in sample paper ctx')
    }
    return ctx ;
}

export {
    useSample,
    SampleProvider
}