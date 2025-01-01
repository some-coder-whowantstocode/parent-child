"use client";
import { FormEvent, RefObject, useRef, useState } from "react";
import style from "./style.module.css";
import { MdEdit, MdDone, MdDelete } from "react-icons/md";
import { question, useSample } from "@/app/lib/contexts/samplepaperContext";
import { FaCaretRight, FaCaretDown, FaPlus } from "react-icons/fa";
import { RxCross2 } from "react-icons/rx";
import { v4 } from "uuid";
import { setError } from "@/app/lib/slices/popupSlice";
import {useDispatch} from 'react-redux';
import { useRouter } from "next/navigation";

interface match {
  left: string;
  right: string;
}

const page = () => {
  const { QUESTION_TYPES, questions, createSamplePaper, setquestions, title, settitle } = useSample();

  const dispatch = useDispatch();
  
  const [edit, setedit] = useState(false);
  const [add, setadd] = useState(false);
  const [type, settype] = useState(0);
  const [showtype, setshow] = useState(false);
  const [options, setoptions] = useState<string[]>([]);
  const [matchups, setmatchup] = useState<match[]>([]);
  const [initcl, setcl] = useState(false);

  const optRef = useRef<HTMLInputElement | null>(null);
  const leftRef = useRef<HTMLInputElement | null>(null);
  const rightRef = useRef<HTMLInputElement | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);
  

  const addquestion = (e: FormEvent<HTMLFormElement>) => {
    try {
      e.preventDefault();
      const form = e.target as HTMLFormElement;
      const data = new FormData(form);
      form.reset();
      let objdata = {
        questionText: "",
        correctAnswer: "",
        score: 10,
      };
      objdata.questionText = `${data.get("questionText")}`;
      objdata.score = Number(`${data.get("score")}`);
      objdata.correctAnswer = `${data.get("correctAnswer")}`;

      if(!objdata.questionText || !objdata.score || !objdata.correctAnswer){
        dispatch(setError('question and answer and mark must be provided to create a question'))
        return;
      }

      switch (type) {
        case 1:
          {
            if(options.length < 2){
                dispatch(setError('atleast 2 or more options are required'))
                return;
            }
            let data = { options };
            objdata = { ...objdata, ...data };
          }
          break;

        case 2:
          {
            if(matchups.length < 2){
                dispatch(setError('atleast 2 or more match up pairs are required'))
                return;
            }
            let data = { matchPairs: matchups };
            objdata = { ...objdata, ...data };
          }
          break;
      }

      console.log(objdata);
      objdata = {...objdata, ...{questionType: QUESTION_TYPES[type]}}
      setquestions((prev) => [...prev, objdata]);
      clearQuestion();
      setadd(false);
    } catch (error) {
      console.log(error);
    }
  };

  const router = useRouter();

  const clearQuestion =()=>{
    try {
      const form = formRef.current;
      if(form){
          form.reset();
      }
        settype(0);
        setoptions([]);
        setmatchup([]);
    } catch (error) {
        console.log(error)
    }
  }

  return (
    <div
    >
      <div className={style.paper}>
        <div className={style.title}>preview</div>
        <div className={style.header}>
          <div>
            {edit ? (
              <input
                type="text"
                defaultValue={title}
                onChange={(e) => {
                  settitle(e.target.value);
                }}
              />
            ) : (
              <>{title.length > 20 ? title.slice(0, 20) + "..." : title}</>
            )}
          </div>
            {edit ? (
                <div
                    className={style.edit}
                    onClick={() => setedit(false)} 
                >
              <MdDone 
              />
              </div>
            ) : (
                <div
                className={style.edit}
                onClick={() => setedit(true)} 
                >
              <MdEdit 
              />
              </div>
            )}
        </div>
        <div className={style.preview}>

          {questions.map(({ questionText,questionType, score, options, matchPairs }, i) => (
            <div 
            key={v4()}
            className={style.Questionpaper}
            >
              <p>Q. {i + 1}</p>
              <div>
              <p
              className={style.ques}
              > {questionText}</p>
              <div
              className={style.opt}
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
                className={style.match}
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
              <p
              className={style.Del}
              onClick={()=>{
                setquestions(prev=>[...prev.slice(0,i), ...prev.slice(i+1,prev.length)])
              }}
              >
                <MdDelete/>
            </p>
            </div>
          ))}

        </div>
        <button className={[style.add,style.Save].join(' ')} onClick={() => setadd(true)}>
          add question
        </button>

        <div>
          <button
          className={style.Save}
          onClick={()=>createSamplePaper()}
          >save</button>
          <button 
          className={style.Cancel}
          onClick={() => setcl(true)}
          >back</button>
        </div>
      </div>

      <div>

        {/* question add form */}
        <form
            ref={formRef}
          onSubmit={(e) => addquestion(e)}
          className={[style.questionform, !add && style.hidden].join(" ")}
        >
          <div className={style.questionformheader}>
            <div className={style.score}>
              <p>mark : </p>
              <input type="number" defaultValue={10} name="score" />
            </div>
            <div className={style.questionType}>
              <div onClick={() => setshow((prev) => !prev)}>
                <div>{QUESTION_TYPES[type]}</div>
                <div className={style.typebtn}>
                  {showtype ? (
                    <FaCaretDown onClick={() => setshow(false)} />
                  ) : (
                    <FaCaretRight onClick={() => setshow(true)} />
                  )}
                </div>
              </div>

              {showtype && (
                <div className={style.qtypeopt}>
                  {QUESTION_TYPES.map((t, i) => (
                    <p
                      key={v4()}
                      className={`${type === i && style.selected}`}
                      onClick={() => {
                        setshow(false);
                        settype(i);
                      }}
                    >
                      {t}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className={style.formtitle}>question</div>
          <textarea 
          name="questionText"  
          className={style.question}
          placeholder="write your question here "
          ></textarea>

          <div className={style.questionadons}>
            {type === 1 && (
              <div className={style.multiplechoice}>
                <div className={style.formtitle}>Options</div>
                <div className={style.options}>
                  {options.map((opt, i) => (
                    <div key={v4()} className={style.option}>
                      <p>{i + 1}</p>
                      <p>{opt}</p>
                      <RxCross2
                        onClick={() => {
                          setoptions((prev) => {
                            return [
                              ...prev.slice(0, i),
                              ...prev.slice(i + 1, prev.length),
                            ];
                          });
                        }}
                      />
                    </div>
                  ))}

                  {
                    options.length < 6 && 

                    <div
                    className={style.addopt}
                    >
                    <input 
                     onKeyDown={(e)=>{
                         if(e.key === 'Enter'){
                             e.preventDefault()
                             e.stopPropagation();
                             const input = e.target as HTMLInputElement;
                             if (options.length >5) return;
                             let data = input.value;
                             input.value = ''
                             if(data === '') return;
                             setoptions((prev) => [...prev, data]);
                         }
                      }}
                    type="text" ref={optRef} />
                    <FaPlus
                     
                      onClick={() => {
                        if (!optRef.current || options.length >5) return;
                        const e: HTMLInputElement = optRef.current;
                        let data = e.value;
                        e.value = ''
                        if(data === '') return;
                        setoptions((prev) => [...prev, data]);
                      }}
                    />
                  </div>
                  }
                  
                </div>
              </div>
            )}

            {type === 2 && (
              <div className={style.matchups}>
               
                <div
                >
                     <div
                    className={style.formtitle}
                    >
                        matchup options
                    </div>
                    {
                        matchups.map(({left, right},i)=>(
                            <div
                            className={style.matchOpts}
                            key={v4()}
                            >
                                <div>{i+1}</div>
                                <div
                                className={style.i1}
                                >{left}</div>
                                <div
                                className={style.i2}
                                >{right}</div>
                                <div
                                >
                                    <MdDelete
                                    onClick={()=>{
                                        setmatchup(prev=>[...prev.slice(0,i),...prev.slice(i+1,prev.length)])
                                    }}
                                    className={style.addmatch}
                                    />
                                </div>
                            </div>
                        ))
                    }
                   
                    <div
                    className={style.matchOpts}
                    >
                        <div></div>
                  <input type="text" placeholder="left-side value" ref={leftRef}  className={style.i1}/>
                  <input type="text" placeholder="right-side value" ref={rightRef} className={style.i2}/>
                  <div>
                    {
                        matchups.length <= 10 && 
                        <FaPlus
                        className={style.addmatch}
                        onClick={() => {
                            const left = leftRef.current?.value || "";
                            const right = rightRef.current?.value || "";
                            if(!left || !right || matchups.length > 9 ) return;
                            setmatchup((prev) => [...prev, { left, right }]);
                          }}
                          />
                    }
                
                    </div>
                    </div>
                 
                </div>
              </div>
            )}
          </div>

          <div>
            <div className={style.formtitle}>answer</div>
          </div>
          <textarea 
          name="correctAnswer" 
          className={style.answer}
          placeholder={`write your answer here.    ${type === 1 ? ' //write the correct answer only do not write the option number' : ''} ${type === 2 ? ' //write the correct answer like this "left-right"  '  :''}${type === 3 ? ' //write only true or false' : ''}
            `}
          ></textarea>
          <div>
            <input 
            type="submit" 
            value="done" 
            className={[style.formbtn, style.Save].join(' ')} />
            <button
            className={[style.formbtn, style.Cancel].join(' ')}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                clearQuestion();
                setadd(false);
              }}
            >
              cancel
            </button>
          </div>
        </form>

        {/*  */}

      </div>

      {initcl && (
        <div className={style.floatcancel}>
          <div className={style.floatcontent}>
            <div>would you like to save the question or discard it.</div>
            <div className={style.alert}>
              remember you can only save it in local which will be not
              accessible in other devices or if you clear or remove the current
              browser unless you create the paper
            </div>
            <div>
              <button 
               onClick={()=>{
                setcl(false);
                router.replace('/Samplepapers')
              }}
              className={style.Save}
              >save</button>
              <button
                onClick={() => {
                  setcl(false);
                }}
                className={style.Save}
              >
                cancel
              </button>
              <button 
              onClick={()=>{
                clearQuestion();
                setcl(false);
                setquestions([]);
                router.replace('/Samplepapers')
              }}
              className={style.Cancel}
              >discard</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default page;
