'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { clientService } from '@/services/client.service'
import { invoiceService } from '@/services/invoice.service'
import { Client, InvoiceItem, CreateInvoicePayload } from '@/types/invoice.types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { ArrowLeft, Plus, Trash2, Save, Send, Users } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { CalendarIcon } from '@radix-ui/react-icons'

interface LineItem extends InvoiceItem {
  id: string
}

interface NewClientData {
  name: string
  email: string
  phone: string
  city: string
}

export default function CreateInvoicePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(false)
  const [showSendConfirm, setShowSendConfirm] = useState(false)
  const [showNewClientForm, setShowNewClientForm] = useState(false)

  const [selectedClientId, setSelectedClientId] = useState<number | ''>('')
  const [clientSearch, setClientSearch] = useState('')

  const [formData, setFormData] = useState({
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    taxRate: 18,
    discount: 0,
    notes: '',
    terms: '',
  })

  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: '1', description: '', quantity: 1, rate: 0, amount: 0 },
  ])

  const [newClientData, setNewClientData] = useState<NewClientData>({
    name: '',
    email: '',
    phone: '',
    city: '',
  })

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      const data = await clientService.list()
      setClients(data)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch clients',
        variant: 'destructive',
      })
    }
  }

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
      client.email.toLowerCase().includes(clientSearch.toLowerCase())
  )

  const selectedClient = clients.find((c) => c.id === selectedClientId)

  const calculateTotals = () => {
    const subtotal = lineItems.reduce((sum, item) => sum + (item.quantity * item.rate), 0)
    const taxAmount = (subtotal * formData.taxRate) / 100
    const total = subtotal + taxAmount - formData.discount
    return { subtotal, taxAmount, total }
  }

  const { subtotal, taxAmount, total } = calculateTotals()

  const handleLineItemChange = (id: string, field: keyof LineItem, value: string | number) => {
    setLineItems((items) =>
      items.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value }
          if (field === 'quantity' || field === 'rate') {
            updated.amount = updated.quantity * updated.rate
          }
          return updated
        }
        return item
      })
    )
  }

  const addLineItem = () => {
    const newId = String(Math.max(...lineItems.map((i) => parseInt(i.id)), 0) + 1)
    setLineItems([...lineItems, { id: newId, description: '', quantity: 1, rate: 0, amount: 0 }])
  }

  const removeLineItem = (id: string) => {
    if (lineItems.length === 1) {
      toast({
        title: 'Error',
        description: 'At least one item is required',
        variant: 'destructive',
      })
      return
    }
    setLineItems(lineItems.filter((item) => item.id !== id))
  }

  const handleCreateClient = async () => {
    if (!newClientData.name || !newClientData.email) {
      toast({
        title: 'Error',
        description: 'Name and email are required',
        variant: 'destructive',
      })
      return
    }

    try {
      const newClient = await clientService.create(newClientData)
      toast({
        title: 'Success',
        description: 'Client created successfully',
      })
      setSelectedClientId(newClient.id)
      setNewClientData({ name: '', email: '', phone: '', city: '' })
      setShowNewClientForm(false)
      fetchClients()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create client',
        variant: 'destructive',
      })
    }
  }

  const validateForm = () => {
    if (!selectedClientId) {
      toast({
        title: 'Error',
        description: 'Please select a client',
        variant: 'destructive',
      })
      return false
    }

    const invalidItems = lineItems.filter(
      (item) => !item.description || item.quantity <= 0 || item.rate <= 0
    )
    if (invalidItems.length > 0) {
      toast({
        title: 'Error',
        description: 'Please fill in all item fields with valid values',
        variant: 'destructive',
      })
      return false
    }

    return true
  }

  const handleSaveDraft = async () => {
    if (!validateForm()) return

    try {
      setLoading(true)
      const payload: CreateInvoicePayload = {
        clientId: Number(selectedClientId),
        issueDate: formData.issueDate,
        dueDate: formData.dueDate,
        items: lineItems.map(({ id, ...item }) => item),
        notes: formData.notes || undefined,
        terms: formData.terms || undefined,
        taxRate: formData.taxRate,
        discount: formData.discount,
        sendNow: false,
      }

      const invoice = await invoiceService.create(payload)
      toast({
        title: 'Success',
        description: 'Invoice created as draft',
      })
      router.push(`/dashboard/invoices/${invoice.id}`)
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create invoice',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveAndSend = async () => {
    if (!validateForm()) return

    setShowSendConfirm(true)
  }

  const confirmSend = async () => {
    setShowSendConfirm(false)
    try {
      setLoading(true)
      const payload: CreateInvoicePayload = {
        clientId: Number(selectedClientId),
        issueDate: formData.issueDate,
        dueDate: formData.dueDate,
        items: lineItems.map(({ id, ...item }) => item),
        notes: formData.notes || undefined,
        terms: formData.terms || undefined,
        taxRate: formData.taxRate,
        discount: formData.discount,
        sendNow: true,
      }

      const invoice = await invoiceService.create(payload)
      toast({
        title: 'Success',
        description: 'Invoice created and sent successfully',
      })
      router.push(`/dashboard/invoices/${invoice.id}`)
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create and send invoice',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount)
  }

  return (
    <div className="space-y-6 animate-fade-up pb-20">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-foreground">Create New Invoice</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Fill in the details to create a new invoice
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Client Selection */}
          <Card className="bg-card border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-foreground">Client</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!showNewClientForm ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="client">Select Client *</Label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Input
                          id="client"
                          placeholder="Search clients..."
                          value={clientSearch}
                          onChange={(e) => setClientSearch(e.target.value)}
                          onFocus={() => setClientSearch('')}
                        />
                        {clientSearch && filteredClients.length > 0 && !selectedClientId && (
                          <div className="absolute z-10 w-full mt-1 bg-card border border-border rounded-md shadow-lg max-h-60 overflow-auto">
                            {filteredClients.map((client) => (
                              <button
                                key={client.id}
                                type="button"
                                onClick={() => {
                                  setSelectedClientId(client.id)
                                  setClientSearch('')
                                }}
                                className="w-full px-3 py-2 text-left hover:bg-muted/50 transition-colors"
                              >
                                <div className="text-sm font-medium text-foreground">{client.name}</div>
                                <div className="text-xs text-muted-foreground">{client.email}</div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setShowNewClientForm(true)}
                        title="Add New Client"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {selectedClient && (
                    <div className="p-3 bg-muted/50 rounded-md flex justify-between items-start">
                      <div>
                        <div className="text-sm font-medium text-foreground">{selectedClient.name}</div>
                        <div className="text-xs text-muted-foreground">{selectedClient.email}</div>
                        {selectedClient.phone && (
                          <div className="text-xs text-muted-foreground">{selectedClient.phone}</div>
                        )}
                        {selectedClient.city && (
                          <div className="text-xs text-muted-foreground">{selectedClient.city}</div>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedClientId('')
                          setClientSearch('')
                        }}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        Change
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div className="space-y-3 p-4 bg-muted/50 rounded-md">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-sm font-medium text-foreground">Add New Client</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowNewClientForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="client-name" className="text-xs">Name *</Label>
                      <Input
                        id="client-name"
                        placeholder="Client name"
                        value={newClientData.name}
                        onChange={(e) => setNewClientData({ ...newClientData, name: e.target.value })}
                        className="h-9"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="client-email" className="text-xs">Email *</Label>
                      <Input
                        id="client-email"
                        type="email"
                        placeholder="client@email.com"
                        value={newClientData.email}
                        onChange={(e) => setNewClientData({ ...newClientData, email: e.target.value })}
                        className="h-9"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="client-phone" className="text-xs">Phone</Label>
                      <Input
                        id="client-phone"
                        placeholder="+91 98765 43210"
                        value={newClientData.phone}
                        onChange={(e) => setNewClientData({ ...newClientData, phone: e.target.value })}
                        className="h-9"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="client-city" className="text-xs">City</Label>
                      <Input
                        id="client-city"
                        placeholder="City name"
                        value={newClientData.city}
                        onChange={(e) => setNewClientData({ ...newClientData, city: e.target.value })}
                        className="h-9"
                      />
                    </div>
                  </div>
                  <Button
                    type="button"
                    onClick={handleCreateClient}
                    disabled={loading || !newClientData.name || !newClientData.email}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Client
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Invoice Details */}
          <Card className="bg-card border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-foreground">Invoice Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="issue-date">Issue Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.issueDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.issueDate ? format(new Date(formData.issueDate), "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={new Date(formData.issueDate)}
                        onSelect={(date) => {
                          if (date) {
                            setFormData({ ...formData, issueDate: date.toISOString().split('T')[0] })
                          }
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="due-date">Due Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.dueDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.dueDate ? format(new Date(formData.dueDate), "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={new Date(formData.dueDate)}
                        onSelect={(date) => {
                          if (date) {
                            setFormData({ ...formData, dueDate: date.toISOString().split('T')[0] })
                          }
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Line Items */}
          <Card className="bg-card border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-foreground">Line Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {lineItems.map((item) => (
                  <div key={item.id} className="flex gap-2 items-start">
                    <div className="flex-1 space-y-2">
                      <Input
                        placeholder="Description"
                        value={item.description}
                        onChange={(e) => handleLineItemChange(item.id, 'description', e.target.value)}
                      />
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <Label htmlFor={`qty-${item.id}`} className="text-xs">Quantity</Label>
                          <Input
                            id={`qty-${item.id}`}
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.quantity}
                            onChange={(e) => handleLineItemChange(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`rate-${item.id}`} className="text-xs">Rate</Label>
                          <Input
                            id={`rate-${item.id}`}
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.rate}
                            onChange={(e) => handleLineItemChange(item.id, 'rate', parseFloat(e.target.value) || 0)}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`amount-${item.id}`} className="text-xs">Amount</Label>
                          <Input
                            id={`amount-${item.id}`}
                            value={formatCurrency(item.amount)}
                            readOnly
                            className="bg-muted/50"
                          />
                        </div>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeLineItem(item.id)}
                      className="mt-6 h-8 w-8 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addLineItem} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </CardContent>
          </Card>

          {/* Notes & Terms */}
          <Card className="bg-card border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-foreground">Notes & Terms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Add any notes for the client..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="terms">Terms & Conditions</Label>
                <Textarea
                  id="terms"
                  placeholder="Add terms and conditions..."
                  value={formData.terms}
                  onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary Sidebar */}
        <div className="space-y-6">
          <Card className="bg-card border-border shadow-sm sticky top-4">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-foreground">Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Subtotal</span>
                  <span className="text-sm font-medium text-foreground">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Tax Rate</span>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={formData.taxRate}
                      onChange={(e) => setFormData({ ...formData, taxRate: parseFloat(e.target.value) || 0 })}
                      className="w-20 h-8 text-right text-sm"
                    />
                    <span className="text-sm text-muted-foreground">%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Tax Amount</span>
                  <span className="text-sm font-medium text-foreground">{formatCurrency(taxAmount)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Discount</span>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.discount}
                    onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })}
                    className="w-32 h-8 text-right text-sm"
                  />
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-base font-semibold text-foreground">Total</span>
                    <span className="text-base font-bold text-foreground">{formatCurrency(total)}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-4">
                <Button
                  onClick={handleSaveDraft}
                  disabled={loading || !selectedClientId}
                  className="w-full gap-2"
                >
                  <Save className="h-4 w-4" />
                  Save as Draft
                </Button>
                <Button
                  onClick={handleSaveAndSend}
                  disabled={loading || !selectedClientId}
                  className="w-full gap-2"
                >
                  <Send className="h-4 w-4" />
                  Save & Send
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <AlertDialog open={showSendConfirm} onOpenChange={setShowSendConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Send Invoice?</AlertDialogTitle>
            <AlertDialogDescription>
              This will send the invoice to {selectedClient?.email}. The invoice status will be changed to "Sent" and cannot be edited afterwards.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSend}>Confirm & Send</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
