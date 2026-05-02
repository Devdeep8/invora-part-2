import express from 'express'
import { contextMiddleware } from '@/src/rest-resources/middlewares/context.middleware.js'
import { authMiddleware } from '@/src/rest-resources/middlewares/auth.middleware.js'
import BusinessController from '@/src/rest-resources/controllers/business.controller'

const businessRoutes = express.Router()

// Protected Routes (Need context + auth verification)
businessRoutes.route('/').post(contextMiddleware(), authMiddleware(), BusinessController.createBusiness)

export default businessRoutes
