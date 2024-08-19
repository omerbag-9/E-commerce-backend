import { AppError } from "./appError.js"
import { deleteFile } from "./deleteFile.js"

//================= asyncHandler ==============//
export const asyncHandler = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch((err) => { return next(new AppError(err.message, err.statusCode)) })
    }
}
//============== global error ==============//
export const globalErrorHandling = (err, req, res, next) => {
    if (req.failImage) {
        deleteFile(req.failImage)
    }
    return res.status(err.statusCode || 500).json({ message: err.message, success: false })
}