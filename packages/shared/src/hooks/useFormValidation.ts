'use client'

import { useState } from 'react'
import { ZodSchema } from 'zod'

interface UseFormValidationOptions {
  onSubmit: (data: unknown) => Promise<void> | void
}

export function useFormValidation<T>(
  schema: ZodSchema,
  options: UseFormValidationOptions
) {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const validateForm = (data: unknown): data is T => {
    try {
      schema.parse(data)
      setErrors({})
      return true
    } catch (error: any) {
      const fieldErrors: Record<string, string> = {}
      if (error.errors) {
        error.errors.forEach((err: any) => {
          const fieldName = err.path.join('.')
          fieldErrors[fieldName] = err.message
        })
      }
      setErrors(fieldErrors)
      return false
    }
  }

  const handleSubmit = async (formData: unknown) => {
    setSubmitError('')
    if (!validateForm(formData)) {
      return
    }

    setIsSubmitting(true)
    try {
      await options.onSubmit(formData)
    } catch (error: any) {
      setSubmitError(error.message || 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    errors,
    isSubmitting,
    submitError,
    validateForm,
    handleSubmit,
    setErrors,
    setSubmitError,
  }
}
