import mongoose from "mongoose";

const optionSchema = new mongoose.Schema({
    text: {type:String, required:true},
},{_id:false})

const matchPairSchema = new mongoose.Schema({
    left:{type:String, required:true},
    right:{type:String, required:true}
},{_id:false})

const questionSchema = new mongoose.Schema({
    questionText: { 
        type: String, 
        required: true,
        maxLength:[5000,"Question length can not exceed 500"],
        minLength:[10,"Question length must be atleast 50"]
    },
    questionType: { type: String, enum: [
        'multiple-choice', 
        'fill-in-the-blank',
        'match-up',
        'chronological-order',
        'true-false',
        'question-answer',
        'map-based',
    ], required: true },
    options: [optionSchema],
    correctAnswer:{type:mongoose.Schema.Types.Mixed,required:true},
    matchPairs:[matchPairSchema],
    chronologicalOrder:[{type:Number}],
    mapDetails:{type:String},
    caseText:{type:String},
    score:{type:Number,required:true,max:100,min:1}
},{_id:false});

const answerSchema = new mongoose.Schema({
    answer: { 
        type: mongoose.Schema.Types.Mixed, 
        required: true,
    },
    score:{
        type:Number,
        default:0,
        max:10,
        min:0
    }
},{_id:false});

const samplePaperSchema = new mongoose.Schema({
    title: { type: String, required: true },
    questions: 
        {   
            type:[questionSchema],
            validate:[
               questionval,
                "There must be at least one question and not more than ten questions."
            ],
            required:[true,'atleast one question is required and questions must be a array']
        }
    ,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
    createdAt: { type: Date, default: Date.now },
    responses:[{type:mongoose.Schema.Types.ObjectId, ref:'activites', default:[]}],
    isdeleted:{
        type:Boolean,
        default:false,
        _id:false
    },
    passingPercent:{
        type:Number,
        required:[true,'passing percentage is required'],
        max:100,
        min:0
    },
    totalScore:{
        type:Number,
        required:[true,"score is required for the sample paper"],
        max:10000,
        min:0
    }
});

function questionval (val:[]){
    return val.length > 1 && val.length < 1000;
}

const childActivitySchema = new mongoose.Schema({
    child: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
    samplePaper: { type: mongoose.Schema.Types.ObjectId, ref: 'samplepapers', required: true },
    answers: [{
        type:answerSchema,
        validate:{
            validator: function(arr:[]){
                return arr.length <= 1000 && arr.length >= 1;
            },
            message:"There must be at least one answer and not more than ten answers."
        }
    }],
    timeSpent: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
    totalScore:{
        type:Number,
        default:0,
        max:10000,
        min:0
    },
    status:{
        type:Number,
        enum:[0,1,2],
        default:0
    }
});

const Activities = mongoose.models.Activities || mongoose.model('activities', childActivitySchema);
const Samplepaper = mongoose.models.Samplepaper || mongoose.model('samplepaper', samplePaperSchema);
// const Question = mongoose.models.Question || mongoose.model('Question', questionSchema);
// const Answer = mongoose.models.Answer || mongoose.model('Answer', answerSchema);

export {  Samplepaper, Activities};