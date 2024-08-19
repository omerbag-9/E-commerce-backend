import { Cart, User } from "../../../db/index.js"
import {  AppError, comparePassword, generateOTP, generateToken, hashPassword, messages, sendEmail, status, verifyToken } from "../../utils/index.js"





export const signup = async (req, res, next) => {
    // get data from req
    let { userName, email, password, phone, DOB } = req.body
    // Check existence
    const userExist = await User.findOne({
        $or: [
            { email },
            { phone }
        ]
    })
    if (userExist) {
        return next(new AppError(messages.user.alreadyExist, 409))
    }
    // prepare data
    const hashedPassword = hashPassword({ password })
    const user = new User({
        userName,
        email,
        phone,
        password: hashedPassword,
        DOB
    })

    // add to db
    const createdUser = await user.save()
    if (!createdUser) {
        return next(new AppError(messages.user.failToCreate, 500))
    }

    // sendEmail
    const token = generateToken({ payload: { _id: createdUser._id } })
     sendEmail({
        to: email, subject: 'verify account', html: `<p>to verify your account please click 
        <a href='https://carrent-assignment.onrender.com/auth/verify-account?token=${token}'>Verify Account</a>
         </p>`
    })
    // send response
    return res.status(201).json({
        message: messages.user.createdSuccessfully,
        success: true,
        data: createdUser,
    })
}

export const verifyAccount = async (req, res, next) => {
    const { token } = req.query
    const decoded = verifyToken({ token })

    const user = await User.findByIdAndUpdate(decoded._id, { status: status.VERIFIED }, { new: true })

    if (!user) return next(new AppError(messages.user.notFound, 404))

    await Cart.create({ user: user._id, products: [] })
    return res.status(200).json({ message: messages.user.verifyAccount, success: true, data: user })
}

export const login = async (req, res, next) => {

    // get data from req
    const { email, password, phone } = req.body

    // check existence
    const userExist = await User.findOne({ $or: [{ email }, { phone }], status: status.VERIFIED })

    if (!userExist) {
        return next(new AppError(messages.user.invalidCredentials, 401))
    }

    // check password
    const match = comparePassword({ password, hashPassword: userExist.password })
    if (!match) {
        return next(new AppError(messages.user.invalidCredentials, 401))
    }

    // update isActive
    userExist.isActive = true
    await userExist.save()
    // generate token
    const accessToken = generateToken({ payload: { _id: userExist._id } })

    // send response
    return res.status(200).json({
        message: "login successfully",
        success: true,
        data: userExist,
        accessToken
    })
}


export const forgetPassword = async (req, res, next) => {
    const { email } = req.body;

    // Check if the user exists
    const userExist = await User.findOne({ email });
    if (!userExist) {
        return next(new AppError(messages.user.notFound, 404));
    }

    // If OTP already sent and not expired
    if (userExist.otp && userExist.otpExpiry > Date.now()) {
        return next(new AppError(messages.user.otpAlreadySent, 400));
    }

    // Reset OTP attempt count
    userExist.otpAttempts = 0;

    // Generate and set OTP
    const otp = generateOTP();
    userExist.otp = otp;
    userExist.otpExpiry = Date.now() + 15 * 60 * 1000;

    // Save to database
    await userExist.save();

    // Send email with OTP
    await sendEmail({
        to: email,
        subject: 'Forget Password',
        html: `<h1>You requested a password reset. Your OTP is ${otp}. If you did not request this, please ignore this email.</h1>`,
    });

    // Send response
    return res.status(200).json({ message: 'Check your email', success: true });
};


export const changPassword = async (req, res, next) => {
    const { otp, newPassword, email } = req.body;

    // Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
        return next(new AppError(messages.user.notFound, 404));
    }

    // Ensure OTP and newPassword are strings
    const otpString = otp.toString();
    const storedOtpString = user.otp ? user.otp.toString() : '';

    // Check if OTP is valid
    if (storedOtpString !== otpString) {
        user.otpAttempts = (user.otpAttempts || 0) + 1;
        await user.save();

        // If OTP attempts exceed 3
        if (user.otpAttempts > 3) {
            user.otp = undefined;
            user.otpExpiry = undefined;
            user.otpAttempts = undefined;
            await user.save();
            return next(new AppError('Maximum OTP attempts exceeded. Please request a new OTP.', 403));
        }

        return next(new AppError(`invalid otp you have only ${4 - user.otpAttempts} attemps left`, 401));
    }

    // Check if OTP is expired
    if (user.otpExpiry < Date.now()) {
        const secondOTP = generateOTP();
        user.otp = secondOTP;
        user.otpExpiry = Date.now() + 5 * 60 * 1000;
        user.otpAttempts = 0; // Reset attempts on new OTP

        await user.save();
        await sendEmail({ to: email, subject: 'Resent OTP', html: `<h1>Your new OTP is ${secondOTP}</h1>` });
        return res.status(200).json({ message: "Check your email", success: true });
    }

    // Hash new password
    const hashedPassword = hashPassword({ password: newPassword });

    // Update password and reset OTP data
    await User.updateOne(
        { email },
        { password: hashedPassword, $unset: { otp: "", otpExpiry: "", otpAttempts: "" } }
    );

    return res.status(200).json({ message: 'Password updated successfully', success: true });
};
