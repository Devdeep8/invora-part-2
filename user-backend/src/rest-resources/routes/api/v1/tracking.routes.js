import { Router } from 'express'
import { contextMiddleware } from '@/src/rest-resources/middlewares/context.middleware.js'
import TrackingController from '@/src/rest-resources/controllers/tracking.controller.js'

const trackingRoutes = Router()

trackingRoutes.use(contextMiddleware())

// No auth middleware - public routes
trackingRoutes.get('/invoice/view/:publicId', TrackingController.trackInvoiceView)

export default trackingRoutes
