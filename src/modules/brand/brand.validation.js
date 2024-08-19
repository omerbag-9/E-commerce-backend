import joi from "joi";
import { generalFields } from "../../middleware/validation.js";

export const createBrandVal = joi.object({
    name: generalFields.name.required(),
}).required()

export const updatedBrandVal = joi.object({
    name: generalFields.name,
    brandId: generalFields.objectId.required()
}).required()

// get brand val
export const getBrandVal = joi.object({
    brandId: generalFields.objectId.required()
}).required()