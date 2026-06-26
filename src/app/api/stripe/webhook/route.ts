import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/server'
import { createServiceClient } from '@/lib/supabase/server'
import { sendOrderConfirmation, sendAdminNewOrderAlert } from '@/lib/resend/emails'

export async function POST(req: Request) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

  let event
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = await createServiceClient()

  if (event.type === 'payment_intent.succeeded') {
    const pi = event.data.object
    const orderId = pi.metadata?.orderId
    if (!orderId) return NextResponse.json({ ok: true })

    const { data: order } = await supabase
      .from('orders')
      .update({ status: 'paid' })
      .eq('id', orderId)
      .select('*, order_items(*, menu_item:menu_items(*)), pickup_location:pickup_locations(*)')
      .single()

    if (order) {
      await Promise.all([
        sendOrderConfirmation(order),
        sendAdminNewOrderAlert(order),
      ])
    }
  }

  if (event.type === 'payment_intent.payment_failed') {
    const pi = event.data.object
    const orderId = pi.metadata?.orderId
    if (orderId) {
      await supabase.from('orders').update({ status: 'pending' }).eq('id', orderId)
    }
  }

  return NextResponse.json({ ok: true })
}
