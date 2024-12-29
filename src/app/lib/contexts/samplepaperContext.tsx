'use client'
import React, { ReactNode, createContext, useContext, useState } from "react";

interface samplectx {
    children:ReactNode
}

interface sendval {
    QUESTION_TYPES:string[];
    questions:question[];
    setquestions:Function;
}

interface match{
    left:string,
    right:string
}

interface question {
    questionText :string,
    questionType:string,
    options: string[],
    correctAnswer:string,
    matchPairs:match[],
    //     chronologicalOrder:[{type:Number}],
    //     mapDetails:{type:String},
    //     caseText:{type:String},
    //     score:{type:Number,required:true,max:10,min:1}
}

const samplePaperContext = createContext<sendval | undefined>(undefined);

const SampleProvider: React.FC<samplectx> = ({children})=>{

    const [ questions, setquestions ] = useState<question[]>([]);
    const QUESTION_TYPES = [
        'question-answer',
        'multiple-choice', 
        'match-up',
        'true-false',
    ]



    return(
        <samplePaperContext.Provider
        value ={{QUESTION_TYPES, questions, setquestions}}
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