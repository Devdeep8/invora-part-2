import express from 'express'
import { contextMiddleware } from '@/src/rest-resources/middlewares/context.middleware.js'
import { authMiddleware } from '@/src/rest-resources/middlewares/auth.middleware.js'
import UserController from '@/src/rest-resources/controllers/user.controller.js'

const authRoutes = express.Router()

// Public Routes (Only need context)
authRoutes.route('/register').post(contextMiddleware(), UserController.register)
authRoutes.route('/login').post(contextMiddleware(), UserController.login)

// Protected Routes (Need context + auth verification)

export default authRoutes
