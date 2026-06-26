import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe/server'
import { calculateDiscount } from '@/lib/discount'

// Called by Vercel cron or manual trigger to close expired groups
export async function POST(req: Request) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createServiceClient()

  // Fetch expired open groups
  const { data: groups } = await supabase
    .from('group_orders')
    .select('*')
    .eq('status', 'open')
    .lt('closes_at', new Date().toISOString())

  if (!groups?.length) return NextResponse.json({ closed: 0 })

  const { data: tiers } = await supabase.from('discount_tiers').select('*')

  let closed = 0
  for (const group of groups) {
    const discount = calculateDiscount(group.current_people, tiers ?? [])

    // Fetch all paid orders in this group
    const { data: orders } = await supabase
      .from('orders')
      .select('id, subtotal, stripe_payment_intent_id')
      .eq('group_order_id', group.id)
      .eq('status', 'paid')

    // Capture each payment intent at the discounted amount
    for (const order of orders ?? []) {
      if (!order.stripe_payment_intent_id) continue
      const captureAmount = Math.round(order.subtotal * (1 - discount / 100) * 100)
      try {
        await stripe.paymentIntents.capture(order.stripe_payment_intent_id, {
          amount_to_capture: captureAmount,
        })
        await supabase
          .from('orders')
          .update({ discount_percent: discount, total_amount: captureAmount / 100, status: 'preparing' })
          .eq('id', order.id)
      } catch (e) {
        console.error(`Failed to capture payment for order ${order.id}`, e)
      }
    }

    await supabase
      .from('group_orders')
      .update({ status: 'closed', applied_discount_percent: discount, closed_at: new Date().toISOString() })
      .eq('id', group.id)

    closed++
  }

  return NextResponse.json({ closed })
}
