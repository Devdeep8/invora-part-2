import { BaseService } from '@/src/lib/base.service.js'
import { AppError } from '@/src/errors/app.error.js'
import { Errors } from '@/src/errors/errorCodes.js'
import { InvoiceStatus } from '@/src/prisma/generated/prisma/client'

export default class UpdateInvoiceStatusService extends BaseService {
  async run() {
    const { id, status } = this.args
    const businessId = this.context.businessId
    const userId = this.context.userId

    const invoice = await this.db.invoice.findFirst({
      where: { id: Number(id), businessId },
    })

    if (!invoice) {
      throw new AppError(Errors.INVOICE_NOT_FOUND, { traceId: this.traceId })
    }

    const validStatuses = Object.values(InvoiceStatus)
    if (!validStatuses.includes(status)) {
      throw new AppError(Errors.INVALID_INVOICE_STATUS, { traceId: this.traceId })
    }

    const updated = await this.db.invoice.update({
      where: { id: Number(id) },
      data: { status },
    })

    await this.db.invoiceEvent.create({
      data: {
        invoiceId: invoice.id,
        businessId,
        eventType: 'STATUS_CHANGED',
        actorType: 'USER',
        actorId: userId,
        metadata: { oldStatus: invoice.status, newStatus: status },
      },
    })

    return updated
  }
}
