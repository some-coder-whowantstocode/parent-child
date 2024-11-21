import mongoose from 'mongoose';

const guardianSchema = new mongoose.Schema({
    fullname:{
        type:String, 
        required:[true, 'Full name is required'], 
        max:[18,'Fullname is too big (max:18)'],
        min:[6,'Fullname is too small (min:6)'],
        match:[/^[a-zA-Z0-9 _-]+$/,'No symbols are allowed in username'],
        unique:[true,'username is already taken']
    },
    username:{
        type:String, 
        required:[true, 'username is required'], 
        max:[18,'username is too big (max:18)'],
        min:[6,'username is too small (min:6)'],
        match:[/^[a-zA-Z0-9 _-]+$/,'No symbols are allowed in username except _-'],
        unique:[true,'username is already taken']
    },
    email: { 
        type: String, 
        required: [true, 'Email is required'], 
        unique: true,
        match:[/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/g,'This email is invalid']
    },
    password: { 
        type: String, 
        required: true,
        max:[12,'password is too big (max:12)'],
        min:[6,'password is too small (min:6)'],
    },
    role: { 
        default:'guardian', 
        type:String, 
        immutable:true 
    },
    children: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Child' 
    }],
    isverified: {
        type:Boolean,
        default:false
    },
    verificationToken: {
        type:String,
        required:[true, 'verification token is missing'],
        match:[/^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.[A-Za-z0-9-_.+/=]*$/, 'invalid token'],
    },
    tokenExpires: {
        type:Date,
        default: ()=> Date.now() + 24*60*60*1000,
    }
});

const childSchema = new mongoose.Schema({
    fullname:{
        type:String, 
        required:[true, 'Full name is required'], 
        max:[18,'Fullname is too big (max:18)'],
        min:[6,'Fullname is too small (min:6)'],
    },
    username:{
        type:String, 
        required:[true, 'username is required'], 
        max:[18,'username is too big (max:18)'],
        min:[6,'username is too small (min:6)'],
    },
    email: { 
        type: String, 
        required: [true, 'Email is required'], 
        unique: true,
        match:[/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/g,'This email is invalid']
    },
    password: { 
        type: String, 
        required: true,
        max:[12,'password is too big (max:12)'],
        min:[6,'password is too small (min:6)'],
    },
    role: { 
        default:'child', 
        type:String, 
        immutable:true 
    },
    guardian: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Guardian' 
    }],
    isverified: {
        type:Boolean,
        default:false
    },
    verificationToken: {
        type:String,
        required:[true, 'verification token is missing'],
        match:[/^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.[A-Za-z0-9-_.+/=]*$/, 'invalid token'],
    },
    tokenExpires: {
        type:Date,
        default: ()=> Date.now() + 24*60*60*1000,
    }
})

const Guardian = mongoose.models.Guardian || mongoose.model('Guardian', guardianSchema);
const Child = mongoose.models.Child || mongoose.model('Child',childSchema);

export { Guardian, Child };

