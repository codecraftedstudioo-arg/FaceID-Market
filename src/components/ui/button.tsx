import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'outline' | 'whatsapp'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
}

/**
 * Botones FACE ID (mismo lenguaje que Cotizador):
 * primario negro, secundario blanco, WhatsApp verde funcional.
 */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = `
    inline-flex items-center justify-center gap-2
    font-semibold rounded-[10px]
    transition-all duration-200 ease-out
    focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2
    active:scale-[0.98]
  `

  const variants = {
    primary: 'bg-cta text-cta-contrast hover:bg-cta-hover shadow-[0_1px_2px_rgba(31,41,55,0.12)] disabled:bg-fg/15 disabled:text-fg-muted disabled:shadow-none',
    secondary: 'bg-surface text-fg border border-line-strong hover:bg-bg-subtle hover:border-fg/30 disabled:opacity-50',
    outline: 'bg-transparent border border-line-strong text-fg hover:bg-fg/5 disabled:opacity-50',
    whatsapp: 'bg-[#25D366] text-white hover:bg-[#20bd5a] disabled:opacity-50',
  }

  const sizes = {
    sm: 'px-4 py-2 text-sm min-h-10',
    md: 'px-5 py-3 text-[15px] min-h-12',
    lg: 'px-8 py-4 text-base min-h-14',
  }

  return (
    <button
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${disabled ? 'cursor-not-allowed pointer-events-none' : 'cursor-pointer'}
        ${className}
      `}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}
