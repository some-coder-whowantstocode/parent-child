'use client'
import { useEffect, useState } from 'react'
import style from './style.module.css'
import style2 from '../create/style.module.css'
import style3 from '../style.module.css'
import { errorhandler } from '@/app/lib/errorhandler'
import { question, useSample } from '@/app/lib/contexts/samplepaperContext'
import { useParams } from 'next/navigation'
import { v4 } from 'uuid'

interface resp{
    totalScore:number,
    _id:string,
    timeSpent:number,
    status:2,
    createdAt:Date
}
interface pers{
    username:string
}

interface paper {
    createdAt:Date,
    passingPercent:number,
    questions:question[],
    responses:resp[],
    title:string,
    totalScore:number,
    _id:string,
    persons:pers[]
}

const page =()=>{
    const {getSamplePaper, samplepapers} = useSample();
    // const [paperinfo, setinfo] = useState<papers>();
    const [paper, setpaper] = useState<paper|null>(null);
    const {id} = useParams();

    useEffect(()=>{
        if(id){
            errorhandler(getSamplePaper,id,setpaper)
            let data = samplepapers.find(({_id})=> _id === id);
            // if(data) setinfo(data);
        }
    },[id])

    

    return(
        <div
        className={style.page}
        >
            <div
            className={style2.title}
            >
                {
                paper?
                paper.title
                :
                'question title'
                }
            </div>
            <div
            className={style.paper}
            >
                {
                    paper?.questions.map(({questionText,questionType,options,matchPairs,score,},i)=>(
                        <div 
                        key={v4()}
                        className={style2.Questionpaper}
                        >
                          <p>Q. {i + 1}</p>
                          <div>
                          <p
                          className={style2.ques}
                          > {questionText}</p>
                          <div
                          className={style2.opt}
                          >{
                          options?.map((opt,j)=>(
                            <p
                            key={v4()}
                            >{String.fromCharCode(97+j)}. {opt}</p>
                          ))
                          }</div>
                          {
                            questionType === 'match-up' &&
                            <div
                            className={style2.match}
                          >
                            <div>
                            <p>column A</p>
                            <p>column B</p>
                            </div>
                            {
                          matchPairs?.map((match, k)=>(
                            <div
                            key={v4()}
                            >
                            <p>{String.fromCharCode(97+k)+" "}.{match.left}</p>
                            <p>{String.fromCharCode(97+k)+" "}.{match.right}</p>
                            </div>
                          ))
                          }</div>
                          }
                         
                          </div>
                          <p
                          >{score}</p>
                         
                        </div>
                    ))
                }
            </div>

            <div
            className={style.title}
            >
                responses
            </div>
            <div
            >
                <div
                className={[style.responses,style.top].join(' ')}

                >
                    <p>slno</p>
                    <p>person</p>
                    <p>totalScore</p>
                    <p>status</p>
                    <p>timeSpent</p>
                    <p>submitedAt</p>
                </div>
                {
                    paper  ?
                    
                    paper.responses.map((res,i)=>(
                        <div
                        className={style.responses}
                        key={v4()}
                        >
                            <p>{i+1}</p>
                            <p>{paper.persons[i].username}</p>
                            <p>{res.totalScore}</p>
                            <p>{res.status}</p>
                            <p>{new Date(res.createdAt).getDate()}</p>
                            <p>{res.timeSpent}</p>
                        </div>
                    ))
                    :
                    <div
                    className={style3.paperSkeleton}
                    >
                        {
                            new Array(5).fill(null).map((_,i)=>(
                                <div
                                key={v4()}
                                ></div>
                            ))
                        }
                    </div>

                }
            </div>
        </div>
    )
}

export default page