import express from 'express'
import userRoutes from "./auth.routes"
import businessRoutes from "./business.routes"

const v1Router = express.Router()

v1Router.use('/user', userRoutes)
v1Router.use('/business', businessRoutes)

export default v1Router