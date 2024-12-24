'use client'
import React, { createContext, ReactNode, useContext, useRef } from "react";
import { useDispatch } from "react-redux";
import { setError, setMessage } from "../slices/popupSlice";


interface UserContextType {
    startauthWorker:Function,
    stopauthWorker:Function,
    useauthWorker:Function
}

interface MyComponentProps { children: ReactNode}

const workerContext = createContext<UserContextType | undefined>(undefined);

const WorkerProvider:React.FC<MyComponentProps> = ({children})=>{
    const authWorkerRef = useRef<Worker | null>(null);
    const URL = '/workers/worker.js';

    const dispatch = useDispatch();
    

    const startauthWorker =()=>{
        try {
            if(authWorkerRef.current) return;
                 const webworker = new Worker(URL,{type:'module'});
                 authWorkerRef.current = webworker;
        } catch (error) {
            console.log(error);
        }
    }

    const stopauthWorker =()=>{
        try {
            if(authWorkerRef.current){
                authWorkerRef.current.terminate();
                authWorkerRef.current = null;
            }
        } catch (error) {
            console.log(error);
        }
    }

    const useauthWorker =(objectdata : object)=>{
        try {
            startauthWorker();
            const webworker = authWorkerRef.current;
            if(webworker){
                webworker.postMessage(objectdata);
                webworker.onmessage = function(event){
                    const {data} = event;
                    
                    if(!data.success){
                      dispatch(setError(data.err))
                    }else{
                        console.log(data)
                      dispatch(setMessage(data.message))
                    }
                  }
                webworker.onerror = function(err){
                    dispatch(setError("worker failed to initiated"))
                    console.log(err)
                }
            }
          
        } catch (error) {
            console.log(error)
        }
         
    }

    return (
        <workerContext.Provider value={{startauthWorker, stopauthWorker, useauthWorker}}>
            {children}
        </workerContext.Provider>
    )
}

const useWorker = ()=>{
    const context = useContext(workerContext);
    if(!context){
        throw new Error("use worker must be used within a workerprovider");
    }
    return context;
}

export { useWorker, WorkerProvider}