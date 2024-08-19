import { Router } from "express";
import { isAuthenticated } from "../../middleware/authentication.js";
import { asyncHandler } from "../../utils/index.js";
import { addToWishlist, deleteFromWishlist,getWishlist } from "./wishlist.controller.js";

 const wishlistRouter = Router()

// add to wishlist
wishlistRouter.put('/',
    isAuthenticated(),
    asyncHandler(addToWishlist)
)

// DELETE FROM wishlist
wishlistRouter.put('/:productId',
    isAuthenticated(),
    asyncHandler(deleteFromWishlist)
)

// get wishlist
wishlistRouter.get('/',
    isAuthenticated(),
    asyncHandler(getWishlist)
)

export default wishlistRouter