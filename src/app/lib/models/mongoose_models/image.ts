import mongoose from "mongoose"

const Imagemetadataschema = new mongoose.Schema({
    userId:{type:mongoose.Schema.ObjectId, required:true, ref:'users'},
    filename:{type:String, required:true},
    uploadDate:{type:Date, default:Date.now}
})

const ImageMetadata  = mongoose.models.imagemetadatas || mongoose.model('imagemetadatas', Imagemetadataschema);
export { ImageMetadata}