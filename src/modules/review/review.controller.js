import { Product, Review } from "../../../db/index.js"
import { ApiFeature, AppError, messages } from "../../utils/index.js"

export const addReview = async (req, res, next) => {
    // get data from req
    const { comment, rate } = req.body
    const { productId } = req.query

    // check exisetence
    const productExist = await Product.findById(productId)
    if (!productExist) {
        return next(new AppError(messages.product.notFound, 404))
    }

    // todo check has ordered this product

    //check has review for the product
    const reviewExist = await Review.findOneAndUpdate({ user: req.authUser._id, product: productId }, { comment, rate }, { new: true })
    let message = messages.review.updatedSuccessfully
    let data = reviewExist
    if (!reviewExist) {
        const review = new Review({
            comment,
            rate,
            user: req.authUser._id,
            product: productId
        })
        const createdReview = await review.save()
        if (!createdReview) {
            return next(new AppError(messages.review.failToCreate, 500))
        }
        message = messages.review.createdSuccessfully
        data = createdReview
    }
    return res.status(200).json({ message, success: true, data })
}


// get reviews for product
export const getReviews = async (req, res, next) => {
    // get data from req
    const {productId} = req.params

    // check existance
    const productExist = await Product.findById(productId)
    if (!productExist) {
        return next(new AppError(messages.product.notFound, 404))
    }
    const apiFeature = new ApiFeature(Review.find({product:productId}),req.query).pagination().sort().select().filter()
    const reviews = await apiFeature.mongooseQuery
    if (reviews.length==0) {
        return next(new AppError(messages.review.notFoundReview, 404))
    }
    // send response
    return res.status(200).json({
        success: true,
        data: reviews
    })
}

// delete review 
export const deleteReview = async (req, res, next) => {
    // get data from req
    const {reviewId} = req.params
    // check existance
    const reviewExist = await Review.findById(reviewId)
    if (!reviewExist) {
        return next(new AppError(messages.review.notFound, 404))
    }
    // delete review
    const deletedReview = await Review.findByIdAndDelete(reviewId)
    if (!deletedReview) {
        return next(new AppError(messages.review.failToDelete, 400))
    }
    // send response
    return res.status(200).json({
        message: messages.review.deletedSuccessfully,
        success: true
    })
}
