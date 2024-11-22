import mongoose from "mongoose";

const optionSchema = new mongoose.Schema({
    text: {type:String, required:true},
    isCorrect:{type:Boolean, default:false}
})

const matchPairSchema = new mongoose.Schema({
    left:{type:String, required:true},
    right:{type:String, required:true}
})

const questionSchema = new mongoose.Schema({
    questionText: { type: String, required: true },
    max:[500,"Question length can not exceed 500"],
    questionType: { type: String, enum: [
        'multiple-choice', 
        'assertion-reason',
        'fill-in-the-blank',
        'match-up',
        'chronological-order',
        'true-false',
        'short-answer',
        'long-answer',
        'case-based',
        'map-based',
    ], required: true },
    options: [optionSchema],
    correctAnswer:{type:mongoose.Schema.Types.Mixed, required:true},
    matchPairs:[matchPairSchema],
    chronologicalOrder:[{type:String}],
    mapDetails:{type:String},
    caseText:{type:String}
});

const answerSchema = new mongoose.Schema({
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
    max:[500,"Answer length can not exceed 500"],
    answer: { type: mongoose.Schema.Types.Mixed, required: true },
    isCorrect: { type: Boolean, required: true }
});

const samplePaperSchema = new mongoose.Schema({
    title: { type: String, required: true },
    questions: [questionSchema],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Guardian', required: true },
    createdAt: { type: Date, default: Date.now },
    responses:[{type:mongoose.Schema.Types.ObjectId, ref:'Activites', default:[]}]
});

const childActivitySchema = new mongoose.Schema({
    child: { type: mongoose.Schema.Types.ObjectId, ref: 'Child', required: true },
    samplePaper: { type: mongoose.Schema.Types.ObjectId, ref: 'SamplePaper', required: true },
    answers: [answerSchema],
    timeSpent: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now }
});

const Samplepaper = mongoose.models.Samplepaper || mongoose.model('Samplepaper', samplePaperSchema);
const Activities = mongoose.models.Activities || mongoose.model('Activities', childActivitySchema);
const Question = mongoose.models.Question || mongoose.model('Question', questionSchema);
const Answer = mongoose.models.Answer || mongoose.model('Answer', answerSchema);

export {  Samplepaper, Activities, Question, Answer};