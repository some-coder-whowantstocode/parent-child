'use client'
import { headers } from "next/headers";
import React, { ReactNode, createContext, useContext, useState } from "react";
import { useDispatch } from "react-redux";
import { setError, setMessage } from "../slices/popupSlice";

interface ctx {
    children:ReactNode
}

type role = 'guardian' | 'child'

interface user{
    username:string,
    role:role
}

interface sendval {
    connections:user[],
    setconnections:Function,
    request:user[],
    setrequests:Function,
    requested:user[],
    setrequested:Function,
    connload:boolean,
    setconn:Function,
    conreqedload:boolean,
    setconreqed:Function,
    conreqload:boolean,
    setconreq:Function,
    getConnections:Function,
    sendConnectionRequest:Function,
    getConnectionrequests:Function,
    getConnectionrequested:Function
}


const connectionContext = createContext<sendval | undefined>(undefined);

const ConnectionProvider: React.FC<ctx> = ({children})=>{
    const [connections, setconnections] = useState([]);
    const [request, setrequests] = useState([]);
    const [requested, setrequested] = useState([]);
    const [connload, setconn] = useState(false);
    const [conreqload, setconreq] = useState(false);
    const [conreqedload, setconreqed] = useState(false);

    const dispatch = useDispatch();

    const getConnections =async()=>{
        try {
            setconn(true)
            const url = '/API/User/HandleConnection/getconnections?page=2.5&limit=10';
            const data = await fetch(url);
            const jsondata = await data.json();
            if(!jsondata.success){
                dispatch(setError(jsondata.error || "something went wrong while getting connection"));
                return;
            }
            setconnections(jsondata.connections);
            dispatch(setMessage(jsondata.message))
            console.log(jsondata);
        } catch (error:any) {
            console.log(error)
            dispatch(setError(error.message || "something went wrong while getting connection"))
        }finally{
            setconn(false)
        }
    }

    const getConnectionrequests =async()=>{
        try {
            setconreq(true)
            const url = '/API/User/HandleConnection/getconnectionRequests?page=2.5&limit=10';
            const data = await fetch(url);
            const jsondata = await data.json();
            if(!jsondata.success){
                dispatch(setError(jsondata.error || "something went wrong while getting connection"));
                return;
            }
            setconreq(jsondata.connectionRequests);
            dispatch(setMessage(jsondata.message))
            console.log(jsondata);
        } catch (error:any) {
            console.log(error)
            dispatch(setError(error.message || "something went wrong while getting connection"))
        }finally{
            setconreq(false)
        }
    }

    const getConnectionrequested =async()=>{
        try {
            setconreqed(true)
            const url = '/API/User/HandleConnection/getconnectionrequested?page=2.5&limit=10';
            const data = await fetch(url);
            const jsondata = await data.json();
            if(!jsondata.success){
                dispatch(setError(jsondata.error || "something went wrong while getting connection"));
                return;
            }
            setconreqed(jsondata.getconnectionrequested);
            dispatch(setMessage(jsondata.message))
            console.log(jsondata);
        } catch (error:any) {
            console.log(error)
            dispatch(setError(error.message || "something went wrong while getting connection"))
        }finally{
            setconreqed(false)
        }
    }

    const sendConnectionRequest =async(identifier : string)=>{
        try {
            if(!identifier ){
                dispatch(setError("please provide a identifier to connect"));
                return;
            }
            const url = '/API/User/HandleConnection/request';
            const objdata = {
                identifier,
                action:'request'
            }
            const stringdata = JSON.stringify(objdata);
            const data = await fetch(url,{body:stringdata, method:"POST"});
            const jsondata = await data.json();
            console.log(jsondata)
            if(!jsondata.success){
                dispatch(setError(jsondata.err || "something went wrong while sending request"));
                return;
            }
            dispatch(setMessage(jsondata.message))
            console.log(jsondata);
        } catch (error:any) {
            console.log(error.message)
            dispatch(setError(error.message || "something went wrong while sending request"))
        }
    }

    return(
        <connectionContext.Provider
        value ={{
            connections,
            setconnections,
            request,
            setrequests,
            requested,
            setrequested,
            connload,
            setconn,
            conreqedload,
            setconreqed,
            conreqload,
            setconreq,
            getConnections,
            sendConnectionRequest,
            getConnectionrequests,
            getConnectionrequested
        }}
        >
            {children}
        </connectionContext.Provider>
    )
}

const useConn = ()=>{
    const ctx = useContext(connectionContext);
    if(!ctx){
        throw new Error('no ctx found in sample paper ctx')
    }
    return ctx ;
}

export {
    useConn,
    ConnectionProvider
}