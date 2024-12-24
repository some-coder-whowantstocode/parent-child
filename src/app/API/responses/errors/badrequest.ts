import customerr from "./customerr";

export default class BadRequest extends customerr{
    constructor(message:string){
        super(400, message);
    }
}