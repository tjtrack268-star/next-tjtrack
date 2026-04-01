"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Edit2, Check, X } from "lucide-react"

interface Variant {
  id?: number
  couleur: string
  taille: string
  quantite: number
  prixSupplement: number
}

interface ProductVariantsProps {
  variants: Variant[]
  onChange: (variants: Variant[]) => void
}

export function ProductVariants({ variants, onChange }: ProductVariantsProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [newVariant, setNewVariant] = useState<Variant>({
    couleur: "",
    taille: "",
    quantite: 0,
    prixSupplement: 0,
  })

  const addVariant = () => {
    if (newVariant.couleur || newVariant.taille) {
      onChange([...variants, { ...newVariant }])
      setNewVariant({ couleur: "", taille: "", quantite: 0, prixSupplement: 0 })
    }
  }

  const updateVariant = (index: number, updated: Variant) => {
    const newVariants = [...variants]
    newVariants[index] = updated
    onChange(newVariants)
    setEditingIndex(null)
  }

  const deleteVariant = (index: number) => {
    onChange(variants.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Variantes (Couleurs / Tailles)</Label>
        <Badge variant="secondary">{variants.length} variante(s)</Badge>
      </div>

      {/* Liste des variantes */}
      <div className="space-y-2">
        {variants.map((variant, index) => (
          <div key={index} className="flex flex-col gap-2 p-3 border rounded-lg sm:flex-row sm:items-center">
            {editingIndex === index ? (
              <>
                <Input
                  placeholder="Couleur"
                  value={variant.couleur}
                  onChange={(e) => updateVariant(index, { ...variant, couleur: e.target.value })}
                  className="w-full sm:flex-1"
                />
                <Input
                  placeholder="Taille"
                  value={variant.taille}
                  onChange={(e) => updateVariant(index, { ...variant, taille: e.target.value })}
                  className="w-full sm:flex-1"
                />
                <Input
                  type="number"
                  placeholder="Qté"
                  value={variant.quantite}
                  onChange={(e) => updateVariant(index, { ...variant, quantite: Number(e.target.value) })}
                  className="w-full sm:w-20"
                />
                <Input
                  type="number"
                  placeholder="Prix +"
                  value={variant.prixSupplement}
                  onChange={(e) => updateVariant(index, { ...variant, prixSupplement: Number(e.target.value) })}
                  className="w-full sm:w-24"
                />
                <div className="flex items-center gap-2 sm:ml-auto">
                  <Button size="icon" variant="ghost" onClick={() => setEditingIndex(null)}>
                    <Check className="h-4 w-4" />
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="w-full sm:flex-1">
                  <div className="flex items-center gap-2">
                    {variant.couleur && <Badge>{variant.couleur}</Badge>}
                    {variant.taille && <Badge variant="outline">{variant.taille}</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Qté: {variant.quantite} {variant.prixSupplement > 0 && `• +${variant.prixSupplement} XAF`}
                  </p>
                </div>
                <div className="flex items-center gap-2 sm:ml-auto">
                  <Button size="icon" variant="ghost" onClick={() => setEditingIndex(index)}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => deleteVariant(index)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Ajouter une variante */}
      <div className="grid grid-cols-1 gap-2 p-3 border-2 border-dashed rounded-lg sm:grid-cols-12 sm:items-end">
        <div className="space-y-2 sm:col-span-3">
          <Input
            placeholder="Couleur (ex: Rouge, Bleu...)"
            value={newVariant.couleur}
            onChange={(e) => setNewVariant({ ...newVariant, couleur: e.target.value })}
          />
        </div>
        <div className="space-y-2 sm:col-span-3">
          <Input
            placeholder="Taille (ex: S, M, L...)"
            value={newVariant.taille}
            onChange={(e) => setNewVariant({ ...newVariant, taille: e.target.value })}
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Input
            type="number"
            placeholder="Qté"
            value={newVariant.quantite || ""}
            onChange={(e) => setNewVariant({ ...newVariant, quantite: Number(e.target.value) })}
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Input
            type="number"
            placeholder="Prix +"
            value={newVariant.prixSupplement || ""}
            onChange={(e) => setNewVariant({ ...newVariant, prixSupplement: Number(e.target.value) })}
          />
        </div>
        <div className="sm:col-span-2">
          <Button onClick={addVariant} className="w-full sm:w-auto" size="icon">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
