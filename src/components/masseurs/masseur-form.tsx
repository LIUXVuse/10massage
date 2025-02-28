"use client"

import { useState, useRef, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import { Slider } from "@/components/ui/slider"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { MultiSelect } from '@/components/ui/multi-select'
import { useRouter } from 'next/navigation'
import { Loader2, UploadCloud, ZoomIn, ZoomOut, RotateCcw, Move, Crop, RefreshCw } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const masseurSchema = z.object({
  name: z.string().min(1, "請輸入按摩師姓名"),
  description: z.string().max(150, "描述最多允許150個字").optional(),
  imageUrl: z.string().optional(),
  imageScale: z.number().optional(),
  cropX: z.number().optional(),
  cropY: z.number().optional(),
  cropWidth: z.number().optional(),
  cropHeight: z.number().optional(),
})

type MasseurFormData = z.infer<typeof masseurSchema>

interface MasseurFormProps {
  initialData?: MasseurFormData & { id?: string }
  services?: { id: string; name: string }[]
  onSubmit?: (data: MasseurFormData) => void
  onCancel?: () => void
}

export function MasseurForm({
  initialData,
  services = [],
  onSubmit: externalSubmit,
  onCancel
}: MasseurFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(initialData?.imageUrl || null)
  const [imageScale, setImageScale] = useState<number>(initialData?.imageScale || 1)
  const [cropBox, setCropBox] = useState({
    x: initialData?.cropX || 0,
    y: initialData?.cropY || 0,
    width: initialData?.cropWidth || 300,
    height: initialData?.cropHeight || 225
  })
  const [editMode, setEditMode] = useState<'view' | 'scale' | 'crop'>('view')
  const [isCropDragging, setIsCropDragging] = useState(false)
  const [cropDragCorner, setCropDragCorner] = useState<string | null>(null)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [isDragOver, setIsDragOver] = useState(false)
  const [isImageLoaded, setIsImageLoaded] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageContainerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)
  const cropBoxRef = useRef<HTMLDivElement>(null)
  const dropZoneRef = useRef<HTMLDivElement>(null)

  // 裁剪框最小尺寸
  const MIN_CROP_SIZE = 50

  const form = useForm<MasseurFormData>({
    resolver: zodResolver(masseurSchema),
    defaultValues: initialData || {
      name: "",
      description: "",
      imageUrl: "",
      imageScale: 1
    }
  })

  // 監聽表單值的變化
  const formValues = form.watch()

  useEffect(() => {
    if (initialData) {
      // 設置基本表單值
      form.setValue("name", initialData.name)
      form.setValue("description", initialData.description || "")
      form.setValue("imageUrl", initialData.imageUrl || "")
      
      // 設置縮放
      if (initialData.imageScale) {
        setImageScale(initialData.imageScale);
        form.setValue("imageScale", initialData.imageScale);
      }
      
      // 設置裁剪框
      if (
        initialData.cropX !== undefined && 
        initialData.cropY !== undefined &&
        initialData.cropWidth !== undefined && 
        initialData.cropHeight !== undefined
      ) {
        setCropBox({
          x: initialData.cropX,
          y: initialData.cropY,
          width: initialData.cropWidth,
          height: initialData.cropHeight
        });
        
        form.setValue("cropX", initialData.cropX);
        form.setValue("cropY", initialData.cropY);
        form.setValue("cropWidth", initialData.cropWidth);
        form.setValue("cropHeight", initialData.cropHeight);
        
        // 移除自動進入裁切模式的設定，預設使用檢視模式
        setEditMode('view');
      } else if (initialData.imageScale != null) {
        // 如果有縮放數據，預設也使用檢視模式
        setEditMode('view');
      }

      // 設置圖片預覽
      setPreviewImage(initialData.imageUrl || null);
    }
  }, [initialData, form]);

  const processFile = async (file: File) => {
    if (!file) return
    
    // 創建預覽URL
    const previewUrl = URL.createObjectURL(file)
    setPreviewImage(previewUrl)
    
    // 重置編輯狀態
    setImageScale(1)
    setCropBox({
      x: 0,
      y: 0,
      width: 300,
      height: 225
    })
    setEditMode('view')
    setIsImageLoaded(false)

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
      
      // 設置 imageUrl 值並確保驗證不會失敗
      form.setValue("imageUrl", url, { shouldValidate: true })
    } catch (error) {
      console.error("上傳圖片時發生錯誤:", error)
      setPreviewImage(null)
    }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      await processFile(file)
    }
  }

  // 拖放相關處理函數
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      const file = files[0]
      if (file.type.startsWith('image/')) {
        await processFile(file)
      }
    }
  }

  // 縮放處理
  const handleScaleChange = (value: number[]) => {
    setImageScale(value[0])
    form.setValue("imageScale", value[0])
  }

  // 裁剪框拖曳處理
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>, corner: string | null = null) => {
    if (editMode !== 'crop') return
    
    e.stopPropagation()
    setIsCropDragging(true)
    setCropDragCorner(corner)
    setDragStart({
      x: e.clientX,
      y: e.clientY
    })
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isCropDragging || editMode !== 'crop') return
    
    e.preventDefault()
    
    const dx = e.clientX - dragStart.x
    const dy = e.clientY - dragStart.y
    
    if (cropDragCorner) {
      // 調整裁剪框大小
      const newCropBox = { ...cropBox }
      
      switch (cropDragCorner) {
        case 'topLeft':
          newCropBox.x += dx
          newCropBox.y += dy
          newCropBox.width -= dx
          newCropBox.height -= dy
          break
        case 'topRight':
          newCropBox.y += dy
          newCropBox.width += dx
          newCropBox.height -= dy
          break
        case 'bottomLeft':
          newCropBox.x += dx
          newCropBox.width -= dx
          newCropBox.height += dy
          break
        case 'bottomRight':
          newCropBox.width += dx
          newCropBox.height += dy
          break
      }
      
      // 確保裁剪框大小不小於最小值
      if (newCropBox.width >= MIN_CROP_SIZE && newCropBox.height >= MIN_CROP_SIZE) {
        setCropBox(newCropBox)
        form.setValue("cropX", newCropBox.x)
        form.setValue("cropY", newCropBox.y)
        form.setValue("cropWidth", newCropBox.width)
        form.setValue("cropHeight", newCropBox.height)
      }
    } else {
      // 移動整個裁剪框
      const newPosition = {
        ...cropBox,
        x: cropBox.x + dx,
        y: cropBox.y + dy
      }
      setCropBox(newPosition)
      form.setValue("cropX", newPosition.x)
      form.setValue("cropY", newPosition.y)
    }
    
    setDragStart({
      x: e.clientX,
      y: e.clientY
    })
  }

  const handleMouseUp = () => {
    setIsCropDragging(false)
    setCropDragCorner(null)
  }

  // 為觸控設備添加觸摸事件處理
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (editMode !== 'crop' || e.touches.length !== 1) return
    
    e.preventDefault()
    const touch = e.touches[0]
    setIsCropDragging(true)
    setDragStart({
      x: touch.clientX,
      y: touch.clientY
    })
  }

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isCropDragging || editMode !== 'crop' || e.touches.length !== 1) return
    
    const touch = e.touches[0]
    handleMouseMove({ clientX: touch.clientX, clientY: touch.clientY } as React.MouseEvent<HTMLDivElement>)
  }

  const handleTouchEnd = () => {
    setIsCropDragging(false)
  }

  const handleReset = () => {
    // 增加提示，表示重置功能被觸發
    console.log("重置功能被觸發: 目前模式", editMode);
    
    if (editMode === 'scale') {
      setImageScale(1)
      form.setValue("imageScale", 1)
    } else if (editMode === 'crop') {
      // 確保重置裁切設定時更新表單及顯示狀態
      const resetCropBox = {
        x: 0,
        y: 0,
        width: 300,
        height: 225
      };
      
      setCropBox(resetCropBox)
      
      // 確保更新表單值
      form.setValue("cropX", 0)
      form.setValue("cropY", 0)
      form.setValue("cropWidth", 300)
      form.setValue("cropHeight", 225)
      
      // 觸發重新渲染
      form.trigger(["cropX", "cropY", "cropWidth", "cropHeight"]);
    }
    
    // 新增提示重置完成
    console.log("重置完成: 新設定", {
      editMode,
      imageScale: editMode === 'scale' ? 1 : imageScale,
      cropBox: editMode === 'crop' ? {x: 0, y: 0, width: 300, height: 225} : cropBox
    });
  }

  const onSubmit = async (values: MasseurFormData) => {
    try {
      setLoading(true)
      
      // 準備要提交的數據
      const dataToSubmit = {
        ...values
      }
      
      // 根據編輯模式處理圖片相關數據
      if (editMode === 'crop') {
        // 在裁切模式下，使用當前裁切框的值
        console.log('裁切模式提交表單 - 使用當前裁切框設定:', cropBox);
        dataToSubmit.cropX = cropBox.x;
        dataToSubmit.cropY = cropBox.y;
        dataToSubmit.cropWidth = cropBox.width;
        dataToSubmit.cropHeight = cropBox.height;
        dataToSubmit.imageScale = 1; // 在裁切模式下，縮放設為1
      } else if (editMode === 'scale') {
        // 在縮放模式下，使用當前縮放值，清除裁切數據
        console.log('縮放模式提交表單 - 使用當前縮放設定:', imageScale);
        dataToSubmit.imageScale = imageScale;
        
        // 如果原本有裁切數據，就保留原始裁切數據
        if (initialData?.cropX !== undefined && initialData?.cropY !== undefined) {
          dataToSubmit.cropX = initialData.cropX;
          dataToSubmit.cropY = initialData.cropY;
          dataToSubmit.cropWidth = initialData.cropWidth;
          dataToSubmit.cropHeight = initialData.cropHeight;
        } else {
          // 沒有原始裁切數據時，清除裁切數據
          dataToSubmit.cropX = 0;
          dataToSubmit.cropY = 0;
          dataToSubmit.cropWidth = undefined;
          dataToSubmit.cropHeight = undefined;
        }
      } else {
        // 在檢視模式下，保留初始數據
        console.log('檢視模式提交表單 - 使用原始設定');
        if (initialData) {
          dataToSubmit.imageScale = initialData.imageScale || 1;
          dataToSubmit.cropX = initialData.cropX;
          dataToSubmit.cropY = initialData.cropY;
          dataToSubmit.cropWidth = initialData.cropWidth;
          dataToSubmit.cropHeight = initialData.cropHeight;
        } else {
          dataToSubmit.imageScale = 1;
          dataToSubmit.cropX = 0;
          dataToSubmit.cropY = 0;
        }
      }
      
      // 確保保留原有的圖片URL
      if (!dataToSubmit.imageUrl && initialData?.imageUrl) {
        dataToSubmit.imageUrl = initialData.imageUrl;
      }
      
      console.log("準備提交表單數據:", {
        editMode,
        imageScale: dataToSubmit.imageScale,
        cropX: dataToSubmit.cropX,
        cropY: dataToSubmit.cropY,
        cropWidth: dataToSubmit.cropWidth,
        cropHeight: dataToSubmit.cropHeight,
        imageUrl: dataToSubmit.imageUrl
      });
      
      // 使用外部提交函數處理（如來自父組件）
      if (externalSubmit) {
        await externalSubmit(dataToSubmit);
        return;
      }
      
      // 否則自行處理 API 請求
      const url = initialData?.id
        ? `/api/masseurs/${initialData.id}`
        : '/api/masseurs'
      const method = initialData?.id ? 'PUT' : 'POST'

      console.log(`發送 ${method} 請求到 ${url}`)
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSubmit),
      })

      const responseData = await response.json()
      console.log("API 響應:", responseData)

      if (!response.ok) {
        throw new Error(responseData.error || '提交失敗')
      }

      router.push('/masseurs')
      router.refresh()
    } catch (error) {
      console.error('提交表單時發生錯誤:', error)
      alert('提交失敗，請稍後再試')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>名稱</FormLabel>
              <FormControl>
                <Input placeholder="請輸入按摩師名稱" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>描述 (選填，最多150字)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="請輸入按摩師描述（選填）"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>按摩師照片</FormLabel>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <FormControl>
                    <Input placeholder="請輸入圖片網址" {...field} />
                  </FormControl>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => fileInputRef.current?.click()}
                  >
                    上傳圖片
                  </Button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </div>
                <FormMessage />

                {/* 拖放上傳區域 */}
                {!previewImage && (
                  <div 
                    ref={dropZoneRef}
                    className={`border-2 border-dashed rounded-lg p-8 transition-colors
                      ${isDragOver ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary/50'}
                      flex flex-col items-center justify-center text-center cursor-pointer`}
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <UploadCloud className="h-12 w-12 text-gray-400 mb-3" />
                    <p className="text-sm font-medium mb-1">將圖片拖曳至此處</p>
                    <p className="text-xs text-gray-500">支援 JPG, PNG, GIF 等常見圖片格式</p>
                  </div>
                )}

                {/* 圖片預覽與編輯區域 */}
                {(previewImage || field.value) && (
                  <div className="space-y-4">
                    {/* 圖片編輯模式選擇 */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Button
                          type="button"
                          variant={editMode === 'view' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setEditMode('view')}
                        >
                          <RefreshCw className="h-4 w-4 mr-1" /> 預覽
                        </Button>
                        <Button
                          type="button"
                          variant={editMode === 'scale' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setEditMode('scale')}
                        >
                          <ZoomIn className="h-4 w-4 mr-1" /> 縮放
                        </Button>
                        <Button
                          type="button"
                          variant={editMode === 'crop' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setEditMode('crop')}
                        >
                          <Crop className="h-4 w-4 mr-1" /> 裁切
                        </Button>
                      </div>
                      
                      {editMode !== 'view' && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                type="button" 
                                variant="outline" 
                                size="icon"
                                onClick={handleReset}
                              >
                                <RotateCcw className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{editMode === 'crop' ? '重置裁剪框' : '重置縮放'}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                    
                    {/* 縮放控制 */}
                    {editMode === 'scale' && (
                      <div className="flex items-center space-x-4 pl-2 pr-2">
                        <ZoomOut className="h-4 w-4 text-gray-500" />
                        <Slider 
                          defaultValue={[imageScale]} 
                          min={0.5} 
                          max={2} 
                          step={0.1} 
                          onValueChange={handleScaleChange}
                          value={[imageScale]}
                        />
                        <ZoomIn className="h-4 w-4 text-gray-500" />
                      </div>
                    )}
                    
                    {/* 圖片顯示容器 */}
                    <div 
                      ref={imageContainerRef}
                      className="relative w-full aspect-[4/3] border rounded-lg overflow-hidden bg-gray-50"
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                      onMouseLeave={handleMouseUp}
                      onTouchStart={handleTouchStart}
                      onTouchMove={handleTouchMove}
                      onTouchEnd={handleTouchEnd}
                    >
                      <div 
                        ref={imageRef}
                        className="absolute w-full h-full"
                      >
                        <Image
                          src={previewImage || field.value || ''}
                          alt="按摩師照片預覽"
                          fill
                          className="object-contain"
                          style={{
                            transform: editMode === 'scale' ? `scale(${imageScale})` : undefined,
                            objectFit: 'contain'
                          }}
                          sizes="(max-width: 768px) 100vw, 500px"
                          onLoad={(e) => {
                            setIsImageLoaded(true);
                            console.log("表單圖片載入完成", {
                              naturalWidth: (e.target as HTMLImageElement).naturalWidth,
                              naturalHeight: (e.target as HTMLImageElement).naturalHeight,
                              imageUrl: previewImage || field.value
                            });
                          }}
                          onError={(e) => {
                            console.error("表單圖片載入錯誤", {
                              error: e,
                              imageUrl: previewImage || field.value
                            });
                          }}
                        />
                      </div>
                      
                      {/* 裁剪框 - 只在裁切模式顯示 */}
                      {editMode === 'crop' && (
                        <div 
                          ref={cropBoxRef}
                          className="absolute border-2 border-white box-content"
                          style={{
                            left: `${cropBox.x}px`,
                            top: `${cropBox.y}px`,
                            width: `${cropBox.width}px`,
                            height: `${cropBox.height}px`,
                            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
                            cursor: 'move'
                          }}
                          onMouseDown={(e) => handleMouseDown(e)}
                        >
                          {/* 裁剪框角落控制點 */}
                          <div 
                            className="absolute w-6 h-6 bg-white rounded-full border-2 border-primary -left-3 -top-3 cursor-nw-resize"
                            onMouseDown={(e) => handleMouseDown(e, 'topLeft')}
                          />
                          <div 
                            className="absolute w-6 h-6 bg-white rounded-full border-2 border-primary -right-3 -top-3 cursor-ne-resize"
                            onMouseDown={(e) => handleMouseDown(e, 'topRight')}
                          />
                          <div 
                            className="absolute w-6 h-6 bg-white rounded-full border-2 border-primary -left-3 -bottom-3 cursor-sw-resize"
                            onMouseDown={(e) => handleMouseDown(e, 'bottomLeft')}
                          />
                          <div 
                            className="absolute w-6 h-6 bg-white rounded-full border-2 border-primary -right-3 -bottom-3 cursor-se-resize"
                            onMouseDown={(e) => handleMouseDown(e, 'bottomRight')}
                          />
                        </div>
                      )}
                    </div>
                    
                    {/* 當前模式說明 */}
                    <div className="text-sm text-gray-500 italic">
                      {editMode === 'view' && <p>預覽模式：查看照片的最終效果</p>}
                      {editMode === 'scale' && <p>縮放模式：調整照片的縮放比例</p>}
                      {editMode === 'crop' && <p>裁切模式：拖動邊框或角落調整裁切區域</p>}
                    </div>
                  </div>
                )}
              </div>
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-4 pt-4">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
            >
              取消
            </Button>
          )}
          <Button
            type="submit"
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initialData ? '更新按摩師' : '添加按摩師'}
          </Button>
        </div>
      </form>
    </Form>
  )
} 