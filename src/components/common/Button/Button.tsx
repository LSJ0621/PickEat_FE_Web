/**
 * 공통 Button 컴포넌트 예시
 */

import React from 'react'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  className = '',
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-semibold rounded-2xl tracking-tight transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:opacity-60 disabled:cursor-not-allowed'

  const variantClasses = {
    primary:
      'text-white bg-gradient-to-r from-orange-500 via-pink-500 to-fuchsia-600 shadow-[0_10px_40px_rgba(249,115,22,0.35)] hover:shadow-[0_15px_45px_rgba(249,115,22,0.45)] hover:-translate-y-0.5 focus-visible:ring-orange-300',
    secondary:
      'text-slate-900 bg-white/90 shadow-xl shadow-slate-950/30 hover:bg-white focus-visible:ring-white/70',
    ghost:
      'text-slate-200 border border-white/20 bg-white/5 hover:bg-white/10 focus-visible:ring-white/40',
  }

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-2.5 text-base',
    lg: 'px-8 py-3 text-lg',
  }

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? '로딩 중...' : children}
    </button>
  )
}
