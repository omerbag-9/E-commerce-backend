import multer, { diskStorage } from 'multer'
import { AppError } from './appError.js'

export const fileValidation = {
    image: ['image/png', 'image/jpeg'],
    file: ['application/pdf'],
    video: ['video/mp4']
}
export const cloudUpload = ({ allowType = fileValidation.image } = {} ) => {
    const storage = diskStorage({})
    const fileFilter = (req, file, cb) => {
        if (!allowType.includes(file.mimetype)) {
            cb(new AppError('invalid file format', 400), false)
        }
        cb(null, true)
    }
    return multer({ storage, fileFilter })
}