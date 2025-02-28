"use client"

import * as React from "react"
import { X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Command, CommandGroup, CommandItem } from "@/components/ui/command"
import { cn } from "@/lib/utils"

interface MultiSelectProps {
  options: { value: string; label: string }[]
  value: string[]
  onChange: (value: string[]) => void
  placeholder?: string
  className?: string
  badgeClassName?: string
}

export function MultiSelect({
  options,
  value,
  onChange,
  placeholder = "選擇項目...",
  className,
  badgeClassName,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState("")
  const inputRef = React.useRef<HTMLInputElement>(null)

  const handleUnselect = (optionValue: string) => {
    onChange(value.filter((v) => v !== optionValue))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Backspace" && !inputValue && value.length > 0) {
      handleUnselect(value[value.length - 1])
    }
  }

  const selectables = options.filter(
    (option) => !value.includes(option.value)
  )

  return (
    <Command
      onKeyDown={handleKeyDown}
      className={cn(
        "overflow-visible bg-transparent",
        className
      )}
    >
      <div
        className="group rounded-md border border-input px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
      >
        <div className="flex flex-wrap gap-1">
          {value.map((selectedValue) => {
            const option = options.find((o) => o.value === selectedValue)
            if (!option) return null
            return (
              <Badge
                key={selectedValue}
                className={cn(
                  "bg-primary text-primary-foreground",
                  badgeClassName
                )}
              >
                {option.label}
                <button
                  className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleUnselect(selectedValue)
                    }
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                  }}
                  onClick={() => handleUnselect(selectedValue)}
                >
                  <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                </button>
              </Badge>
            )
          })}
          <input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
            placeholder={value.length === 0 ? placeholder : ""}
            onFocus={() => setOpen(true)}
            onBlur={() => {
              setOpen(false)
              setInputValue("")
            }}
          />
        </div>
      </div>
      <div className="relative">
        {open && selectables.length > 0 && (
          <div className="absolute top-0 z-10 w-full rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in">
            <CommandGroup className="h-full overflow-auto">
              {selectables.map((option) => (
                <CommandItem
                  key={option.value}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                  }}
                  onSelect={() => {
                    onChange([...value, option.value])
                    setInputValue("")
                  }}
                  className="cursor-pointer"
                >
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </div>
        )}
      </div>
    </Command>
  )
} 