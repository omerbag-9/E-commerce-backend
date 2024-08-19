import { Router } from "express";
import { asyncHandler, fileUpload, roles } from "../../utils/index.js";
import { isValid } from "../../middleware/validation.js";
import { createProductVal, getProductVal, updateProductVal } from "./product.validation.js";
import { createProduct, getProducts, getProduct, deleteProduct, updateProduct } from "./product.controller.js";
import { isAuthenticated, isAuthorized } from "../../middleware/authentication.js";
import { isActive } from "../../middleware/isActive.js";

 const productRouter = Router()

// create product 
productRouter.post('/',
    isAuthenticated(),
    isAuthorized([roles.ADMIN,roles.SELLER,roles.SUPERADMIN]),
    fileUpload({ folder: 'product' }).fields([
        { name: 'mainImage', maxCount: 1 },
        { name: 'subImages', maxCount: 5 }
    ]),
    isValid(createProductVal),
    isActive(),
    asyncHandler(createProduct)
)

// update product 
productRouter.put('/:productId',
    isAuthenticated(),
    isAuthorized([roles.ADMIN,roles.SELLER,roles.SUPERADMIN]),
    fileUpload({ folder: 'product' }).fields([
        { name: 'mainImage', maxCount: 1 },
        { name: 'subImages', maxCount: 5 }
    ]),
    isValid(updateProductVal),
    isActive(),
    asyncHandler(updateProduct)
)

// delete product 
productRouter.delete('/:productId',
    isAuthenticated(),
    isAuthorized([roles.ADMIN,roles.SELLER,roles.SUPERADMIN]),
    isValid(getProductVal),
    isActive(),
    asyncHandler(deleteProduct)
)

// get all products
productRouter.get('/', asyncHandler(getProducts))

// get specific product
productRouter.get('/:productId',
    isValid(getProductVal),
    asyncHandler(getProduct)
)

export default productRouter