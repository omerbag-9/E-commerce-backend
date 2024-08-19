import { Router } from "express";
import { createSubcategoryVal, deleteSubcategoryVal, getSubcategoryVal, updateSubcategoryVal } from "./subcategory.validation.js";
import { createSubcategory, getSubcategory, updateSubCategory, deleteSubCategory, getSubcategories } from "./subcategory.controller.js";
import { asyncHandler, fileUpload, roles } from "../../utils/index.js";
import { isValid } from "../../middleware/validation.js";
import { isAuthenticated, isAuthorized } from "../../middleware/authentication.js";
import { isActive } from "../../middleware/isActive.js";

const subcategoryRouter = Router();

// create subcategory 
subcategoryRouter.post('/',
    isAuthenticated(),
    isAuthorized([roles.ADMIN,roles.SUPERADMIN]),
    fileUpload({ folder: 'subcategory' }).single('image'),
    isValid(createSubcategoryVal),
    isActive(),
    asyncHandler(createSubcategory)
)

// update subcategory
subcategoryRouter.put('/:subCategoryId',
    isAuthenticated(),
    isAuthorized([roles.ADMIN,roles.SUPERADMIN]),
    fileUpload({ folder: 'subcategory' }).single('image'),
    isValid(updateSubcategoryVal),
    isActive(),
    asyncHandler(updateSubCategory)
)

// delete subcategory and related documents
subcategoryRouter.delete('/:subCategoryId',
    isAuthenticated(),
    isAuthorized([roles.ADMIN,roles.SUPERADMIN]),
    isValid(deleteSubcategoryVal),
    isActive(),
    asyncHandler(deleteSubCategory)
)

// get specific subcategory
subcategoryRouter.get('/:categoryId',
    isValid(getSubcategoryVal),
    asyncHandler(getSubcategory)
)

// get all subcategories
subcategoryRouter.get('/',asyncHandler(getSubcategories))


export default subcategoryRouter