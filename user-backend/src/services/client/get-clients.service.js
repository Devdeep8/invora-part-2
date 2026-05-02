import { BaseService } from '@/src/lib/base.service.js'

export default class GetClientsService extends BaseService {
  async run() {
    const businessId = this.context.businessId

    const clients = await this.db.client.findMany({
      where: { businessId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        city: true,
        gstin: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return clients
  }
}
