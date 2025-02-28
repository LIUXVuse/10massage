"use client"

import * as React from "react"
import { DialogProps } from "@radix-ui/react-dialog"
import { cn } from "@/lib/utils"

interface CommandProps {
  children: React.ReactNode
  className?: string
  onKeyDown?: (e: React.KeyboardEvent<HTMLDivElement>) => void
}

export function Command({
  children,
  className,
  onKeyDown,
  ...props
}: CommandProps) {
  return (
    <div
      className={cn(
        "flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground",
        className
      )}
      onKeyDown={onKeyDown}
      {...props}
    >
      {children}
    </div>
  )
}

interface CommandGroupProps {
  children: React.ReactNode
  className?: string
  heading?: React.ReactNode
}

export function CommandGroup({
  children,
  className,
  heading,
  ...props
}: CommandGroupProps) {
  return (
    <div
      className={cn("overflow-hidden p-1 text-foreground", className)}
      {...props}
    >
      {heading && (
        <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
          {heading}
        </div>
      )}
      <div className="flex flex-col gap-1">{children}</div>
    </div>
  )
}

interface CommandItemProps {
  children: React.ReactNode
  className?: string
  onSelect?: () => void
  onMouseDown?: (e: React.MouseEvent<HTMLDivElement>) => void
}

export function CommandItem({
  children,
  className,
  onSelect,
  onMouseDown,
  ...props
}: CommandItemProps) {
  return (
    <div
      className={cn(
        "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 hover:bg-accent hover:text-accent-foreground",
        className
      )}
      onMouseDown={onMouseDown}
      onClick={onSelect}
      {...props}
    >
      {children}
    </div>
  )
}

interface CommandInputProps {
  placeholder?: string
  className?: string
  value?: string
  onChange?: (value: string) => void
}

export function CommandInput({
  placeholder,
  className,
  value,
  onChange,
  ...props
}: CommandInputProps) {
  return (
    <div className="flex items-center px-3 border-b" cmdk-input-wrapper="">
      <input
        className={cn(
          "flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        {...props}
      />
    </div>
  )
} 