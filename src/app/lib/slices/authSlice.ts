import { RootState } from "@/app/store";
import { createSlice } from "@reduxjs/toolkit";

type UserRole = 'guardian' | 'child'

export interface value{
    username:string | null,
    fullname:string | null,
    email:string | null,
    type:UserRole | null,
    loggedIn:boolean,
    rememberme:boolean
}

const initialState : value ={
    username: null,
    fullname:null,
    email:null,
    type:null,
    loggedIn:false,
    rememberme:true
}

const authSlice = createSlice({
    name:"auth",
    initialState,
    reducers:{
        login(state, action){
            const {username, fullname, email, type} = action.payload;
            state.username = username;
            state.fullname = fullname;
            state.email = email;
            state.type = type;
            state.loggedIn = true;
        },
        logout(state){
            state.username = null;
            state.fullname = null;
            state.email = null;
            state.type = null;
            state.loggedIn = false;
        },
        memory(state){
            state.rememberme != state.rememberme;
        }
    }
})

export const {login, logout, memory} = authSlice.actions;
export const useAuth = (state:RootState)=>state.auth as value;
export default authSlice.reducer;