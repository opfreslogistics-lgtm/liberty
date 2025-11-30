/**
 * Email Notification Service
 * Handles sending email notifications for various banking actions
 */

import { supabase } from '@/lib/supabase'

// Email service configuration
const EMAIL_API_URL = '/api/email/send' // Next.js API route

export interface EmailNotificationData {
  notificationType: string
  recipientEmail: string
  recipientName?: string
  subject: string
  metadata?: Record<string, any>
  userId?: string
  adminId?: string
}

export interface EmailTemplate {
  subject: string
  html: string
  text?: string
}

/**
 * Send email notification
 */
export async function sendEmailNotification(data: EmailNotificationData): Promise<boolean> {
  try {
    // Call Next.js API route to send email
    const response = await fetch(EMAIL_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('Email sending failed:', error)
      return false
    }

    // Log email notification in database
    await logEmailNotification(data)

    return true
  } catch (error) {
    console.error('Error sending email notification:', error)
    // Still log the attempt
    await logEmailNotification(data, error instanceof Error ? error.message : 'Unknown error')
    return false
  }
}

/**
 * Log email notification in database
 */
async function logEmailNotification(
  data: EmailNotificationData,
  error?: string
): Promise<void> {
  try {
    const { error: dbError } = await supabase.from('email_notifications').insert({
      user_id: data.userId || null,
      admin_id: data.adminId || null,
      notification_type: data.notificationType,
      recipient_email: data.recipientEmail,
      recipient_name: data.recipientName || null,
      subject: data.subject,
      email_sent: !error,
      email_sent_at: !error ? new Date().toISOString() : null,
      email_error: error || null,
      metadata: data.metadata || null,
    })

    if (dbError) {
      console.error('Error logging email notification:', dbError)
    }
  } catch (error) {
    console.error('Error logging email notification:', error)
  }
}

/**
 * Get admin emails
 */
export async function getAdminEmails(): Promise<Array<{ email: string; name: string }>> {
  try {
    const { data, error } = await supabase.rpc('get_admin_emails')

    if (error) {
      console.error('Error fetching admin emails:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error fetching admin emails:', error)
    return []
  }
}

/**
 * Get user email and name
 */
export async function getUserEmailInfo(
  userId: string
): Promise<{ email: string; name: string } | null> {
  try {
    const { data, error } = await supabase.rpc('get_user_email_info', {
      user_uuid: userId,
    })

    if (error || !data || data.length === 0) {
      console.error('Error fetching user email info:', error)
      return null
    }

    return data[0]
  } catch (error) {
    console.error('Error fetching user email info:', error)
    return null
  }
}

/**
 * Send notification to user
 */
export async function notifyUser(
  userId: string,
  notificationType: string,
  subject: string,
  metadata?: Record<string, any>
): Promise<boolean> {
  const userInfo = await getUserEmailInfo(userId)
  if (!userInfo) {
    console.error('User email info not found for userId:', userId)
    return false
  }

  return sendEmailNotification({
    notificationType,
    recipientEmail: userInfo.email,
    recipientName: userInfo.name,
    subject,
    metadata,
    userId,
  })
}

/**
 * Send notification to admins
 */
export async function notifyAdmins(
  notificationType: string,
  subject: string,
  metadata?: Record<string, any>
): Promise<boolean> {
  const adminEmails = await getAdminEmails()
  if (adminEmails.length === 0) {
    console.warn('No admin emails found')
    return false
  }

  const results = await Promise.all(
    adminEmails.map((admin) =>
      sendEmailNotification({
        notificationType,
        recipientEmail: admin.email,
        recipientName: admin.name,
        subject,
        metadata,
        adminId: admin.email, // Store admin identifier
      })
    )
  )

  return results.every((result) => result)
}

/**
 * Send notification to both user and admins
 */
export async function notifyUserAndAdmins(
  userId: string,
  notificationType: string,
  userSubject: string,
  adminSubject: string,
  userMetadata?: Record<string, any>,
  adminMetadata?: Record<string, any>
): Promise<boolean> {
  const [userResult, adminResult] = await Promise.all([
    notifyUser(userId, notificationType, userSubject, userMetadata),
    notifyAdmins(notificationType, adminSubject, adminMetadata || userMetadata),
  ])

  return userResult && adminResult
}

