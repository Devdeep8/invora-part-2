'use client'
import { useState, useEffect } from 'react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  GripVertical,
  Pencil,
  Trash2,
  Plus,
  ExternalLink,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import { profileService } from '@/services/profile.service'
import type { Profile } from '@/types/profile.types'
import type { Link } from '@/types/link.types'
import { cn } from '@/lib/utils'

const SOCIALS = [
  { name: 'Instagram', prefix: 'https://instagram.com/' },
  { name: 'Twitter', prefix: 'https://x.com/' },
  { name: 'YouTube', prefix: 'https://youtube.com/@' },
  { name: 'LinkedIn', prefix: 'https://linkedin.com/in/' },
  { name: 'GitHub', prefix: 'https://github.com/' },
]

interface Props {
  profile: Profile
  onUpdate: (p: Profile) => void
}

interface SortableItemProps {
  link: Link
  isEditing: boolean
  title: string
  url: string
  saving: boolean
  formError: string | null
  setTitle: (v: string) => void
  setUrl: (v: string) => void
  onSave: () => Promise<void>
  onCancel: () => void
  onDelete: (id: number) => Promise<void>
  onEdit: (link: Link) => void
  onSocial: (prefix: string) => void
}

// ────────────────────────────────────────────────────────────
// LinkForm — used for both "add new" and inline edit
// ────────────────────────────────────────────────────────────
function LinkForm({
  title,
  url,
  saving,
  formError,
  setTitle,
  setUrl,
  onSave,
  onCancel,
  onSocial,
  saveLabel,
}: {
  title: string
  url: string
  saving: boolean
  formError: string | null
  setTitle: (v: string) => void
  setUrl: (v: string) => void
  onSave: () => Promise<void>
  onCancel: () => void
  onSocial: (prefix: string) => void
  saveLabel: string
}) {
  return (
    <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-3">
      <div className="space-y-2">
        <Input
          className="bg-card border-border h-10 text-sm transition-all duration-150 focus:border-primary"
          placeholder="Title (e.g. My Website)"
          value={title}
          disabled={saving}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !saving) onSave()
          }}
        />
        <Input
          className="bg-card border-border h-10 text-sm transition-all duration-150 focus:border-primary"
          placeholder="URL (e.g. https://...)"
          value={url}
          disabled={saving}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !saving) onSave()
          }}
        />
      </div>

      {/* Social quick-add — only when URL not yet a full link */}
      {!url.startsWith('http') && (
        <div className="flex flex-wrap gap-1.5">
          <p className="text-xs text-muted-foreground w-full">Quick add social:</p>
          {SOCIALS.map((s) => (
            <button
              key={s.name}
              type="button"
              disabled={saving}
              onClick={() => onSocial(s.prefix)}
              className="text-xs px-2.5 py-1 rounded-md bg-card border border-border text-muted-foreground hover:border-primary hover:text-primary disabled:opacity-50 transition-all duration-150"
            >
              {s.name}
            </button>
          ))}
        </div>
      )}

      {/* Inline error */}
      {formError && (
        <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          {formError}
        </div>
      )}

      <div className="flex justify-end gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          disabled={saving}
          className="text-muted-foreground hover:text-foreground transition-all duration-150"
        >
          Cancel
        </Button>
        <Button
          size="sm"
          onClick={onSave}
          disabled={saving || !title.trim() || !url.trim()}
          className="bg-primary hover:bg-primary/90 shadow-sm shadow-primary/20 transition-all duration-150 min-w-[90px]"
        >
          {saving ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            saveLabel
          )}
        </Button>
      </div>
    </div>
  )
}

// ────────────────────────────────────────────────────────────
// SortableItem
// ────────────────────────────────────────────────────────────
function SortableItem({
  link,
  isEditing,
  title,
  url,
  saving,
  formError,
  setTitle,
  setUrl,
  onSave,
  onCancel,
  onDelete,
  onEdit,
  onSocial,
}: SortableItemProps) {
  const [deleting, setDeleting] = useState(false)
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: link.id,
  })
  const style = { transform: CSS.Transform.toString(transform), transition }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await onDelete(link.id)
    } finally {
      setDeleting(false)
    }
  }

  if (isEditing) {
    return (
      <div ref={setNodeRef} style={style}>
        <LinkForm
          title={title}
          url={url}
          saving={saving}
          formError={formError}
          setTitle={setTitle}
          setUrl={setUrl}
          onSave={onSave}
          onCancel={onCancel}
          onSocial={onSocial}
          saveLabel="Update Link"
        />
      </div>
    )
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-3 bg-card border border-border rounded-xl px-3 py-2.5 group',
        'hover:border-primary/40 hover:shadow-sm transition-all duration-150',
        deleting && 'opacity-50 pointer-events-none'
      )}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-muted-foreground transition-colors duration-150 touch-none"
        aria-label="Drag to reorder"
      >
        <GripVertical className="h-4 w-4" />
      </button>

      <div className="flex-1 min-w-0 flex items-center gap-2">
        <span className="text-sm font-medium text-foreground truncate flex-1">{link.title}</span>
        <a
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground/40 hover:text-primary transition-colors duration-150 shrink-0"
          title={link.url}
        >
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>

      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-150"
          onClick={() => onEdit(link)}
          title="Edit"
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-150"
          onClick={handleDelete}
          disabled={deleting}
          title="Delete"
        >
          {deleting ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Trash2 className="h-3.5 w-3.5" />
          )}
        </Button>
      </div>
    </div>
  )
}

// ────────────────────────────────────────────────────────────
// StudioEditor — main component
// ────────────────────────────────────────────────────────────
export function StudioEditor({ profile }: Props) {
  const [links, setLinks] = useState<Link[]>([])
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  // Shared form fields (used by both add and edit forms)
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  // ── Load links ──
  useEffect(() => {
    setLoading(true)
    setLoadError(null)
    profileService
      .getProfileLinks(profile.id)
      .then(setLinks)
      .catch((err: Error) => setLoadError(err.message))
      .finally(() => setLoading(false))
  }, [profile.id])

  // ── Drag & drop reorder ──
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIdx = links.findIndex((l) => l.id === active.id)
    const newIdx = links.findIndex((l) => l.id === over.id)
    const reordered = arrayMove(links, oldIdx, newIdx).map((l, i) => ({
      ...l,
      sortOrder: i,
    }))
    setLinks(reordered)
    try {
      await profileService.reorderLinks(
        reordered.map((l) => ({ id: l.id, sortOrder: l.sortOrder }))
      )
    } catch {
      // Silently ignore reorder errors — UI already shows the new order
    }
  }

  // ── Add new link ──
  const handleAddSave = async () => {
    if (!title.trim() || !url.trim()) return
    setSaving(true)
    setFormError(null)
    try {
      const newLink = await profileService.createLink(profile.id, {
        title: title.trim(),
        url: url.trim(),
      })
      setLinks((prev) => [...prev, newLink])
      resetForm()
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to create link')
      // ⚠️ DO NOT call resetForm() here — keep the form open with the error
    } finally {
      setSaving(false)
    }
  }

  // ── Edit existing link ──
  const handleEditSave = async () => {
    if (!editingId || !title.trim() || !url.trim()) return
    setSaving(true)
    setFormError(null)
    try {
      const updated = await profileService.updateLink(editingId, {
        title: title.trim(),
        url: url.trim(),
      })
      setLinks((prev) => prev.map((l) => (l.id === updated.id ? updated : l)))
      resetForm()
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to update link')
    } finally {
      setSaving(false)
    }
  }

  // ── Delete link ──
  const handleDelete = async (id: number) => {
    try {
      await profileService.deleteLink(id)
      setLinks((prev) => prev.filter((l) => l.id !== id))
    } catch (err: unknown) {
      // Show delete errors as a brief banner at the top
      setLoadError(err instanceof Error ? err.message : 'Failed to delete link')
      setTimeout(() => setLoadError(null), 4000)
    }
  }

  // ── Start editing a link ──
  const startEdit = (link: Link) => {
    setEditingId(link.id)
    setTitle(link.title)
    setUrl(link.url)
    setIsAdding(false)
    setFormError(null)
  }

  // ── Reset all form state ──
  const resetForm = () => {
    setIsAdding(false)
    setEditingId(null)
    setTitle('')
    setUrl('')
    setFormError(null)
  }

  const applySocial = (prefix: string) => {
    setUrl(prefix)
    setFormError(null)
  }

  // ── Open add form ──
  const openAddForm = () => {
    setEditingId(null)
    setTitle('')
    setUrl('')
    setFormError(null)
    setIsAdding(true)
  }

  // ── Loading state ──
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Top-level error banner (load / delete errors) */}
      {loadError && (
        <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2.5">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{loadError}</span>
        </div>
      )}

      {/* Sorted link cards */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={links.map((l) => l.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {links.map((link) => (
              <SortableItem
                key={link.id}
                link={link}
                isEditing={editingId === link.id}
                title={title}
                url={url}
                saving={saving}
                formError={formError}
                setTitle={setTitle}
                setUrl={setUrl}
                onSave={handleEditSave}
                onCancel={resetForm}
                onDelete={handleDelete}
                onEdit={startEdit}
                onSocial={applySocial}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Empty state */}
      {links.length === 0 && !isAdding && (
        <div className="text-center py-6 text-sm text-muted-foreground">
          No links yet. Add your first link below.
        </div>
      )}

      {/* Add / Add-form toggle */}
      {!isAdding ? (
        <button
          onClick={openAddForm}
          className={cn(
            'w-full flex items-center justify-center gap-2 h-14 rounded-xl text-sm font-medium',
            'text-muted-foreground border-2 border-dashed border-border',
            'hover:border-primary hover:text-primary hover:bg-primary/5',
            'transition-all duration-150'
          )}
        >
          <Plus className="h-4 w-4" />
          Add new link
        </button>
      ) : (
        <LinkForm
          title={title}
          url={url}
          saving={saving}
          formError={formError}
          setTitle={setTitle}
          setUrl={setUrl}
          onSave={handleAddSave}
          onCancel={resetForm}
          onSocial={applySocial}
          saveLabel="Save Link"
        />
      )}
    </div>
  )
}
