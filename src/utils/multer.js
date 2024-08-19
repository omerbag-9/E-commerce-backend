import path from 'path'
import fs from 'fs'
import { nanoid } from 'nanoid'
import multer, { diskStorage } from 'multer'
import { AppError } from './appError.js'
export const fileValidation = {
    image: ['image/png', 'image/jpeg'],
    file: ['application/pdf'],
    video: ['video/mp4']
}
export const fileUpload = ({ folder, allowType = fileValidation.image }) => {
    const storage = diskStorage({
        destination: (req, file, cb) => {
            const fullPath = `uploads/${folder}`
            const folderPath = path.resolve(fullPath)
            if (!fs.existsSync(folderPath)) {
                fs.mkdirSync(folderPath, { recursive: true })
            }
            cb(null, fullPath)
        },
        filename: (req, file, cb) => {
            cb(null, nanoid() + file.originalname)
        }
    })
    const fileFilter = (req, file, cb) => {
        if (!allowType.includes(file.mimetype)) {
            cb(new AppError('invalid file format', 400), false)
        }
        cb(null, true)
    }
    return multer({ storage, fileFilter })
}