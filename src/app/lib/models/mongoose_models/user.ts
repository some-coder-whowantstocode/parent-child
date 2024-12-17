import mongoose, { Schema } from 'mongoose';

const userSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: [true, 'Full name is required'],
        max: [18, 'Fullname is too big (max:18)'],
        min: [6, 'Fullname is too small (min:6)'],
        match: [/^[a-zA-Z0-9 _-]+$/, 'No symbols are allowed in username'],
    },
    username: {
        type: String,
        required: [true, 'username is required'],
        max: [18, 'username is too big (max:18)'],
        min: [6, 'username is too small (min:6)'],
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
        max: [12, 'password is too big (max:12)'],
        min: [6, 'password is too small (min:6)'],
    },
    role: {
        default: 'guardian',
        type: String,
        enum:['guardian','child'],
        immutable: true
    },
    Connections:[{
        id:{
            type: Schema.Types.ObjectId,
        },
        _id:false
    }],
    connectionRequests: [{
        id:{
            type: Schema.Types.ObjectId
        },
        _id:false
    }],
    connectionRequested: [{
        id:{
            type: Schema.Types.ObjectId
        },
        _id:false
    }],
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
        ref: 'Samplepaper',
        _id:false
    }],
    activities: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Activities',
        _id:false
    }],
    isdeleted:{
        type:Boolean,
        default:false,
        _id:false
    }
})

userSchema.index({ email:1 },{unique:true});
userSchema.index({ email:1,'connectionRequests.id': 1 },{unique:true});
userSchema.index({ email:1,'connectionRequested.id': 1 },{unique:true});

const User = mongoose.models.User || mongoose.model("User",userSchema);


export { User };

