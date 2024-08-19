import { Brand, Product } from "../../../db/index.js"
import { ApiFeature, AppError, deleteFile, messages } from "../../utils/index.js"

export const createBrand = async (req, res, next) => {
    // get data from req
    let { name } = req.body
    name = name.toLowerCase()

    // check file
    if (!req.file) {
        return next(new AppError(messages.image.required, 400))
    }
    // check existence
    const brandExist = await Brand.findOne({ name }) // {},null
    if (brandExist) {
        // remove image
        req.failImage = req.file.path
        return next(new AppError(messages.brand.alreadyExist, 409))
    }
    // prepare data
    const brand = new Brand({
        name,
        logo: req.file.path,
        createdBy: req.authUser._id
    })
    const createdBrand = await brand.save()
    if (!createdBrand) {
        // remove image
        req.failImage = req.file.path
        return next(new AppError(messages.brand.failToCreate, 500))
    }
    return res.status(201).json({ message: messages.brand.createdSuccessfully, success: true, data: createdBrand })
}

export const updateBrand = async (req, res, next) => {
    // get data from req
    let { name } = req.body
    const { brandId } = req.params
    name = name.toLowerCase()

    const brandExist = await Brand.findById(brandId)
    if (!brandExist) {
        // remove image
        req.failImage = req.file?.path
        return next(new AppError(messages.brand.notFound, 404))
    }
    if (name) {
        const nameExist = await Brand.findOne({ name, _id: { $ne: brandId } })
        if (nameExist) {
            return next(new AppError(messages.brand.alreadyExist, 409))
        }
        brandExist.name = name
    }
    if(req.file){
        // remove old image
        deleteFile(brandExist.logo)
        // add new image
        brandExist.logo = req.file.path
    }
    const updatedBrand = await brandExist.save()
    if(!updatedBrand){
        req.failImage = req.file.path
        return next(new AppError(messages.brand.failToUpdate,500))
    }
    return res.status(200).json({message:messages.brand.createdSuccessfully , success:true , data:updatedBrand})
}

export const deleteBrand = async (req, res, next) => {
    const { brandId } = req.params

    // check brand existence
    const brand = await Brand.findById(brandId)
    if (!brand) {
        return next(new AppError(messages.brand.notFound, 404))
    }
    
    // prepare ids
    const products = await Product.find({ brand: brandId }).select(["mainImage", "subImages"])
    const productIds = products.map(product => product._id)

    // delete products
    await Product.deleteMany({_id :{ $in: productIds }})

    // delete products images
    products.forEach(product => {
        deleteFile(product.mainImage)
        products.subImages.forEach(image => {
            deleteFile(image)
        })
    })

    // delete brand
    const deletedBrand = await Brand.deleteOne({_id : brandId})
    if(!deletedBrand){
        return next(new AppError(messages.brand.failToDelete, 500))
    } 

    // delete brand image
    deleteFile(brand.logo)
    return res.status(200).json({ message: messages.brand.deletedSuccessfully, success: true })
}

export const getBrands = async (req, res, next) => {
    const apiFeature = new ApiFeature(Brand.find() , req.query).pagination().select().filter().sort()
    const brands = await apiFeature.mongooseQuery
    return res.status(200).json({ data: brands, success: true })
}


export const getBrand = async (req, res, next) => {
    const { brandId } = req.params
    const brand = await Brand.findById(brandId).populate([{ path: "products" }])
    if (!brand) {
        return next(new AppError(messages.brand.notFound, 404))
    }
    return res.status(200).json({ data: brand, success: true })
}