// schedulers.js
import schedule from 'node-schedule';
import { Coupon, User } from '../../db/index.js';
import { status } from './constant/enums.js';

// Job to delete users with PENDING status older than 30 days
export const deletePendingUsers = ()=>{
    schedule.scheduleJob('1 1 1 * * *', async function () {
    const users = await User.find({ 
        status: status.PENDING, 
        createdAt: { $lte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } 
    }).lean();

    const userIds = users.map((user) => user._id);

    // Delete associated images from Cloudinary
    for (const user of users) {
        if (user.image && user.image.public_id) {
            await cloudinary.uploader.destroy(user.image.public_id);
        }
    }

    // Delete the users from the database
    await User.deleteMany({ _id: { $in: userIds } });
});}


// Job to handle users with DELETED status older than 3 months
export const handleDeletedUsers = ()=>{
    schedule.scheduleJob('1 1 1 * * *', async () => {
        const users = await User.find({
            status: status.DELETED,
            updatedAt: { $lte: new Date(Date.now() - 3 * 30 * 24 * 60 * 60 * 1000) }
        });
    
        // Additional logic for DELETED users
        for (const user of users) {

            await User.findByIdAndDelete(user._id);
    
            // Delete associated images from Cloudinary
            if (user.image && user.image.public_id) {
                await cloudinary.uploader.destroy(user.image.public_id);
            }
        }
    });
}



// Scheduled job to delete expired or unused coupons
export const deleteExpiredCoupons = ()=>{
    schedule.scheduleJob('1 1 1 * * *', async function () {
        const coupons = await Coupon.find({
            expirationDate: { $lte: new Date() } // Find coupons that are expired
        }).lean();
    
        const couponIds = coupons.map((coupon) => coupon._id);
    
    
        // Delete the coupons from the database
        await Coupon.deleteMany({ _id: { $in: couponIds } });
    });
}

// export const test =()=>{
//     schedule.scheduleJob('* * * * * *', async function () {
//         console.log('test');
//     });
// }
