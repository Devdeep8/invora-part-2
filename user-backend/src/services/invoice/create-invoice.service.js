import { BaseService } from '@/src/lib/base.service.js'
import { AppError } from '@/src/errors/app.error.js'
import { Errors } from '@/src/errors/errorCodes.js'
import { InvoiceStatus } from '@/src/prisma/generated/prisma/client'
import appEvents from '@/src/events/app-events.js'

export default class CreateInvoiceService extends BaseService {
  validate() {
    const { clientId, issueDate, dueDate, items } = this.args
    const errors = []

    if (!clientId) errors.push({ field: 'clientId', message: 'Client is required' })
    if (!issueDate) errors.push({ field: 'issueDate', message: 'Issue date is required' })
    if (!dueDate) errors.push({ field: 'dueDate', message: 'Due date is required' })
    if (!items || !Array.isArray(items) || items.length === 0) {
      errors.push({ field: 'items', message: 'At least one item is required' })
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
    const { clientId, issueDate, dueDate, items, notes, terms, sendNow, taxRate, discount } = this.args
    const businessId = this.context.businessId
    const userId = this.context.userId

    const client = await this.db.client.findFirst({
      where: { id: Number(clientId), businessId },
    })

    if (!client) {
      throw new AppError(Errors.CLIENT_NOT_FOUND, { traceId: this.traceId })
    }

    const business = await this.db.business.findUnique({
      where: { id: businessId },
    })

    if (!business) {
      throw new AppError(Errors.BUSINESS_NOT_FOUND, { traceId: this.traceId })
    }

    const invoiceNumber = `${business.invoicePrefix}-${String(business.nextInvoiceNum).padStart(3, '0')}`

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

    const taxAmount = (subtotal * (taxRate || business.taxRate)) / 100
    const total = subtotal + taxAmount - (discount || 0)

    const result = await this.db.$transaction(async (tx) => {
      const invoice = await tx.invoice.create({
        data: {
          businessId,
          clientId: Number(clientId),
          invoiceNumber,
          status: InvoiceStatus.DRAFT,
          issueDate: new Date(issueDate),
          dueDate: new Date(dueDate),
          subtotal,
          taxRate: taxRate || business.taxRate,
          taxAmount,
          discount: discount || 0,
          total,
          notes,
          terms,
        },
      })

      await tx.invoiceItem.createMany({
        data: processedItems.map(item => ({
          invoiceId: invoice.id,
          ...item,
        })),
      })

      await tx.business.update({
        where: { id: businessId },
        data: { nextInvoiceNum: business.nextInvoiceNum + 1 },
      })

      await tx.invoiceEvent.create({
        data: {
          invoiceId: invoice.id,
          businessId,
          eventType: 'CREATED',
          actorType: 'USER',
          actorId: userId,
        },
      })

      return invoice
    })

    if (sendNow) {
      appEvents.emit('invoice.send', {
        invoiceId: result.id,
        businessId,
        userId,
      })
    }

    const invoiceWithItems = await this.db.invoice.findUnique({
      where: { id: result.id },
      include: {
        items: true,
        client: true,
        business: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
          },
        },
      },
    })

    return invoiceWithItems
  }
}
