/**
 * Contact Form Submission API Route
 * Handles contact form submissions and sends email notifications to admin
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAppSetting } from '@/lib/utils/appSettings'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, subject, message } = body

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get admin email from settings
    const contactEmail = await getAppSetting('contact_email') || await getAppSetting('support_email') || 'admin@libertybank.com'

    // Send email notification to admin
    const emailResponse = await fetch(`${request.nextUrl.origin}/api/email/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        notificationType: 'contact_form',
        recipientEmail: contactEmail,
        recipientName: 'Admin',
        subject: `New Contact Form Submission: ${subject}`,
        metadata: {
          senderName: name,
          senderEmail: email,
          senderPhone: phone || 'Not provided',
          subject: subject,
          message: message,
          date: new Date().toLocaleString(),
        },
      }),
    })

    if (!emailResponse.ok) {
      console.error('Failed to send email notification to admin')
    }

    // Send confirmation email to user
    const userEmailResponse = await fetch(`${request.nextUrl.origin}/api/email/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        notificationType: 'contact_confirmation',
        recipientEmail: email,
        recipientName: name,
        subject: 'We received your message - Liberty National Bank',
        metadata: {
          name: name,
          subject: subject,
          message: message,
          date: new Date().toLocaleString(),
        },
      }),
    })

    if (!userEmailResponse.ok) {
      console.error('Failed to send confirmation email to user')
    }

    return NextResponse.json({
      success: true,
      message: 'Contact form submitted successfully',
    })
  } catch (error: any) {
    console.error('Error in contact form submission:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
  }
}
