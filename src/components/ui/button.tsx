import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'outline' | 'whatsapp'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
}

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
    font-medium rounded-xl
    transition-all duration-300 ease-out
    focus:outline-none focus:ring-2 focus:ring-offset-2
    transform hover:scale-[1.02] active:scale-[0.98]
  `

  const variants = {
    primary: 'bg-white text-black hover:bg-gray-100 focus:ring-white shadow-lg hover:shadow-white/25 disabled:bg-gray-400',
    secondary: 'bg-white/20 text-white hover:bg-white/30 focus:ring-white/50 backdrop-blur-sm disabled:bg-white/10',
    outline: 'border-2 border-white/30 text-white hover:border-white hover:bg-white/10 focus:ring-white backdrop-blur-sm',
    whatsapp: 'bg-green-500 text-white hover:bg-green-400 focus:ring-green-500 shadow-lg hover:shadow-green-500/25 disabled:bg-green-300',
  }

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-5 py-2.5 text-base',
    lg: 'px-8 py-4 text-lg font-semibold',
  }

  return (
    <button
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${disabled ? 'cursor-not-allowed opacity-60 transform-none' : 'cursor-pointer'}
        ${className}
      `}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}
