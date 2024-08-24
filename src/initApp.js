import path from 'path'
import { connectDB } from "../db/connection.js"
import { asyncHandler, globalErrorHandling } from "./utils/index.js"
import * as allRouter from './index.js'
import dotenv from 'dotenv'
import { Cart, Order } from '../db/index.js'
export const initApp = (app, express) => {
    app.use('/webhook', express.raw({ type: 'application/json' }), asyncHandler(
        async (req, res) => {
            const sig = req.headers['stripe-signature'].toString()

            let event = stripe.webhooks.constructEvent(req.body, sig, 'whsec_9tc9ABjo2hhKEk0yIgUWdvW8KW0Jkx70');


            // Handle the event checkout.session.completed
            if (event.type === 'checkout.session.completed') {
                const checkout = event.data.object
                const orderId = checkout.metadata.orderId
                const orderExist = await Order.findByIdAndUpdate(orderId, { status: 'placed' }, { new: true })
                const cart = await Cart.findOneAndUpdate({ user: orderExist.user }, { products: [] } , { new: true })
            }
            // return a 200 res to acknowledge receipt of the event
            res.send()
        }))

    app.use(express.json())
    app.use('/uploads', express.static('uploads'))

    connectDB()
    const port = process.env.PORT || 3000
    app.use('/category', allRouter.categoryRouter)
    app.use('/sub-category', allRouter.subcategoryRouter)
    app.use('/brand', allRouter.brandRouter)
    app.use('/product', allRouter.productRouter)
    app.use('/auth', allRouter.authRouter)
    app.use('/admin', allRouter.adminRouter)
    app.use('/wishlist', allRouter.wishlistRouter)
    app.use('/user', allRouter.userRouter)
    app.use('/review', allRouter.reviewRouter)
    app.use('/coupon', allRouter.couponRouter)
    app.use('/cart', allRouter.cartRouter)
    app.use('/order', allRouter.orderRouter)
    app.use(globalErrorHandling)
    app.listen(port, () => console.log('server is running on port', port))
}