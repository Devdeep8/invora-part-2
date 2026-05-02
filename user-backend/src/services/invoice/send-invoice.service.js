import { BaseService } from '@/src/lib/base.service.js'
import { AppError } from '@/src/errors/app.error.js'
import { Errors } from '@/src/errors/errorCodes.js'
import { InvoiceStatus } from '@/src/prisma/generated/prisma/client'
import appEvents from '@/src/events/app-events.js'

export default class SendInvoiceService extends BaseService {
  async run() {
    const { id } = this.args
    const businessId = this.context.businessId
    const userId = this.context.userId

    const invoice = await this.db.invoice.findFirst({
      where: { id: Number(id), businessId },
    })

    if (!invoice) {
      throw new AppError(Errors.INVOICE_NOT_FOUND, { traceId: this.traceId })
    }

    if (invoice.status !== InvoiceStatus.DRAFT) {
      throw new AppError(Errors.INVOICE_ALREADY_SENT, { traceId: this.traceId })
    }

    appEvents.emit('invoice.send', {
      invoiceId: invoice.id,
      businessId,
      userId,
    })

    return { message: 'Invoice send queued' }
  }
}
