import { BaseService } from '@/src/lib/base.service.js'
import { AppError } from '@/src/errors/app.error.js'
import { Errors } from '@/src/errors/errorCodes.js'

export default class DeleteClientService extends BaseService {
  async run() {
    const { id } = this.args
    const businessId = this.context.businessId

    const client = await this.db.client.findFirst({
      where: { id: Number(id), businessId },
    })

    if (!client) {
      throw new AppError(Errors.CLIENT_NOT_FOUND, { traceId: this.traceId })
    }

    const invoiceCount = await this.db.invoice.count({
      where: { clientId: Number(id) },
    })

    if (invoiceCount > 0) {
      throw new AppError(Errors.CLIENT_HAS_INVOICES, { traceId: this.traceId })
    }

    await this.db.client.delete({
      where: { id: Number(id) },
    })

    return { message: 'Client deleted successfully' }
  }
}
