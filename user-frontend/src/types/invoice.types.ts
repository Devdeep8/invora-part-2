export type InvoiceStatus = 'DRAFT' | 'SENT' | 'VIEWED' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE' | 'CANCELLED'

export interface Client {
  id: number
  name: string
  email: string
  phone?: string
  address?: string
  city?: string
  state?: string
  country?: string
  zipCode?: string
  gstin?: string
  createdAt: string
  updatedAt: string
}

export interface InvoiceItem {
  id?: number
  description: string
  quantity: number
  rate: number
  amount: number
}

export interface Invoice {
  id: number
  invoiceNumber: string
  status: InvoiceStatus
  clientId: number
  client: Client
  businessId: number
  business: {
    id: number
    name: string
    logoUrl?: string
    address?: string
    city?: string
    state?: string
    country?: string
    zipCode?: string
    phone?: string
    taxId?: string
    email?: string
  }
  items: InvoiceItem[]
  subtotal: number
  taxRate: number
  taxAmount: number
  discount: number
  total: number
  issueDate: string
  dueDate: string
  notes?: string
  terms?: string
  viewedAt?: string
  sentAt?: string
  emailOpenedAt?: string
  paidAt?: string
  publicId: string
  publicIdExpiresAt?: string
  createdAt: string
  updatedAt: string
  events?: InvoiceEvent[]
}

export interface InvoiceEvent {
  id: number
  invoiceId: number
  businessId: number
  eventType: string
  actorType: string
  actorId?: number
  metadata?: Record<string, unknown>
  createdAt: string
}

export interface CreateClientPayload {
  name: string
  email: string
  phone?: string
  address?: string
  city?: string
  state?: string
  country?: string
  zipCode?: string
  gstin?: string
}

export interface UpdateClientPayload extends Partial<CreateClientPayload> {}

export interface CreateInvoicePayload {
  clientId: number
  issueDate: string
  dueDate: string
  items: InvoiceItem[]
  notes?: string
  terms?: string
  sendNow?: boolean
  taxRate?: number
  discount?: number
}

export interface UpdateInvoicePayload {
  issueDate?: string
  dueDate?: string
  items?: InvoiceItem[]
  notes?: string
  terms?: string
  taxRate?: number
  discount?: number
}

export interface UpdateInvoiceStatusPayload {
  status: InvoiceStatus
}

export interface InvoiceListResponse {
  invoices: Invoice[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
