import Stripe from "stripe"
import { Cart, Coupon, Order, Product } from "../../../db/index.js"
import { AppError, messages, orderStatus } from "../../utils/index.js"

export const createOrder = async (req, res, next) => {
    // get data from req
    const { address, phone, coupon, payment } = req.body
    // check coupon
    const couponExist = await Coupon.findOne({ couponCode: coupon })
    if (!couponExist) {
        return next(new AppError(messages.coupon.notFound, 404))
    }
    const currentDate = new Date();
    if (new Date(couponExist.fromDate) > currentDate || new Date(couponExist.toDate) < currentDate) {
        return next(new AppError("Invalid coupon", 404));
    }
    // check cart
    const cart = await Cart.findOne({ user: req.authUser._id }).populate("products.productId")
    const products = cart.products
    if (products.length <= 0) {
        return next(new AppError("cart is empty", 400))
    }
    // check products
    let orderProducts = []
    let orderPrice = 0
    for (const product of products) {
        const productExist = await Product.findById(product.productId)
        if (!productExist) {
            return next(new AppError(messages.product.notFound, 404))
        }
        if (product.quantity > productExist.stock) {
            if (productExist.stock === 0) {
                return next(new AppError(`Product ${productExist.title} is out of stock`, 400))
            } else {
                return next(new AppError(`Only ${productExist.stock} units of ${productExist.title} are in stock`, 400))
            }
        }
        // Decrement product stock
        await Product.findByIdAndUpdate(productExist._id, {
            $inc: { stock: -product.quantity }
        });

        orderProducts.push({
            productId: product.productId,
            name:productExist.title,
            title: productExist.title,
            itemPrice: productExist.finalPrice,
            quantity: product.quantity,
            finalPrice: product.quantity * productExist.finalPrice
        })
        orderPrice += product.quantity * productExist.finalPrice
    }
    // Calculate final price based on coupon type
    let discount = 0;
    if (couponExist.couponType === 'fixedAmount') {
        discount = couponExist.couponAmount;
    } else if (couponExist.couponType === 'percentage') {
        discount = orderPrice * (couponExist.couponAmount / 100);
    }
    const finalPrice = Math.max(orderPrice - discount, 0);

    const order = new Order({
        user: req.authUser._id,
        products: orderProducts,
        address,
        phone,
        coupon: {
            couponId: couponExist?._id,
            code: couponExist?.couponCode,
            discount: couponExist?.couponAmount
        },
        status: orderStatus.PLACED,
        payment,
        orderPrice,
        finalPrice
    })
    const createdOrder = await order.save()
    if (!createdOrder) {
        return next(new AppError(messages.order.failToCreate, 500))
    }
    if(payment === 'visa'){
        
    // integrate payment gateway
    const stripe = new Stripe(process.env.StripeSecretKey);
    const checkout = await stripe.checkout.sessions.create({
        success_url: "https://www.google.com",  // replace with your actual success URL
        cancel_url: "https://www.facebook.com",  // replace with your actual cancel URL
        payment_method_types: ["card"],
        mode: "payment",
        metadata: {
            orderId: createdOrder._id.toString(),
            // clear cart
            // update order status (placed)
        },
        line_items: createdOrder.products.map((product) => {
            return {
                price_data: {
                    currency: "egp",
                    product_data: {
                        name: product.title,
                    },
                    unit_amount: (product.itemPrice - product.itemPrice * (couponExist.couponAmount / 100))*100, 
                },
                quantity: product.quantity,
            };
        }),
    });

    return res.status(200).json({
        message: messages.order.createdSuccessfully,
        success: true,
        data: createdOrder,
        url: checkout.url,
    })
    }
    
        return res.status(200).json({
            message: messages.order.createdSuccessfully,
            success: true,
            data: createdOrder
        });
    }    



// get order
export const getOrder = async (req, res, next) => {
    const apiFeature = new apiFeature(Order.find({ user: req.authUser._id }), req.query).pagination().sort().select().filter()
    const orders = await apiFeature.mongooseQuery
    if (!orders) {
        return next(new AppError(messages.order.notFound, 404))
    }
    // send response
    return res.status(200).json({
        success: true,
        data: orders
    })
}


// update order
export const updateOrder = async (req, res, next) => {
    const { orderId } = req.params;
    const { address, phone, products } = req.body;

    // Find the order and validate ownership
    const order = await Order.findOne({ _id: orderId, user: req.authUser._id });
    if (!order) {
        return next(new AppError(messages.order.notFound, 404));
    }

    // Ensure the order is in a state that allows updates
    if (order.status !== orderStatus.PLACED) {
        return next(new AppError('Order cannot be updated unless it is in PLACED status', 400));
    }
    // Revert stock for previous products before updating the order
    for (const product of order.products) {
        await Product.findByIdAndUpdate(product.productId, {
            $inc: { stock: product.quantity }
        });
    }

    // Update address and phone if provided
    order.address = address || order.address;
    order.phone = phone || order.phone;

    let orderPrice = 0;
    let orderProducts = [];

    // Validate and update products
    if (products && Array.isArray(products)) {
        for (const productUpdate of products) {
            const productExist = await Product.findById(productUpdate.productId);
            if (!productExist) {
                return next(new AppError(messages.product.notFound, 404));
            }
            if (!productExist.inStock(productUpdate.quantity)) {
                return next(new AppError(messages.product.outOfStock, 400));
            }
            // Decrement stock for new product quantities
            await Product.findByIdAndUpdate(productExist._id, {
                $inc: { stock: -productUpdate.quantity }
            });

            const productPrice = productExist.finalPrice || productExist.price;
            const finalPrice = productPrice * productUpdate.quantity;

            orderProducts.push({
                productId: productExist._id,
                title: productExist.title,
                itemPrice: productPrice,
                quantity: productUpdate.quantity,
                finalPrice: finalPrice,
            });

            // Calculate the order's total price
            orderPrice += finalPrice;
        }

        // Update the order's products
        order.products = orderProducts;
    }

    // Apply the original coupon if available
    let finalPrice = orderPrice;
    let discount = 0;
    if (order.coupon && order.coupon.couponId) {
        const couponExist = await Coupon.findById(order.coupon.couponId);
        if (!couponExist) {
            return next(new AppError(messages.coupon.notFound, 404));
        }
        if (couponExist.fromDate > Date.now() || couponExist.toDate < Date.now()) {
            return next(new AppError(messages.coupon.expired, 400));
        }

        if (couponExist.couponType === 'fixedAmount') {
            discount = couponExist.couponAmount;
        } else if (couponExist.couponType === 'percentage') {
            discount = orderPrice * (couponExist.couponAmount / 100);
        }

        finalPrice = Math.max(orderPrice - discount, 0);

        // Update the coupon details in the order
        order.coupon.discount = discount;
        order.coupon.code = couponExist.couponCode;
    }

    // Update the final price and order price in the order
    order.finalPrice = finalPrice;
    order.orderPrice = orderPrice;

    // Save the updated order
    const updatedOrder = await order.save();
    if (!updatedOrder) {
        return next(new AppError(messages.order.failToUpdate, 500));
    }

    // Send the response
    return res.status(200).json({
        success: true,
        data: updatedOrder,
    });
};


// delete order
export const deleteOrder = async (req, res, next) => {
    const { orderId } = req.params;

    // Find the order and validate ownership
    const order = await Order.findOne({ _id: orderId, user: req.authUser._id });
    if (!order) {
        return next(new AppError(messages.order.notFound, 404));
    }

    // Ensure the order is in a state that allows deletion
    if (order.status !== orderStatus.PLACED) {
        return next(new AppError('Only orders in PLACED status can be deleted', 400));
    }

    // Remove the order
    const deletedOrder = await Order.findByIdAndDelete(orderId);
    if (!deletedOrder) {
        return next(new AppError(messages.order.failToDelete, 500));
    }

    // Optional: Update product stock if necessary (undoing reserved quantities)
    for (const product of order.products) {
        await Product.findByIdAndUpdate(product.productId, {
            $inc: { stock: product.quantity }
        });
    }

    // Send the response
    return res.status(200).json({
        success: true,
        message: messages.order.deletedSuccessfully,
        data: deletedOrder,
    });
};