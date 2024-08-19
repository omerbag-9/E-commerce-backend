import { Router } from "express";
import { isAuthenticated, isAuthorized } from "../../middleware/authentication.js";
import { isValid } from "../../middleware/validation.js";
import { addReviewVal, deleteReviewVal, getReviewsVal } from "./review.validation.js";
import { asyncHandler, roles } from "../../utils/index.js";
import { addReview, deleteReview, getReviews } from "./review.controller.js";
import { isActive } from "../../middleware/isActive.js";


const reviewRouter = Router()

// add review
reviewRouter.post('/',
    isAuthenticated(),
    isAuthorized([roles.CUSTOMER]),
    isValid(addReviewVal),
    isActive(),
    asyncHandler(addReview)
)


// get reviews for product
reviewRouter.get('/get-reviews/:productId',
    isAuthenticated(),
    isValid(getReviewsVal),
    asyncHandler(getReviews)
)

// delete review

reviewRouter.delete('/delete-review/:reviewId',
    isAuthenticated(),
    isAuthorized([roles.ADMIN, roles.SUPERADMIN, roles.CUSTOMER]),
    isValid(deleteReviewVal),
    isActive(),
    asyncHandler(deleteReview)
)


export default reviewRouter