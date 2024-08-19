import { Router } from "express";
import { isAuthenticated, isAuthorized } from "../../middleware/authentication.js";
import { asyncHandler, roles } from "../../utils/index.js";
import { isValid } from "../../middleware/validation.js";
import { createCouponVal, deleteCouponVal, updateCouponVal } from "./coupon.validation.js";
import { createCoupon, deleteCoupon, getCoupons, updateCoupon } from "./coupon.controller.js";
import { isActive } from "../../middleware/isActive.js";


const couponRouter = Router()

// create coupon
couponRouter.post('/',
    isAuthenticated(),
    isAuthorized([roles.ADMIN , roles.SUPERADMIN]),
    isValid(createCouponVal),
    isActive(),
    asyncHandler(createCoupon)
)

// get coupon
couponRouter.get('/get-coupons',
    isAuthenticated(),
    isAuthorized([roles.ADMIN, roles.SUPERADMIN]),
    isActive(),
    asyncHandler(getCoupons))

// update coupon
couponRouter.put('/update-coupon/:couponId',
    isAuthenticated(),
    isAuthorized([roles.ADMIN, roles.SUPERADMIN]),
    isValid(updateCouponVal),
    isActive(),
    asyncHandler(updateCoupon))

// delete coupon
couponRouter.delete('/delete-coupon/:couponId',
    isAuthenticated(),
    isAuthorized([roles.ADMIN, roles.SUPERADMIN]),
    isValid(deleteCouponVal),
    isActive(),
    asyncHandler(deleteCoupon))


export default couponRouter