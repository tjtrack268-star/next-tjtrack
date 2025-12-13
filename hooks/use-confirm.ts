"use client"

import { useState } from "react"

interface ConfirmOptions {
  title: string
  description: string
  confirmText?: string
  cancelText?: string
}

export function useConfirm() {
  const [isOpen, setIsOpen] = useState(false)
  const [options, setOptions] = useState<ConfirmOptions | null>(null)
  const [resolvePromise, setResolvePromise] = useState<((value: boolean) => void) | null>(null)

  const confirm = (opts: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setOptions(opts)
      setResolvePromise(() => resolve)
      setIsOpen(true)
    })
  }

  const handleConfirm = () => {
    resolvePromise?.(true)
    setIsOpen(false)
    setResolvePromise(null)
  }

  const handleCancel = () => {
    resolvePromise?.(false)
    setIsOpen(false)
    setResolvePromise(null)
  }

  return {
    confirm,
    isOpen,
    options,
    handleConfirm,
    handleCancel,
    setIsOpen
  }
}