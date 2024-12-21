'use client'
import { useState } from 'react';
import style from './style.module.css';
import { useRecoilState } from 'recoil';
import { sucess, error, running } from '../lib/recoil/atoms/popupatom';

const Layout =()=>{
    const [messages, setmessages] = useRecoilState(sucess);
    const [errors, seterrors] = useRecoilState(error);
    const [processes, setprocesses] = useRecoilState(running);

    return(
        <div>
            <div>
                {
                    messages.map((item)=>(
                        <>
                        {
                            
                        }
                        </>
                    ))
                }
            </div>
            <div>
                {
                    errors.map((item)=>(
                        <>
                        {
                            
                        }
                        </>
                    ))
                }
            </div>
            <div>
                {
                    processes.map((item)=>(
                        <>
                        {
                            
                        }
                        </>
                    ))
                }
            </div>
        </div>
    )
}

export default Layout