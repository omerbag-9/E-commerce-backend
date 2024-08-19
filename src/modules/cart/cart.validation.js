import joi from "joi"
import { generalFields } from "../../middleware/validation.js"

// delete from cart
export const deleteFromCartVal = joi.object({
    productId: generalFields.objectId.required()
}).required()

// add to cart
export const addToCartVal = joi.object({
    productId: generalFields.objectId.required(),
    quantity: joi.number().min(1)
}).required()