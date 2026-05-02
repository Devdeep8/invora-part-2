import { Router } from 'express'
import { contextMiddleware } from '@/src/rest-resources/middlewares/context.middleware.js'
import { authMiddleware } from '@/src/rest-resources/middlewares/auth.middleware.js'
import ClientController from '@/src/rest-resources/controllers/client.controller.js'

const clientRoutes = Router()

clientRoutes.use(contextMiddleware())
clientRoutes.use(authMiddleware())

clientRoutes.post('/', ClientController.create)
clientRoutes.get('/', ClientController.list)
clientRoutes.get('/:id', ClientController.getById)
clientRoutes.put('/:id', ClientController.update)
clientRoutes.delete('/:id', ClientController.delete)

export default clientRoutes
