# 🔑 RAZORPAY KEY SETUP - COMPLETE GUIDE

## ❌ **Current Issue:**

Your Razorpay key `rzp_live_RZAjiONe3JhSfa` is returning **401 Unauthorized**.

This means the key is either:
- ❌ Not activated
- ❌ Incorrect
- ❌ Account not KYC verified
- ❌ Key has been regenerated/revoked

---

## ✅ **SOLUTION - Get Your Correct Key:**

### **Step 1: Go to Razorpay Dashboard**

1. Open: https://dashboard.razorpay.com/
2. Login to your account
3. Go to **Settings** → **API Keys**

---

### **Step 2: Generate/Copy Your Key**

#### **For Testing (Recommended First):**

1. Look for **Test Mode** keys
2. Copy the **Key ID** (starts with `rzp_test_`)
3. Example: `rzp_test_1DP5mmOlF5G5ag`

#### **For Production (After Testing Works):**

1. Complete KYC verification first
2. Switch to **Live Mode**
3. Generate **Live Keys**
4. Copy the **Key ID** (starts with `rzp_live_`)

---

### **Step 3: Add Key to Your .env File**

Open `/Users/mohammedshakeeb/Desktop/NFRR/.env` and update:

```env
# For Testing
VITE_RAZORPAY_KEY_ID=rzp_test_YOUR_ACTUAL_TEST_KEY_HERE

# OR for Production (after KYC)
VITE_RAZORPAY_KEY_ID=rzp_live_YOUR_ACTUAL_LIVE_KEY_HERE
```

**IMPORTANT:** 
- ✅ No spaces
- ✅ No quotes
- ✅ Replace with YOUR actual key from dashboard

---

### **Step 4: Restart Dev Server**

```bash
# Stop server (Ctrl+C)
# Then restart:
npm run dev
```

---

### **Step 5: Test**

1. Hard refresh browser (Cmd+Shift+R)
2. Try booking
3. Razorpay modal should open! ✅

---

## 🧪 **Test Card Details:**

When using **test keys**, use these test cards:

### **Success:**
- Card: `4111 1111 1111 1111`
- CVV: Any 3 digits
- Expiry: Any future date
- Name: Any name

### **Failure:**
- Card: `4000 0000 0000 0002`

---

## 🔍 **How to Check Your Key Status:**

### **In Browser Console:**

After restarting server and refreshing browser, you should see:

✅ **If Test Key:**
```
🔑 Razorpay Key: rzp_test_xxxxx
🔑 Key Type: TEST MODE ⚠️
🔑 Key Valid: true
```

✅ **If Live Key:**
```
🔑 Razorpay Key: rzp_live_xxxxx
🔑 Key Type: LIVE MODE ✅
🔑 Key Valid: true
```

❌ **If Placeholder:**
```
❌ CRITICAL: Replace PLACEHOLDER with your actual Razorpay key!
📝 Get your key from: https://dashboard.razorpay.com/app/keys
```

---

## 📊 **Key Comparison:**

| Key Type | Format | When to Use | KYC Required |
|----------|--------|-------------|--------------|
| Test | `rzp_test_xxxxx` | Development/Testing | ❌ No |
| Live | `rzp_live_xxxxx` | Production | ✅ Yes |

---

## ⚠️ **Common Issues:**

### **Issue 1: 401 Unauthorized**
**Cause:** Invalid or deactivated key
**Fix:** Get new key from dashboard

### **Issue 2: Key Not Loading**
**Cause:** .env not read by Vite
**Fix:** Restart dev server

### **Issue 3: Live Key Not Working**
**Cause:** KYC not completed
**Fix:** Complete KYC verification in Razorpay dashboard

---

## 🎯 **Quick Start (Testing):**

1. **Get test key** from https://dashboard.razorpay.com/app/keys
2. **Add to .env:**
   ```
   VITE_RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_HERE
   ```
3. **Restart server:** `npm run dev`
4. **Hard refresh browser:** Cmd+Shift+R
5. **Test booking** with card: 4111 1111 1111 1111

---

## 🚀 **For Production:**

1. **Complete KYC** in Razorpay dashboard
2. **Generate live keys**
3. **Update .env** with live key
4. **Restart server**
5. **Test with real card**

---

## 📞 **Still Not Working?**

If you've done all the above and it still doesn't work:

1. Check Razorpay dashboard for any account issues
2. Verify KYC status (for live keys)
3. Check if keys are active (not revoked)
4. Contact Razorpay support: support@razorpay.com

---

## ✅ **Checklist:**

- [ ] Logged into Razorpay dashboard
- [ ] Copied correct key (test or live)
- [ ] Added key to .env file (no spaces, no quotes)
- [ ] Restarted dev server
- [ ] Hard refreshed browser
- [ ] Tested booking

---

## 💡 **Pro Tip:**

**Always start with TEST keys!** Only switch to LIVE keys after:
- ✅ Testing works perfectly
- ✅ KYC is completed
- ✅ Ready for production

---

**The code is working perfectly. You just need the correct Razorpay key! 🔑**
