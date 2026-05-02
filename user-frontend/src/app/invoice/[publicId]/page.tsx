'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { invoiceService } from '@/services/invoice.service'
import { Invoice } from '@/types/invoice.types'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Printer, FileText, Building, User as UserIcon, Mail, Phone, MapPin } from 'lucide-react'

export default function PublicInvoicePage() {
  const params = useParams()
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchInvoice()
  }, [params.publicId])

  const fetchInvoice = async () => {
    try {
      setLoading(true)
      console.log('Fetching invoice with publicId:', params.publicId)
      const data = await invoiceService.getPublicInvoice(params.publicId as string)
      console.log('Invoice data received:', data)
      setInvoice(data)
    } catch (err: any) {
      console.error('Failed to fetch invoice:', err)
      setError(err.message || 'Failed to load invoice')
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="text-sm text-gray-600">Loading invoice...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <FileText className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Invoice Not Found</h2>
              <p className="text-sm text-gray-600 mb-4">{error}</p>
              <p className="text-xs text-gray-500">
                This invoice link may have expired or been removed.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!invoice) return null

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Print Button - Hidden when printing */}
        <div className="mb-6 flex justify-end no-print">
          <Button onClick={handlePrint} className="gap-2">
            <Printer className="h-4 w-4" />
            Print Invoice
          </Button>
        </div>

        {/* Invoice Document */}
        <Card className="bg-white shadow-lg print:shadow-none print:border-none">
          <CardContent className="p-8">
            {/* Header */}
            <div className="flex justify-between items-start mb-8">
              <div className="flex items-start gap-4">
                {invoice.business.logoUrl && (
                  <img
                    src={invoice.business.logoUrl}
                    alt={invoice.business.name}
                    className="h-16 w-16 object-contain rounded-lg"
                  />
                )}
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{invoice.business.name}</h1>
                  {invoice.business.address && (
                    <div className="flex items-start gap-2 mt-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>
                        {invoice.business.address}
                        {invoice.business.city && `, ${invoice.business.city}`}
                        {invoice.business.state && `, ${invoice.business.state}`}
                        {invoice.business.zipCode && ` ${invoice.business.zipCode}`}
                      </span>
                    </div>
                  )}
                  {invoice.business.phone && (
                    <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                      <Phone className="h-4 w-4" />
                      <span>{invoice.business.phone}</span>
                    </div>
                  )}
                  {invoice.business.email && (
                    <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                      <Mail className="h-4 w-4" />
                      <span>{invoice.business.email}</span>
                    </div>
                  )}
                  {invoice.business.taxId && (
                    <div className="text-sm text-gray-600 mt-1">
                      <span className="font-medium">GSTIN:</span> {invoice.business.taxId}
                    </div>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-900 mb-1">INVOICE</div>
                <div className="text-sm text-gray-600 mb-2">{invoice.invoiceNumber}</div>
                <Badge className={
                  invoice.status === 'PAID' ? 'bg-green-100 text-green-800' :
                  invoice.status === 'SENT' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }>
                  {invoice.status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (l: string) => l.toUpperCase())}
                </Badge>
              </div>
            </div>

            {/* Client Info */}
            <div className="mb-8 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-3 text-sm font-medium text-gray-700">
                <UserIcon className="h-4 w-4" />
                <span>Bill To</span>
              </div>
              <div>
                <div className="text-lg font-semibold text-gray-900">{invoice.client.name}</div>
                {invoice.client.email && (
                  <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                    <Mail className="h-4 w-4" />
                    <span>{invoice.client.email}</span>
                  </div>
                )}
                {invoice.client.phone && (
                  <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                    <Phone className="h-4 w-4" />
                    <span>{invoice.client.phone}</span>
                  </div>
                )}
                {invoice.client.address && (
                  <div className="flex items-start gap-2 mt-1 text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>
                      {invoice.client.address}
                      {invoice.client.city && `, ${invoice.client.city}`}
                      {invoice.client.state && `, ${invoice.client.state}`}
                      {invoice.client.zipCode && ` ${invoice.client.zipCode}`}
                    </span>
                  </div>
                )}
                {invoice.client.gstin && (
                  <div className="text-sm text-gray-600 mt-1">
                    <span className="font-medium">GSTIN:</span> {invoice.client.gstin}
                  </div>
                )}
              </div>
            </div>

            {/* Invoice Details */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div>
                <div className="text-xs text-gray-500 mb-1">Issue Date</div>
                <div className="text-sm font-medium text-gray-900">{formatDate(invoice.issueDate)}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Due Date</div>
                <div className="text-sm font-medium text-gray-900">{formatDate(invoice.dueDate)}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Invoice Date</div>
                <div className="text-sm font-medium text-gray-900">{formatDate(invoice.createdAt)}</div>
              </div>
              {invoice.business.taxId && (
                <div>
                  <div className="text-xs text-gray-500 mb-1">Business GSTIN</div>
                  <div className="text-sm font-medium text-gray-900">{invoice.business.taxId}</div>
                </div>
              )}
            </div>

            {/* Line Items */}
            <div className="mb-8">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="text-xs font-semibold text-gray-700">Description</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-700 text-right">Quantity</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-700 text-right">Rate</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-700 text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoice.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="py-3">
                        <span className="text-sm text-gray-900">{item.description}</span>
                      </TableCell>
                      <TableCell className="py-3 text-right">
                        <span className="text-sm text-gray-900">{item.quantity}</span>
                      </TableCell>
                      <TableCell className="py-3 text-right">
                        <span className="text-sm text-gray-900">{formatCurrency(item.rate)}</span>
                      </TableCell>
                      <TableCell className="py-3 text-right">
                        <span className="text-sm font-medium text-gray-900">{formatCurrency(item.amount)}</span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Summary */}
            <div className="mb-8">
              <div className="flex justify-end">
                <div className="w-full md:w-80 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-gray-900">{formatCurrency(invoice.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax ({invoice.taxRate}%)</span>
                    <span className="text-gray-900">{formatCurrency(invoice.taxAmount)}</span>
                  </div>
                  {invoice.discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Discount</span>
                      <span className="text-green-600">-{formatCurrency(invoice.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold pt-2 border-t-2 border-gray-200">
                    <span>Total</span>
                    <span className="text-blue-600">{formatCurrency(invoice.total)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes & Terms */}
            {(invoice.notes || invoice.terms) && (
              <div className="border-t pt-6">
                {invoice.notes && (
                  <div className="mb-4">
                    <div className="text-sm font-semibold text-gray-700 mb-2">Notes</div>
                    <p className="text-sm text-gray-600">{invoice.notes}</p>
                  </div>
                )}
                {invoice.terms && (
                  <div>
                    <div className="text-sm font-semibold text-gray-700 mb-2">Terms & Conditions</div>
                    <p className="text-sm text-gray-600">{invoice.terms}</p>
                  </div>
                )}
              </div>
            )}

            {/* Footer */}
            <div className="mt-8 pt-6 border-t text-center">
              <p className="text-xs text-gray-500">
                Thank you for your business! If you have any questions, please contact us.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background: white !important;
          }
          @page {
            margin: 1cm;
          }
        }
      `}</style>
    </div>
  )
}
