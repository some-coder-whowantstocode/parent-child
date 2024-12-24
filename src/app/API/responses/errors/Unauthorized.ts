import customerr from "./customerr"

export default class Unauthorized extends customerr{
    constructor(message:string){
        super(401, message);
    }
}