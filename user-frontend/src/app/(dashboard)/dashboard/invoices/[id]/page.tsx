'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { invoiceService } from '@/services/invoice.service'
import { Invoice } from '@/types/invoice.types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ArrowLeft, Send, Download, ExternalLink, Clock, CheckCircle2, Mail, Eye, User } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
  SENT: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
  VIEWED: 'bg-purple-100 text-purple-700 hover:bg-purple-200',
  PARTIALLY_PAID: 'bg-amber-100 text-amber-700 hover:bg-amber-200',
  PAID: 'bg-green-100 text-green-700 hover:bg-green-200',
  OVERDUE: 'bg-red-100 text-red-700 hover:bg-red-200',
  CANCELLED: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
}

const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Draft',
  SENT: 'Sent',
  VIEWED: 'Viewed',
  PARTIALLY_PAID: 'Partially Paid',
  PAID: 'Paid',
  OVERDUE: 'Overdue',
  CANCELLED: 'Cancelled',
}

const EVENT_ICONS: Record<string, any> = {
  CREATED: Clock,
  SENT: Send,
  EMAIL_OPENED: Mail,
  VIEWED: Eye,
  STATUS_CHANGED: CheckCircle2,
  PAYMENT_RECEIVED: CheckCircle2,
}

const EVENT_COLORS: Record<string, string> = {
  CREATED: 'bg-blue-500',
  SENT: 'bg-green-500',
  EMAIL_OPENED: 'bg-purple-500',
  VIEWED: 'bg-indigo-500',
  STATUS_CHANGED: 'bg-amber-500',
  PAYMENT_RECEIVED: 'bg-emerald-500',
}

export default function InvoiceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchInvoice()
  }, [params.id])

  const fetchInvoice = async () => {
    try {
      setLoading(true)
      const data = await invoiceService.getById(params.id as string)
      setInvoice(data)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch invoice',
        variant: 'destructive',
      })
      router.push('/dashboard/invoices')
    } finally {
      setLoading(false)
    }
  }

  const handleSendInvoice = async () => {
    if (!invoice) return

    try {
      await invoiceService.send(invoice.id)
      toast({
        title: 'Success',
        description: 'Invoice sent successfully',
      })
      fetchInvoice()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to send invoice',
        variant: 'destructive',
      })
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount)
  }

  const getEventLabel = (event: any) => {
    if (event.eventType === 'STATUS_CHANGED') {
      return `Status changed from ${event.metadata?.oldStatus} to ${event.metadata?.newStatus}`
    }
    return event.eventType.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (l: string) => l.toUpperCase())
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!invoice) {
    return null
  }

  return (
    <div className="space-y-6 animate-fade-up pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-foreground">{"INV-" +invoice.invoiceNumber}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {invoice.client.name}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={STATUS_COLORS[invoice.status]}>
            {STATUS_LABELS[invoice.status]}
          </Badge>
          {invoice.status === 'DRAFT' && (
            <Button onClick={handleSendInvoice} size="sm" className="gap-2">
              <Send className="h-4 w-4" />
              Send Invoice
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(`/invoice/${invoice.publicId}`, '_blank')}
            className="gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            Public Link
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Download
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Invoice Details */}
          <Card className="bg-card border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-foreground">Invoice Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Issue Date</div>
                  <div className="text-sm font-medium text-foreground">{formatDate(invoice.issueDate)}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Due Date</div>
                  <div className="text-sm font-medium text-foreground">{formatDate(invoice.dueDate)}</div>
                </div>
              </div>

              {invoice.sentAt && (
                <div className="pt-2 border-t">
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Email sent to {invoice.client.email} on {formatDate(invoice.sentAt)}</span>
                  </div>
                </div>
              )}

              {invoice.viewedAt && (
                <div className="pt-2 border-t">
                  <div className="flex items-center gap-2 text-sm text-blue-600">
                    <Eye className="h-4 w-4" />
                    <span>Invoice viewed on {formatDate(invoice.viewedAt)}</span>
                  </div>
                </div>
              )}

              {invoice.notes && (
                <div className="pt-2 border-t">
                  <div className="text-xs text-muted-foreground mb-1">Notes</div>
                  <div className="text-sm text-foreground">{invoice.notes}</div>
                </div>
              )}

              {invoice.terms && (
                <div className="pt-2 border-t">
                  <div className="text-xs text-muted-foreground mb-1">Terms & Conditions</div>
                  <div className="text-sm text-foreground">{invoice.terms}</div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Line Items */}
          <Card className="bg-card border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-foreground">Line Items</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-none">
                    <TableHead className="text-xs text-muted-foreground font-medium">Description</TableHead>
                    <TableHead className="text-xs text-muted-foreground font-medium text-right">Qty</TableHead>
                    <TableHead className="text-xs text-muted-foreground font-medium text-right">Rate</TableHead>
                    <TableHead className="text-xs text-muted-foreground font-medium text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoice.items.map((item) => (
                    <TableRow key={item.id} className="hover:bg-transparent">
                      <TableCell className="py-3">
                        <span className="text-sm text-foreground">{item.description}</span>
                      </TableCell>
                      <TableCell className="py-3 text-right">
                        <span className="text-sm text-foreground">{item.quantity}</span>
                      </TableCell>
                      <TableCell className="py-3 text-right">
                        <span className="text-sm text-foreground">{formatCurrency(item.rate)}</span>
                      </TableCell>
                      <TableCell className="py-3 text-right">
                        <span className="text-sm font-medium text-foreground">{formatCurrency(item.amount)}</span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="mt-4 space-y-2 border-t pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">{formatCurrency(invoice.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax ({invoice.taxRate}%)</span>
                  <span className="font-medium">{formatCurrency(invoice.taxAmount)}</span>
                </div>
                {invoice.discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Discount</span>
                    <span className="font-medium text-green-600">-{formatCurrency(invoice.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-bold pt-2 border-t">
                  <span>Total</span>
                  <span>{formatCurrency(invoice.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          {invoice.events && invoice.events.length > 0 && (
            <Card className="bg-card border-border shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm font-semibold text-foreground">Activity Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {invoice.events.map((event, index) => {
                    const EventIcon = EVENT_ICONS[event.eventType] || Clock
                    return (
                      <div key={event.id} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className={cn(
                            "h-8 w-8 rounded-full flex items-center justify-center",
                            EVENT_COLORS[event.eventType] || 'bg-gray-500'
                          )}>
                            <EventIcon className="h-4 w-4 text-white" />
                          </div>
                          {index < invoice.events!.length - 1 && (
                            <div className="w-0.5 h-full bg-border mt-2" />
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <div className="flex items-center justify-between">
                            <div className="text-sm font-medium text-foreground">
                              {getEventLabel(event)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {formatDateTime(event.createdAt)}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-muted-foreground">
                              {event.actorType === 'USER' ? 'You' : event.actorType === 'CLIENT' ? 'Client' : 'System'}
                            </span>
                            {event.metadata?.toEmail && (
                              <>
                                <span className="text-muted-foreground">→</span>
                                <span className="text-xs text-muted-foreground">{event.metadata.toEmail as string}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Client Info Sidebar */}
        <div className="space-y-6">
          <Card className="bg-card border-border shadow-sm sticky top-4">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-foreground">Client Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Name</div>
                <div className="text-sm font-medium text-foreground">{invoice.client.name}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Email</div>
                <div className="text-sm text-foreground">{invoice.client.email}</div>
              </div>
              {invoice.client.phone && (
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Phone</div>
                  <div className="text-sm text-foreground">{invoice.client.phone}</div>
                </div>
              )}
              {invoice.client.address && (
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Address</div>
                  <div className="text-sm text-foreground">
                    {invoice.client.address}
                    {invoice.client.city && `, ${invoice.client.city}`}
                    {invoice.client.state && `, ${invoice.client.state}`}
                    {invoice.client.zipCode && ` ${invoice.client.zipCode}`}
                  </div>
                </div>
              )}
              {invoice.client.gstin && (
                <div>
                  <div className="text-xs text-muted-foreground mb-1">GSTIN</div>
                  <div className="text-sm text-foreground">{invoice.client.gstin}</div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-foreground">Business Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Business Name</div>
                <div className="text-sm font-medium text-foreground">{invoice.business.name}</div>
              </div>
              {invoice.business.address && (
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Address</div>
                  <div className="text-sm text-foreground">
                    {invoice.business.address}
                    {invoice.business.city && `, ${invoice.business.city}`}
                    {invoice.business.state && `, ${invoice.business.state}`}
                    {invoice.business.zipCode && ` ${invoice.business.zipCode}`}
                  </div>
                </div>
              )}
              {invoice.business.phone && (
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Phone</div>
                  <div className="text-sm text-foreground">{invoice.business.phone}</div>
                </div>
              )}
              {invoice.business.taxId && (
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Tax ID</div>
                  <div className="text-sm text-foreground">{invoice.business.taxId}</div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
