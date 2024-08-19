import { AppError, comparePassword, generateToken, hashPassword, messages, sendEmail, status } from "../../utils/index.js"
import cloudinary from "../../utils/cloudinary.js"
import { User } from "../../../db/index.js"

export const updateUser = async (req, res, next) => {
    // get data from req
    const userId = req.authUser._id
    const { userName, email, phone, address } = req.body

    // check user exist
    const user = await User.findById(userId)
    if (!user) {
        return next(new AppError(messages.user.notFound, 404))
    }

    // Handle file upload and image replacement
    if (req.file) {
        // Check if the user already has an image that is not the default one
        if (user.image && user.image.public_id !== process.env.PUBLIC_ID) {

            // Delete the old image from Cloudinary
            await cloudinary.uploader.destroy(user.image.public_id);
        }
        // Upload the new image to Cloudinary under the 'ecommerce/user' folder
        const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, {
            folder: 'ecommerce/user',
        });

        // Update the user's image with the new details
        req.body.image = { secure_url, public_id };
    }

    // update email
    if (email) {
        // check if email already exist in another user
        const userExist = await User.findOne({ email })
        // if email exist and its not my current email
        if (userExist && email != user.email) {
            return next(new AppError("email is already in use", 409))
        }
        // if its my current email
        if (userExist && email == user.email) {
            user.email = email
        }
        // if email not exist
        else {
            user.email = email
            user.status = status.PENDING
            user.isActive = false
            const token = generateToken({ payload: { _id: user._id } })
            await sendEmail({
                to: email, subject: 'verify account', html: `<p>to verify your account please click 
        <a href='https://carrent-assignment.onrender.com/auth/verify-account?token=${token}'>Verify Account</a>
         </p>`
            })
        }
    }

    user.userName = userName || user.userName
    user.phone = phone || user.phone
    if (address) {
        user.address = JSON.parse(address) || user.address
    }
    user.image = req.body.image || user.image
    const updatedUser = await user.save()
    if (!updatedUser) {
        return next(new AppError(messages.user.failToUpdate, 500))
    }
    return res.status(200).json({ message: messages.user.updatedSuccessfully, success: true, data: updatedUser })
}

export const deleteUser = async (req, res, next) => {
    const userId = req.authUser._id
    const user = await User.findById(userId)
    if (!user) {
        return next(new AppError(messages.user.notFound, 404))
    }

    if (user.image && user.image.public_id !== process.env.PUBLIC_ID) {
        await cloudinary.uploader.destroy(user.image.public_id)
    }

    const deletedUser = await User.deleteOne({ _id: userId })
    if (!deletedUser) {
        return next(new AppError(messages.user.failToDelete, 500))
    }

    return res.status(200).json({ message: messages.user.deletedSuccessfully, success: true })
}

export const logout = async (req, res, next) => {
    const userId = req.authUser._id
    const user = await User.findOneAndUpdate({ _id: userId }, { isActive: false }, { new: true })
    if (!user) {
        return next(new AppError(messages.user.notFound, 404))
    }
    return res.status(200).json({ message: "logged out", success: true })
}

export const resetPassword = async (req, res, next) => {
    // get data from req
    const { oldPassword, newPassword } = req.body
    const userId = req.authUser._id
    // check user password
    const match = comparePassword({ password: oldPassword, hashPassword: req.authUser.password })
    if (!match) {
        return next(new AppError(messages.user.invalidCredentials, 401))
    }
    // hash new password
    const hashedPassword = hashPassword({ password: newPassword })

    // update password
    await User.updateOne({ _id: userId }, { password: hashedPassword })

    // send res
    return res.status(200).json({ message: messages.user.updatedSuccessfully, success: true })
}

export const getUserProfile = async (req, res, next) => {
    const userId = req.authUser._id
    const user = await User.findById(userId)
    if (!user) {
        return next(new AppError(messages.user.notFound, 404))
    }
    return res.status(200).json({ success: true, data: user })
}