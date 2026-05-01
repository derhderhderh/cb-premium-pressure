import { Resend } from "resend"
import { Booking } from "./types"
import { format } from "date-fns"
import { toDate } from "./utils"

const FROM_EMAIL = "CB Premium Pressure <noreply@cbpremiumpressure.org>"

function getResend() {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not configured")
  }

  return new Resend(process.env.RESEND_API_KEY)
}

export async function sendBookingConfirmation(booking: Booking) {
  const preferredDate = toDate(booking.preferredDate)

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Booking Confirmation</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #1e40af; margin: 0;">CB Premium Pressure</h1>
          <p style="color: #64748b; margin: 5px 0;">Professional Pressure Washing Services | Allen, Texas</p>
        </div>
        
        <div style="background: #f8fafc; border-radius: 12px; padding: 30px; margin-bottom: 20px;">
          <h2 style="color: #1e293b; margin-top: 0;">Thank You for Your Booking Request!</h2>
          <p>Hi ${booking.customerName},</p>
          <p>We've received your booking request and will confirm your appointment shortly.</p>
          
          <div style="background: #e0f2fe; border-left: 4px solid #3b82f6; padding: 15px; border-radius: 0 8px 8px 0; margin: 20px 0;">
            <p style="margin: 0; font-weight: 600; color: #1e40af;">
              📱 Expect a Text Message
            </p>
            <p style="margin: 8px 0 0 0; color: #1e293b;">
              One of our team members will text you directly to confirm the details and answer any questions you may have.
            </p>
          </div>
        </div>
        
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 25px; margin-bottom: 20px;">
          <h3 style="color: #1e293b; margin-top: 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px;">Booking Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #64748b;">Service:</td>
              <td style="padding: 8px 0; text-align: right; font-weight: 500; text-transform: capitalize;">${booking.serviceType.replace("_", " ")}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b;">Area:</td>
              <td style="padding: 8px 0; text-align: right; font-weight: 500;">${booking.squareFootage.toLocaleString()} sq ft</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b;">Preferred Date:</td>
              <td style="padding: 8px 0; text-align: right; font-weight: 500;">${format(preferredDate, "MMMM d, yyyy")}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b;">Preferred Time:</td>
              <td style="padding: 8px 0; text-align: right; font-weight: 500;">${booking.preferredTime || "Flexible"}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b;">Address:</td>
              <td style="padding: 8px 0; text-align: right; font-weight: 500;">${booking.address}</td>
            </tr>
            <tr style="border-top: 2px solid #e2e8f0;">
              <td style="padding: 15px 0 8px 0; color: #1e293b; font-weight: 600;">Estimated Price:</td>
              <td style="padding: 15px 0 8px 0; text-align: right; font-weight: 700; font-size: 20px; color: #1e40af;">$${booking.estimatedPrice.toFixed(2)}</td>
            </tr>
          </table>
          <p style="font-size: 12px; color: #64748b; margin-top: 15px;">
            * Final price may vary based on condition and accessibility. Payment is due upon completion.
          </p>
        </div>
        
        <div style="text-align: center; color: #64748b; font-size: 14px;">
          <p>Questions? Email us at <a href="mailto:contact@cbpremiumpressure.org" style="color: #1e40af;">contact@cbpremiumpressure.org</a></p>
          <p style="margin-top: 20px;">&copy; ${new Date().getFullYear()} CB Premium Pressure. Serving Allen, Texas since 2026.</p>
        </div>
      </body>
    </html>
  `

  try {
    const { data, error } = await getResend().emails.send({
      from: FROM_EMAIL,
      to: booking.email,
      subject: "Booking Confirmation - CB Premium Pressure",
      html,
    })

    if (error) {
      console.error("Error sending booking confirmation:", error)
      throw error
    }

    return data
  } catch (error) {
    console.error("Failed to send booking confirmation email:", error)
    throw error
  }
}

export async function sendNewBookingAdminEmail(
  booking: Booking,
  recipients: string[]
) {
  if (recipients.length === 0) return

  const preferredDate = toDate(booking.preferredDate)
  const dashboardUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    "https://www.cbpremiumpressure.org"
  const normalizedDashboardUrl = dashboardUrl.startsWith("http")
    ? dashboardUrl
    : `https://${dashboardUrl}`

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Booking Request</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #1e40af; margin: 0;">CB Premium Pressure</h1>
          <p style="color: #64748b; margin: 5px 0;">New booking request received</p>
        </div>

        <div style="background: #f8fafc; border-radius: 12px; padding: 30px; margin-bottom: 20px;">
          <h2 style="color: #1e293b; margin-top: 0;">Review a New Booking</h2>
          <p>A customer submitted a new booking request. Review it in the admin dashboard or claim it from My Jobs.</p>
          <p style="margin: 24px 0 0 0;">
            <a href="${normalizedDashboardUrl}/dashboard/admin/bookings" style="display: inline-block; background: #1e40af; color: #ffffff; text-decoration: none; font-weight: 600; padding: 12px 18px; border-radius: 8px;">Open Dashboard</a>
          </p>
        </div>

        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 25px; margin-bottom: 20px;">
          <h3 style="color: #1e293b; margin-top: 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px;">Booking Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #64748b;">Customer:</td>
              <td style="padding: 8px 0; text-align: right; font-weight: 500;">${booking.customerName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b;">Email:</td>
              <td style="padding: 8px 0; text-align: right; font-weight: 500;">${booking.email}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b;">Phone:</td>
              <td style="padding: 8px 0; text-align: right; font-weight: 500;">${booking.phone}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b;">Service:</td>
              <td style="padding: 8px 0; text-align: right; font-weight: 500; text-transform: capitalize;">${booking.serviceType.replace("_", " ")}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b;">Preferred Date:</td>
              <td style="padding: 8px 0; text-align: right; font-weight: 500;">${format(preferredDate, "MMMM d, yyyy")}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b;">Preferred Time:</td>
              <td style="padding: 8px 0; text-align: right; font-weight: 500;">${booking.preferredTime || "Flexible"}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b;">Address:</td>
              <td style="padding: 8px 0; text-align: right; font-weight: 500;">${booking.address}</td>
            </tr>
            <tr style="border-top: 2px solid #e2e8f0;">
              <td style="padding: 15px 0 8px 0; color: #1e293b; font-weight: 600;">Estimated Price:</td>
              <td style="padding: 15px 0 8px 0; text-align: right; font-weight: 700; font-size: 20px; color: #1e40af;">$${booking.estimatedPrice.toFixed(2)}</td>
            </tr>
          </table>
        </div>
      </body>
    </html>
  `

  try {
    const { data, error } = await getResend().emails.send({
      from: FROM_EMAIL,
      to: recipients,
      subject: "New Booking Request - CB Premium Pressure",
      html,
    })

    if (error) {
      console.error("Error sending admin booking notification:", error)
      throw error
    }

    return data
  } catch (error) {
    console.error("Failed to send admin booking notification:", error)
    throw error
  }
}

export async function sendStatusUpdateEmail(booking: Booking, newStatus: string) {
  const statusMessages: Record<string, { subject: string; heading: string; message: string }> = {
    accepted: {
      subject: "Booking Confirmed - CB Premium Pressure",
      heading: "Your Booking is Confirmed!",
      message: "Great news! Your pressure washing appointment has been confirmed. Our team will arrive at the scheduled time.",
    },
    declined: {
      subject: "Booking Update - CB Premium Pressure",
      heading: "Booking Could Not Be Confirmed",
      message: "We apologize, but we were unable to confirm your booking at this time. Please contact us to reschedule.",
    },
    in_progress: {
      subject: "Service Started - CB Premium Pressure",
      heading: "Your Service Has Started!",
      message: "Our team has arrived and started working on your property. We'll let you know when the job is complete.",
    },
    completed: {
      subject: "Service Completed - CB Premium Pressure",
      heading: "Your Service is Complete!",
      message: "We've finished the job! Thank you for choosing CB Premium Pressure. We hope you love the results.",
    },
  }

  const statusInfo = statusMessages[newStatus]
  if (!statusInfo) return

  const preferredDate = toDate(booking.preferredDate)

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${statusInfo.subject}</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #1e40af; margin: 0;">CB Premium Pressure</h1>
          <p style="color: #64748b; margin: 5px 0;">Professional Pressure Washing Services | Allen, Texas</p>
        </div>
        
        <div style="background: #f8fafc; border-radius: 12px; padding: 30px; margin-bottom: 20px;">
          <h2 style="color: #1e293b; margin-top: 0;">${statusInfo.heading}</h2>
          <p>Hi ${booking.customerName},</p>
          <p>${statusInfo.message}</p>
        </div>
        
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 25px; margin-bottom: 20px;">
          <h3 style="color: #1e293b; margin-top: 0;">Service Details</h3>
          <p style="margin: 5px 0;"><strong>Service:</strong> ${booking.serviceType.replace("_", " ")}</p>
          <p style="margin: 5px 0;"><strong>Date:</strong> ${format(preferredDate, "MMMM d, yyyy")}</p>
          <p style="margin: 5px 0;"><strong>Address:</strong> ${booking.address}</p>
        </div>
        
        <div style="text-align: center; color: #64748b; font-size: 14px;">
          <p>Questions? Email us at <a href="mailto:contact@cbpremiumpressure.org" style="color: #1e40af;">contact@cbpremiumpressure.org</a></p>
          <p style="margin-top: 20px;">&copy; ${new Date().getFullYear()} CB Premium Pressure. Serving Allen, Texas since 2026.</p>
        </div>
      </body>
    </html>
  `

  try {
    const { data, error } = await getResend().emails.send({
      from: FROM_EMAIL,
      to: booking.email,
      subject: statusInfo.subject,
      html,
    })

    if (error) {
      console.error("Error sending status update email:", error)
      throw error
    }

    return data
  } catch (error) {
    console.error("Failed to send status update email:", error)
    throw error
  }
}
