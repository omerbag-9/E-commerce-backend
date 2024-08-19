import joi from "joi";
import { generalFields } from "../../middleware/validation.js";

const parseArr = (value , helper)=>{
    value = JSON.parse(value)
    const schema = joi.array().items(joi.string())
    const {error}= schema.validate(value,{abortEarly:false})
    if(error){
      return helper("invalid array")
    }
    else{
      return true
    }  
}

// create product val
export const createProductVal = joi.object({
    title: generalFields.name.required(),
    description: generalFields.name.required(),
    category: generalFields.objectId.required(),
    subcategory: generalFields.objectId.required(),
    brand: generalFields.objectId.required(), 
    price:joi.number().min(0).required(),
    discount:joi.number().min(0).max(100),
    size:joi.custom(parseArr),
    colors:joi.custom(parseArr),
    stock:joi.number().min(0),
}).required()

// update product val
export const updateProductVal = joi.object({
    title: generalFields.name,
    description: generalFields.name,
    category: generalFields.objectId,
    subcategory: generalFields.objectId,
    brand: generalFields.objectId, 
    price:joi.number().min(0),
    discount:joi.number().min(0).max(100),
    size:joi.custom(parseArr),
    colors:joi.custom(parseArr),
    stock:joi.number().min(0),
    productId: generalFields.objectId.required()
}).required()


// get product val
export const getProductVal = joi.object({
    productId: generalFields.objectId.required()
})