import { createClient } from '@/lib/supabase/server'
import MenuPageClient from '@/components/menu/MenuPageClient'

export default async function MenuPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const supabase = await createClient()

  const { data: items } = await supabase
    .from('menu_items')
    .select('*')
    .eq('is_available', true)
    .order('sort_order')

  const { data: tiers } = await supabase
    .from('discount_tiers')
    .select('*')
    .order('sort_order')

  return <MenuPageClient locale={locale} items={items ?? []} tiers={tiers ?? []} />
}
