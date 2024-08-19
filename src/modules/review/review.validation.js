import joi from "joi";
import { generalFields } from "../../middleware/validation.js";

// add review
export const addReviewVal = joi.object({
    comment : generalFields.comment.required(),
    rate : joi.number().min(0).max(5),
    productId:generalFields.objectId.required(),
}).required()

// get reviews
export const getReviewsVal = joi.object({
    productId: generalFields.objectId.required()
}).required()

// delete review
export const deleteReviewVal = joi.object({
    reviewId: generalFields.objectId.required()
}).required()