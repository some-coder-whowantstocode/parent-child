'use client'
import { useEffect, useRef, useState } from 'react';
import style from './style.module.css'
import { IoMdPersonAdd } from "react-icons/io";
import { v4 } from 'uuid';
import { useConn } from '../lib/contexts/connectionRequest';
import { useSelector } from 'react-redux';
import { useAuth } from '../lib/slices/authSlice';

const page =()=>{
    
    const {getConnections, getConnectionrequested, getConnectionrequests, sendConnectionRequest, connections, request, requested, connload, conreqedload, conreqload} = useConn();
    const {loggedIn} = useSelector(useAuth);
    
    const [initadd, setadd] = useState(false);

    const idRef = useRef<HTMLInputElement|null>(null)

    useEffect(()=>{
        if(loggedIn){
            getConnections();
            getConnectionrequested();
            getConnectionrequests();
        }
    },[])
    
    return(
        <>
         {
                loggedIn && 
                <div>
           

                <div
                className={style.conn}
                >
                    <div
                    className={style.title}
                    >Requests</div>
                    {
                        conreqload ?
                        <div>
                            {
                                new Array(5).fill(null).map((_,i)=>(
                                    <div key={v4()} className={style.skeleton}></div>
                                ))
                            }
                        </div>
                        :
                        <div>
                            {
                                request?.map(({username, role},i)=>(
                                    <>
                                    </>
                                ))
                            }
                            {request.length === 0 && <div
                            className={style.placeholder}
                            >you do not have any requests.</div>}
                        </div>
                    }
                </div>
    
    
                <div
                className={style.conn}
                >
                    <div
                    className={style.title}
                    >Request sent</div>
                    {
                        conreqedload ?
                        <div>
                            {
                                new Array(5).fill(null).map((_,i)=>(
                                    <div key={v4()} className={style.skeleton}></div>
                                ))
                            }
                        </div>
                        :
                        <div>
                            {
                                requested?.map(({username, role},i)=>(
                                    <>
                                    </>
                                ))
                            }
                            {connections.length === 0 && <div
                            className={style.placeholder}
                            >you have not sent any requests, try sending requests..</div>}
    
                        </div>
                    }
                </div>
    
    
                <div
                className={style.conn}
                >
                    <div
                    className={style.title}
                    >Connections</div>
                    {
                        connload ?
                        <div>
                            {
                                new Array(5).fill(null).map((_,i)=>(
                                    <div key={v4()} className={style.skeleton}></div>
                                ))
                            }
                        </div>
                        :
                        <div>
                            {
                                connections?.map(({username, role},i)=>(
                                    <>
                                    </>
                                ))
                            }
                            {connections.length === 0 && <div
                            className={style.placeholder}
                            >you do not have any connections try sending requests..</div>}
    
                        </div>
                    }
                </div>
    
    
                {
                    initadd ?
                    <div
                    onClick={()=>{
                        setadd(false)
                    }}
                    className={style.addblock}
                    >
                        <div
                        onClick={(e)=>{
                            e.stopPropagation()
                        }}
                        >
                            <div>Enter the username or email of the user you want to connect with</div>
                            <input ref={idRef} type="text" placeholder='identifier' />
                            <button
                            onClick={()=>sendConnectionRequest(idRef.current?.value)}
                            >send request</button>
                           
                        </div>
                    </div>
                    :
                    <div
                    className={style.add}
                    onClick={()=>{
                        setadd(true);
                    }}
                    >
                    <IoMdPersonAdd />
                    </div>
                }
            </div>
        }
       
        </>
    )
}

export default page;