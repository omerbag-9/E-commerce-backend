import { Types } from "mongoose"
import { AppError, messages } from "../../utils/index.js"
import { Product, User } from "../../../db/index.js"

export const addToWishlist = async (req, res, next) => {
    // get data from req
    let { productId } = req.body
    productId = new Types.ObjectId(productId)
    const { authUser } = req
    // check product exist
    const productExist = await Product.findById(productId)// {},null

    if (!productExist) {
        return next(new AppError(messages.product.notFound, 404))
    }
    const user = await User.findByIdAndUpdate(authUser._id, { $addToSet: { wishlist: productId } },{ new: true }).select("wishlist")//user.wishlist = [1,2,3] //addToSet if the product added many times it dont push it again
return res.status(200).json({ message: messages.wishlist.addedSuccessfully, success: true, data: user })
}

export const deleteFromWishlist = async (req, res, next) => {
    // get data from req
    const { productId } = req.params
    const user = await User.findByIdAndUpdate(req.authUser._id, { 
        $pull: { wishlist: productId }
    },{ new: true }).select("wishlist")
    return res.status(200).json({ message: messages.wishlist.deletedSuccessfully, success: true, data: user })
}

export const getWishlist = async (req, res, next) => {
    const {authUser} = req
    const user = await User.findById(authUser._id).select("wishlist")
    return res.status(200).json({ success: true, data: user })
}