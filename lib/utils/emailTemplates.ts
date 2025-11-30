/**
 * Email Templates
 * Professional, clean email templates for banking notifications
 */

export interface TransferEmailData {
  recipientName: string
  amount: string
  fromAccount: string
  toAccount?: string
  referenceNumber: string
  transferType: 'internal' | 'external' | 'p2p' | 'wire'
  date: string
  memo?: string
}

export interface BillPaymentEmailData {
  recipientName: string
  billName: string
  amount: string
  accountNumber: string
  referenceNumber: string
  date: string
}

export interface LoanApplicationEmailData {
  recipientName: string
  loanType: string
  requestedAmount: string
  referenceNumber: string
  date: string
}

export interface LoanApprovalEmailData {
  recipientName: string
  loanType: string
  approvedAmount: string
  interestRate: string
  monthlyPayment: string
  termMonths: number
  referenceNumber: string
}

export interface LoanPaymentEmailData {
  recipientName: string
  loanType: string
  paymentAmount: string
  balanceRemaining: string
  referenceNumber: string
  date: string
}

export interface AdminActionEmailData {
  adminName: string
  actionType: string
  userEmail?: string
  userName?: string
  details: string
  amount?: string
  date: string
}

export interface RoleChangeEmailData {
  recipientName: string
  newRole: string
  previousRole?: string
  changedBy: string
  date: string
  message?: string
}

export interface AccountFundedEmailData {
  recipientName: string
  amount: string
  accountType: string
  accountNumber: string
  fundingMethod: string
  referenceNumber: string
  date: string
  adminName?: string
}

/**
 * Base email template wrapper
 */
function getEmailTemplate(title: string, content: string, contactEmail?: string): string {
  return getEmailTemplateWithLogo(title, content, '', contactEmail)
}

/**
 * Base email template wrapper with optional logo
 */
function getEmailTemplateWithLogo(title: string, content: string, logoHtml: string, contactEmail?: string): string {
  // Default logo URL if none is provided
  const DEFAULT_LOGO_URL = 'https://ancomjvybjnaapxjsfbk.supabase.co/storage/v1/object/public/app-images/app-settings/app_logo_dark_1764461829920_27d4d2.png'
  
  // Always show logo if provided, otherwise use default logo
  const headerContent = logoHtml 
    ? logoHtml
    : `<img src="${DEFAULT_LOGO_URL}" alt="Liberty National Bank" style="max-width: 200px; max-height: 60px; margin: 0 auto; display: block; height: auto; width: auto;" />`

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f5f5; padding: 20px;">
    <tr>
      <td align="center">
        <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 30px 30px 20px; text-align: center; background: linear-gradient(135deg, #16a34a 0%, #047857 100%); border-radius: 8px 8px 0 0;">
              ${headerContent}
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 30px;">
              ${content}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 20px 30px; background-color: #f9f9f9; border-radius: 0 0 8px 8px; text-align: center; font-size: 12px; color: #666666; line-height: 1.6;">
              <p style="margin: 0 0 10px;">This is an automated message from Liberty National Bank.</p>
              <p style="margin: 0 0 10px;"><strong>Please do not reply to this email.</strong> This email address is not monitored and replies will not be received.</p>
              <p style="margin: 0;">© ${new Date().getFullYear()} Liberty National Bank. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}

/**
 * Transfer notification email template
 */
export function getTransferEmailTemplate(data: TransferEmailData): { subject: string; html: string } {
  const transferTypeLabels = {
    internal: 'Internal Transfer',
    external: 'External Transfer',
    p2p: 'Peer-to-Peer Transfer',
    wire: 'Wire Transfer',
  }

  const content = `
    <h2 style="margin: 0 0 20px; color: #333333; font-size: 20px;">Transfer Notification</h2>
    <p style="margin: 0 0 15px; color: #666666; line-height: 1.6;">Dear ${data.recipientName},</p>
    <p style="margin: 0 0 20px; color: #666666; line-height: 1.6;">
      This email confirms that a ${transferTypeLabels[data.transferType]} has been processed from your account.
    </p>
    
    <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 20px 0; background-color: #f9f9f9; border-radius: 6px; padding: 20px;">
      <tr>
        <td style="padding: 8px 0; color: #333333; font-weight: 600;">Transfer Type:</td>
        <td style="padding: 8px 0; color: #666666; text-align: right;">${transferTypeLabels[data.transferType]}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #333333; font-weight: 600;">Amount:</td>
            <td style="padding: 8px 0; color: #16a34a; font-weight: 600; font-size: 18px; text-align: right;">${data.amount}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #333333; font-weight: 600;">From Account:</td>
        <td style="padding: 8px 0; color: #666666; text-align: right;">${data.fromAccount}</td>
      </tr>
      ${data.toAccount ? `
      <tr>
        <td style="padding: 8px 0; color: #333333; font-weight: 600;">To Account:</td>
        <td style="padding: 8px 0; color: #666666; text-align: right;">${data.toAccount}</td>
      </tr>
      ` : ''}
      <tr>
        <td style="padding: 8px 0; color: #333333; font-weight: 600;">Reference Number:</td>
        <td style="padding: 8px 0; color: #666666; text-align: right; font-family: monospace;">${data.referenceNumber}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #333333; font-weight: 600;">Date & Time:</td>
        <td style="padding: 8px 0; color: #666666; text-align: right;">${data.date}</td>
      </tr>
      ${data.memo ? `
      <tr>
        <td style="padding: 8px 0; color: #333333; font-weight: 600;">Memo:</td>
        <td style="padding: 8px 0; color: #666666; text-align: right;">${data.memo}</td>
      </tr>
      ` : ''}
    </table>
    
    <p style="margin: 20px 0 0; color: #666666; line-height: 1.6; font-size: 14px;">
      If you did not initiate this transfer, please contact us immediately at support@libertybank.com or call 1-800-LIBERTY.
    </p>
  `

  return {
    subject: `${transferTypeLabels[data.transferType]} - ${data.amount} - ${data.referenceNumber}`,
    html: getEmailTemplate('Transfer Notification', content),
  }
}

/**
 * Bill payment email template
 */
export function getBillPaymentEmailTemplate(data: BillPaymentEmailData): { subject: string; html: string } {
  const content = `
    <h2 style="margin: 0 0 20px; color: #333333; font-size: 20px;">Bill Payment Confirmation</h2>
    <p style="margin: 0 0 15px; color: #666666; line-height: 1.6;">Dear ${data.recipientName},</p>
    <p style="margin: 0 0 20px; color: #666666; line-height: 1.6;">
      This email confirms that your bill payment has been successfully processed.
    </p>
    
    <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 20px 0; background-color: #f9f9f9; border-radius: 6px; padding: 20px;">
      <tr>
        <td style="padding: 8px 0; color: #333333; font-weight: 600;">Bill Name:</td>
        <td style="padding: 8px 0; color: #666666; text-align: right;">${data.billName}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #333333; font-weight: 600;">Amount Paid:</td>
            <td style="padding: 8px 0; color: #16a34a; font-weight: 600; font-size: 18px; text-align: right;">${data.amount}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #333333; font-weight: 600;">Account Used:</td>
        <td style="padding: 8px 0; color: #666666; text-align: right;">${data.accountNumber}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #333333; font-weight: 600;">Reference Number:</td>
        <td style="padding: 8px 0; color: #666666; text-align: right; font-family: monospace;">${data.referenceNumber}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #333333; font-weight: 600;">Payment Date:</td>
        <td style="padding: 8px 0; color: #666666; text-align: right;">${data.date}</td>
      </tr>
    </table>
    
    <p style="margin: 20px 0 0; color: #666666; line-height: 1.6; font-size: 14px;">
      Thank you for using Liberty National Bank for your bill payments.
    </p>
  `

  return {
    subject: `Bill Payment Confirmation - ${data.billName} - ${data.amount}`,
    html: getEmailTemplate('Bill Payment Confirmation', content),
  }
}

/**
 * Loan application email template
 */
export function getLoanApplicationEmailTemplate(data: LoanApplicationEmailData): { subject: string; html: string } {
  const content = `
    <h2 style="margin: 0 0 20px; color: #333333; font-size: 20px;">Loan Application Received</h2>
    <p style="margin: 0 0 15px; color: #666666; line-height: 1.6;">Dear ${data.recipientName},</p>
    <p style="margin: 0 0 20px; color: #666666; line-height: 1.6;">
      Thank you for submitting your loan application. We have received your application and our team will review it within 24-48 hours.
    </p>
    
    <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 20px 0; background-color: #f9f9f9; border-radius: 6px; padding: 20px;">
      <tr>
        <td style="padding: 8px 0; color: #333333; font-weight: 600;">Loan Type:</td>
        <td style="padding: 8px 0; color: #666666; text-align: right;">${data.loanType}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #333333; font-weight: 600;">Requested Amount:</td>
            <td style="padding: 8px 0; color: #16a34a; font-weight: 600; font-size: 18px; text-align: right;">${data.requestedAmount}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #333333; font-weight: 600;">Application Reference:</td>
        <td style="padding: 8px 0; color: #666666; text-align: right; font-family: monospace;">${data.referenceNumber}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #333333; font-weight: 600;">Application Date:</td>
        <td style="padding: 8px 0; color: #666666; text-align: right;">${data.date}</td>
      </tr>
    </table>
    
    <p style="margin: 20px 0 0; color: #666666; line-height: 1.6; font-size: 14px;">
      You will receive an email notification once your application has been reviewed. If you have any questions, please contact our loan department.
    </p>
  `

  return {
    subject: `Loan Application Received - ${data.loanType} - ${data.referenceNumber}`,
    html: getEmailTemplate('Loan Application Received', content),
  }
}

/**
 * Loan approval email template
 */
export function getLoanApprovalEmailTemplate(data: LoanApprovalEmailData): { subject: string; html: string } {
  const content = `
    <h2 style="margin: 0 0 20px; color: #333333; font-size: 20px;">🎉 Loan Application Approved</h2>
    <p style="margin: 0 0 15px; color: #666666; line-height: 1.6;">Dear ${data.recipientName},</p>
    <p style="margin: 0 0 20px; color: #666666; line-height: 1.6;">
      We are pleased to inform you that your loan application has been approved!
    </p>
    
    <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 20px 0; background-color: #f0fdf4; border-radius: 6px; padding: 20px; border: 2px solid #16a34a;">
      <tr>
        <td style="padding: 8px 0; color: #333333; font-weight: 600;">Loan Type:</td>
        <td style="padding: 8px 0; color: #666666; text-align: right;">${data.loanType}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #333333; font-weight: 600;">Approved Amount:</td>
            <td style="padding: 8px 0; color: #16a34a; font-weight: 600; font-size: 18px; text-align: right;">${data.approvedAmount}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #333333; font-weight: 600;">Interest Rate:</td>
        <td style="padding: 8px 0; color: #666666; text-align: right;">${data.interestRate}% APR</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #333333; font-weight: 600;">Monthly Payment:</td>
            <td style="padding: 8px 0; color: #16a34a; font-weight: 600; font-size: 18px; text-align: right;">${data.monthlyPayment}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #333333; font-weight: 600;">Loan Term:</td>
        <td style="padding: 8px 0; color: #666666; text-align: right;">${data.termMonths} months</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #333333; font-weight: 600;">Reference Number:</td>
        <td style="padding: 8px 0; color: #666666; text-align: right; font-family: monospace;">${data.referenceNumber}</td>
      </tr>
    </table>
    
    <p style="margin: 20px 0 0; color: #666666; line-height: 1.6; font-size: 14px;">
      Please log in to your account to view the full loan details and next steps. If you have any questions, please contact our loan department.
    </p>
  `

  return {
    subject: `Loan Approved - ${data.loanType} - ${data.approvedAmount}`,
    html: getEmailTemplate('Loan Application Approved', content),
  }
}

/**
 * Loan payment email template
 */
export function getLoanPaymentEmailTemplate(data: LoanPaymentEmailData): { subject: string; html: string } {
  const content = `
    <h2 style="margin: 0 0 20px; color: #333333; font-size: 20px;">Loan Payment Received</h2>
    <p style="margin: 0 0 15px; color: #666666; line-height: 1.6;">Dear ${data.recipientName},</p>
    <p style="margin: 0 0 20px; color: #666666; line-height: 1.6;">
      This email confirms that your loan payment has been successfully processed.
    </p>
    
    <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 20px 0; background-color: #f9f9f9; border-radius: 6px; padding: 20px;">
      <tr>
        <td style="padding: 8px 0; color: #333333; font-weight: 600;">Loan Type:</td>
        <td style="padding: 8px 0; color: #666666; text-align: right;">${data.loanType}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #333333; font-weight: 600;">Payment Amount:</td>
            <td style="padding: 8px 0; color: #16a34a; font-weight: 600; font-size: 18px; text-align: right;">${data.paymentAmount}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #333333; font-weight: 600;">Remaining Balance:</td>
        <td style="padding: 8px 0; color: #666666; text-align: right;">${data.balanceRemaining}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #333333; font-weight: 600;">Reference Number:</td>
        <td style="padding: 8px 0; color: #666666; text-align: right; font-family: monospace;">${data.referenceNumber}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #333333; font-weight: 600;">Payment Date:</td>
        <td style="padding: 8px 0; color: #666666; text-align: right;">${data.date}</td>
      </tr>
    </table>
    
    <p style="margin: 20px 0 0; color: #666666; line-height: 1.6; font-size: 14px;">
      Thank you for your payment. Keep up the great work!
    </p>
  `

  return {
    subject: `Loan Payment Confirmation - ${data.loanType} - ${data.paymentAmount}`,
    html: getEmailTemplate('Loan Payment Confirmation', content),
  }
}

/**
 * Admin action notification email template
 */
export function getAdminActionEmailTemplate(data: AdminActionEmailData): { subject: string; html: string } {
  const content = `
    <h2 style="margin: 0 0 20px; color: #333333; font-size: 20px;">Admin Action Notification</h2>
    <p style="margin: 0 0 15px; color: #666666; line-height: 1.6;">Dear ${data.adminName},</p>
    <p style="margin: 0 0 20px; color: #666666; line-height: 1.6;">
      This is a notification of an admin action that was performed in the system.
    </p>
    
    <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 20px 0; background-color: #f9f9f9; border-radius: 6px; padding: 20px;">
      <tr>
        <td style="padding: 8px 0; color: #333333; font-weight: 600;">Action Type:</td>
        <td style="padding: 8px 0; color: #666666; text-align: right;">${data.actionType}</td>
      </tr>
      ${data.userName ? `
      <tr>
        <td style="padding: 8px 0; color: #333333; font-weight: 600;">User:</td>
        <td style="padding: 8px 0; color: #666666; text-align: right;">${data.userName}${data.userEmail ? ` (${data.userEmail})` : ''}</td>
      </tr>
      ` : ''}
      ${data.amount ? `
      <tr>
        <td style="padding: 8px 0; color: #333333; font-weight: 600;">Amount:</td>
            <td style="padding: 8px 0; color: #16a34a; font-weight: 600; font-size: 18px; text-align: right;">${data.amount}</td>
      </tr>
      ` : ''}
      <tr>
        <td style="padding: 8px 0; color: #333333; font-weight: 600;">Details:</td>
        <td style="padding: 8px 0; color: #666666; text-align: right;">${data.details}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #333333; font-weight: 600;">Date & Time:</td>
        <td style="padding: 8px 0; color: #666666; text-align: right;">${data.date}</td>
      </tr>
    </table>
  `

  return {
    subject: `Admin Action: ${data.actionType}`,
    html: getEmailTemplate('Admin Action Notification', content),
  }
}

export interface OTPEmailData {
  recipientName: string
  otpCode: string
  expiresInMinutes: number
  logoUrl?: string // Optional logo URL
  contactEmail?: string // Contact email from admin settings
}

/**
 * OTP (One-Time Password) email template
 * Updated to match website's green/emerald color scheme and include logo
 */
export function getOTPEmailTemplate(data: OTPEmailData): { subject: string; html: string } {
  // Default logo URL if none is provided
  const DEFAULT_LOGO_URL = 'https://ancomjvybjnaapxjsfbk.supabase.co/storage/v1/object/public/app-images/app-settings/app_logo_dark_1764461829920_27d4d2.png'
  
  const logoUrlToUse = data.logoUrl || DEFAULT_LOGO_URL
  const logoHtml = `<img src="${logoUrlToUse}" alt="Liberty National Bank" style="max-width: 200px; max-height: 60px; margin: 0 auto; display: block; height: auto; width: auto;" />`

  const content = `
    <h2 style="margin: 0 0 20px; color: #333333; font-size: 20px;">Your Login Verification Code</h2>
    <p style="margin: 0 0 15px; color: #666666; line-height: 1.6;">Dear ${data.recipientName},</p>
    <p style="margin: 0 0 20px; color: #666666; line-height: 1.6;">
      You have requested to log in to your Liberty National Bank account. Please use the verification code below to complete your login.
    </p>
    
    <div style="text-align: center; margin: 30px 0;">
      <div style="display: inline-block; background: linear-gradient(135deg, #16a34a 0%, #047857 100%); padding: 20px 40px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <p style="margin: 0 0 10px; color: #ffffff; font-size: 14px; font-weight: 600; letter-spacing: 1px;">YOUR VERIFICATION CODE</p>
        <p style="margin: 0; color: #ffffff; font-size: 36px; font-weight: 700; letter-spacing: 8px; font-family: 'Courier New', monospace;">${data.otpCode}</p>
      </div>
    </div>
    
    <div style="background-color: #dcfce7; border-left: 4px solid #16a34a; padding: 15px; margin: 20px 0; border-radius: 4px;">
      <p style="margin: 0; color: #166534; font-size: 14px; line-height: 1.6;">
        <strong>⚠️ Security Notice:</strong> This code will expire in ${data.expiresInMinutes} minutes. Never share this code with anyone. Liberty National Bank will never ask for this code via phone or email.
      </p>
    </div>
    
    <p style="margin: 20px 0 0; color: #666666; line-height: 1.6; font-size: 14px;">
      If you did not request this code, please ignore this email immediately. Do not reply to this email.
    </p>
  `

  return {
    subject: `Your Login Verification Code - ${data.otpCode}`,
    html: getEmailTemplateWithLogo('Login Verification Code', content, logoHtml, data.contactEmail),
  }
}

/**
 * Role change email template
 */
export function getRoleChangeEmailTemplate(data: RoleChangeEmailData): { subject: string; html: string } {
  const content = `
    <h2 style="margin: 0 0 20px; color: #333333; font-size: 20px;">Role Change Notification</h2>
    <p style="margin: 0 0 15px; color: #666666; line-height: 1.6;">Dear ${data.recipientName},</p>
    <p style="margin: 0 0 20px; color: #666666; line-height: 1.6;">
      Your account role has been updated.
    </p>
    
    <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 20px 0; background-color: #f9f9f9; border-radius: 6px; padding: 20px;">
      ${data.previousRole ? `
      <tr>
        <td style="padding: 8px 0; color: #333333; font-weight: 600;">Previous Role:</td>
        <td style="padding: 8px 0; color: #666666; text-align: right;">${data.previousRole}</td>
      </tr>
      ` : ''}
      <tr>
        <td style="padding: 8px 0; color: #333333; font-weight: 600;">New Role:</td>
        <td style="padding: 8px 0; color: #16a34a; font-weight: 600; font-size: 18px; text-align: right;">${data.newRole}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #333333; font-weight: 600;">Changed By:</td>
        <td style="padding: 8px 0; color: #666666; text-align: right;">${data.changedBy}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #333333; font-weight: 600;">Date & Time:</td>
        <td style="padding: 8px 0; color: #666666; text-align: right;">${data.date}</td>
      </tr>
    </table>
    
    ${data.message ? `
    <div style="background-color: #dcfce7; border-left: 4px solid #16a34a; padding: 15px; margin: 20px 0; border-radius: 4px;">
      <p style="margin: 0; color: #166534; font-size: 14px; line-height: 1.6;">${data.message}</p>
    </div>
    ` : ''}
    
    <p style="margin: 20px 0 0; color: #666666; line-height: 1.6; font-size: 14px;">
      If you have any questions about this change, please contact our support team.
    </p>
  `

  return {
    subject: `Account Role Changed - ${data.newRole}`,
    html: getEmailTemplate('Role Change Notification', content),
  }
}

/**
 * Account funded email template
 */
export function getAccountFundedEmailTemplate(data: AccountFundedEmailData): { subject: string; html: string } {
  const content = `
    <h2 style="margin: 0 0 20px; color: #333333; font-size: 20px;">Account Funded Notification</h2>
    <p style="margin: 0 0 15px; color: #666666; line-height: 1.6;">Dear ${data.recipientName},</p>
    <p style="margin: 0 0 20px; color: #666666; line-height: 1.6;">
      Your account has been successfully funded.
    </p>
    
    <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 20px 0; background-color: #f0fdf4; border-radius: 6px; padding: 20px; border: 2px solid #16a34a;">
      <tr>
        <td style="padding: 8px 0; color: #333333; font-weight: 600;">Amount:</td>
        <td style="padding: 8px 0; color: #16a34a; font-weight: 600; font-size: 18px; text-align: right;">${data.amount}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #333333; font-weight: 600;">Account Type:</td>
        <td style="padding: 8px 0; color: #666666; text-align: right;">${data.accountType}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #333333; font-weight: 600;">Account Number:</td>
        <td style="padding: 8px 0; color: #666666; text-align: right; font-family: monospace;">${data.accountNumber}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #333333; font-weight: 600;">Funding Method:</td>
        <td style="padding: 8px 0; color: #666666; text-align: right;">${data.fundingMethod}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #333333; font-weight: 600;">Reference Number:</td>
        <td style="padding: 8px 0; color: #666666; text-align: right; font-family: monospace;">${data.referenceNumber}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #333333; font-weight: 600;">Date & Time:</td>
        <td style="padding: 8px 0; color: #666666; text-align: right;">${data.date}</td>
      </tr>
      ${data.adminName ? `
      <tr>
        <td style="padding: 8px 0; color: #333333; font-weight: 600;">Processed By:</td>
        <td style="padding: 8px 0; color: #666666; text-align: right;">${data.adminName}</td>
      </tr>
      ` : ''}
    </table>
    
    <p style="margin: 20px 0 0; color: #666666; line-height: 1.6; font-size: 14px;">
      Thank you for banking with Liberty National Bank. The funds are now available in your account.
    </p>
  `

  return {
    subject: `Account Funded - ${data.amount} - ${data.referenceNumber}`,
    html: getEmailTemplate('Account Funded Notification', content),
  }
}

