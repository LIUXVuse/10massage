"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { MasseurForm } from "@/components/masseurs/masseur-form"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import Image from "next/image"

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
  imageX?: number
  imageY?: number
  services: Service[]
  user?: {
    id: string
    name: string
    email: string
  } | null
}

export default function MasseursPage() {
  const [masseurs, setMasseurs] = useState<Masseur[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isAddingMasseur, setIsAddingMasseur] = useState(false)
  const [editingMasseur, setEditingMasseur] = useState<Masseur | null>(null)
  const [deletingMasseur, setDeletingMasseur] = useState<Masseur | null>(null)

  useEffect(() => {
    fetchMasseurs()
    fetchServices()
  }, [])

  const fetchMasseurs = async () => {
    try {
      const response = await fetch("/api/masseurs")
      if (!response.ok) throw new Error("獲取按摩師列表失敗")
      const data = await response.json()
      setMasseurs(data)
    } catch (error) {
      setError("載入按摩師列表時發生錯誤")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const fetchServices = async () => {
    try {
      const response = await fetch("/api/services")
      if (!response.ok) throw new Error("獲取服務列表失敗")
      const data = await response.json()
      setServices(data)
    } catch (error) {
      console.error("載入服務列表時發生錯誤:", error)
    }
  }

  const handleAddMasseur = async (data: any) => {
    try {
      const response = await fetch("/api/masseurs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      })

      if (!response.ok) throw new Error("新增按摩師失敗")
      await fetchMasseurs()
      setIsAddingMasseur(false)
    } catch (error) {
      console.error("新增按摩師時發生錯誤:", error)
      setError("新增按摩師時發生錯誤")
    }
  }

  const handleEditMasseur = async (data: any) => {
    if (!editingMasseur) return

    try {
      const response = await fetch("/api/masseurs", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, id: editingMasseur.id })
      })

      if (!response.ok) throw new Error("更新按摩師失敗")
      await fetchMasseurs()
      setEditingMasseur(null)
    } catch (error) {
      console.error("更新按摩師時發生錯誤:", error)
      setError("更新按摩師時發生錯誤")
    }
  }

  const handleDeleteMasseur = async () => {
    if (!deletingMasseur) return

    try {
      const response = await fetch("/api/masseurs", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deletingMasseur.id })
      })

      if (!response.ok) throw new Error("刪除按摩師失敗")
      await fetchMasseurs()
      setDeletingMasseur(null)
    } catch (error) {
      console.error("刪除按摩師時發生錯誤:", error)
      setError("刪除按摩師時發生錯誤")
    }
  }

  if (loading) return <div className="p-4">載入中...</div>
  if (error) return <div className="p-4 text-red-500">{error}</div>

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">按摩師管理</h1>
        <Button onClick={() => setIsAddingMasseur(true)}>新增按摩師</Button>
      </div>

      {isAddingMasseur && (
        <div className="mb-4 p-4 border rounded-lg">
          <h2 className="text-lg font-semibold mb-4">新增按摩師</h2>
          <MasseurForm
            onSubmit={handleAddMasseur}
            onCancel={() => setIsAddingMasseur(false)}
            services={services}
          />
        </div>
      )}

      {editingMasseur && (
        <div className="mb-4 p-4 border rounded-lg">
          <h2 className="text-lg font-semibold mb-4">編輯按摩師</h2>
          <MasseurForm
            initialData={{
              name: editingMasseur.user?.name || editingMasseur.name,
              description: editingMasseur.description,
              services: editingMasseur.services.map(s => s.id),
              imageUrl: editingMasseur.imageUrl,
            }}
            onSubmit={handleEditMasseur}
            onCancel={() => setEditingMasseur(null)}
            services={services}
          />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {masseurs.map((masseur) => (
          <div key={masseur.id} className="border rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-semibold">{masseur.user?.name || masseur.name}</h3>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingMasseur(masseur)}
                >
                  編輯
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setDeletingMasseur(masseur)}
                >
                  刪除
                </Button>
              </div>
            </div>
            
            {masseur.imageUrl && (
              <div className="relative w-full aspect-[4/3] mb-4">
                <div
                  className="absolute inset-0 overflow-hidden"
                >
                  <div
                    className="absolute"
                    style={{
                      transform: `translate(${masseur.imageX || 0}px, ${masseur.imageY || 0}px) scale(${masseur.imageScale || 1})`,
                      transformOrigin: 'center',
                    }}
                  >
                    <Image
                      src={masseur.imageUrl}
                      alt={masseur.user?.name || masseur.name}
                      width={400}
                      height={300}
                      className="object-cover rounded-lg"
                      priority
                    />
                  </div>
                </div>
              </div>
            )}

            {masseur.description && (
              <p className="text-gray-600 mb-2">{masseur.description}</p>
            )}

            {masseur.services.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-1">提供服務:</p>
                <div className="flex flex-wrap gap-1">
                  {masseur.services.map((service) => (
                    <span
                      key={service.id}
                      className="text-sm bg-gray-100 px-2 py-1 rounded"
                    >
                      {service.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {masseur.user && (
              <div className="mt-2 text-sm text-gray-500">
                已綁定帳號: {masseur.user.email}
              </div>
            )}
          </div>
        ))}
      </div>

      <ConfirmDialog
        isOpen={!!deletingMasseur}
        onClose={() => setDeletingMasseur(null)}
        onConfirm={handleDeleteMasseur}
        title="刪除按摩師"
        message={`確定要刪除按摩師 ${deletingMasseur?.name} 嗎？此操作無法復原。`}
      />
    </div>
  )
} 