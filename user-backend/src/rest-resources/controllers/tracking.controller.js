import prisma from '@/src/lib/prisma.js'
import { sendResponse } from '@/src/helpers/response.helpers.js'

export default class TrackingController {
  static async trackInvoiceView(req, res, next) {
    try {
      const { publicId } = req.params

      const invoice = await prisma.invoice.findUnique({
        where: { publicId },
        include: {
          items: true,
          client: true,
          business: {
            select: {
              id: true,
              name: true,
              logoUrl: true,
              address: true,
              city: true,
              state: true,
              country: true,
              zipCode: true,
              phone: true,
              taxId: true,
            },
          },
        },
      })

      if (!invoice) {
        return res.status(404).json({ message: 'Invoice not found' })
      }

      if (invoice.publicIdExpiresAt && invoice.publicIdExpiresAt < new Date()) {
        return res.status(410).json({ message: 'This invoice link has expired' })
      }

      if (!invoice.viewedAt) {
        await prisma.$transaction(async (tx) => {
          await tx.invoice.update({
            where: { id: invoice.id },
            data: { viewedAt: new Date() },
          })

          await tx.invoiceEvent.create({
            data: {
              invoiceId: invoice.id,
              businessId: invoice.businessId,
              eventType: 'VIEWED',
              actorType: 'CLIENT',
            },
          })
        })
      }

      sendResponse({ res }, invoice)
    } catch (error) { next(error) }
  }
}
