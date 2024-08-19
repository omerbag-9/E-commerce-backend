import { Router } from "express";
import { isValid } from "../../middleware/validation.js";
import { createBrandVal, getBrandVal, updatedBrandVal } from "./brand.validation.js";
import { createBrand, updateBrand, getBrands, getBrand,deleteBrand } from "./brand.controller.js";
import { isAuthenticated, isAuthorized } from "../../middleware/authentication.js";
import { isActive } from "../../middleware/isActive.js";
import {  asyncHandler, fileUpload, roles,  } from "../../utils/index.js"

 const brandRouter = Router()

// create brand 
brandRouter.post('/',
    isAuthenticated(),
    isAuthorized([roles.ADMIN,roles.SUPERADMIN]),
    fileUpload({ folder: 'brand' }).single('logo'),
    isValid(createBrandVal),
    isActive(),
    asyncHandler(createBrand)
)


// update brand 
brandRouter.put('/:brandId',
    isAuthenticated(),
    isAuthorized([roles.ADMIN,roles.SUPERADMIN]),
    fileUpload({ folder: 'brand' }).single('logo'),
    isValid(updatedBrandVal),
    isActive(),
    asyncHandler(updateBrand)
)

// delete brand 
brandRouter.delete('/:brandId',
    isValid(getBrandVal),
    isAuthenticated(),
    isAuthorized([roles.ADMIN,roles.SUPERADMIN]),
    isActive(),
    asyncHandler(deleteBrand)
)

// get specific brand
brandRouter.get('/:brandId',
    isValid(getBrandVal),
    asyncHandler(getBrand)
)

// get brands
brandRouter.get('/',
    asyncHandler(getBrands)
)

export default brandRouter