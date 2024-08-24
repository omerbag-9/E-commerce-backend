import path from 'path'
import { connectDB } from "../db/connection.js"
import { globalErrorHandling } from "./utils/index.js"
import * as allRouter from './index.js'
import dotenv from 'dotenv'
export const initApp = (app, express) => {
    dotenv.config({ path: path.resolve('./config/.env') })
    app.use(express.json())
    app.use('/uploads', express.static('uploads'))

    connectDB()
    const port = process.env.PORT || 3000
    app.use('/category', allRouter.categoryRouter)
    app.use('/sub-category', allRouter.subcategoryRouter)
    app.use('/brand', allRouter.brandRouter)
    app.use('/product', allRouter.productRouter)
    app.use('/auth',  allRouter.authRouter)
    app.use('/admin', allRouter.adminRouter)
    app.use('/wishlist',  allRouter.wishlistRouter)
    app.use('/user',  allRouter.userRouter)
    app.use('/review',  allRouter.reviewRouter)
    app.use('/coupon',  allRouter.couponRouter)
    app.use('/cart',  allRouter.cartRouter)
    app.use('/order',  allRouter.orderRouter)
    app.use(globalErrorHandling)
    app.listen(port, () => console.log('server is running on port', port))
}