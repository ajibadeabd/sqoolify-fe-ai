type Variant = 'default' | 'success' | 'warning' | 'danger' | 'error' | 'info'
type Size = 'sm' | 'md'

const variants: Record<Variant, string> = {
  default: 'bg-gray-100 text-gray-700',
  success: 'bg-green-100 text-green-700',
  warning: 'bg-yellow-100 text-yellow-700',
  danger: 'bg-red-100 text-red-700',
  error: 'bg-red-100 text-red-700',
  info: 'bg-blue-100 text-blue-700',
}

const sizes: Record<Size, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-0.5 text-xs',
}

export default function Badge({
  children,
  variant = 'default',
  size = 'md',
}: {
  children: string
  variant?: Variant
  size?: Size
}) {
  return (
    <span className={`inline-flex items-center rounded-full font-medium ${sizes[size]} ${variants[variant]}`}>
      {children}
    </span>
  )
}
