'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

/* ── Context ─────────────────────────────────────────── */

interface SelectContextValue {
  value: string
  onValueChange: (value: string) => void
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const SelectContext = React.createContext<SelectContextValue | null>(null)

function useSelectContext() {
  const ctx = React.useContext(SelectContext)
  if (!ctx) throw new Error('Select compound components must be used within <Select>')
  return ctx
}

/* ── Root ─────────────────────────────────────────────── */

interface SelectProps {
  children: React.ReactNode
  value: string
  onValueChange: (value: string) => void
}

function Select({ children, value, onValueChange }: SelectProps) {
  const [open, setOpen] = React.useState(false)
  return (
    <SelectContext.Provider value={{ value, onValueChange, open, setOpen }}>
      <div className="relative w-full">{children}</div>
    </SelectContext.Provider>
  )
}

/* ── Trigger ──────────────────────────────────────────── */

interface SelectTriggerProps {
  children: React.ReactNode
  className?: string
}

function SelectTrigger({ children, className }: SelectTriggerProps) {
  const { open, setOpen } = useSelectContext()
  return (
    <button
      type="button"
      onClick={() => setOpen((o) => !o)}
      className={cn(
        'flex h-10 w-full items-center justify-between rounded-sm border border-neutral-300 bg-white px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50',
        open && 'ring-2 ring-neutral-400 ring-offset-1',
        className
      )}
    >
      {children}
      <svg className="ml-2 h-4 w-4 shrink-0 opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
    </button>
  )
}

/* ── Value ─────────────────────────────────────────────── */

interface SelectValueProps {
  placeholder?: string
}

function SelectValue({ placeholder }: SelectValueProps) {
  const { value } = useSelectContext()
  return <span className={cn(!value && 'text-neutral-400')}>{value || placeholder || ''}</span>
}

/* ── Content ──────────────────────────────────────────── */

interface SelectContentProps {
  children: React.ReactNode
  className?: string
}

function SelectContent({ children, className }: SelectContentProps) {
  const { open, setOpen } = useSelectContext()
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!open) return
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.parentElement?.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open, setOpen])

  if (!open) return null

  return (
    <div
      ref={ref}
      className={cn(
        'absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-sm border border-neutral-200 bg-white py-1 shadow-lg',
        className
      )}
    >
      {children}
    </div>
  )
}

/* ── Item ──────────────────────────────────────────────── */

interface SelectItemProps {
  value: string
  children: React.ReactNode
  className?: string
}

function SelectItem({ value, children, className }: SelectItemProps) {
  const ctx = useSelectContext()
  const isSelected = ctx.value === value

  return (
    <button
      type="button"
      onClick={() => {
        ctx.onValueChange(value)
        ctx.setOpen(false)
      }}
      className={cn(
        'flex w-full items-center px-3 py-2 text-sm outline-none hover:bg-neutral-100',
        isSelected && 'bg-neutral-50 font-medium',
        className
      )}
    >
      {children}
    </button>
  )
}

export { Select, SelectTrigger, SelectContent, SelectItem, SelectValue }
