'use client'

import React, { FormHTMLAttributes } from 'react'

interface FormProps extends FormHTMLAttributes<HTMLFormElement> {
  children: React.ReactNode
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
}

const Form = React.forwardRef<HTMLFormElement, FormProps>(
  ({ className = '', children, onSubmit, ...props }, ref) => {
    return (
      <form
        ref={ref}
        className={`space-y-4 ${className}`}
        onSubmit={onSubmit}
        {...props}
      >
        {children}
      </form>
    )
  }
)

Form.displayName = 'Form'

interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

const FormField: React.FC<FormFieldProps> = ({ className = '', children, ...props }) => (
  <div className={`space-y-1 ${className}`} {...props}>
    {children}
  </div>
)

interface FormGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  columns?: number
}

const FormGroup: React.FC<FormGroupProps> = ({ className = '', children, columns = 1, ...props }) => {
  const gridClass = columns > 1 ? `grid grid-cols-${columns} gap-4` : ''

  return (
    <div className={`${gridClass} ${className}`} {...props}>
      {children}
    </div>
  )
}

export default Form
export { FormField, FormGroup }
