import { Router } from 'express'
import { contextMiddleware } from '@/src/rest-resources/middlewares/context.middleware.js'
import { authMiddleware } from '@/src/rest-resources/middlewares/auth.middleware.js'
import InvoiceController from '@/src/rest-resources/controllers/invoice.controller.js'

const invoiceRoutes = Router()

invoiceRoutes.use(contextMiddleware())
invoiceRoutes.use(authMiddleware())

invoiceRoutes.post('/', InvoiceController.create)
invoiceRoutes.get('/', InvoiceController.list)
invoiceRoutes.get('/:id', InvoiceController.getById)
invoiceRoutes.put('/:id', InvoiceController.update)
invoiceRoutes.delete('/:id', InvoiceController.delete)
invoiceRoutes.post('/:id/send', InvoiceController.send)
invoiceRoutes.patch('/:id/status', InvoiceController.updateStatus)

export default invoiceRoutes
