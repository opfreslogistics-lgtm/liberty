# Nodemailer OTP Email Setup Guide

## ✅ What's Been Implemented

A complete OTP email system using **Nodemailer** has been added to send 6-digit verification codes to users during login.

### Features
- ✅ Automatic OTP email sending after password authentication
- ✅ Professional HTML email template with branded design
- ✅ 10-minute expiration timer included in email
- ✅ Supports multiple email providers (Gmail, Outlook, Custom SMTP)
- ✅ Graceful fallback (OTP still works even if email fails)

## 📋 Setup Steps

### Step 1: Install Dependencies

```bash
npm install nodemailer
npm install --save-dev @types/nodemailer
```

Or run:
```bash
npm install
```

### Step 2: Configure Environment Variables

Add these to your `.env.local` file:

#### Option A: Gmail (Recommended for Development)

```env
# Email Service (gmail, outlook, etc.)
EMAIL_SERVICE=gmail

# Gmail Account Credentials
EMAIL_USER=your-email@gmail.com
# IMPORTANT: Remove ALL spaces from Gmail App Password!
# If Gmail shows: "mata ywlu fzop hcug"
# Use here: "mataywlufzophcug" (no spaces!)
EMAIL_PASSWORD=your-16-character-app-password-no-spaces

# Email Display
EMAIL_FROM=Liberty Bank <your-email@gmail.com>
EMAIL_REPLY_TO=support@libertybank.com
```

**Note for Gmail:**
- You need to generate an **App Password** (not your regular password)
- Go to: Google Account → Security → 2-Step Verification → App Passwords
- Create an app password for "Mail" and use that as `EMAIL_PASSWORD`

#### Option B: Outlook/Hotmail

```env
EMAIL_SERVICE=hotmail
EMAIL_USER=your-email@outlook.com
EMAIL_PASSWORD=your-password
EMAIL_FROM=Liberty Bank <your-email@outlook.com>
EMAIL_REPLY_TO=support@libertybank.com
```

#### Option C: Custom SMTP Server

```env
# SMTP Server Configuration
EMAIL_HOST=smtp.yourdomain.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@yourdomain.com
EMAIL_PASSWORD=your-smtp-password

# Email Display
EMAIL_FROM=Liberty Bank <noreply@yourdomain.com>
EMAIL_REPLY_TO=support@libertybank.com
```

### Step 3: Test the Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Try logging in with any user account
3. After successful password authentication, you should:
   - See the OTP verification modal
   - Receive an email with the 6-digit code
   - Be able to enter the code to complete login

### Step 4: Verify Email Delivery

- Check your email inbox (and spam folder)
- The email should contain:
  - Liberty International Bank branding
  - A large, easy-to-read 6-digit code
  - 10-minute expiration notice
  - Security warning

## 🔧 Configuration Options

### Environment Variables Explained

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `EMAIL_SERVICE` | No | Email service provider | `gmail`, `hotmail`, `outlook` |
| `EMAIL_HOST` | No* | SMTP server hostname | `smtp.gmail.com` |
| `EMAIL_PORT` | No | SMTP port (default: 587) | `587`, `465` |
| `EMAIL_SECURE` | No | Use SSL/TLS (default: false) | `true`, `false` |
| `EMAIL_USER` | **Yes** | Email address to send from | `your-email@gmail.com` |
| `EMAIL_PASSWORD` | **Yes** | Email password or app password | `your-password` |
| `EMAIL_FROM` | No | Display name and email | `Liberty Bank <noreply@libertybank.com>` |
| `EMAIL_REPLY_TO` | No | Reply-to address | `support@libertybank.com` |

*`EMAIL_HOST` is required if using custom SMTP (Option C). For Gmail/Outlook, `EMAIL_SERVICE` is sufficient.

## 🚀 How It Works

### Login Flow with OTP Email

1. **User enters email and password** → Clicks "Sign In"
2. **Password authentication** → Supabase validates credentials
3. **System checks if OTP is enabled** → Checks `otp_enabled_login` in `user_profiles`
4. **If enabled:**
   - Generates 6-digit random code
   - Saves code to database with 10-minute expiry
   - **Sends email via Nodemailer** ← NEW!
   - Shows OTP verification modal
5. **User enters code from email** → Verifies against database
6. **On success** → Redirects to dashboard/admin panel

### Email Template

The email includes:
- Professional branded header
- Large, prominent 6-digit code
- Expiration warning (10 minutes)
- Security notice
- Footer with bank information

## 🐛 Troubleshooting

### Issue: "EMAIL_USER and EMAIL_PASSWORD are required"

**Solution:** Make sure you've added these to your `.env.local` file and restarted your dev server.

### Issue: "Invalid login" or "Authentication failed"

**Gmail Solution:**
- You must use an **App Password**, not your regular Gmail password
- Enable 2-Step Verification first
- Generate App Password: Google Account → Security → App Passwords
- Use the generated password as `EMAIL_PASSWORD`

**Other Services:**
- Make sure your email and password are correct
- Check if your email provider requires special settings

### Issue: Email not being received

1. **Check spam/junk folder**
2. **Check server console** for error messages
3. **Verify environment variables** are set correctly
4. **Test in development mode** - check console logs for email details

### Issue: "Cannot find module 'nodemailer'"

**Solution:**
```bash
npm install nodemailer
npm install --save-dev @types/nodemailer
```

## 📝 Development Mode

If `EMAIL_USER` or `EMAIL_PASSWORD` are not configured:
- OTP code is still generated and saved
- Email details are logged to console
- System returns success (for testing)
- User can still verify OTP manually
- Check console for: `📧 OTP Email (Development Mode - Email not configured)`

## ✅ Verification Checklist

- [ ] Installed `nodemailer` and `@types/nodemailer`
- [ ] Added environment variables to `.env.local`
- [ ] Restarted development server
- [ ] Tested login flow
- [ ] Received OTP email
- [ ] Successfully verified OTP code
- [ ] Checked spam folder (if email not received)

## 🎯 Next Steps

Once configured, the OTP email system will work automatically:
- Every user login (with OTP enabled) will trigger an email
- Admins can toggle OTP on/off per user
- Emails are sent asynchronously (won't block login)
- System gracefully handles email failures

---

**That's it!** Your OTP email system is ready to use. Users will now receive their verification codes via email automatically! 📧✨

