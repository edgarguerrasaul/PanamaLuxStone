// Plantillas de correo en texto simple + HTML mínimo. Nada de librerías
// pesadas: son funciones que devuelven { subject, html }.

export function orderConfirmationEmail(params: { customerName: string; orderId: string; total: number }) {
  const { customerName, orderId, total } = params;
  return {
    subject: `Confirmamos tu pedido #${orderId.slice(-6).toUpperCase()} — Panamá LuxeStone`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:auto;color:#1a1a1a">
        <h2 style="color:#96702c">¡Gracias por tu compra, ${customerName}!</h2>
        <p>Tu pedido <strong>#${orderId.slice(-6).toUpperCase()}</strong> fue confirmado por un total de
        <strong>$${total.toFixed(2)}</strong>.</p>
        <p>Nuestro equipo se pondrá en contacto para coordinar medición e instalación.</p>
        <p style="color:#666;font-size:13px">Panamá LuxeStone · Piedra sinterizada, mármol y granito en Panamá</p>
      </div>
    `,
  };
}

export function quoteFollowUpEmail(params: { customerName: string; productName?: string; estimatedTotal: number }) {
  const { customerName, productName, estimatedTotal } = params;
  return {
    subject: "¿Seguimos con tu cotización?",
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:auto;color:#1a1a1a">
        <h2 style="color:#96702c">Hola ${customerName},</h2>
        <p>Vimos que armaste una cotización${productName ? ` con <strong>${productName}</strong>` : ""}
        por un estimado de <strong>$${estimatedTotal.toFixed(2)}</strong>, pero no la terminaste de enviar.</p>
        <p>¿Tienes dudas sobre medidas, tiempos de entrega o instalación? Responde este correo y te ayudamos.</p>
        <p style="color:#666;font-size:13px">Panamá LuxeStone · Piedra sinterizada, mármol y granito en Panamá</p>
      </div>
    `,
  };
}

export function quoteReceivedEmail(params: { customerName: string; estimatedTotal: number }) {
  const { customerName, estimatedTotal } = params;
  return {
    subject: "Recibimos tu cotización",
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:auto;color:#1a1a1a">
        <h2 style="color:#96702c">Hola ${customerName},</h2>
        <p>Recibimos tu solicitud de cotización por un estimado de
        <strong>$${estimatedTotal.toFixed(2)}</strong>. Un asesor la revisará y te escribirá en menos de 24 horas.</p>
        <p style="color:#666;font-size:13px">Panamá LuxeStone · Piedra sinterizada, mármol y granito en Panamá</p>
      </div>
    `,
  };
}

export function contactMessageAdminAlertEmail(params: { name: string; email: string; message: string }) {
  const { name, email, message } = params;
  return {
    subject: `Nuevo mensaje de contacto de ${name}`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:auto;color:#1a1a1a">
        <h2 style="color:#96702c">Nuevo mensaje desde /contacto</h2>
        <p><strong>Nombre:</strong> ${name}</p>
        <p><strong>Correo:</strong> ${email}</p>
        <p><strong>Mensaje:</strong></p>
        <p>${message}</p>
      </div>
    `,
  };
}

export function proofOfPaymentAdminAlertEmail(params: { orderId: string; customerName: string; total: number }) {
  const { orderId, customerName, total } = params;
  return {
    subject: `Comprobante subido — pedido #${orderId.slice(-6).toUpperCase()}`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:auto;color:#1a1a1a">
        <h2 style="color:#96702c">Comprobante de pago pendiente de revisar</h2>
        <p><strong>${customerName}</strong> subió un comprobante para el pedido
        <strong>#${orderId.slice(-6).toUpperCase()}</strong> por <strong>$${total.toFixed(2)}</strong>.</p>
        <p>Revísalo desde el panel de administración (/admin/pedidos) y confirma el pedido si el pago es correcto.</p>
      </div>
    `,
  };
}
