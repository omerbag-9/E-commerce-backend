import { model, Schema } from "mongoose";

// schema
const reviewSchema = new Schema({
   user:{
    type:Schema.Types.ObjectId,
    ref:'User',
    required:true
   },
   product:{
    type:Schema.Types.ObjectId,
    ref:'Product',
    required:true
   },
   comment:{
    type:String,
    required:true
   },
    rate:{
        type:Number,
        min:0,
        max:5
    }
})

// model
export const Review = model('Review',reviewSchema)