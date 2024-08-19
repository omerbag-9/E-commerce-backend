import { Router } from "express";
import { isAuthenticated, isAuthorized } from "../../middleware/authentication.js";
import { isValid } from "../../middleware/validation.js";
import { addAdmin, addUser, deleteUser, getUsers, updateUser } from "./admin.controller.js";
import { isActive } from "../../middleware/isActive.js";
import {  asyncHandler, cloudUpload, roles } from "../../utils/index.js"
const adminRouter = Router()

// add admin
adminRouter.post('/add-admin',
    isAuthenticated(),
    isAuthorized(roles.SUPERADMIN),
    cloudUpload().single('image'),
    // isValid()
    isActive(),
    asyncHandler(addAdmin)
)

// add user or seller
adminRouter.post('/add-user',
    isAuthenticated(),
    isAuthorized([roles.SUPERADMIN , roles.ADMIN]),
    cloudUpload().single('image'),
    isActive(),
    asyncHandler(addUser)
)

// get users
adminRouter.get('/get-users',
    isAuthenticated(),
    isAuthorized([roles.SUPERADMIN , roles.ADMIN]),
    isActive(),
    asyncHandler(getUsers)
)

// delete user
adminRouter.delete('/delete-user/:userId',
    isAuthenticated(),
    isAuthorized([roles.ADMIN,roles.SUPERADMIN]),
    isActive(),
    asyncHandler(deleteUser)
)


// update user
adminRouter.put('/update-user/:userId',
    isAuthenticated(),
    isAuthorized([roles.ADMIN,roles.SUPERADMIN]),
    isActive(),
    asyncHandler(updateUser))

export default adminRouter;