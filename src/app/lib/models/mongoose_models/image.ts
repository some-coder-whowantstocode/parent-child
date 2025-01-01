import mongoose from "mongoose"

const Imagemetadataschema = new mongoose.Schema({
    userId:{type:mongoose.Schema.ObjectId, required:true, ref:'User'},
    filename:{type:String, required:true},
    uploadDate:{type:Date, default:Date.now}
})

const ImageMetadata  = mongoose.models.ImageMetadata || mongoose.model('ImageMetadata', Imagemetadataschema);
export { ImageMetadata}