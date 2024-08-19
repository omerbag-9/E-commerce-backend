import { Cart, Product } from "../../../db/index.js"
import { ApiFeature, AppError, messages } from "../../utils/index.js"

export const addToCart = async (req, res, next) => {
    // get data from req
    const { productId, quantity } = req.body
    // check exisetence
    const productExist = await Product.findById(productId)//.lean() lean make 3x speed of query but cant chaining bec it dont return metadata and dont see changing on the document
    if (!productExist) {
        return next(new AppError(messages.product.notFound, 404))
    }
    //check stock
    if (!productExist.inStock(quantity)) {
        return next(new AppError('exceeded the number of the product in stock', 400))
    }
    //check cart if user already has cart and the product is exists in his cart or not
    const userCart = await Cart.findOneAndUpdate(
        {
            user: req.authUser._id, 'products.productId': productId
        },
        {
            $set: { 'products.$.quantity': quantity }, // $ means to specify the quantity of specific product
        },
        { new: true }
    )
    let data = userCart
    // if user dont have cart create cart to him and add product to this cart
    if (!userCart) {
        data = await Cart.findOneAndUpdate({ user: req.authUser._id },
            { $push: { products: { productId, quantity } } },{ new: true }
        )
    }
    return res.status(200).json({ message: "done", success: true, data })
}

// get cart
export const getCart = async (req, res, next) => {
    const apiFeature = new ApiFeature(Cart.find({ user: req.authUser._id }).populate('products.productId'), req.query).pagination().sort().select().filter()
    const cart = await apiFeature.mongooseQuery
    if (!cart) {
        return next(new AppError(messages.cart.notFound, 404));
    }
    // send response
    return res.status(200).json({
        message: 'Cart get successfully',
        success: true,
        data: cart
    });
}


// delete from cart
export const deleteFromCart = async (req, res, next) => {
    // get productId from req
    const { productId } = req.params;
    // find the cart for the authenticated user
    const cart = await Cart.findOne({ user: req.authUser._id });

    // check if the cart exists and if the user is the owner
    if (!cart) {
        return next(new AppError(messages.cart.notFound, 404)); 
    }

    // check if the product exists in the cart
    const productInCart = cart.products.find(product => String(product.productId) === String(productId));
    if (!productInCart) {
        return next(new AppError(messages.cart.notFoundCart, 404)); 
    }
    // remove the product from the cart
    const updatedCart = await Cart.findOneAndUpdate(
        { user: req.authUser._id },
        { $pull: { products: { productId } } },
        { new: true }
    );
    // send response
    return res.status(200).json({
        message: 'Product removed from cart successfully',
        success: true,
        data: updatedCart
    });
};
