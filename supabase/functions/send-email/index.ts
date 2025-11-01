// supabase/functions/send-email/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

serve(async (req) => {
  const { email, userName, type } = await req.json()
  
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'NeighbourFriendly Rentals <noreply@neighbourfriendly.in>',
      to: email,
      subject: 'Welcome!',
      html: '<h1>Welcome!</h1>',
    }),
  })
  
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
```

3. **Call from React:**
```typescript
// In AuthContext.tsx
const response = await supabase.functions.invoke('send-email', {
  body: { email, userName, type: 'welcome' }
})