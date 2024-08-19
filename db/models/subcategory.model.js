import { model, Schema } from "mongoose";

// schema
const subcategorySchema = new Schema(
    {
        name: {
            type: String,
            unique: true,
            lowercase: true,
            trim: true,
            required: true
        },
        slug: {
            type: String,
            unique: true,
            lowercase: true,
            trim: true,
            required: true
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        category: {
            type: Schema.Types.ObjectId,
            ref: "Category",
            required: true
        },
        image: String
    },
    {
        timestamps: true
    }
)
// model
export const Subcategory = model('Subcategory', subcategorySchema)