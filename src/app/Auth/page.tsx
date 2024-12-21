'use client'
import React, { useState } from 'react';
import style from './style.module.css'

const page = () => {

  const [animate, setanimate] = useState(style.setintro);
  const [turn, setturn] = useState(false);
  const [type, settype] = useState(false);

  function change(){
    setanimate(style.setoutro);
    const timeid = setTimeout(() => {
      setturn(!turn);
      setanimate(style.setintro);
      clearTimeout(timeid);
    }, 300);
  }

  async function createAccount(e:React.FormEvent<HTMLFormElement>){
    try {
      e.preventDefault();


      let inputdata = e.target as HTMLFormElement;
      let data = new FormData(inputdata);

      const objectdata : {[key:string]:FormDataEntryValue} = {};
      for(const [key, value] of data){
        objectdata[key] = value;
      }
      objectdata['type'] = type? 'guardian' : 'child';
      objectdata['create'] = 'true';

      const url = '/API/User/Auth';

      let stringdata = JSON.stringify(objectdata);

      const response = await fetch(url,{
        method:'POST',
        headers:{
          "Content-Type":"application/json"
        },
        body:stringdata
      });
      const result = await response.json()
      console.log(result);
      
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
          <form onSubmit={(e)=>createAccount(e)} >
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
          <form action="">
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