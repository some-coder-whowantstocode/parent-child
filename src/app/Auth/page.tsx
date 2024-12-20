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
          <form action="">
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
            <div>
              <input type="button" value="guardian" name='type' className={style.typebtn}/>
              <input type="button" value="child" name='type' className={style.typebtn}/>
            </div>
            <input type="submit" value="Create Account" />
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
          >Sign Up</div>
          <form action="">
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
            <div>
              <input type="button" value="guardian" name='type' className={style.typebtn}/>
              <input type="button" value="child" name='type' className={style.typebtn}/>
            </div>
            <input type="submit" value="Create Account" />
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

export default page
