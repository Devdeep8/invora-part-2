import appEvents from '@/src/events/app-events.js'
import { invoiceSendHandler } from './invoice-send.handler.js'

export const registerInvoiceListeners = () => {
  appEvents.on('invoice.send', async (payload) => {
    try {
      await invoiceSendHandler(payload)
    } catch (err) {
      console.error('[invoice.send] unhandled error:', err)
    }
  })
}
