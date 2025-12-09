# Email Authentication Setup

Exquizite now uses email/password authentication with Supabase instead of Google OAuth.

## Features

✅ **Sign Up** - Create account with email and password
✅ **Sign In** - Login with existing credentials
✅ **Guest Mode** - Continue without an account
✅ **Password Reset** - (Can be added if needed)
✅ **Auto Profile Creation** - Profile created automatically on signup

## Quick Start

### 1. Configure Supabase Auth Settings

1. Go to your Supabase Dashboard: https://wenqlegazqvsmnchippx.supabase.co
2. Navigate to **Authentication** → **Settings**
3. Under **Auth Providers**, make sure:
   - ✅ Email is **enabled**
   - ⚠️ Confirm email is **disabled** (for testing - enable in production)
4. Under **Email Templates**, you can customize:
   - Confirmation email
   - Password reset email
   - Magic link email

### 2. Test Authentication

```bash
npm start
```

**Sign Up Flow:**

1. Launch the app
2. Click "Don't have an account? Sign Up"
3. Enter name, email, password
4. Click "Sign Up"
5. You're automatically signed in!

**Sign In Flow:**

1. Launch the app
2. Enter email and password
3. Click "Sign In"

**Guest Mode:**

1. Click "Continue as Guest"
2. No email required!

## UI Features

### Sign In Screen

- Email input
- Password input (masked)
- "Sign In" button
- Toggle to sign up
- Guest mode option

### Sign Up Screen

- Name input
- Email input
- Password input (min 6 characters)
- Confirm password
- Validation for password match
- Auto-switch to sign in after success

### Keyboard Handling

- KeyboardAvoidingView for iOS
- ScrollView for longer forms
- Auto-dismiss keyboard on tap

## How It Works

### Sign Up Process

```typescript
1. User enters: name, email, password
2. App validates input (password length, match, etc.)
3. Supabase creates auth user
4. Database trigger creates profile automatically
5. User is signed in
6. Profile loaded from database
```

### Sign In Process

```typescript
1. User enters: email, password
2. Supabase validates credentials
3. Session created and stored securely
4. Profile loaded from database
5. User redirected to main app
```

### Guest Mode

```typescript
1. User clicks "Continue as Guest"
2. Supabase creates anonymous user
3. Profile created with is_guest=true
4. Full app access (data saved to database)
```

## Security

- ✅ Passwords hashed by Supabase (never stored in plain text)
- ✅ Session tokens stored in SecureStore
- ✅ Row Level Security (users only see their data)
- ✅ Automatic session refresh
- ✅ Secure password validation

## Email Confirmation (Production)

For production, enable email confirmation:

1. **Supabase Dashboard** → **Authentication** → **Settings**
2. Enable "Confirm email"
3. Users must click link in email before signing in
4. Customize email template to match your brand

### Custom Email Template

```html
<h2>Confirm Your Email</h2>
<p>Thanks for signing up to Exquizite!</p>
<p>Click the link below to confirm your email:</p>
<a href="{{ .ConfirmationURL }}">Confirm Email</a>
```

## Password Reset (To Add)

To add password reset functionality:

```typescript
// In login screen, add:
<Button
  title="Forgot Password?"
  onPress={() => {
    // Show password reset modal
    Alert.prompt('Reset Password', 'Enter your email:', async (email) => {
      try {
        await resetPassword(email);
        Alert.alert('Success', 'Check your email for reset link');
      } catch (error) {
        Alert.alert('Error', error.message);
      }
    });
  }}
  variant="text"
/>
```

## Troubleshooting

### Issue: "Invalid login credentials"

**Solution:** Check email/password are correct, user exists

### Issue: "Please check your email to confirm your account"

**Solution:** Email confirmation is enabled. Check your email or disable in Supabase settings

### Issue: "User already registered"

**Solution:** Email already exists, use sign in instead

### Issue: Guest data lost

**Solution:** Guest users are anonymous. If they sign out, they can't recover data. Prompt to create account to save data permanently.

## Converting Guest to Full Account

To allow guests to create an account:

```typescript
// Add this function to AuthContext
const convertGuestToAccount = async (email: string, password: string) => {
  if (!user?.isGuest) throw new Error('Not a guest user');

  // Update auth user
  await supabase.auth.updateUser({ email, password });

  // Update profile
  await supabase
    .from('profiles')
    .update({ email, is_guest: false })
    .eq('id', user.id);
};
```

## Production Checklist

- [ ] Enable email confirmation in Supabase
- [ ] Customize email templates
- [ ] Set up custom SMTP (optional, for better deliverability)
- [ ] Add password reset functionality
- [ ] Add "remember me" option
- [ ] Implement rate limiting for failed login attempts
- [ ] Add 2FA/MFA (optional, for extra security)
- [ ] Test email deliverability
- [ ] Add terms of service/privacy policy links
- [ ] Implement account deletion

## Comparison: Email vs Google OAuth

| Feature             | Email Auth        | Google OAuth              |
| ------------------- | ----------------- | ------------------------- |
| Setup complexity    | ✅ Simple         | ⚠️ Complex (Google Cloud) |
| User experience     | ✅ Familiar       | ✅ One-click              |
| Password management | ⚠️ Users manage   | ✅ Google manages         |
| Email verification  | ✅ Built-in       | ✅ Google verified        |
| Privacy             | ✅ Self-hosted    | ⚠️ Shares with Google     |
| Offline signup      | ❌ Needs internet | ❌ Needs internet         |

## Next Steps

1. **Test the auth flow:**
   - Sign up with a test email
   - Sign out and sign back in
   - Try guest mode

2. **Check Supabase:**
   - Go to **Authentication** → **Users**
   - See your test users
   - Check **Table Editor** → **profiles**

3. **Deploy:**
   - Enable email confirmation
   - Customize email templates
   - Test on real device

Your app now has a complete email authentication system! 🎉
