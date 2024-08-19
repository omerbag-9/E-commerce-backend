import { Router } from "express";
import { isAuthenticated, isAuthorized } from "../../middleware/authentication.js";
import { deleteUser, resetPassword, updateUser, logout, getUserProfile } from "./user.controller.js";
import { asyncHandler, cloudUpload, roles } from "../../utils/index.js";
import { isActive } from "../../middleware/isActive.js";

const userRouter = Router()

//  update user
userRouter.put('/',
    isAuthenticated(),
    isAuthorized(roles.CUSTOMER),
    cloudUpload().single('image'),
    isActive(),
    asyncHandler(updateUser)
)

//  delete user
userRouter.delete('/',
    isAuthenticated(),
    isAuthorized(roles.CUSTOMER),
    isActive(),
    asyncHandler(deleteUser)
)

// get user profile
userRouter.get('/profile',
    isAuthenticated(),
    isActive(),
    asyncHandler(getUserProfile)
)

// logout
userRouter.get('/logout',
    isAuthenticated(),
    isActive(),
    asyncHandler(logout)
)

// reset password
userRouter.put('/reset-password',
    isAuthenticated(),
    isActive(),
    asyncHandler(resetPassword)
)

export default userRouter