import { model, Schema } from "mongoose";

// schema
const categorySchema = new Schema(
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
        image: Object // i can type it like it {secure_url:String , public_id:String}
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
)
categorySchema.virtual('subcategories', {
    ref: 'Subcategory',
    localField: '_id',
    foreignField: 'category'
})
// model
export const Category = model('Category', categorySchema)