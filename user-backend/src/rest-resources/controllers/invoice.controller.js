import { sendResponse } from '@/src/helpers/response.helpers.js'
import CreateInvoiceService from '@/src/services/invoice/create-invoice.service.js'
import GetInvoicesService from '@/src/services/invoice/get-invoices.service.js'
import GetInvoiceByIdService from '@/src/services/invoice/get-invoice-by-id.service.js'
import UpdateInvoiceService from '@/src/services/invoice/update-invoice.service.js'
import DeleteInvoiceService from '@/src/services/invoice/delete-invoice.service.js'
import SendInvoiceService from '@/src/services/invoice/send-invoice.service.js'
import UpdateInvoiceStatusService from '@/src/services/invoice/update-invoice-status.service.js'

export default class InvoiceController {
  static async create(req, res, next) {
    try {
      const result = await CreateInvoiceService.execute(req.body, req.context)
      sendResponse({ res }, result, 'Invoice created successfully')
    } catch (error) { next(error) }
  }

  static async list(req, res, next) {
    try {
      const result = await GetInvoicesService.execute(req.query, req.context)
      sendResponse({ res }, result)
    } catch (error) { next(error) }
  }

  static async getById(req, res, next) {
    try {
      const result = await GetInvoiceByIdService.execute({ id: req.params.id }, req.context)
      sendResponse({ res }, result)
    } catch (error) { next(error) }
  }

  static async update(req, res, next) {
    try {
      const result = await UpdateInvoiceService.execute({ id: req.params.id, ...req.body }, req.context)
      sendResponse({ res }, result, 'Invoice updated successfully')
    } catch (error) { next(error) }
  }

  static async delete(req, res, next) {
    try {
      const result = await DeleteInvoiceService.execute({ id: req.params.id }, req.context)
      sendResponse({ res }, result, 'Invoice deleted successfully')
    } catch (error) { next(error) }
  }

  static async send(req, res, next) {
    try {
      const result = await SendInvoiceService.execute({ id: req.params.id }, req.context)
      sendResponse({ res }, result, 'Invoice sent successfully')
    } catch (error) { next(error) }
  }

  static async updateStatus(req, res, next) {
    try {
      const result = await UpdateInvoiceStatusService.execute({ id: req.params.id, ...req.body }, req.context)
      sendResponse({ res }, result, 'Invoice status updated successfully')
    } catch (error) { next(error) }
  }
}
