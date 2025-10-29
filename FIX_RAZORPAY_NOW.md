# 🔧 FIX RAZORPAY ERROR - 2 MINUTES!

## ❌ **The Error You're Seeing:**
```
Razorpay key not configured. Please add VITE_RAZORPAY_KEY_ID to .env file
```

---

## ✅ **THE FIX (Super Simple!):**

### **Step 1: Check Your .env File**

Open your `.env` file and make sure it has this line:

```env
VITE_RAZORPAY_KEY_ID=rzp_live_RZAjiONe3JhSfa
```

**IMPORTANT:** 
- No spaces around the `=`
- No quotes around the value
- Exact format: `VITE_RAZORPAY_KEY_ID=rzp_live_RZAjiONe3JhSfa`

---

### **Step 2: RESTART Your Dev Server** ⚡

**This is the most important step!**

In your terminal:

```bash
# Stop the server (press Ctrl+C)
# Then restart:
npm run dev
```

**Why?** Vite only reads `.env` files when the server starts. Changes to `.env` require a restart!

---

### **Step 3: Clear Browser Cache**

1. Open DevTools (F12)
2. Right-click the refresh button
3. Click "Empty Cache and Hard Reload"

OR just press: `Cmd + Shift + R` (Mac) or `Ctrl + Shift + R` (Windows)

---

## 🧪 **Test It:**

1. After restarting server
2. Go to `/premium`
3. Click "Get Started"
4. Razorpay modal should open! ✅

---

## 🆘 **If Still Not Working:**

### **Option 1: Check .env Format**

Your `.env` should look like this:

```env
VITE_SUPABASE_URL=https://geblongar.tr/fgwz.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...your-key-here
VITE_RAZORPAY_KEY_ID=rzp_live_RZAjiONe3JhSfa
VITE_RAZORPAY_KEY_SECRET=your_secret_here
VITE_APP_URL=http://localhost:5173
```

### **Option 2: Verify Key is Loading**

Add this temporarily to check:

In `src/services/razorpayService.ts`, add after line 4:

```typescript
console.log('🔑 Razorpay Key:', RAZORPAY_KEY_ID);
```

Restart server and check console. Should show your key.

### **Option 3: Use Test Key Instead**

If you want to test first, use Razorpay test key:

```env
VITE_RAZORPAY_KEY_ID=rzp_test_your_test_key_here
```

Get test keys from: https://dashboard.razorpay.com/app/keys

---

## 📝 **Common Mistakes:**

❌ **Wrong:**
```env
VITE_RAZORPAY_KEY_ID = rzp_live_RZAjiONe3JhSfa  # Spaces!
VITE_RAZORPAY_KEY_ID="rzp_live_RZAjiONe3JhSfa" # Quotes!
RAZORPAY_KEY_ID=rzp_live_RZAjiONe3JhSfa        # Missing VITE_!
```

✅ **Correct:**
```env
VITE_RAZORPAY_KEY_ID=rzp_live_RZAjiONe3JhSfa
```

---

## 🎯 **Quick Checklist:**

- [ ] `.env` file has `VITE_RAZORPAY_KEY_ID=rzp_live_RZAjiONe3JhSfa`
- [ ] No spaces or quotes
- [ ] Dev server restarted (Ctrl+C, then `npm run dev`)
- [ ] Browser cache cleared (Cmd+Shift+R)
- [ ] Test on `/premium` page

---

## 💡 **Why This Happens:**

Vite (your build tool) only reads `.env` files when the server starts. If you:
1. Add a key to `.env`
2. Don't restart the server
3. The app won't see the new key!

**Solution:** Always restart after changing `.env`!

---

## ✅ **After the Fix:**

You should see in console:
```
📦 Loading Razorpay SDK...
✅ Razorpay SDK loaded successfully
```

And the payment modal will open! 🎉

---

## 🚀 **Still Having Issues?**

If after restarting the server it still doesn't work:

1. Check if `.env` is in the root folder (same level as `package.json`)
2. Make sure `.env` is not in `.gitignore` (it should be, but check it exists)
3. Try using a test key first to verify the flow works
4. Check browser console for any other errors

---

## 📞 **Need More Help?**

Show me:
1. Your `.env` file (just the Razorpay line)
2. Console errors after restarting server
3. I'll fix it immediately!

**This should take 2 minutes max! Just restart the server! 💪**
