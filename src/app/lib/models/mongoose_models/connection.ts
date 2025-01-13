import { Schema, model, models } from "mongoose";

interface IConnection extends Document {
  userOne: string;
  userTwo: string;
  status: "two-one" | "one-two" | "connected";
}

const ConnectionSchema = new Schema({
  userOne: {
    type: Schema.Types.ObjectId,
    require: [true, "userOne is required."],
    unique: true,
    ref:'users'
  },
  userTwo: {
    type: Schema.Types.ObjectId,
    require: [true, "userTwo is required."],
    unique: true,
    ref:"users"
  },
  status: {
    enum: ["two-one", "one-two", "connected"],
    type: String,
  },
});

ConnectionSchema.pre("save", function(this:IConnection, next) {
  if (this.userOne == this?.userTwo){
    const err = new Error('userOne and userTwo cannot be the same'); 
    return next(err);
  } 
    next();
});

if (!models.User && process.env.NODE_ENV === "production") {
  ConnectionSchema.index({ userOne: 1, userTwo: 1 }, { unique: true });
}

const Connection = models.connections || model("connections", ConnectionSchema);

export { Connection };