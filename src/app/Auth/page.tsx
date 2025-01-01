'use client'
import React, { useState } from 'react';

import style from './style.module.css'
import { useWorker } from '../lib/contexts/workerContext';
import { errorhandler } from '../lib/errorhandler';


const page = () => {

  const [animate, setanimate] = useState(style.setintro);
  const [turn, setturn] = useState(false);
  const [type, settype] = useState(false);

  const {useauthWorker} = useWorker();



  function change(){
    setanimate(style.setoutro);
    const timeid = setTimeout(() => {
      setturn(!turn);
      setanimate(style.setintro);
      clearTimeout(timeid);
    }, 300);
  }
  async function Auth(e:React.FormEvent<HTMLFormElement>,create:boolean){
    try {
      e.preventDefault();
      let inputdata = e.target as HTMLFormElement;
      let data = new FormData(inputdata);
      
      const objectdata : {[key:string]:FormDataEntryValue} = {};
      for(const [key, value] of data){
        objectdata[key] = value;
      }
      if(create){
        objectdata['type'] = type? 'guardian' : 'child';
        objectdata['create'] = 'true';
      }else{
        objectdata['login'] = 'true';

      }
        
      errorhandler(useauthWorker,objectdata);
      
    } catch (error) {
      console.log(error)
    }
  }


  return (
    <div
    className={style.authPage}
    >
      <div
      className={style.circle}
      ></div>
      <div
      className={style.shape1}
      ></div>
      <div
      className={style.shape2}
      ></div>
      <div
      className={style.shape3}
      ></div>
      <div
      className={style.auth}
      
      >
        {
          turn ? 
          <div
          className={`${style.back} ${animate}`}
          >
            <p>JOIN OUR LEARNING COMMUNITY Create a new account to start learning and teaching.</p>
            <div
            className={style.linkbox}
            onClick={()=>change()}
            >
            <p>Don't have an account yet? Create one now</p>
            </div>
          </div>

          :

        <div
        className={`${style.front} ${animate}`}
        >
          <div
          className={style.title}
          >Sign Up</div>
          <form onSubmit={(e)=>Auth(e,true)} >
            <div>
            <p>username</p>
            <input type="text" name='username' placeholder='superJohn' className={style.datainput}/>
            </div>
            <div>
            <p>fullname</p>
            <input type="text" name='fullname' placeholder='John Doe' className={style.datainput}/>
            </div>
            <div>
            <p>email</p>
            <input type="text" name='email' placeholder='JohnDoe@gmail.com' className={style.datainput}/>
            </div>
            <div>
            <p>password</p>
            <input type="password" name='password' placeholder='password' className={style.datainput}/>
            </div>
            <p className={style.typetext}>what type of account do you want to create</p>
            <div>
              <input type="button" onClick={()=>settype(true)} value="guardian" name='type' className={`${style.typebtn} ${type && style.selected}`}/>
              <input type="button" onClick={()=>settype(false)} value="child" name='type' className={`${style.typebtn} ${!type && style.selected}`}/>
            </div>
            <input type="submit" className={style.submitbtn} value="Create Account" />
          </form>
        </div>
        }
        
       
      </div>
      <div
      className={style.auth}
      >
      {
          !turn ? 
          <div
          className={`${style.back} ${animate}`}
          >
            <p>WELCOME BACK Sign in to access your classes and resources.</p>
            <div
            className={style.linkbox}
            onClick={()=>change()}
            >
            <p>Already have an account? Sign in here</p>
            </div>
          </div>

          :

        <div
        className={`${style.front} ${animate}`}
        >
          <div
          className={style.title}
          >Log In</div>
          <form onSubmit={(e)=>Auth(e,false)}>
            <div>
            <p>email or username</p>
            <input type="text" name='identifier' placeholder='superJohn' className={style.datainput}/>
            </div>
            <div>
            <p>password</p>
            <input type="password" name='password' placeholder='password' className={style.datainput}/>
            </div>
            <input type="submit" value="Log in" className={style.submitbtn} />
          </form>
          {/* <div
          className={style.linkbox}
          onClick={()=>change()}
          >
          <p>already have an account?</p>
          </div> */}
        </div>
        }
      </div>
    </div>
  )
}

export default page;