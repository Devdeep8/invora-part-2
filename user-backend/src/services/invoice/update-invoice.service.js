import { BaseService } from '@/src/lib/base.service.js'
import { AppError } from '@/src/errors/app.error.js'
import { Errors } from '@/src/errors/errorCodes.js'
import { InvoiceStatus } from '@/src/prisma/generated/prisma/client'

export default class UpdateInvoiceService extends BaseService {
  validate() {
    const { issueDate, dueDate, items } = this.args
    const errors = []

    if (issueDate && !new Date(issueDate).isValid()) {
      errors.push({ field: 'issueDate', message: 'Invalid issue date' })
    }
    if (dueDate && !new Date(dueDate).isValid()) {
      errors.push({ field: 'dueDate', message: 'Invalid due date' })
    }

    if (items) {
      items.forEach((item, index) => {
        if (!item.description) {
          errors.push({ field: `items.${index}.description`, message: 'Description is required' })
        }
        if (!item.quantity || item.quantity <= 0) {
          errors.push({ field: `items.${index}.quantity`, message: 'Quantity must be greater than 0' })
        }
        if (!item.rate || item.rate <= 0) {
          errors.push({ field: `items.${index}.rate`, message: 'Rate must be greater than 0' })
        }
      })
    }

    if (errors.length > 0) throw AppError.validation(errors, this.traceId)
  }

  async run() {
    const { id, issueDate, dueDate, items, notes, terms, taxRate, discount } = this.args
    const businessId = this.context.businessId

    const invoice = await this.db.invoice.findFirst({
      where: { id: Number(id), businessId },
    })

    if (!invoice) {
      throw new AppError(Errors.INVOICE_NOT_FOUND, { traceId: this.traceId })
    }

    if (invoice.status !== InvoiceStatus.DRAFT) {
      throw new AppError(Errors.INVOICE_NOT_DRAFT, { traceId: this.traceId })
    }

    let updateData = {}
    if (issueDate) updateData.issueDate = new Date(issueDate)
    if (dueDate) updateData.dueDate = new Date(dueDate)
    if (notes !== undefined) updateData.notes = notes
    if (terms !== undefined) updateData.terms = terms
    if (taxRate !== undefined) updateData.taxRate = taxRate
    if (discount !== undefined) updateData.discount = discount

    if (items && items.length > 0) {
      let subtotal = 0
      const processedItems = items.map(item => {
        const amount = item.quantity * item.rate
        subtotal += amount
        return {
          description: item.description,
          quantity: item.quantity,
          rate: item.rate,
          amount,
        }
      })

      const taxAmount = (subtotal * (taxRate !== undefined ? taxRate : invoice.taxRate)) / 100
      const total = subtotal + taxAmount - (discount !== undefined ? discount : invoice.discount)

      updateData.subtotal = subtotal
      updateData.taxAmount = taxAmount
      updateData.total = total

      await this.db.$transaction(async (tx) => {
        await tx.invoiceItem.deleteMany({
          where: { invoiceId: Number(id) },
        })

        await tx.invoiceItem.createMany({
          data: processedItems.map(item => ({
            invoiceId: Number(id),
            ...item,
          })),
        })

        await tx.invoice.update({
          where: { id: Number(id) },
          data: updateData,
        })
      })

      return await this.db.invoice.findUnique({
        where: { id: Number(id) },
        include: {
          items: true,
          client: true,
        },
      })
    } else {
      const updated = await this.db.invoice.update({
        where: { id: Number(id) },
        data: updateData,
        include: {
          items: true,
          client: true,
        },
      })

      return updated
    }
  }
}
