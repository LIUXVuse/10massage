"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { MasseurForm } from "@/components/masseurs/masseur-form"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import Image from "next/image"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { isAdmin } from "@/lib/auth/auth-utils"
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Loader2 } from 'lucide-react'
import { toast } from "@/components/ui/use-toast"
import Link from "next/link"

interface Service {
  id: string
  name: string
}

interface Masseur {
  id: string
  name: string
  description: string
  imageUrl?: string
  imageScale?: number
  cropX?: number
  cropY?: number
  cropWidth?: number
  cropHeight?: number
  sortOrder?: number
  services: Service[]
  user?: {
    id: string
    name: string
    email: string
  } | null
}

// 可排序的按摩師卡片組件
function SortableMasseurCard({ 
  masseur, 
  userIsAdmin, 
  onDelete
}: { 
  masseur: Masseur, 
  userIsAdmin: boolean,
  onDelete: (masseur: Masseur) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: masseur.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white p-4 rounded-lg shadow relative group ${isDragging ? 'ring-2 ring-primary shadow-lg' : ''}`}
    >
      {userIsAdmin && (
        <div 
          className="absolute top-2 left-2 cursor-grab opacity-30 group-hover:opacity-100 transition-opacity"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-6 w-6 text-gray-500" />
        </div>
      )}

      <div className="relative h-40 w-full rounded-md overflow-hidden mb-3">
        {masseur.imageUrl ? (
          <div className="relative w-full h-full">
            <Image
              src={masseur.imageUrl.startsWith('http') ? masseur.imageUrl : `${process.env.NEXT_PUBLIC_API_URL}${masseur.imageUrl}`}
              alt={masseur.name}
              fill
              style={{
                objectFit: masseur.imageScale ? 'cover' : 'contain',
                objectPosition: masseur.cropX && masseur.cropY 
                  ? `${masseur.cropX}% ${masseur.cropY}%` 
                  : 'center',
                backgroundColor: '#f3f4f6'
              }}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="transition-all duration-300"
              priority={true}
              loading="eager"
              onError={(e) => {
                console.error("圖片載入錯誤", {
                  masseurId: masseur.id,
                  imageUrl: masseur.imageUrl,
                  error: e
                });
                // 當圖片載入失敗時，將圖片源設置為備用圖片
                (e.target as HTMLImageElement).src = '/images/placeholder-masseur.jpg';
              }}
            />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-100">
            <span className="text-gray-400">無圖片</span>
          </div>
        )}
      </div>

      <h3 className="font-semibold text-lg mb-1">{masseur.name}</h3>
      <p className="text-sm text-gray-600 mb-3 line-clamp-2 h-10">
        {masseur.description || "無自我介紹"}
      </p>

      <div className="flex flex-wrap gap-1 mb-3">
        {masseur.services && masseur.services.length > 0 ? (
          masseur.services.slice(0, 3).map((service: any) => (
            <span 
              key={service.id} 
              className="inline-block text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-full"
            >
              {service.name}
            </span>
          ))
        ) : (
          <span className="text-xs text-gray-400">未提供服務</span>
        )}
        {masseur.services && masseur.services.length > 3 && (
          <span className="text-xs text-gray-500">+{masseur.services.length - 3}種服務</span>
        )}
      </div>

      {userIsAdmin && (
        <div className="flex justify-between mt-3 pt-3 border-t border-gray-100">
          <Link
            href={`/masseurs/edit/${masseur.id}`}
            className="text-xs inline-flex items-center px-2.5 py-1.5 rounded-md font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
          >
            編輯
          </Link>
          <button
            onClick={() => onDelete(masseur)}
            className="text-xs inline-flex items-center px-2.5 py-1.5 rounded-md font-medium bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
          >
            刪除
          </button>
        </div>
      )}
    </div>
  );
}

export default function MasseursPage() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/login')
    }
  })

  const userIsAdmin = isAdmin(session)
  const [masseurs, setMasseurs] = useState<Masseur[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingMasseur, setDeletingMasseur] = useState<Masseur | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isSavingOrder, setIsSavingOrder] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  useEffect(() => {
    console.log("會話狀態:", status)
    console.log("用戶:", session?.user)
    console.log("是否為管理員:", userIsAdmin)
  }, [session, status, userIsAdmin])

  useEffect(() => {
    fetchMasseurs()
    fetchServices()
  }, [])

  const fetchMasseurs = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/masseurs')
      const data = await response.json()
      setMasseurs(data)
    } catch (error) {
      console.error('獲取按摩師列表時發生錯誤:', error)
      toast({
        title: "錯誤",
        description: "獲取按摩師列表失敗",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/services')
      const data = await response.json()
      setServices(data)
    } catch (error) {
      console.error('獲取服務列表時發生錯誤:', error)
    }
  }

  const handleDeleteMasseur = async () => {
    if (!deletingMasseur) return
    
    try {
      const response = await fetch('/api/masseurs', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: deletingMasseur.id })
      })

      if (!response.ok) {
        throw new Error('刪除按摩師失敗')
      }

      setMasseurs(prev => prev.filter(m => m.id !== deletingMasseur.id))
      toast({
        title: "成功",
        description: "按摩師已成功刪除"
      })
    } catch (error) {
      console.error('刪除按摩師時發生錯誤:', error)
      toast({
        title: "錯誤",
        description: "刪除按摩師失敗",
        variant: "destructive"
      })
    } finally {
      setDeletingMasseur(null)
      setIsDeleteDialogOpen(false)
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    
    if (over && active.id !== over.id) {
      setMasseurs((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)
        
        toast({
          title: "正在更新排序",
          description: "正在保存新的按摩師排序...",
          duration: 2000
        })
        
        return arrayMove(items, oldIndex, newIndex)
      })
      
      await saveNewOrder()
    }
  }
  
  const saveNewOrder = async () => {
    if (!userIsAdmin) return
    
    setIsSavingOrder(true)
    try {
      const masseurOrders = masseurs.map((masseur, index) => ({
        id: masseur.id,
        order: index + 1
      }))
      
      const response = await fetch("/api/masseurs", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ masseurOrders })
      })
      
      if (!response.ok) {
        throw new Error("更新排序失敗")
      }
      
      toast({
        title: "排序已更新",
        description: "按摩師排序已成功保存，下次登入時將保持此排序",
        duration: 3000
      })
    } catch (error) {
      console.error("保存排序時發生錯誤:", error)
      toast({
        title: "排序更新失敗",
        description: "無法保存按摩師排序，請稍後再試",
        variant: "destructive",
        duration: 5000
      })
    } finally {
      setIsSavingOrder(false)
    }
  }

  const handleDeleteClick = (masseur: Masseur) => {
    console.log("嘗試刪除按摩師:", masseur.name);
    setDeletingMasseur(masseur);
    setIsDeleteDialogOpen(true);
  }

  return (
    <div className="container mx-auto py-6 relative">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">按摩師管理</h1>
        {userIsAdmin && (
          <Link href="/masseurs/edit/new">
            <Button className="bg-green-600 hover:bg-green-700">
              <span className="mr-2">+</span> 新增按摩師
            </Button>
          </Link>
        )}
      </div>
      
      {userIsAdmin && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <span>
            <strong>排序提示：</strong> 您可以通過拖放按摩師卡片來調整顯示順序。點擊並按住卡片左上角的拖動圖標，然後拖動到所需位置。
          </span>
        </div>
      )}
      
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
          <span className="ml-2 text-lg">載入中...</span>
        </div>
      ) : masseurs.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-gray-300 rounded-lg">
          <p className="text-gray-500 mb-4">尚未新增任何按摩師</p>
          {userIsAdmin && (
            <Link href="/masseurs/edit/new">
              <Button>新增第一位按摩師</Button>
            </Link>
          )}
        </div>
      ) : (
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext 
            items={masseurs.map(m => m.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {masseurs.map((masseur) => (
                <SortableMasseurCard
                  key={masseur.id}
                  masseur={masseur}
                  userIsAdmin={userIsAdmin}
                  onDelete={handleDeleteClick}
                />
              ))}
            </div>
          </SortableContext>
          {isSavingOrder && (
            <div className="fixed inset-0 bg-white/50 flex items-center justify-center z-50">
              <div className="bg-white p-4 rounded-lg shadow-lg flex items-center space-x-3">
                <Loader2 className="h-6 w-6 text-primary animate-spin" />
                <span className="text-gray-700 font-medium">正在保存排序...</span>
              </div>
            </div>
          )}
        </DndContext>
      )}
      
      <ConfirmDialog
        open={isDeleteDialogOpen}
        title="確認刪除"
        description={`您確定要刪除按摩師 "${deletingMasseur?.name}" 嗎？此操作無法撤銷。`}
        onConfirm={handleDeleteMasseur}
        onCancel={() => {
          setIsDeleteDialogOpen(false);
          setDeletingMasseur(null);
        }}
      />
    </div>
  )
}