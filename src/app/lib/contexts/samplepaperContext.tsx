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
    //     chronologicalOrder:[{type:Number}],
    //     mapDetails:{type:String},
    //     caseText:{type:String},
        score:number
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

    const dispatch = useDispatch();

    const createSamplePaper =async()=>{
        try {
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
            console.log(data);
            const jsondata = await data.json();
            console.log(jsondata)
            dispatch(setMessage('paper created successfully'))
        } catch (error) {
            console.log(error);
            dispatch(setError('paper creation failed'))
        }
    }


    return(
        <samplePaperContext.Provider
        value ={{QUESTION_TYPES, questions, setquestions, createSamplePaper, title, settitle}}
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