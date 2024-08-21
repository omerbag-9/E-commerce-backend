import { Router } from "express";
import { asyncHandler, cloudUpload, fileUpload, roles } from "../../utils/index.js";
import { isValid } from "../../middleware/validation.js";
import { createCategoryVal, getCategoryVal, updateCategoryVal } from "./category.validation.js";
import { createCategory, deletCategory, getCategories, getCategory, updateCategory , createCategoryCloud, deletCategoryCloud, updateCategoryCloud } from "./category.controller.js";
import { isAuthenticated, isAuthorized } from "../../middleware/authentication.js";
import { isActive } from "../../middleware/isActive.js";

const categoryRouter = Router()
// create category  
categoryRouter.post('/',
    isAuthenticated(),
    isAuthorized([roles.ADMIN,roles.SUPERADMIN]),
    fileUpload({ folder: 'category' }).single('image'),
    isValid(createCategoryVal),
    isActive(),
    asyncHandler(createCategory)
)

// add category and upload on cloudinary
categoryRouter.post('/cloud',
    isAuthenticated(),
    isAuthorized([roles.ADMIN,roles.SUPERADMIN]),
    cloudUpload().single('image'),
    isValid(createCategoryVal),
    isActive(),
    asyncHandler(createCategoryCloud)
)

// update category 
categoryRouter.put('/:categoryId',
    isAuthenticated(),
    isAuthorized([roles.ADMIN,roles.SUPERADMIN]),
    fileUpload({ folder: 'category' }).single('image'),
    isValid(updateCategoryVal),
    isActive(),
    asyncHandler(updateCategory)
)

// update category cloud 
categoryRouter.put('/cloud/:categoryId',
    isAuthenticated(),
    isAuthorized([roles.ADMIN,roles.SUPERADMIN]),
    cloudUpload().single('image'),
    isValid(updateCategoryVal),
    isActive(),
    asyncHandler(updateCategoryCloud)
)

// delete category 
categoryRouter.delete('/:categoryId',
    isAuthenticated(),
    isAuthorized([roles.ADMIN,roles.SUPERADMIN]),
    isValid(getCategoryVal),
    isActive(),
    asyncHandler(deletCategory)
)

// delete category cloud 
categoryRouter.delete('/cloud/:categoryId',
    isAuthenticated(),
    isAuthorized([roles.ADMIN,roles.SUPERADMIN]),
    isValid(getCategoryVal),
    isActive(),
    asyncHandler(deletCategoryCloud)
)

// get specific category
categoryRouter.get('/:categoryId',
    isValid(getCategoryVal),
    asyncHandler(getCategory))

// get all categories
categoryRouter.get('/',asyncHandler(getCategories))

export default categoryRouter