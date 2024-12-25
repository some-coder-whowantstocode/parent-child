'use client'
import React, { useEffect, useRef, useState } from "react";
import { LayoutProps } from "../../../.next/types/app/layout";
import style from './style.module.css'
import { v4 } from "uuid";
import { useRouter } from "next/navigation";
import { useAuth, value } from "../lib/slices/authSlice";
import { FaRegUserCircle } from "react-icons/fa";
import { useWorker } from "../lib/contexts/workerContext";
import { useSelector } from "react-redux";

const Layout :React.FC<LayoutProps> = ({children})=>{

    const barRef = useRef(null);
    const followerRef = useRef(null);
    const router = useRouter();
    const [currentlocation, setlocation] = useState("problems");
    const {loggedIn} = useSelector(useAuth);
    const {useauthWorker} = useWorker();

    const LOCATIONS = [
    {name:'problems', location:"problems"},
    {name:'connections', location:"connections"},
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
        useauthWorker({retrieve:true});
    },[])

    return (<>
    <nav
    className={style.nav}
    >
        <div 
        className={style.left}
        onClick={()=>{
            router.replace('/')
        }}
        >
            connect
        </div>
        <div 
        className={style.middle}
        ref={barRef}
        >
            {
                loggedIn && LOCATIONS.map(({name, location})=>(
                    <p
                    onClick={()=>{
                        setlocation(location);
                        router.replace(location)
                    }} 
                    
                    key={v4()}>{name}</p>
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
                     router.replace('/Auth')
                    }}
                    />
            </div>
            :
            <div 
        className={style.right}
        onClick={()=>{
            router.replace('/Auth')
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