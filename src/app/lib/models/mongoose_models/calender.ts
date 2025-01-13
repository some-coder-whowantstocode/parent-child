import mongoose, { ValidatorProps } from "mongoose"

const CalenderSchema = new mongoose.Schema({
    calender:[{
        _id:false,
        date:{
            type:String,
            validate: {
                validator : function(v:string){
                    return (/^\d{4}-\d{2}-\d{2}$/).test(v);
                },
                message: (props:ValidatorProps)=>`${props.value} is not in the correct form date must be in this form of yyyy-mm-dd`
            },
            unique:true
        },
        count:{
            type:Number,
            default:1
        }
    }]
})


if(!mongoose.models.User && process.env.NODE_ENV === 'production'){
    CalenderSchema.index({ _id:1, 'calender.date':1},{unique:true})
}


const Calender  = mongoose.models.calenders || mongoose.model('calenders', CalenderSchema);
export { Calender}