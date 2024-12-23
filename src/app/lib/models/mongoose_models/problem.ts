import mongoose from "mongoose";

const optionSchema = new mongoose.Schema({
    text: {type:String, required:true},
    isCorrect:{type:Boolean, default:false}
},{_id:false})

const matchPairSchema = new mongoose.Schema({
    text:{type:String, required:true},
    // right:{type:String, required:true}
},{_id:false})

const questionSchema = new mongoose.Schema({
    questionText: { 
        type: String, 
        required: true,
        max:[500,"Question length can not exceed 500"],
        min:[10,"Question length must be atleast 50"]
    },
    questionType: { type: String, enum: [
        'multiple-choice', 
        'fill-in-the-blank',
        'match-up',
        'chronological-order',
        'true-false',
        'short-answer',
        'long-answer',
        'map-based',
    ], required: true },
    options: [optionSchema],
    correctAnswer:{type:mongoose.Schema.Types.Mixed,required:true},
    matchPairs:[matchPairSchema],
    chronologicalOrder:[{type:Number}],
    mapDetails:{type:String},
    caseText:{type:String},
    score:{type:Number,required:true,max:10,min:1}
},{_id:false});

const answerSchema = new mongoose.Schema({
    // questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
    answer: { 
        type: mongoose.Schema.Types.Mixed, 
        required: true,
        max:[500,"Answer length can not exceed 500"]
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
    questions: [
        {   
            type:questionSchema,
            validate:{
                validator: function(arr:[]){
                    return arr.length <= 10 && arr.length >= 1;
                },
                message:"There must be at least one question and not more than ten questions."
            }
        }
    ],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now },
    responses:[{type:mongoose.Schema.Types.ObjectId, ref:'Activites', default:[]}],
    isdeleted:{
        type:Boolean,
        default:false,
        _id:false
    },
    totalScore:{
        type:Number,
        required:[true,"score is required for the sample paper"],
        max:100,
        min:10
    }
});

const childActivitySchema = new mongoose.Schema({
    child: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    samplePaper: { type: mongoose.Schema.Types.ObjectId, ref: 'Samplepaper', required: true },
    answers: [{
        type:answerSchema,
        validate:{
            validator: function(arr:[]){
                return arr.length <= 10 && arr.length >= 1;
            },
            message:"There must be at least one answer and not more than ten answers."
        }
    }],
    timeSpent: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
    totalScore:{
        type:Number,
        default:0,
        max:100,
        min:0
    },
    status:{
        type:Number,
        enum:[0,1,2],
        default:0
    }
});

const Activities = mongoose.models.Activities || mongoose.model('Activities', childActivitySchema);
const Samplepaper = mongoose.models.Samplepaper || mongoose.model('Samplepaper', samplePaperSchema);
const Question = mongoose.models.Question || mongoose.model('Question', questionSchema);
const Answer = mongoose.models.Answer || mongoose.model('Answer', answerSchema);

export {  Samplepaper, Activities, Question, Answer};