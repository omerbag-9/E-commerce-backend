import slugify from "slugify"
import { ApiFeature, AppError, deleteFile, messages } from "../../utils/index.js"
import { Category, Product, Subcategory } from "../../../db/index.js"

export const createSubcategory = async (req, res, next) => {
    // get data from req
    let { name, category } = req.body
    name = name.toLowerCase()
    // check category existence
    const categoryExist = await Category.findById(category)// {},null
    if (!categoryExist) {
        // remove image
        req.failImage = req.file.path
        return next(new AppError(messages.category.notFound, 404))
    }

    if(!req.file){
        return next(new AppError(messages.image.required,404))
    }
    // check subcategory existence
    const subcategoryExist = await Subcategory.findOne({ name })// {},null
    if (subcategoryExist) {
        // remove image
        req.failImage = req.file.path
        return next(new AppError(messages.subcategory.alreadyExist, 409))
    }
    // prepare data
    const slug = slugify(name)
    const subcategory = new Subcategory({
        name,
        slug,
        category,
        image: req.file.path,
        createdBy: req.authUser._id
    })
    // add to db
    const createdSubcategory = await subcategory.save()
    if (!createdSubcategory) {
        // remove image
        req.failImage = req.file.path
        return next(new AppError(messages.subcategory.failToCreate, 500))
    }
    // send response
    return res.status(201).json({ message: messages.subcategory.createdSuccessfully, success: true,data:createdSubcategory })
}

export const getSubcategory = async (req, res, next) => {
    // get data from req
    const { categoryId } = req.params
    // check category existence
    const categoryExist = await Category.findById(categoryId)// {},null
    if (!categoryExist) {
        return next(new AppError(messages.category.notFound, 404))
    }
    // get subcategories
    const subcategories = await Subcategory.find({ category: categoryId }, {}, { populate: [{ path: 'category' }] })
    return res.status(200).json({ data: subcategories, success: true })
}

export const getSubcategories = async (req, res, next) => {
    const apiFeature = new ApiFeature(Subcategory.find().populate([{ path: 'category' }]), req.query).filter().sort().select().pagination()
    const subcategories = await apiFeature.mongooseQuery
    return res.status(200).json({ data: subcategories, success: true })
}

export const updateSubCategory = async (req,res,next) =>{
    // get data from req
    const {name , category} = req.body
    const {subCategoryId} = req.params
    // check category existance
    const subcategoryExist = await Subcategory.findById(subCategoryId)
    if(!subcategoryExist){
        req.failImage = req.file.path
        return next(new AppError(messages.subcategory.notFound , 404))
    }

    // check file update
    if(req.file){
        // old file
        deleteFile(subcategoryExist.image)
        // new file
        subcategoryExist.image = req.file.path
    }

    if(name){
        subcategoryExist.name = name
        subcategoryExist.slug = slugify(name)
    }

    if(category){
        subcategoryExist.category = category
    }
    const updatedSubCategory = await subcategoryExist.save()
    if(!updatedSubCategory){
        req.failImage = req.file.path
        return next(new AppError(messages.subcategory.failToUpdate , 500))
    }

    return res.status(200).json({message:messages.subcategory.updatedSuccessfully,success:true,data:updatedSubCategory})
}

export const deleteSubCategory = async (req,res,next) =>{
    // get data from req
    const {subCategoryId} = req.params

    // check subcategory existance
    const subcategoryExist = await Subcategory.findById(subCategoryId)
    if(!subcategoryExist){
        return next(new AppError(messages.subcategory.notFound , 404))
    }

    const products = await Product.find({ category: subCategoryId }).select(["mainImage", "subImages"])
    const productIds = products.map(product => product._id) // [id1 , id2 , id3]

    // delete products
    await Product.deleteMany({ _id: { $in: productIds } });

    // Delete images of products
    products.forEach(product => {
        deleteFile(product.mainImage);
        product.subImages.forEach(image => {
            deleteFile(image);
        });
    });
    
    // delete subcategory
    await Subcategory.deleteOne({_id:subCategoryId})

    // delete file
    deleteFile(subcategoryExist.image)

    return res.status(200).json({message:messages.subcategory.deletedSuccessfully , success:true})
}