import { model, Schema } from "mongoose";
import { couponTypes } from "../../src/utils/index.js";

// schema
const couponSchema = new Schema({
    couponCode: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    couponAmount: {
        type: Number,
        min: 1
    },
    couponType: {
        type: String,
        enum: Object.values(couponTypes),
        default: couponTypes.FIXED_AMOUNT
    },
    fromDate: { type: String, default: Date.now() },
    toDate: { type: String, default: Date.now() + (24 * 60 * 60 * 1000), },
    assignedUsers: [
        {
            user: { type: Schema.Types.ObjectId, ref: 'User' },
            maxUse: { type: Number, default: 10, max: 10 }
        }
    ],
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true })

// model
export const Coupon = model('Coupon', couponSchema) 