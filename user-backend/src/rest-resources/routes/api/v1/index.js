import express from 'express'
import userRoutes from "./auth.routes"
import businessRoutes from "./business.routes"
import clientRoutes from "./client.routes"
import invoiceRoutes from "./invoice.routes"
import trackingRoutes from "./tracking.routes"

const v1Router = express.Router()

v1Router.use('/user', userRoutes)
v1Router.use('/business', businessRoutes)
v1Router.use('/clients', clientRoutes)
v1Router.use('/invoices', invoiceRoutes)
v1Router.use('/track', trackingRoutes)

export default v1Router