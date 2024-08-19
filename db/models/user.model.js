import path from 'path'
import { model, Schema } from "mongoose";
import dotenv from 'dotenv'
import { roles, status } from '../../src/utils/index.js';
dotenv.config({ path: path.resolve('config/.env') })
// schema 
const userSchema = new Schema({
    userName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true
    },
    phone: {
        type: String,
    },
    password: {
        type: String,
        required: true,
    },
    // isVerified: {
    //     type: Boolean,
    //     default: false
    // },
    role: {
        type: String, // customer , admin , seller
        enum: Object.values(roles),// ['customer' , 'admin' , 'seller']
        default: roles.CUSTOMER
    },
    status: {
        type: String,
        enum: Object.values(status),
        default: status.PENDING
    },
    isActive: {
        type: Boolean,
        default: false
    },
    image: {
        type: Object, //{secure_url , public_id}
        default: {
            secure_url: process.env.SECURE_URL,
            public_id: process.env.PUBLIC_ID
        }
    },
    DOB: Date,
    address: [
        {
            street: String,
            city: String,
            phone: String
        }
    ],
    wishlist:[{
            type:Schema.Types.ObjectId,
            ref:'Product'
        }],
        otp:Number,
        otpExpiry: Date,
        otpAttempts: { type: Number, default: 0 }
    }, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})

// hash password
// userSchema.pre('save',function(){
//     this.password = hashPassword({password:this.password})
// })

// model
export const User = model('User', userSchema) 