"use client"

import { useState, useRef, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import { Slider } from "@/components/ui/slider"

const masseurSchema = z.object({
  name: z.string().min(1, "請輸入按摩師姓名"),
  description: z.string().optional(),
  services: z.array(z.string()).optional(),
  imageUrl: z.string().optional(),
  imageScale: z.number().optional(),
  imageX: z.number().optional(),
  imageY: z.number().optional(),
})

type MasseurFormData = z.infer<typeof masseurSchema>

interface MasseurFormProps {
  initialData?: MasseurFormData & { id?: string }
  onSubmit: (data: MasseurFormData) => Promise<void>
  onCancel: () => void
  services?: { id: string; name: string }[]
}

export function MasseurForm({
  initialData,
  onSubmit,
  onCancel,
  services = []
}: MasseurFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedServices, setSelectedServices] = useState<string[]>(
    initialData?.services || []
  )
  const [previewImage, setPreviewImage] = useState<string | null>(initialData?.imageUrl || null)
  const [imageScale, setImageScale] = useState(1)
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageContainerRef = useRef<HTMLDivElement>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<MasseurFormData>({
    resolver: zodResolver(masseurSchema),
    defaultValues: initialData || {
      name: "",
      description: "",
      services: [],
      imageUrl: "",
    }
  })

  // 監聽表單值的變化
  const formValues = watch()

  useEffect(() => {
    if (initialData) {
      setValue("name", initialData.name)
      setValue("description", initialData.description || "")
      setValue("imageUrl", initialData.imageUrl || "")
      setSelectedServices(initialData.services || [])
      if (initialData.imageScale) setImageScale(initialData.imageScale)
      if (initialData.imageX != null && initialData.imageY != null) {
        setImagePosition({ x: initialData.imageX, y: initialData.imageY })
      }
    }
  }, [initialData, setValue])

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // 創建預覽URL
    const previewUrl = URL.createObjectURL(file)
    setPreviewImage(previewUrl)
    setImageScale(1)
    setImagePosition({ x: 0, y: 0 })

    // 上傳圖片到伺服器
    const formData = new FormData()
    formData.append("file", file)

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) throw new Error("上傳圖片失敗")

      const { url } = await response.json()
      setValue("imageUrl", url)
    } catch (error) {
      console.error("上傳圖片時發生錯誤:", error)
      setPreviewImage(null)
    }
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true)
    setDragStart({
      x: e.clientX - imagePosition.x,
      y: e.clientY - imagePosition.y
    })
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return

    const newX = e.clientX - dragStart.x
    const newY = e.clientY - dragStart.y

    setImagePosition({
      x: newX,
      y: newY
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleScaleChange = (value: number[]) => {
    setImageScale(value[0])
  }

  const onSubmitForm = async (data: MasseurFormData) => {
    setIsSubmitting(true)
    try {
      await onSubmit({
        ...data,
        services: selectedServices,
        imageScale,
        imageX: imagePosition.x,
        imageY: imagePosition.y,
      })
    } catch (error) {
      console.error("提交表單時發生錯誤:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleService = (serviceId: string) => {
    setSelectedServices(prev =>
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">按摩師姓名</label>
        <Input {...register("name")} placeholder="請輸入姓名" />
        {errors.name && (
          <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">照片</label>
        <div className="flex flex-col gap-4">
          {previewImage && (
            <div className="relative w-full max-w-md mx-auto">
              <div
                ref={imageContainerRef}
                className="relative w-full aspect-[4/3] overflow-hidden rounded-lg"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                <div
                  className="absolute"
                  style={{
                    transform: `translate(${imagePosition.x}px, ${imagePosition.y}px) scale(${imageScale})`,
                    transition: isDragging ? 'none' : 'transform 0.2s',
                    cursor: isDragging ? 'grabbing' : 'grab'
                  }}
                >
                  <Image
                    src={previewImage}
                    alt={formValues.name || "按摩師照片"}
                    width={400}
                    height={300}
                    className="object-cover rounded-lg"
                    priority
                  />
                </div>
              </div>
              <div className="mt-2">
                <label className="block text-sm font-medium mb-1">縮放比例</label>
                <Slider
                  value={[imageScale]}
                  min={0.5}
                  max={2}
                  step={0.1}
                  onValueChange={handleScaleChange}
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">
                提示：可以拖曳照片調整位置，使用滑桿調整大小
              </p>
            </div>
          )}
          <div className="flex justify-start">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              ref={fileInputRef}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              {previewImage ? "更換照片" : "上傳照片"}
            </Button>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">自我介紹</label>
        <textarea
          {...register("description")}
          className="w-full border rounded-md p-2 min-h-[100px]"
          placeholder="請輸入自我介紹和專長描述（選填）"
        />
      </div>

      {services.length > 0 && (
        <div>
          <label className="block text-sm font-medium mb-1">提供服務</label>
          <div className="flex flex-wrap gap-2">
            {services.map((service) => (
              <label
                key={service.id}
                className="flex items-center space-x-2 border rounded-md p-2"
              >
                <input
                  type="checkbox"
                  checked={selectedServices.includes(service.id)}
                  onChange={() => toggleService(service.id)}
                  className="rounded border-gray-300"
                />
                <span>{service.name}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          取消
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "儲存中..." : "儲存"}
        </Button>
      </div>
    </form>
  )
} 