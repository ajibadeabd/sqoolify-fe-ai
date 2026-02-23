import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'

export interface ActionMenuItem {
  label: string
  onClick: (e: React.MouseEvent) => void
  variant?: 'default' | 'danger'
  hidden?: boolean
}

interface ActionMenuProps {
  items: ActionMenuItem[]
}

export default function ActionMenu({ items }: ActionMenuProps) {
  const [open, setOpen] = useState(false)
  const [menuPos, setMenuPos] = useState({ top: 0, right: 0 })
  const buttonRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        menuRef.current && !menuRef.current.contains(e.target as Node) &&
        buttonRef.current && !buttonRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  useEffect(() => {
    const handleScroll = () => setOpen(false)
    if (open) {
      window.addEventListener('scroll', handleScroll, true)
    }
    return () => window.removeEventListener('scroll', handleScroll, true)
  }, [open])

  const visibleItems = items.filter((item) => !item.hidden)
  if (visibleItems.length === 0) return null

  const handleOpen = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setMenuPos({
        top: rect.bottom + 4,
        right: window.innerWidth - rect.right,
      })
    }
    setOpen((prev) => !prev)
  }

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={handleOpen}
        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
        aria-label="Actions"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
        </svg>
      </button>

      {open && createPortal(
        <div
          ref={menuRef}
          style={{ top: menuPos.top, right: menuPos.right, position: 'fixed' }}
          className="z-9999 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-35"
        >
          {visibleItems.map((item, i) => (
            <button
              key={i}
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setOpen(false)
                item.onClick(e)
              }}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                item.variant === 'danger'
                  ? 'text-red-600 hover:bg-red-50'
                  : 'text-gray-700'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>,
        document.body
      )}
    </>
  )
}
