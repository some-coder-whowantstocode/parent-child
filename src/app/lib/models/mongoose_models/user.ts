import mongoose, { Schema, ValidatorProps } from 'mongoose';


const userSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: [true, 'Full name is required'],
        maxlength: [18, 'Fullname is too big (max:18)'],
        minlength: [6, 'Fullname is too small (min:6)'],
        match: [/^[a-zA-Z0-9 _-]+$/, 'No symbols are allowed in username'],
    },
    username: {
        type: String,
        required: [true, 'username is required'],
        maxlength: [18, 'username is too big (max:18)'],
        minlength: [6, 'username is too small (min:6)'],
        match: [/^[a-zA-Z0-9 _-]+$/, 'No symbols are allowed in username except _-'],
        unique: [true, 'username is already taken']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        match: [/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/g, 'This email is invalid']
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        default: 'guardian',
        type: String,
        enum: {
            values: ['guardian','child'],
            message: '{VALUE} is not supported'
          },
        immutable: true
    },
    isverified: {
        type: Boolean,
        default: false
    },
    verificationToken: {
        type: String,
        required: [true, 'verification token is missing'],
        match: [/^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.[A-Za-z0-9-_.+/=]*$/, 'invalid token'],
    },
    tokenExpires: {
        type: Date,
        default: () => Date.now() + 24 * 60 * 60 * 1000,
    },
    samplePapers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'samplepapers',
        _id:false
    }],
    activities: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'activities',
        _id:false
    }],
    isdeleted:{
        type:Boolean,
        default:false,
        _id:false
    },
    connectionCount:{
        type:Number,
        default:0,
        _id:false
    },
    samplePaperCount:{
        type:Number,
        default:0,
        _id:false
    },
    activityCount:{
        type:Number,
        default:0,
        _id:false
    },
    calenderid:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"calenders",
        _id:false
    }
})

if(!mongoose.models.User && process.env.NODE_ENV === 'production'){
    userSchema.index({ email:1 },{unique:true});
    userSchema.index({ email:1,'connectionRequests.id': 1 },{unique:true});
    userSchema.index({ email:1,'connectionRequested.id': 1 },{unique:true});
    userSchema.index({ _id:1, 'calender.date':1},{unique:true})
}

const User = mongoose.models.users || mongoose.model("users",userSchema);


export { User };

