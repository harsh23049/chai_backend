import  mongoogse,{Schema} from "mongoose";

const subscriptionSchema = new mongoose.Schema({
    subscriber: {
        type: Schema.Types.ObjectId, // one who is subscribing
        ref: "User"
    }, 
    channel:{
        type: Schema.Types.ObjectId, // one who is being subscribed to
        ref: "User"
    }
    
},{Timestamps: true})

export const Subscription = mongoose.model("Subscription", subscriptionSchema)