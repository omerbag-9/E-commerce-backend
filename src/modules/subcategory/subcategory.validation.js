import joi from "joi";
import { generalFields } from "../../middleware/validation.js";

// create subcategory val
export const createSubcategoryVal = joi.object({
    name: generalFields.name.required(),
    category: generalFields.objectId.required(),
}).required()

// update subcategory val
export const updateSubcategoryVal = joi.object({
    name: generalFields.name,
    category: generalFields.objectId,
    subCategoryId: generalFields.objectId.required()
}).required()

// get subcategory val
export const getSubcategoryVal = joi.object({
    categoryId: generalFields.objectId.required()
}).required()

// delete subcategory val
export const deleteSubcategoryVal = joi.object({
    subCategoryId: generalFields.objectId.required()
}).required()