import { BaseService } from '@/src/lib/base.service.js'
import { AppError } from '@/src/errors/app.error.js'
import { Errors } from '@/src/errors/errorCodes.js'

export default class CreateClientService extends BaseService {
  validate() {
    const { name, email } = this.args
    const errors = []

    if (!name) errors.push({ field: 'name', message: 'Client name is required' })
    if (!email) errors.push({ field: 'email', message: 'Client email is required' })
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push({ field: 'email', message: 'Invalid email format' })
    }

    if (errors.length > 0) throw AppError.validation(errors, this.traceId)
  }

  async run() {
    const { name, email, phone, address, city, state, country, zipCode, gstin } = this.args
    const businessId = this.context.businessId

    const existingClient = await this.db.client.findFirst({
      where: {
        businessId,
        email: email.toLowerCase()
      }
    })

    if (existingClient) {
      throw new AppError(Errors.CLIENT_EMAIL_EXISTS, { traceId: this.traceId })
    }

    const client = await this.db.client.create({
      data: {
        businessId,
        name,
        email: email.toLowerCase(),
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
