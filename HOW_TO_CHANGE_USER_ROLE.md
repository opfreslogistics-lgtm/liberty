# How to Change User Role from User to Admin in Supabase

## Method 1: Using Supabase Dashboard (Easiest)

### Step 1: Open Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to **Table Editor** in the left sidebar
3. Click on the **`user_profiles`** table

### Step 2: Find the User
1. Use the search/filter feature to find the user by email or name
2. Click on the row to select it

### Step 3: Update the Role
1. Click on the **`role`** field
2. Change the value from `'user'` to `'admin'` or `'superadmin'`
3. Click **Save** or press Enter

That's it! The user now has admin privileges.

---

## Method 2: Using SQL Editor (Recommended for Bulk Updates)

### Step 1: Open SQL Editor
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**

### Step 2: Run SQL Query

#### To change a specific user by email:
```sql
UPDATE user_profiles
SET role = 'admin'
WHERE email = 'user@example.com';
```

#### To change a specific user by user ID:
```sql
UPDATE user_profiles
SET role = 'admin'
WHERE id = 'user-uuid-here';
```

#### To change a user by first name and last name:
```sql
UPDATE user_profiles
SET role = 'admin'
WHERE first_name = 'John' AND last_name = 'Doe';
```

#### To make user a superadmin instead:
```sql
UPDATE user_profiles
SET role = 'superadmin'
WHERE email = 'user@example.com';
```

#### To change multiple users at once:
```sql
UPDATE user_profiles
SET role = 'admin'
WHERE email IN ('user1@example.com', 'user2@example.com', 'user3@example.com');
```

### Step 3: Execute the Query
1. Click **Run** or press `Ctrl+Enter` (Windows) / `Cmd+Enter` (Mac)
2. Check the success message

---

## Method 3: Using Supabase Client (From Your App)

You can also add a feature in your admin panel to change user roles. Here's how:

### Add to Admin User Management Page

```typescript
const updateUserRole = async (userId: string, newRole: 'user' | 'admin' | 'superadmin') => {
  const { error } = await supabase
    .from('user_profiles')
    .update({ role: newRole })
    .eq('id', userId)
  
  if (error) {
    console.error('Error updating role:', error)
    return
  }
  
  // Success! User role updated
}
```

---

## Valid Role Values

The `role` field accepts these values:
- `'user'` - Regular user (default)
- `'admin'` - Admin user (can access admin panel)
- `'superadmin'` - Super admin (first user, has all privileges)

---

## Security Notes

⚠️ **Important Security Considerations:**

1. **Only admins should be able to change roles** - This should be done through the admin panel or by database administrators
2. **Audit logging** - Consider logging role changes in an `admin_actions` table
3. **RLS Policies** - Make sure your Row Level Security policies prevent regular users from changing roles

---

## Verify the Change

After changing the role, verify it worked:

### Using SQL:
```sql
SELECT id, email, first_name, last_name, role
FROM user_profiles
WHERE email = 'user@example.com';
```

### The user should:
1. Sign out of the application
2. Sign back in
3. Now have access to `/admin` pages
4. See "Admin" or "Super Admin" in their profile

---

## Troubleshooting

### Issue: User still sees regular dashboard after role change
**Solution:** User needs to sign out and sign back in for the session to refresh

### Issue: Cannot update role - permission denied
**Solution:** 
1. Check RLS policies allow updates
2. Make sure you're logged in as admin/superadmin
3. Or use Supabase Dashboard as admin

### Issue: Role change doesn't persist
**Solution:**
1. Check if there's a trigger or function overriding the update
2. Verify the update query succeeded
3. Refresh the page and check again

---

## Quick Reference SQL

```sql
-- View all users and their roles
SELECT id, email, first_name, last_name, role, created_at
FROM user_profiles
ORDER BY created_at DESC;

-- Change user to admin
UPDATE user_profiles SET role = 'admin' WHERE email = 'user@example.com';

-- Change user back to regular user
UPDATE user_profiles SET role = 'user' WHERE email = 'user@example.com';

-- Find all admins
SELECT * FROM user_profiles WHERE role IN ('admin', 'superadmin');

-- Count users by role
SELECT role, COUNT(*) as count
FROM user_profiles
GROUP BY role;
```

---

**That's it! You now know how to change user roles in Supabase.** 🎉


