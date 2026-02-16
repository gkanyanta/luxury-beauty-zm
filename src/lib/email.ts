import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

interface EmailOptions {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log('[Email] SMTP not configured. Would send:', { to, subject })
    return
  }

  await transporter.sendMail({
    from: process.env.SMTP_FROM || 'Luxury Beauty ZM <noreply@luxurybeautyzm.com>',
    to,
    subject,
    html,
  })
}

export function orderConfirmationEmail(order: any) {
  const items = (order.items || []).map((item: any) => ({
    name: item.productName || item.name || 'Item',
    quantity: item.quantity,
    price: `ZMW ${Number(item.price).toFixed(2)}`,
  }))

  const customerName = order.shippingName || 'Valued Customer'
  const subtotal = `ZMW ${Number(order.subtotal).toFixed(2)}`
  const shipping = `ZMW ${Number(order.shippingCost).toFixed(2)}`
  const discount = `ZMW ${Number(order.discount || 0).toFixed(2)}`
  const total = `ZMW ${Number(order.total).toFixed(2)}`
  const paymentMethod = (order.paymentMethod || '').replace(/_/g, ' ')

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;color:#1a1a1a;">
<div style="text-align:center;padding:30px 0;border-bottom:1px solid #e5e5e5;">
<h1 style="font-size:24px;font-weight:300;letter-spacing:3px;margin:0;">LUXURY BEAUTY ZM</h1>
</div>
<div style="padding:30px 0;">
<h2 style="font-size:18px;font-weight:400;">Order Confirmed</h2>
<p>Dear ${customerName},</p>
<p>Thank you for your order! Your order <strong>#${order.orderNumber}</strong> has been received.</p>
<table style="width:100%;border-collapse:collapse;margin:20px 0;">
<thead><tr style="border-bottom:1px solid #e5e5e5;">
<th style="text-align:left;padding:8px 0;">Item</th>
<th style="text-align:center;padding:8px 0;">Qty</th>
<th style="text-align:right;padding:8px 0;">Price</th>
</tr></thead>
<tbody>
${items.map((item: any) => `<tr style="border-bottom:1px solid #f0f0f0;">
<td style="padding:8px 0;">${item.name}</td>
<td style="text-align:center;padding:8px 0;">${item.quantity}</td>
<td style="text-align:right;padding:8px 0;">${item.price}</td>
</tr>`).join('')}
</tbody></table>
<div style="border-top:1px solid #e5e5e5;padding-top:15px;">
<p>Subtotal: ${subtotal}</p>
<p>Shipping: ${shipping}</p>
${discount !== 'ZMW 0.00' ? `<p style="color:#059669;">Discount: -${discount}</p>` : ''}
<p style="font-weight:600;font-size:16px;border-top:1px solid #e5e5e5;padding-top:8px;">Total: ${total}</p>
</div>
<p style="margin-top:20px;">Payment Method: <strong>${paymentMethod}</strong></p>
<p>We'll notify you when your order ships.</p>
</div>
<div style="text-align:center;padding:20px 0;border-top:1px solid #e5e5e5;color:#888;font-size:12px;">
<p>Luxury Beauty ZM &mdash; 100% Authentic Beauty Products</p>
</div></body></html>`
}
