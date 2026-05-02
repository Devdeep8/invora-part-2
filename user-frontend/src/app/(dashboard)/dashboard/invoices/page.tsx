'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { invoiceService } from '@/services/invoice.service'
import { Invoice, InvoiceStatus } from '@/types/invoice.types'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { FileText, Plus, Search, Send, Eye, MoreVertical, ArrowLeft } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const STATUS_COLORS: Record<InvoiceStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
  SENT: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
  VIEWED: 'bg-purple-100 text-purple-700 hover:bg-purple-200',
  PARTIALLY_PAID: 'bg-amber-100 text-amber-700 hover:bg-amber-200',
  PAID: 'bg-green-100 text-green-700 hover:bg-green-200',
  OVERDUE: 'bg-red-100 text-red-700 hover:bg-red-200',
  CANCELLED: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
}

const STATUS_LABELS: Record<InvoiceStatus, string> = {
  DRAFT: 'Draft',
  SENT: 'Sent',
  VIEWED: 'Viewed',
  PARTIALLY_PAID: 'Partially Paid',
  PAID: 'Paid',
  OVERDUE: 'Overdue',
  CANCELLED: 'Cancelled',
}

export default function InvoicesPage() {
  const router = useRouter()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | ''>('')
  const { toast } = useToast()

  const fetchInvoices = async () => {
    try {
      setLoading(true)
      const response = await invoiceService.list({
        status: statusFilter || undefined,
      })
      // The service now properly extracts the data from the API response
      const invoicesData = response?.invoices || []
      setInvoices(invoicesData)
    } catch (error) {
      console.error('Failed to fetch invoices:', error)
      setInvoices([]) // Ensure invoices is always an array
      toast({
        title: 'Error',
        description: 'Failed to fetch invoices',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInvoices()
  }, [statusFilter])

  const filteredInvoices = (invoices || []).filter(
    (invoice) =>
      invoice?.invoiceNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice?.client?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice?.client?.email?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSendInvoice = async (id: number) => {
    try {
      await invoiceService.send(id)
      toast({
        title: 'Success',
        description: 'Invoice sent successfully',
      })
      fetchInvoices()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to send invoice',
        variant: 'destructive',
      })
    }
  }

  const handleDeleteInvoice = async (id: number) => {
    if (!confirm('Are you sure you want to delete this invoice?')) return

    try {
      await invoiceService.delete(id)
      toast({
        title: 'Success',
        description: 'Invoice deleted successfully',
      })
      fetchInvoices()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete invoice',
        variant: 'destructive',
      })
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
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

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Invoices
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage and track your invoices
          </p>
        </div>
        <Button onClick={() => router.push('/dashboard/invoices/new')} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Invoice
        </Button>
      </div>

      <Card className="bg-card border-border shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-sm font-semibold text-foreground">
              All Invoices ({invoices.length})
            </CardTitle>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search invoices..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 w-full sm:w-64"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as InvoiceStatus | '')}
                className="h-9 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">All Status</option>
                {Object.entries(STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              Loading invoices...
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              {searchQuery || statusFilter ? 'No invoices found matching your search' : 'No invoices yet. Create your first invoice to get started.'}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-none">
                  <TableHead className="text-xs text-muted-foreground font-medium pl-5">Invoice #</TableHead>
                  <TableHead className="text-xs text-muted-foreground font-medium">Client</TableHead>
                  <TableHead className="text-xs text-muted-foreground font-medium hidden sm:table-cell">Amount</TableHead>
                  <TableHead className="text-xs text-muted-foreground font-medium hidden md:table-cell">Status</TableHead>
                  <TableHead className="text-xs text-muted-foreground font-medium hidden lg:table-cell">Due Date</TableHead>
                  <TableHead className="text-xs text-muted-foreground font-medium text-right pr-5">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.id} className="hover:bg-muted/50 transition-colors duration-100">
                    <TableCell className="pl-5 py-3">
                      <span className="text-sm font-medium text-foreground">{invoice.invoiceNumber}</span>
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-foreground">{invoice.client.name}</span>
                        <span className="text-xs text-muted-foreground">{invoice.client.email}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-3 hidden sm:table-cell">
                      <span className="text-sm font-medium text-foreground">
                        {formatCurrency(invoice.total)}
                      </span>
                    </TableCell>
                    <TableCell className="py-3 hidden md:table-cell">
                      <Badge className={STATUS_COLORS[invoice.status]}>
                        {STATUS_LABELS[invoice.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3 hidden lg:table-cell">
                      <span className="text-sm text-muted-foreground">
                        {formatDate(invoice.dueDate)}
                      </span>
                    </TableCell>
                    <TableCell className="py-3 text-right pr-5">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/dashboard/invoices/${invoice.id}`)}
                          className="h-8 w-8 p-0"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {invoice.status === 'DRAFT' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSendInvoice(invoice.id)}
                            className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700"
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {invoice.status === 'DRAFT' && (
                              <>
                                <DropdownMenuItem onClick={() => router.push(`/dashboard/invoices/${invoice.id}/edit`)}>
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleSendInvoice(invoice.id)}
                                  className="text-blue-600"
                                >
                                  Send Invoice
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDeleteInvoice(invoice.id)}
                                  className="text-destructive"
                                >
                                  Delete
                                </DropdownMenuItem>
                              </>
                            )}
                            {invoice.status !== 'DRAFT' && (
                              <DropdownMenuItem onClick={() => router.push(`/dashboard/invoices/${invoice.id}`)}>
                                View Details
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
