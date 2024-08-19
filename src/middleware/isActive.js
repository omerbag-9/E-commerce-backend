import { User } from "../../db/index.js"
import { AppError } from "../utils/appError.js"
import { messages } from "../utils/constant/messages.js"

export const isActive = () => {
    return async (req, res, next) => {
        const userId = req.authUser._id
        const user = await User.findById(userId)
        if (!user) {
            return next(new AppError(messages.user.notFound, 404))
        }
        if (user.isActive === false) {
            return next(new AppError(messages.user.notActive, 400))
        }
        next()
    }
}
