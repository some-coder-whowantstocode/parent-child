'use client'

import { useDispatch, useSelector } from 'react-redux';
import style from './style.module.css';
import { logout, useAuth } from '@/app/lib/slices/authSlice';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { FaRegUserCircle } from "react-icons/fa";
import { v4 } from 'uuid';
import { del } from '../API/User/Logout/route';
import { useRouter } from 'next/navigation';
import { setMessage } from '../lib/slices/popupSlice';

const page =()=>{

    const {loggedIn, username, email, fullname, type} = useSelector(useAuth);
    const formRef = useRef<HTMLFormElement|null>(null);
    const [fn, setfn] = useState("");
    const [un, setun] = useState("");
    const [em, setem] = useState("");
    const [active, setactive] = useState(false);
    const router = useRouter();

    const dispatch = useDispatch();

    const handleUpdate =(e:FormEvent<HTMLFormElement>)=>{
        try {
            e.preventDefault();
            console.log(e)
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(()=>{
        username && setun(username);
        fullname && setfn(fullname);
        email && setem(email);
    },[username, email, fullname])

    useEffect(()=>{
        let fnval = fn?.replace(/\s+/g,' ');
        fnval = fnval?.trim();
        let unval = un?.replace(/\s+/g,' ');
        unval = unval?.trim();
        let emval = em?.replace(/\s+/g,' ');
        emval = emval?.trim();
        if(!fnval || !emval || !unval){
            setactive(false);
            return;
        }
        if(fnval === fullname && unval === username && emval === email){
            setactive(false);
            return;
        }
        setactive(true);
    },[fn, un, em])

    return(
        <div
        className={style.profile}
        >
        {
         (loggedIn && username && email && fullname && type) && (
            <div
            className={[style.loggedin].join(" ")}
            >
                {/* img */}
                <FaRegUserCircle className={style.img}/>
                <form 
                ref={formRef}
                className={[style.form].join(" ")}
                >
                    <input type="text" name='username' defaultValue={un} onChange={(e)=>setun(e.target.value)} />
                    <input type="text" name='fullname' defaultValue={fn} onChange={(e)=>setfn(e.target.value)} />
                    <input type="text" name='email' defaultValue={em} onChange={(e)=>setem(e.target.value)} />
                    <input type="text" name='type' value={type} disabled />

                </form>
                {
                    active ?
                <button
                className={style.update}
                onClick={()=>{
                    if(formRef.current){
                        const form = formRef.current;
                        const FormEvent = new Event('submit',{
                            bubbles:true,
                            cancelable:true
                        }) 
                        form.dispatchEvent(FormEvent);
                        handleUpdate(FormEvent as unknown as FormEvent<HTMLFormElement>);
                    }
                }}
                >update</button>
                :
                <button className={style.disabled}>update</button>
                }
                <button
                className={style.logout}
                onClick={async()=>{
                    try {
                        del();
                        dispatch(logout());   
                        dispatch(setMessage("successfully logged out"))
                        router.replace('/Auth');
                    } catch (error) {
                        console.log(error)
                    }
                   
                }}
                >Logout</button>
                {/* <div className={style.title}>Analytics</div>

                <div
                className={style.AnalyticSkeleton}
                >
                    <div></div>
                    <div></div>
                    <div></div>
                </div>
                
                <div className={style.title}>Connections</div>
                <div
                className={style.connectionSkeleton}
                >
                    {
                        new Array(6).fill(null).map((_,i)=>(
                            <div
                            key={v4()}
                            ></div>
                        ))
                    }
                </div>
                <div className={style.title}>solved papers</div> */}

            </div>
         )
        }
        </div>
    )
}

export default page;