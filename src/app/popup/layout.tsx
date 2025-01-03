'use client';
import React, { useEffect } from 'react';
import style from './style.module.css';
import { useDispatch, useSelector } from 'react-redux';
import { usePopup, removeMessage, removeError, updateMessage } from '../lib/slices/popupSlice';
import { LayoutProps } from '../../../.next/types/app/layout';
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { useProcess } from '../lib/slices/processSlice';
import { v4 } from 'uuid';

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const dispatch = useDispatch();
  const {loader} = useSelector(useProcess)
  const { message: messages, error: errors} = useSelector(usePopup);

  useEffect(()=>{
    let data ;
    data = messages.map((m)=>{
      const currenttime = Date.now();
      const remainingTime = 3000 - (currenttime - m.initialTime);
      const timeid = setTimeout(() => {
        dispatch(removeMessage(m.id));
      }, remainingTime);
      return {...m,timeid};
    })
    updateMessage(data);

    return()=>{
      messages.map(m=>m.timeid && clearTimeout(m.timeid))}
  },[messages])

  useEffect(()=>{
    let data ;
    data = errors.map((m)=>{
      const currenttime = Date.now();
      const remainingTime = 5000 - (currenttime - m.initialTime);
      const timeid = setTimeout(() => {
        dispatch(removeError(m.id));
      }, remainingTime);
      return {...m,timeid};
    })
    updateMessage(data);

    return()=>{
      errors.map(m=>m.timeid && clearTimeout(m.timeid))}
  },[errors])

  return (
    <div className={style.notifications}>
      {children}
      <div className={style.messages}>
        {Array.from(messages.values()).map((item) => (
          <div
          key={item.id}
          >
          <div className={style.messageContent} onClick={() => dispatch(removeMessage(item.id))}>
            {item.data}
          </div>
          <div className={style.messagelife}></div>
          </div>
        ))}
      </div>
      <div className={style.errors}>
        {Array.from(errors.values()).map((item) => (
          <div
          key={item.id}
          >
          <div className={style.messageContent} onClick={() => dispatch(removeError(item.id))}>
            {item.data}
          </div>
          <div className={style.errorlife}></div>
          </div>
        ))}
      </div>
      <div className={style.processes}>
        {loader.map(({msg}) => (
          <div
          key={v4()}
          >
          <div >
            {msg}
          </div>
          <AiOutlineLoading3Quarters className={style.loading}/>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Layout;
