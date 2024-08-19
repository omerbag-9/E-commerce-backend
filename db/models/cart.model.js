import { model, Schema } from "mongoose";

// schema
const cartSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    products:[
        {
            productId:{
                type: Schema.Types.ObjectId,
                ref: 'Product',
                required: false
            },
            quantity: {
                type: Number,
                default: 1
            }
        }
    ],
},{ timestamps: true })

// model
export const Cart = model('Cart', cartSchema)