import slugify from 'slugify'
import { Category, Product, Subcategory } from "../../../db/index.js"
import { ApiFeature, AppError, deleteFile, messages } from '../../utils/index.js'
import cloudinary from '../../utils/cloudinary.js'

export const createCategory = async (req, res, next) => {
    // get data from req
    let { name } = req.body
    name = name.toLowerCase()
    // check existence
    const categoryExist = await Category.findOne({ name })// {},null
    if (categoryExist) {
        // remove image
        req.failImage = req.file.path
        return next(new AppError(messages.category.alreadyExist, 409))
    }
    if (!req.file) {
        return next(new AppError(messages.image.required, 404))
    }
    // prepare data
    const slug = slugify(name)
    const category = new Category({
        name,
        slug,
        image: req.file.path,
        createdBy: req.authUser._id
    })
    // add to db
    const createdCategory = await category.save()
    if (!createdCategory) {
        // remove image
        req.failImage = req.file.path
        return next(new AppError(messages.category.failToCreate, 500))
    }
    // send response
    return res.status(201).json({ message: messages.category.createdSuccessfully, success: true })
}

export const createCategoryCloud = async (req, res, next) => {
    // get data from req
    let { name } = req.body
    name = name.toLowerCase()
    // check existence
    const categoryExist = await Category.findOne({ name })// {},null
    if (categoryExist) {
        return next(new AppError(messages.category.alreadyExist, 409))
    }
    if (!req.file) {
        return next(new AppError(messages.image.required, 404))
    }
    // prepare data
    const slug = slugify(name)

    const { secure_url, public_id } = await cloudinary.uploader.upload(req.file?.path, {
        folder: 'ecommerce/category',
        // public_id:category.image.public_id // when i put i can use this
    })

    const category = new Category({
        name,
        slug,
        image: { secure_url, public_id },
        createdBy: req.authUser._id
    })
    // add to db
    const createdCategory = await category.save()
    if (!createdCategory) {
        return next(new AppError(messages.category.failToCreate, 500))
    }
    // send response
    return res.status(201).json({ message: messages.category.createdSuccessfully, success: true, data: createdCategory })
}

export const updateCategory = async (req, res, next) => {
    // get data from req
    const { name } = req.body
    const { categoryId } = req.params

    // check category exist
    const categoryExist = await Category.findById(categoryId) // {} , null
    if (!categoryExist) {
        req.failImage = req.file.path
        return next(new AppError(messages.category.notFound, 404))
    }
    if (req.file) {
        // delete old image
        deleteFile(categoryExist.image)
        // update new image
        categoryExist.image = req.file.path
    }
    if (name) {
        categoryExist.name = name
        categoryExist.slug = slugify(name)
    }
    const updatedCategory = await categoryExist.save()
    if (!updatedCategory) {
        req.failImage = req.file.path
        return next(new AppError(messages.category.failToUpdate, 500))
    }
    return res.status(200).json({ message: messages.category.updatedSuccessfully, success: true, data: updatedCategory })
}


export const updateCategoryCloud = async (req, res, next) => {
    const { categoryId } = req.params
    const category = await Category.findById(categoryId)
    if (req.file) {
        const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, { public_id: category.image.public_id })
        req.body.image = { secure_url, public_id }
    }
    category.name = req.body.name || category.name
    if (req.body.image) {
        // delete old image from cloudinary
        await cloudinary.uploader.destroy(category.image.public_id)
        // update new image
        category.image = req.body.image
    }
    const updatedCategory = await category.save()
    return res.status(200).json({ message: messages.category.updatedSuccessfully, success: true, data: updatedCategory })
}

export const deletCategory = async (req, res, next) => {
    // get data from req
    const { categoryId } = req.params

    // check category existance
    const categoryExist = await Category.findById(categoryId)
    if (!categoryExist) {
        return next(new AppError(messages.category.notFound, 404))
    }

    // prepare ids
    const subcategories = await Subcategory.find({ category: categoryId }).select("image")
    const products = await Product.find({ category: categoryId }).select(["mainImage", "subImages"])
    const subcategoriesIds = subcategories.map(sub => sub._id) // [id1 , id2 , id3]
    const productIds = products.map(product => product._id) // [id1 , id2 , id3]

    // delete subCategories
    await Subcategory.deleteMany({ _id: { $in: subcategoriesIds } });

    // delete products
    await Product.deleteMany({ _id: { $in: productIds } });

    // Delete images of subcategories
    subcategories.forEach(subcategory => {
        deleteFile(subcategory.image);
    });

    // Delete images of products
    products.forEach(product => {
        deleteFile(product.mainImage);
        product.subImages.forEach(image => {
            deleteFile(image);
        });
    });

    // delete category
    const deletedCategory = await categoryExist.deleteOne()
    if (!deletedCategory) {
        return next(new AppError(messages.category.failToDelete))
    }
    // delete category image
    deleteFile(categoryExist.image)

    return res.status(200).json({ message: messages.category.deletedSuccessfully, success: true })
}

export const deletCategoryCloud = async (req, res, next) => {
    // get data from req
    const { categoryId } = req.params

    // check category existance
    const categoryExist = await Category.findById(categoryId)
    if (!categoryExist) {
        return next(new AppError(messages.category.notFound, 404))
    }

    // prepare ids
    const subcategories = await Subcategory.find({ category: categoryId }).select("image")
    const products = await Product.find({ category: categoryId }).select(["mainImage", "subImages"])
    const subcategoriesIds = subcategories.map(sub => sub._id) // [id1 , id2 , id3]
    const productIds = products.map(product => product._id) // [id1 , id2 , id3]

    // delete subCategories
    await Subcategory.deleteMany({ _id: { $in: subcategoriesIds } });

    // delete products
    await Product.deleteMany({ _id: { $in: productIds } });

    // Delete images of subcategories
    subcategories.forEach(subcategory => {
        deleteFile(subcategory.image);
    });

    // Delete images of products
    products.forEach(product => {
        deleteFile(product.mainImage);
        product.subImages.forEach(image => {
            deleteFile(image);
        });
    });

    // delete category
    const deletedCategory = await Category.deleteOne({ _id: categoryId })
    if (!deletedCategory) {
        return next(new AppError(messages.category.failToDelete))
    }
    // delete category image
    await cloudinary.uploader.destroy(categoryExist.image.public_id)

    return res.status(200).json({ message: messages.category.deletedSuccessfully, success: true })
}

export const getCategory = async (req, res, next) => {
    // get data from req
    const { categoryId } = req.params
    // check existence
    //--1 // populate
    const category = await Category.findById(categoryId).populate([{ path: "subcategories" }])// {},null
    if (!category) {
        return next(new AppError(messages.category.notFound, 404))
    }
    //--2 using aggregate
    // const category = await Category.aggregate([
    //     {
    //         $match: {
    //             _id: new Types.ObjectId(categoryId)
    //         }
    //     },
    //     {
    //         $lookup: {
    //             from: "subcategories",
    //             localField: '_id',
    //             foreignField: "category",
    //             as: "subcategories"
    //         }
    //     }
    // ])
    category ?
        res.status(200).json({ date: category, success: true })
        : next(new AppError(messages.category.notFound, 404))
}

export const getCategories = async (req, res, next) => {
    const apiFeature = new ApiFeature(Category.find().populate([{ path: "subcategories" }]), req.query).pagination().select().filter().sort()
    const categories = await apiFeature.mongooseQuery
    return res.status(200).json({ data: categories, success: true })
}