'use client'
import React, { useEffect, useRef, useState } from "react";
import { LayoutProps } from "../../../.next/types/app/layout";
import style from './style.module.css'
import { v4 } from "uuid";
import { useRouter } from "next/navigation";
import { logout, useAuth, value } from "../lib/slices/authSlice";
import { FaRegUserCircle } from "react-icons/fa";
import { useWorker } from "../lib/contexts/workerContext";
import { useDispatch, useSelector } from "react-redux";
import { errorhandler } from "../lib/errorhandler";

const Layout :React.FC<LayoutProps> = ({children})=>{

    const barRef = useRef(null);
    const followerRef = useRef(null);
    const router = useRouter();
    const [currentlocation, setlocation] = useState("problems");
    const {loggedIn, type} = useSelector(useAuth);
    const {useauthWorker} = useWorker();
    const dispatch = useDispatch();

    const LOCATIONS = [
    {name:'Samplepapers', location:"Samplepapers", t:"guardian"},
    {name:'connections', location:"connections", t:'all'},
    ]

    const SECUREDPAGES = [
        'userprofile',
        'samplepapers'
    ]

    useEffect(()=>{
            const setPosition = ()=>{
                try {
                    if(!barRef.current || !followerRef.current) return;
            
                    const Bar : HTMLElement = barRef.current;
                    const follower : HTMLElement = followerRef.current;
        
                    for(let i =0;i<Bar.children.length;i++){
                        if( currentlocation === Bar.children[i].innerHTML ){
                            const child  = Bar.children[i] as HTMLElement;
        
                            const distanceX = child.offsetLeft - follower.offsetLeft;
                            const distanceY = child.offsetTop - follower.offsetTop;
        
                            follower.style.backgroundColor = "gray";
                            follower.style.position = 'fixed';
                            follower.style.transform = `translateX(${distanceX}px) translateY(${distanceY}px)`;
                            follower.style.width = `${child.offsetWidth}px`;
                            follower.style.height = `${child.offsetHeight}px`;
                        
                            follower.classList.add(style.jiggle);

                            const id = setTimeout(() => {
                                follower.classList.remove(style.jiggle)
                                clearTimeout(id);
                            }, 350);
                            break;
                        }
                    }
                } catch (error) {
                    console.log(error);
                }
            }
            setPosition();

            const debounce = (func:Function, wait:number)=>{
                let timeout : ReturnType<typeof setTimeout> ;
                return function(){
                    clearTimeout(timeout);
                    timeout = setTimeout(()=>func(),wait);
                }
            }

            window.addEventListener("resize",debounce(setPosition,150));

            return()=>{
                window.removeEventListener('resize',debounce(setPosition,150));
            }
      
    },[currentlocation])

    useEffect(()=>{
        console.log(useauthWorker)
         errorhandler(useauthWorker,{retrieve:true});
    },[])

 

    return (<>
    <nav
    className={style.nav}
    >
        <div 
        className={style.left}
        onClick={()=>{
            router.push('/')
        }}
        >
            connect
        </div>
        <div 
        className={style.middle}
        ref={barRef}
        >
            {
                loggedIn && LOCATIONS.map(({name, location, t})=>(
                    <div
                    key={v4()}
                    
                    >
                   { (t === 'all' || t === type)&&  <p
                    onClick={()=>{
                        setlocation(location);
                        
                        router.replace('/'+location)
                    }} 
                    
                    >{name}</p>}
                    </div>
                ))
            }
        </div>
        {
            loggedIn ? 
            <div
            className={style.right}
            >
                <FaRegUserCircle
                 className={style.logo}
                 onClick={()=>{
                     router.push(`/userprofile`)
                    }}
                    />
            </div>
            :
            <div 
        className={style.right}
        onClick={()=>{
            router.push('/Auth')
        }}
        >
            <p>
            login
            </p>
        </div>
        }
       
        
        <div ref={followerRef} className={style.follower}></div>
    </nav>
    {children}
    </>)
}

export default Layout;