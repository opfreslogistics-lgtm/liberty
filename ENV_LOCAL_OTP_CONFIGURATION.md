# .env.local Configuration for Nodemailer OTP Emails

## 📧 Gmail Configuration (Recommended)

### Step 1: Get Gmail App Password

1. Go to your Google Account: https://myaccount.google.com/
2. Click **Security** → **2-Step Verification** (enable it if not already enabled)
3. Scroll down and click **App passwords**
4. Select app: **Mail**
5. Select device: **Other (Custom name)** → Enter "Liberty Bank App"
6. Click **Generate**
7. Google will show you a 16-character password like: `mata ywlu fzop hcug`

### Step 2: Copy to .env.local

**IMPORTANT: Remove ALL spaces from the app password!**

If Gmail shows: `mata ywlu fzop hcug`
Use in .env.local: `mataywlufzophcug` (no spaces!)

### Step 3: Add These Lines to .env.local

Create or update your `.env.local` file in the project root:

```env
# ============================================
# NODEMAILER OTP EMAIL CONFIGURATION
# ============================================

# Email service (gmail, hotmail, outlook, etc.)
EMAIL_SERVICE=gmail

# Your Gmail email address
EMAIL_USER=your-email@gmail.com

# Gmail App Password (REMOVE ALL SPACES!)
# Example: If Gmail shows "mata ywlu fzop hcug"
#          Use: "mataywlufzophcug" (no spaces)
EMAIL_PASSWORD=mataywlufzophcug

# Email display name and address
EMAIL_FROM=Liberty Bank <your-email@gmail.com>

# Reply-to address
EMAIL_REPLY_TO=support@libertybank.com
```

## ✅ Complete Example

Here's a complete example of what your `.env.local` should look like:

```env
# Supabase Configuration (already in your file)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Nodemailer OTP Email Configuration (ADD THESE)
EMAIL_SERVICE=gmail
EMAIL_USER=john.doe@gmail.com
EMAIL_PASSWORD=mataywlufzophcug
EMAIL_FROM=Liberty Bank <john.doe@gmail.com>
EMAIL_REPLY_TO=support@libertybank.com
```

## 🔑 Key Points

1. **No Spaces in App Password**: Remove all spaces from Gmail app password
   - ❌ Wrong: `mata ywlu fzop hcug`
   - ✅ Correct: `mataywlufzophcug`

2. **Use App Password, Not Regular Password**: 
   - Don't use your Gmail account password
   - Use the 16-character app password from Google

3. **File Location**: 
   - Create `.env.local` in the project root (same folder as `package.json`)
   - Don't commit it to git (it's already in `.gitignore`)

4. **Restart Server**: 
   - After adding environment variables, restart your development server:
   ```bash
   npm run dev
   ```

## 🧪 Test Your Configuration

1. Add the variables to `.env.local`
2. Restart your dev server
3. Try logging in
4. Check your email inbox for the OTP code
5. Check server console for any errors

## ❌ Common Mistakes

- **Including spaces in app password** → Remove all spaces!
- **Using regular Gmail password** → Must use App Password
- **Not restarting server** → Environment variables only load on startup
- **Wrong email format** → Use full email address: `your-email@gmail.com`

## 🆘 Troubleshooting

If emails aren't being sent:

1. Check console logs for error messages
2. Verify `EMAIL_USER` and `EMAIL_PASSWORD` are correct
3. Make sure app password has no spaces
4. Verify 2-Step Verification is enabled on Google Account
5. Check spam/junk folder

---

**Quick Checklist:**
- [ ] Created `.env.local` file
- [ ] Added all 5 email configuration variables
- [ ] Removed spaces from app password
- [ ] Used App Password (not regular password)
- [ ] Restarted development server
- [ ] Tested login and received email

