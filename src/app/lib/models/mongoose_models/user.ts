import mongoose, { Schema } from 'mongoose';

const childconnectionSchema = new mongoose.Schema({
    id:{
        type:Schema.Types.ObjectId,
        require:true,
        ref:"Child"
    },
    category:{
        type:String,
        default:"child"
    }
},{_id:false})

const GuardianconnectionSchema = new mongoose.Schema({
    id:{
        type:Schema.Types.ObjectId,
        require:true,
        ref:"Guardian"
    },
    category:{
        type:String,
        default:"guardian"
    }
},{_id:false})

const guardianSchema = new mongoose.Schema({
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
        immutable: true
    },
    // connections: [{
    //     type: Schema.Types.Mixed,
    //     validate:{
    //         validator: function(v){
    //             if(!v) return false;
    //             if(childconnectionSchema.obj && GuardianconnectionSchema.obj){
    //                 return true;
    //             }
    //             return false;
    //         },
    //         message: "invalid type"
    //     }
    // }],
    childConnections:[{
        type: Schema.Types.ObjectId,
        ref:"Child"
    }],
    guardianConnections:[{
        type: Schema.Types.ObjectId,
        ref:"Guardian"
    }],
    connectionRequests: [{
        id:{
            type: Schema.Types.ObjectId
        },
        pos:{
            type:String,
            enum:["child","guardian"]
        }
    }],
    connectionRequested: [{
        id:{
            type: Schema.Types.ObjectId
        },
        pos:{
            type:String,
            enum:["child","guardian"]
        }
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
        ref: 'Samplepaper'
    }]
});

const childSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: [true, 'Full name is required'],
        max: [18, 'Fullname is too big (max:18)'],
        min: [6, 'Fullname is too small (min:6)'],
    },
    username: {
        type: String,
        required: [true, 'username is required'],
        max: [18, 'username is too big (max:18)'],
        min: [6, 'username is too small (min:6)'],
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
        default: 'child',
        type: String,
        immutable: true
    },
    // connections: [{
    //     type: Schema.Types.Mixed,
    //     validate:{
    //         validator: function(v){
    //             if(!v) return false;
    //             if(childconnectionSchema.obj && GuardianconnectionSchema.obj){
    //                 return true;
    //             }
    //             return false;
    //         },
    //         message: "invalid type"
    //     }
    // }],
    
    childConnections:[{
        type: Schema.Types.ObjectId,
        ref:"Child"
    }],
    guardianConnections:[{
        type: Schema.Types.ObjectId,
        ref:"Guardian"
    }],
    connectionRequests: [{
        id:{
            type: Schema.Types.ObjectId
        },
        pos:{
            type:String,
            enum:["child","guardian"]
        }
    }],
    connectionRequested: [{
        id:{
            type: Schema.Types.ObjectId
        },
        pos:{
            type:String,
            enum:["child","guardian"]
        }
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
    activities: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Activities'
    }]
})


guardianSchema.index({email:1});
childSchema.index({email:1});
const Guardian = mongoose.models.Guardian || mongoose.model('Guardian', guardianSchema);
const Child = mongoose.models.Child || mongoose.model('Child', childSchema);


export { Guardian, Child };

