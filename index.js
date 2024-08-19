import path from 'path'
import dotenv from 'dotenv'
import express from 'express'
import { initApp } from './src/initApp.js'
import { deleteExpiredCoupons, deletePendingUsers, handleDeletedUsers } from './src/utils/cronJobs.js'
const app = express()

deleteExpiredCoupons()
handleDeletedUsers()
deletePendingUsers()
dotenv.config({ path: path.resolve('./config/.env') })
initApp(app, express)
