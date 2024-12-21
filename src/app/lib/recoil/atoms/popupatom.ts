import { atom } from "recoil";

const sucess = atom({
    key:'success',
    default:[]
})

const error = atom({
    key:"error",
    default:[]
})

const running = atom({
    key:"running",
    default:[]
})

export {
    sucess,
    error,
    running
}