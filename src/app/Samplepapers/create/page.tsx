'use client'
import { RefObject, useRef, useState } from 'react';
import style from './style.module.css';
import { MdEdit, MdDone } from "react-icons/md";
import { useSample } from '@/app/lib/contexts/samplepaperContext';
import { FaCaretRight, FaCaretDown, FaPlus } from "react-icons/fa";

interface match {
    left:string,
    right:string
}

const page = ()=>{

    const {QUESTION_TYPES, questions} = useSample();

    const [edit, setedit] = useState(false);
    const [title, settitle] = useState('title');
    const [add, setadd] = useState(false);
    const [type, settype] = useState(0);
    const [showtype, setshow] = useState(false);
    const [options, setoptions] = useState<string[]>([]);
    const [matchups, setmatchup] = useState<match[]>([]);
    
    const optRef = useRef<HTMLInputElement|null>(null);
    const leftRef = useRef<HTMLInputElement|null>(null);
    const rightRef = useRef<HTMLInputElement|null>(null);


    return (
        <div
        // className={style.paper}
        >
            <div
            className={style.paper}
            >
            <div
            className={style.title}
            >preview</div>
            <div
            className={style.header}
            >
                <div
                >{
                    edit ?
                    <input type="text" defaultValue={title} onChange={(e)=>{settitle(e.target.value)}} />
                    :<>{title.length > 20 ? title.slice(0,20) + '...' : title }</>}</div>
                {
                
                }
                <div
                className={style.edit}
                >
                    {
                        edit ?
                        <MdDone 
                        onClick={()=>setedit(false)}
                        
                        />
                        :
                        <MdEdit 
                        onClick={()=>setedit(true)}
                        
                        />
                    }
                   
                </div>
            </div>
            <div
            className={style.preview}
            >
                {}
            </div>
                <button
                className={style.add}
                onClick={()=>setadd(true)}
                >add question</button>

                <button>create paper</button>
                </div>

            <div>

                <form 
                className={[style.questionform , !add && style.hidden].join(' ')}
                >
                    <div
                        className={style.questionformheader}
                    >
                        <div
                        className={style.score}
                        >
                            <p>score : </p>
                            <input type="number" defaultValue={10} name='score' />
                        </div>
                        <div
                        className={style.questionType}
                        >
                            <div>
                            <div>{QUESTION_TYPES[type]}</div>
                            <div
                            className={style.typebtn}
                            >

                            {
                                showtype ?
                                <FaCaretDown
                                onClick={()=>setshow(false)}
                                />
                                :
                                <FaCaretRight 
                                onClick={()=>setshow(true)}
                                />
                               
                            }
                            </div>
                            </div>
                            
                            {
                                showtype && 
                                <div
                                className={style.qtypeopt}
                                >
                                {
                                    QUESTION_TYPES.map((t,i)=>(
                                        <p
                                        className={`${type===i && style.selected}`}
                                        onClick={()=>settype(i)}
                                        >{t}</p>
                                    ))
                                }
                            </div>
                                }
                        </div>
                    </div>

                    <div
                    className={style.title}
                    >
                        question
                    </div>
                    <textarea name="question"  className={style.question}></textarea>
                    
                    
                    <div
                        className={style.questionadons}
                        >
                            {
                                type === 1 && 
                                <div
                                className={style.multiplechoice}
                                >
                                    <div 
                                    className={style.title}
                                    >Options</div>
                                    <div
                                    className={style.options}
                                    >
                                    {
                                        options.map((opt,i)=>(
                                            <div
                                            className={style.option}
                                            >
                                                <p>{i+1}</p>
                                                <p>{opt}</p>
                                            </div>
                                        ))
                                    }
                                    <div>
                                    <input type="text" ref={optRef} />
                                    <FaPlus
                                    onClick={()=>{
                                        if(!optRef.current) return;
                                        const e : HTMLInputElement = optRef.current;
                                        setoptions(prev=>[...prev,e.value])
                                    }}
                                    />
                                    </div>
                                    </div>
                                    
                                </div>
                            }

                            {
                                type === 2 && 
                                <div
                                className={style.matchups}
                                >
                                    {
                                        matchups.map(({left, right},i)=>(
                                            <div>
                                                <div>{left}</div>
                                                <div>{right}</div>
                                            </div>
                                        ))
                                    }
                                    <div>
                                        <input type="text" ref={leftRef}/>
                                        <input type="text" ref={rightRef}/>
                                        <FaPlus
                                        onClick={()=>{
                                            const left = leftRef.current?.value || 'left';
                                            const right = rightRef.current?.value || 'right';
                                            setmatchup(prev=>[...prev,{left, right}])
                                        }}
                                        />
                                    </div>
                                </div>
                            }



                        </div>
                    
                    
                    <div>
                        
                    <div
                    className={style.title}
                    >
                        answer
                    </div>
                    </div>
                    <textarea name="answer" className={style.answer}></textarea>
                    <div>
                        <button>done</button>
                        <button>cancel</button>
                    </div>
                </form>

                <div>
                    <div>
                    dropdown for question type
                    </div>
                    <div>
                        mark for question
                    </div>
                </div>
                <div>
                    <div>question</div>
                    <div>answer</div>
                </div>
                <div>
                    <button>save</button>
                    <button>cancel</button>
                </div>
            </div>
            
            

            <div>
                <div>would you like to save the question or discard it.</div>
                <div>remember you can only save it in local which will be not accessible in other devices or if you clear or remove the current browser unless you create the paper</div>
                <div>
                <button>save</button>
                <button>discard</button>
                </div>
            </div>
        </div>
    )
}

export default page;