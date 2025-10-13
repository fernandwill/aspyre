import { forwardRef } from 'react'
import { cn } from '../../lib/utils'

const VARIANTS = {
  default: 'shadcn-button shadcn-button--default',
  outline: 'shadcn-button shadcn-button--outline',
  ghost: 'shadcn-button shadcn-button--ghost',
}

const SIZES = {
  default: 'shadcn-button--md',
  sm: 'shadcn-button--sm',
  lg: 'shadcn-button--lg',
}

export const Button = forwardRef(function Button(
  { className, variant = 'default', size = 'default', type = 'button', ...props },
  ref
) {
  const variantClass = VARIANTS[variant] ?? VARIANTS.default
  const sizeClass = SIZES[size] ?? SIZES.default

  return (
    <button ref={ref} type={type} className={cn(variantClass, sizeClass, className)} {...props} />
  )
})
