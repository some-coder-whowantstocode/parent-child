import customerr from "./customerr";

export default class NotFound extends customerr{
    constructor(message:string){
        super(404, message);
    }
}