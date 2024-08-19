import { model, Schema } from "mongoose";

// schema
const brandSchema = new Schema({
    name:{
        type:String,
        required:true,
        trim:true,
        unique:true,
        lowercase:true
    },
    logo:{
        type:String,
        required:true
    },
    createdBy:{
        type:Schema.Types.ObjectId,
        ref:'User',
        required:true
    }
},{
    timestamps:true,
    toJSON:{
        virtuals:true
    },
    toObject:{
        virtuals:true
    }
})

brandSchema.virtual('products',{
    ref:'Product',
    localField:'_id',
    foreignField:'brand',
})
// model
export const Brand = model('Brand',brandSchema)