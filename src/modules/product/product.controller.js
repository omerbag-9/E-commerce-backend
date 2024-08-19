import slugify from "slugify"
import { Brand, Category, Product, Subcategory } from "../../../db/index.js"
import { ApiFeature, AppError, deleteFile, messages } from "../../utils/index.js"

// handle delete image function
const deleteImage = () => {
    // delete image
    if (req.files?.mainImage) {
        deleteFile(req.files.mainImage[0].path);
    }
    if (req.files?.subImages) {
        req.files.subImages.forEach(img => {
            deleteFile(img.path);
        });
    }
}

export const createProduct = async (req, res, next) => {
    // get data from req
    const { title, description, category, subcategory, brand, price, discount, size, colors, stock } = req.body

    // check category existence
    const categoryExist = await Category.findById(category) // {},null
    if (!categoryExist) {
        deleteImage()
        return next(new AppError(messages.category.notFound, 404))
    }

    // check subcategory existence
    const subcategoryExist = await Subcategory.findById(subcategory) // {},null
    if (!subcategoryExist) {
        deleteImage()
        return next(new AppError(messages.subcategory.notFound, 404))
    }

    // check brand existence
    const brandExist = await Brand.findById(brand) // {},null
    if (!brandExist) {
        deleteImage()
        return next(new AppError(messages.brand.notFound, 404))
    }

    // prepare data
    const slug = slugify(title)
    const product = new Product({
        title,
        slug,
        mainImage: req.files.mainImage[0].path,
        subImages: req.files.subImages.map(img => img.path),
        description,
        category,
        subcategory,
        brand,
        price,
        discount,
        size: JSON.parse(size),
        colors: JSON.parse(colors),
        stock,
        createdBy: req.authUser._id
    })
    const createdProduct = await product.save()
    if (!createdProduct) {
        deleteImage()
        return next(new AppError(messages.product.failToCreate, 500))
    }
    return res.status(201).json({ message: messages.product.createdSuccessfully, success: true, data: createdProduct })
}

export const updateProduct = async (req, res, next) => {
    const { productId } = req.params
    const { title, description, category, subcategory, brand, price, discount, size, colors, stock } = req.body
    const product = await Product.findById(productId)
    // check product existence
    if (!product) {
        // delete product images
        deleteImage()
        return next(new AppError(messages.product.notFound, 404))
    }
    // check category existence
    const categoryExist = await Category.findById(category) // {},null
    if (!categoryExist) {
        // delete product images
        deleteImage()
        return next(new AppError(messages.category.notFound, 404))
    }

    // check subcategory existence
    const subcategoryExist = await Subcategory.findById(subcategory) // {},null
    if (!subcategoryExist) {
        // delete product images
        deleteImage()
        return next(new AppError(messages.subcategory.notFound, 404))
    }

    // check brand existence
    const brandExist = await Brand.findById(brand) // {},null
    if (!brandExist) {
        // delete product images
        deleteImage()
        return next(new AppError(messages.brand.notFound, 404))
    }

    // check file main image update
    if (req.files.mainImage) {
        // old file
        deleteFile(product.mainImage)
        // new file
        product.mainImage = req.files.mainImage[0].path
    }

    // check file sub images update
    if (req.files.subImages) {
        // old files
        product.subImages.forEach(image => {
            deleteFile(image)
        })
        // new files
        product.subImages = req.files.subImages.map(img => img.path)
    }

    // prepare data
    const slug = slugify(title)
    // update product
    const updatedProduct = await Product.findByIdAndUpdate(productId, {
        title,
        slug,
        mainImage: req.files.mainImage[0].path,
        subImages: req.files.subImages.map((img) => img.path),
        description,
        category,
        subcategory,
        brand,
        price,
        discount,
        size: JSON.parse(size),
        colors: JSON.parse(colors),
        stock
    })
    if (!updatedProduct) {
        // delete product images
        deleteFile(product.mainImage)
        product.subImages.forEach(image => {
            deleteFile(image)
        })
        return next(new AppError(messages.product.failToUpdate, 500))
    }
    return res.status(200).json({ message: messages.product.updatedSuccessfully, success: true, data: updatedProduct })
}

export const deleteProduct = async (req, res, next) => {
    const { productId } = req.params
    const product = await Product.findById(productId)
    // check product existence
    if (!product) {
        return next(new AppError(messages.product.notFound, 404))
    }
    // delete product
    const deletedProduct = await Product.deleteOne({ _id: productId })
    if (!deletedProduct) {
        return next(new AppError(messages.product.failToDelete, 500))
    }
    // delete product images
    deleteFile(product.mainImage)
    product.subImages.forEach(image => {
        deleteFile(image)
    })

    return res.status(200).json({ message: messages.product.deletedSuccessfully, success: true })
}

export const getProduct = async (req, res, next) => {
    const { productId } = req.params
    const product = await Product.findById(productId).populate('brand subcategory category')
    if (!product) {
        return next(new AppError(messages.product.notFound, 404))
    }
    return res.status(200).json({ data: product, success: true })
}

export const getProducts = async (req, res, next) => {
    const apiFeature = new ApiFeature(Product.find(), req.query).pagination().sort().select().filter()
    const products = await apiFeature.mongooseQuery
    return res.status(200).json({ data: products, success: true })
}