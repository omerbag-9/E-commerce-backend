import { Router } from "express";
import { isAuthenticated } from "../../middleware/authentication.js";
import { asyncHandler } from "../../utils/index.js";
import { addToCart, deleteFromCart, getCart } from "./cart.controller.js";
import { isActive } from "../../middleware/isActive.js";
import { addToCartVal, deleteFromCartVal } from "./cart.validation.js";
import { isValid } from "../../middleware/validation.js";

const cartRouter = Router()

// add to cart
cartRouter.post('/',
    isAuthenticated(),
    isValid(addToCartVal),
    isActive(),
    asyncHandler(addToCart)
)

// delete from cart
cartRouter.delete('/delete-from-cart/:productId',
    isAuthenticated(),
    isValid(deleteFromCartVal),
    isActive(),
    asyncHandler(deleteFromCart))

// get cart
cartRouter.get('/get-cart',
    isAuthenticated(),
    isActive(),
    asyncHandler(getCart))


export default cartRouter