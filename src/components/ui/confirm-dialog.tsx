"use client"

import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"

interface ConfirmDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onConfirm: () => void
  onCancel?: () => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
}

export function ConfirmDialog({
  open = false,
  onOpenChange,
  onConfirm,
  onCancel,
  title,
  description,
  confirmText = "確認",
  cancelText = "取消"
}: ConfirmDialogProps) {
  // 使用內部狀態來控制顯示，確保客戶端/服務器端水合一致
  const [isOpen, setIsOpen] = useState(false)
  
  // 使用 useEffect 來同步 props 和內部狀態
  useEffect(() => {
    setIsOpen(open)
  }, [open])
  
  if (!isOpen) return null
  
  const handleCancel = () => {
    if (onCancel) onCancel();
    if (onOpenChange) onOpenChange(false);
    setIsOpen(false);
  };

  const handleConfirm = () => {
    onConfirm();
    if (onOpenChange) onOpenChange(false);
    setIsOpen(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-semibold mb-4">{title}</h2>
        <p className="text-gray-600 mb-6">{description}</p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleCancel}>
            {cancelText}
          </Button>
          <Button variant="destructive" onClick={handleConfirm}>
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  )
} 