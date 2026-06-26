import { Resend } from 'resend'
import type { Order } from '@/types'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendOrderConfirmation(order: Order) {
  const isZh = true // TODO: pull from user preferred_language
  const subject = isZh ? '订单确认 — O\'Young Dumplings' : 'Order Confirmed — O\'Young Dumplings'
  const to = order.guest_email ?? ''
  if (!to) return

  await resend.emails.send({
    from: 'orders@oyoungdumplings.com',
    to,
    subject,
    html: buildOrderConfirmationHtml(order, isZh),
  })
}

export async function sendAdminNewOrderAlert(order: Order) {
  const adminEmail = process.env.RESTAURANT_ADMIN_EMAIL
  if (!adminEmail) return

  await resend.emails.send({
    from: 'alerts@oyoungdumplings.com',
    to: adminEmail,
    subject: `[新订单] ${order.guest_name} — $${order.total_amount}`,
    html: `<p>New order from <strong>${order.guest_name}</strong></p>
           <p>Total: <strong>$${order.total_amount}</strong></p>
           <p>Type: ${order.order_type}</p>
           <p><a href="${process.env.NEXT_PUBLIC_BASE_URL}/zh/admin/orders">View in Admin</a></p>`,
  })
}

function buildOrderConfirmationHtml(order: Order, isZh: boolean): string {
  const items = order.order_items?.map(item =>
    `<tr>
      <td>${isZh ? item.menu_item?.name_zh : item.menu_item?.name_en} × ${item.quantity}</td>
      <td>$${item.subtotal.toFixed(2)}</td>
    </tr>`
  ).join('') ?? ''

  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #D92B2B;">${isZh ? '订单确认' : 'Order Confirmed'}</h1>
      <p>${isZh ? '感谢您的订购！' : 'Thank you for your order!'}</p>
      <table style="width:100%; border-collapse:collapse;">
        <thead><tr><th style="text-align:left;">${isZh ? '商品' : 'Item'}</th><th>${isZh ? '价格' : 'Price'}</th></tr></thead>
        <tbody>${items}</tbody>
        <tfoot>
          <tr><td><strong>${isZh ? '合计' : 'Total'}</strong></td><td><strong>$${order.total_amount.toFixed(2)}</strong></td></tr>
        </tfoot>
      </table>
      <p style="color: #6B6B6B; margin-top: 24px;">${isZh ? '取餐地点：' : 'Pickup at: '}${order.pickup_location?.address}</p>
    </div>
  `
}
