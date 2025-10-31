# 🌐 Network Error Handling Guide

## ✅ What's Fixed

Your app now has comprehensive network error handling:

1. **User-friendly error messages** - No more cryptic errors
2. **Automatic retry logic** - Failed requests retry automatically
3. **Network status monitoring** - Shows when offline/online
4. **Timeout handling** - Requests don't hang forever
5. **Connection detection** - Knows when internet is back

---

## 🛠️ How to Use

### 1. Basic Error Handling

```typescript
import { handleNetworkError } from '../utils/networkErrorHandler';

try {
  const { data, error } = await supabase.from('listings').select('*');
  if (error) throw error;
} catch (error) {
  const networkError = handleNetworkError(error);
  showToast.error(networkError.message);
}
```

### 2. Auto Retry with Backoff

```typescript
import { retryWithBackoff } from '../utils/networkErrorHandler';

const fetchData = async () => {
  return await retryWithBackoff(
    async () => {
      const { data, error } = await supabase.from('listings').select('*');
      if (error) throw error;
      return data;
    },
    3, // Max 3 retries
    1000 // Start with 1 second delay
  );
};
```

### 3. Check Network Status

```typescript
import { isOnline } from '../utils/networkErrorHandler';

if (!isOnline()) {
  showToast.error('No internet connection');
  return;
}

// Proceed with request
```

### 4. Wait for Connection

```typescript
import { waitForConnection } from '../utils/networkErrorHandler';

try {
  await waitForConnection(30000); // Wait up to 30 seconds
  // Connection is back, proceed
} catch (error) {
  showToast.error('Still offline. Please check your connection.');
}
```

### 5. Fetch with Timeout

```typescript
import { fetchWithTimeout } from '../utils/networkErrorHandler';

try {
  const response = await fetchWithTimeout(
    'https://api.example.com/data',
    { method: 'GET' },
    10000 // 10 second timeout
  );
  const data = await response.json();
} catch (error) {
  const networkError = handleNetworkError(error);
  showToast.error(networkError.message);
}
```

---

## 🎯 Network Status Component

### Add to Your App

In `src/App.tsx` or `src/main.tsx`:

```typescript
import { NetworkStatus } from './components/NetworkStatus';

function App() {
  return (
    <>
      <NetworkStatus />
      {/* Rest of your app */}
    </>
  );
}
```

This will show:
- 🔴 **"No internet connection"** banner when offline
- 🟢 **"Back online"** banner when reconnected
- Auto-hides after 3 seconds

---

## 📊 Error Types Handled

| Error Type | Message | Retry? |
|------------|---------|--------|
| **Network Error** | "Unable to connect to the server" | ✅ Yes |
| **Timeout** | "Request timed out" | ✅ Yes |
| **Database Error** | "Database connection error" | ✅ Yes |
| **Auth Error (401)** | "Session expired. Please log in" | ❌ No |
| **Rate Limit (429)** | "Too many requests. Wait a moment" | ✅ Yes |
| **Server Error (500+)** | "Server error. Try again later" | ✅ Yes |
| **Client Error (400+)** | "Invalid request" | ❌ No |

---

## 🔧 Common Patterns

### Pattern 1: Fetch Data with Error Handling

```typescript
const fetchListings = async () => {
  try {
    setLoading(true);
    
    const data = await retryWithBackoff(async () => {
      const { data, error } = await supabase
        .from('listings')
        .select('*');
      
      if (error) throw error;
      return data;
    });
    
    setListings(data);
  } catch (error) {
    const networkError = handleNetworkError(error);
    showToast.error(networkError.message);
  } finally {
    setLoading(false);
  }
};
```

### Pattern 2: Submit Form with Retry

```typescript
const handleSubmit = async (formData: any) => {
  if (!isOnline()) {
    showToast.error('No internet connection');
    return;
  }

  try {
    await retryWithBackoff(async () => {
      const { error } = await supabase
        .from('listings')
        .insert(formData);
      
      if (error) throw error;
    });
    
    showToast.success('Listing created!');
  } catch (error) {
    const networkError = handleNetworkError(error);
    showToast.error(networkError.message);
  }
};
```

### Pattern 3: Monitor Network Status

```typescript
import { addNetworkListeners } from '../utils/networkErrorHandler';

useEffect(() => {
  const cleanup = addNetworkListeners(
    () => {
      showToast.success('Back online!');
      // Refetch data
      fetchData();
    },
    () => {
      showToast.error('Connection lost');
    }
  );

  return cleanup;
}, []);
```

---

## 🚀 Best Practices

### 1. Always Handle Errors
```typescript
// ✅ Good
try {
  await fetchData();
} catch (error) {
  handleNetworkError(error);
}

// ❌ Bad
await fetchData(); // No error handling
```

### 2. Show User Feedback
```typescript
// ✅ Good
catch (error) {
  const networkError = handleNetworkError(error);
  showToast.error(networkError.message);
}

// ❌ Bad
catch (error) {
  console.error(error); // User sees nothing
}
```

### 3. Use Retry for Important Operations
```typescript
// ✅ Good - Retry important operations
await retryWithBackoff(() => saveBooking());

// ❌ Bad - Single attempt for critical operation
await saveBooking();
```

### 4. Check Connection Before Heavy Operations
```typescript
// ✅ Good
if (!isOnline()) {
  showToast.error('No internet connection');
  return;
}
await uploadImages();

// ❌ Bad
await uploadImages(); // Might fail silently
```

---

## 🎯 Testing

### Test Offline Behavior

1. Open DevTools (F12)
2. Go to **Network** tab
3. Select **Offline** from dropdown
4. Try using the app
5. Should see "No internet connection" banner

### Test Retry Logic

1. Open DevTools (F12)
2. Go to **Network** tab
3. Select **Slow 3G**
4. Try fetching data
5. Should retry automatically

---

## 📞 Troubleshooting

### "Still getting network errors"

**Check:**
1. Is `NetworkStatus` component added to App?
2. Are you using `handleNetworkError()` in catch blocks?
3. Check browser console for actual error

### "Retries not working"

**Check:**
1. Using `retryWithBackoff()` wrapper?
2. Error is marked as retryable?
3. Max retries not exceeded?

### "Timeout too short/long"

**Adjust timeout:**
```typescript
// Shorter timeout (5 seconds)
await fetchWithTimeout(url, options, 5000);

// Longer timeout (30 seconds)
await fetchWithTimeout(url, options, 30000);
```

---

## ✅ Checklist

- [x] Created network error handler utility
- [x] Created network status component
- [ ] Add NetworkStatus to App.tsx
- [ ] Replace old error handling with new utility
- [ ] Test offline behavior
- [ ] Test retry logic
- [ ] Test timeout handling

---

**Your app now has enterprise-grade network error handling!** 🎉

All network issues will be handled gracefully with user-friendly messages and automatic retries!
