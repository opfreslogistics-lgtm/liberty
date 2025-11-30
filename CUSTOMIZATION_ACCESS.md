# How to Access Homepage Customization

## 🔐 Access Instructions

### Option 1: Direct URL Access
1. Make sure you're logged in as an **admin** user
2. Navigate directly to:
   ```
   http://localhost:3000/admin/customize/home
   ```
   Or on your production site:
   ```
   https://yourdomain.com/admin/customize/home
   ```

### Option 2: Through Admin Dashboard
If you have an admin dashboard, you can add a menu item that links to the customization page.

---

## 📋 What You Can Customize

Once you access the page, you can customize:

### Hero Slider Section
- ✅ Upload 3 hero slider images
- ✅ Edit slide headings and subheadings
- ✅ Customize button text

### Quick Services Section
- ✅ Upload 5 service icons
- ✅ Edit service titles and descriptions

### About Section
- ✅ Upload about page image
- ✅ Edit about title and content
- ✅ Customize button text

### Features Section
- ✅ Upload 4 feature icons
- ✅ Edit feature titles and descriptions

### Promotional Banner
- ✅ Upload banner background image
- ✅ Edit promo title and description
- ✅ Customize button text

### Account Steps
- ✅ Upload 3 step icons
- ✅ Edit step titles and descriptions

### Testimonials
- ✅ Upload 3 user images
- ✅ Edit names, content, and roles

### Blog Section
- ✅ Upload blog post images
- ✅ Edit blog titles and excerpts

### Partners Section
- ✅ Upload 4 partner logos

### App Download Section
- ✅ Upload app mockup image
- ✅ Upload Google Play and App Store badges
- ✅ Edit app title and description

### Footer Section
- ✅ Upload footer logo
- ✅ Upload social media icons (Facebook, Twitter, Instagram, LinkedIn)

---

## 🎯 Quick Steps

1. **Login as Admin**
   - Go to your login page
   - Login with admin credentials

2. **Navigate to Customization**
   - Type in browser: `/admin/customize/home`
   - Or click on "Homepage Customization" in admin menu (if added)

3. **Upload Images**
   - Click "Upload Image" button for any image field
   - Select your image file
   - Wait for upload to complete
   - Image appears instantly on homepage

4. **Edit Text**
   - Click on any text field
   - Type your new content
   - Click outside or press Enter to save
   - Changes reflect immediately

---

## 💡 Tips

- **Image Formats**: JPG, PNG, WebP recommended
- **Image Sizes**: 
  - Hero images: 1920x1080px recommended
  - Icons: 200x200px or 512x512px
  - Logos: Transparent PNG recommended
- **Auto-Save**: Text fields save automatically when you click outside
- **Real-time Updates**: Changes appear on homepage immediately after saving

---

## 🔒 Security

- Only users with `role = 'admin'` can access this page
- RLS (Row Level Security) policies protect the database
- All images are stored securely in Supabase Storage

---

## 📱 Preview

After making changes, visit your homepage (`/`) to see the updates!


