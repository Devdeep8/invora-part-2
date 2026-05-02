import prisma from '@/src/lib/prisma.js'

export const invoiceSendHandler = async ({ invoiceId, businessId, userId }) => {
  try {
    const invoice = await prisma.invoice.findFirst({
      where: { id: invoiceId, businessId },
      include: { client: true, business: true, items: true }
    })

    if (!invoice) return

    if (['SENT', 'PAID', 'PARTIALLY_PAID'].includes(invoice.status)) return

    await prisma.$transaction(async (tx) => {
      await tx.invoice.update({
        where: { id: invoiceId },
        data: { status: 'SENT', sentAt: new Date() }
      })

      await tx.invoiceEvent.create({
        data: {
          invoiceId,
          businessId,
          eventType: 'SENT',
          actorType: 'SYSTEM',
          metadata: {
            toEmail: invoice.client.email,
            note: 'Email sending not configured for MVP'
          }
        }
      })
    })

  } catch (err) {
    console.error('[invoice.send] error:', err)
  }
}
