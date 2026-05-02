import { BaseService } from '@/src/lib/base.service.js'
import { AppError } from '@/src/errors/app.error.js'
import { Errors } from '@/src/errors/errorCodes.js'

export default class UpdateClientService extends BaseService {
  validate() {
    const { name, email } = this.args
    const errors = []

    if (!name) errors.push({ field: 'name', message: 'Client name is required' })
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push({ field: 'email', message: 'Invalid email format' })
    }

    if (errors.length > 0) throw AppError.validation(errors, this.traceId)
  }

  async run() {
    const { id, name, email, phone, address, city, state, country, zipCode, gstin } = this.args
    const businessId = this.context.businessId

    const existingClient = await this.db.client.findFirst({
      where: { id: Number(id), businessId },
    })

    if (!existingClient) {
      throw new AppError(Errors.CLIENT_NOT_FOUND, { traceId: this.traceId })
    }

    if (email && email !== existingClient.email) {
      const duplicateClient = await this.db.client.findFirst({
        where: {
          businessId,
          email: email.toLowerCase(),
          id: { not: Number(id) }
        }
      })

      if (duplicateClient) {
        throw new AppError(Errors.CLIENT_EMAIL_EXISTS, { traceId: this.traceId })
      }
    }

    const client = await this.db.client.update({
      where: { id: Number(id) },
      data: {
        name,
        email: email ? email.toLowerCase() : existingClient.email,
        phone,
        address,
        city,
        state,
        country,
        zipCode,
        gstin,
      },
    })

    return client
  }
}
