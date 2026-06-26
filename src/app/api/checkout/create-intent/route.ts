import { NextResponse } from 'next/server'
import { z } from 'zod'
import { stripe } from '@/lib/stripe/server'
import { createServiceClient } from '@/lib/supabase/server'

const schema = z.object({
  items: z.array(z.object({
    menuItemId: z.string().uuid(),
    quantity: z.number().int().min(1),
    unitPrice: z.number().positive(),
  })),
  groupOrderId: z.string().uuid().nullable().optional(),
  pickupLocationId: z.string().uuid(),
  orderType: z.enum(['group', 'solo']),
  guestName: z.string().min(1),
  guestEmail: z.string().email(),
  guestPhone: z.string().optional(),
  notes: z.string().optional(),
})

export async function POST(req: Request) {
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const { items, groupOrderId, pickupLocationId, orderType, guestName, guestEmail, guestPhone, notes } = parsed.data
  const supabase = await createServiceClient()

  const subtotal = items.reduce((acc, i) => acc + i.unitPrice * i.quantity, 0)
  let discountPercent = 0

  if (groupOrderId) {
    const { data: group } = await supabase
      .from('group_orders')
      .select('applied_discount_percent')
      .eq('id', groupOrderId)
      .single()
    discountPercent = group?.applied_discount_percent ?? 0
  }

  const totalAmount = subtotal * (1 - discountPercent / 100)
  const amountCents = Math.round(totalAmount * 100)

  // Create order in DB
  const { data: order, error: orderErr } = await supabase
    .from('orders')
    .insert({
      group_order_id: groupOrderId ?? null,
      guest_name: guestName,
      guest_email: guestEmail,
      guest_phone: guestPhone ?? null,
      pickup_location_id: pickupLocationId,
      order_type: orderType,
      status: 'pending',
      subtotal,
      discount_percent: discountPercent,
      total_amount: totalAmount,
      notes: notes ?? null,
    })
    .select()
    .single()

  if (orderErr || !order) {
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }

  // Insert order items
  await supabase.from('order_items').insert(
    items.map(i => ({
      order_id: order.id,
      menu_item_id: i.menuItemId,
      quantity: i.quantity,
      unit_price: i.unitPrice,
      subtotal: i.unitPrice * i.quantity,
    }))
  )

  // Create Stripe PaymentIntent (authorize only — capture_method: manual)
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountCents,
    currency: 'usd',
    capture_method: 'manual',
    metadata: { orderId: order.id, guestEmail, orderType },
    receipt_email: guestEmail,
  })

  // Save payment intent id
  await supabase
    .from('orders')
    .update({ stripe_payment_intent_id: paymentIntent.id })
    .eq('id', order.id)

  return NextResponse.json({ clientSecret: paymentIntent.client_secret, orderId: order.id })
}
