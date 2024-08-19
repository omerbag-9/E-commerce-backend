import joi from "joi"
import { AppError } from "../utils/appError.js"
import { Types } from "mongoose"

const validatedObjectId = (value , helper) =>{
    const match = Types.ObjectId.isValid(value)
    if(match){
        return true
    }
    return helper('invalid ObjectId')
}
export const generalFields = {
    name: joi.string(),
    email: joi.string().email(),
    password: joi.string().required(),
    rePassword: joi.string().valid(joi.ref('password')),
    // objectId: joi.string().hex().length(24)
    objectId:joi.custom(validatedObjectId),
    comment : joi.string()
}
export const isValid = (schema) => {
    return (req, res, next) => {
        const data = {
            ...req.body,
            ...req.params,
            ...req.query
        }
        const { error } = schema.validate(data, { abortEarly: true })
        if (error) {
            const errArr = []
            error.details.forEach(err => errArr.push(err.message))
            return next(new AppError(errArr, 400))
        }
        next()
    }
}