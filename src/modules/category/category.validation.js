import joi from 'joi'
import { generalFields } from '../../middleware/validation.js'
// create category val
export const createCategoryVal = joi.object({
    name: generalFields.name.required(),
}).required()

// update category val
export const updateCategoryVal = joi.object({
    name: generalFields.name,
    categoryId: generalFields.objectId.required()
}).required()


// get category val
export const getCategoryVal = joi.object({
    categoryId: generalFields.objectId.required()
}).required()