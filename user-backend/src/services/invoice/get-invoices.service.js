import { BaseService } from '@/src/lib/base.service.js'

export default class GetInvoicesService extends BaseService {
  async run() {
    const { status, page = 1, limit = 20 } = this.args
    const businessId = this.context.businessId
    const skip = (page - 1) * limit

    const where = { businessId }
    if (status) {
      where.status = status
    }

    const [invoices, total] = await Promise.all([
      this.db.invoice.findMany({
        where,
        include: {
          client: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit),
      }),
      this.db.invoice.count({ where }),
    ])

    return {
      invoices,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    }
  }
}
