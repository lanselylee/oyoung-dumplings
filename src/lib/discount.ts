import type { DiscountTier } from '@/types'

export function calculateDiscount(peopleCount: number, tiers: DiscountTier[]): number {
  const sorted = [...tiers].sort((a, b) => b.min_people - a.min_people)
  const applicable = sorted.find(t => peopleCount >= t.min_people)
  return applicable?.discount_percent ?? 0
}

export function applyDiscount(price: number, discountPercent: number): number {
  return price * (1 - discountPercent / 100)
}

export function nextTier(peopleCount: number, tiers: DiscountTier[]): DiscountTier | null {
  const sorted = [...tiers].sort((a, b) => a.min_people - b.min_people)
  return sorted.find(t => t.min_people > peopleCount) ?? null
}

export function formatTimeLeft(closesAt: string): string {
  const diff = new Date(closesAt).getTime() - Date.now()
  if (diff <= 0) return '0m'
  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}
