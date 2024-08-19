import { Router } from "express";
import { isAuthenticated, isAuthorized } from "../../middleware/authentication.js";
import { asyncHandler, roles } from "../../utils/index.js";
import { createOrder, deleteOrder, getOrder,updateOrder } from "./order.controller.js";
import { isActive } from "../../middleware/isActive.js";

const orderRouter = Router()

// create order
orderRouter.post('/',
    isAuthenticated(),
    isAuthorized(Object.values(roles)),
    isActive(),
    asyncHandler(createOrder)
)


// update order
orderRouter.put('/update-order/:orderId',
    isAuthenticated(),
    isAuthorized(Object.values(roles)),
    isActive(),
    asyncHandler(updateOrder)
)

// delete order
orderRouter.delete('/delete-order/:orderId',
    isAuthenticated(),
    isAuthorized(Object.values(roles)),
    isActive(),
    asyncHandler(deleteOrder)
)

// get order
orderRouter.get('/get-orders',
    isAuthenticated(),
    isActive(),
    asyncHandler(getOrder))

export default orderRouter