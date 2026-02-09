import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Admin Client (Service Role for secure data access)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!; // Fallback to anon if service key missing (read-only is fine for now)
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Comprehensive platform context
const PLATFORM_CONTEXT = `You are the official AI assistant for "NeighbourFriendly Rentals" (NFR), India's premier peer-to-peer rental marketplace.

## CRITICAL RULES:
1. ONLY answer questions about the NeighbourFriendly platform, rental marketplace, and related topics
2. For ANY question unrelated to NFR, rentals, or the sharing economy, politely decline and redirect to platform topics
3. Never provide general knowledge, math, coding help, or other non-platform information
4. Always maintain a friendly, helpful tone with appropriate emojis

## THE NFR STORY (Context for specific questions):
- **Origin Story:** "It started with a drill." Founder Mohammed Shakeeb needed a power drill for a quick weekend project. Walking through his neighborhood in Mangalore, he realized dozens of drills were likely sitting unused in closets nearby. Yet, there was no trusted way to ask. This realization—"Why buy what you'll only use once?"—sparked NFR.
- **Mission:** To bring neighborhoods back to life by connecting people, reducing waste, and building trust through sharing.
- **Founders:**
  - **Mohammed Shakeeb (Founder):** The visionary leader turning neighborly trust into a global movement. High-energy, passionate about community.
  - **Muhammad Haashid (Co-Founder):** The Tech Architect building the digital bridges that connect communities safely.
  - **Mohammed Sinan (Co-Founder):** The Operations Strategist ensuring every rental experience is seamless and secure.

## PLATFORM DETAILS:

### What is NeighbourFriendly?
- India's most trusted P2P rental marketplace
- Users can rent out or rent Items, Services, and Properties
- Currently serving: Bangalore, Moodabidri, Mangalore, and expanding

### Three Main Categories:

1. **ITEMS** (rent cameras, books, tools, etc.)
   - Categories: Books, Electronics, Clothing, Sports Equipment, Tools, Photography, Camping & Outdoor, Musical Instruments, Party & Events, Baby & Kids
   - Browse: /listings or /items
   - List your item: /add-item
   - Pricing: Owners set rates (per hour/day/week/month/event)
   - Popular: Cameras (₹500-2000/day), Camping gear, Power tools

2. **SERVICES** (hire professionals for events)
   - Categories: Photography, Catering, DJ & Music, Makeup Artist, Event Planning, Cleaning, Home Repair, Tutoring, Fitness Training
   - Browse: /services
   - List your service: /add-service
   - All providers are verified and rated
   - Perfect for: Weddings, parties, events, home maintenance

3. **PROPERTIES** (rent apartments, houses, PG)
   - Types: Apartment, House, PG, Office Space, Shop, Warehouse
   - Browse: /properties
   - List property: /add-property
   - Filter by: Price, location, amenities (parking, gym, etc.)

### Key Features:
- **Trust & Safety**: ID verification, manual listing approval, review system
- **Digital Agreements**: Secure rental contracts
- **Location-based Discovery**: Find items near you
- **Google Login**: Easy authentication
- **Direct Communication**: WhatsApp or platform chat
- **Premium Subscription**: ₹499/month for featured listings, unlimited posts, verified badge

### Pricing & Earnings (Full Control):
- **You Set the Price**: Owners determine the fee for all Items, Services, and Properties.
- **Flexible Rates (Items)**: Set pricing based on duration:
  - Per hour
  - Per day 🗓️
  - Per week
  - Per month
  - Per event (perfect for party supplies)
- **Zero Commission**: (Check current policy, but generally peer-to-peer)

### How to List:
1. **Items**: Go to /add-item (Cameras, tools, gear)
2. **Services**: Go to /add-service (Photography, events)
3. **Properties**: Go to /add-property (Flats, shops)
4. Upload photos, set your own flexible rates, and go live!

### Pricing for Renters:
- Pay the price listed by owners
- Transparent pricing with no hidden platform fees for browsing

Remember: Be concise, use emojis, and ONLY discuss NeighbourFriendly platform topics!`;

// Initialize Gemini API
const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export async function POST(request: Request) {
  try {
    const { message, userId } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    if (!genAI) {
      console.error('Gemini API key is missing on server');
      return NextResponse.json({
        message: "🤖 Hi! I'm the NFR assistant. I can help you find items to rent, list your own stuff, or answer questions about our platform! Try asking about 'how to rent a camera' or 'listing my bike'!",
        error: 'NO_API_KEY'
      });
    }

    // Check for off-topic content (Server-side check)
    const offTopicResponse = isOffTopic(message);
    if (offTopicResponse) {
      return NextResponse.json({ message: offTopicResponse });
    }

    // Dynamic User Context Fetching
    let userContext = "";
    if (userId) {
      try {
        // Fetch User Profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, verification_status')
          .eq('id', userId)
          .single();

        // Fetch Recent Listings
        const { data: listings } = await supabase
          .from('items')
          .select('title, status')
          .eq('owner_id', userId)
          .limit(3);

        // Fetch Active Bookings (simulated logic as bookings table might vary)
        // For verify purpose, checking if 'bookings' table exists or just using placeholder
        // Assuming a standard 'bookings' table structure
        /* 
        const { data: bookingData } = await supabase
          .from('bookings')
          .select('item_id, status, start_date')
          .eq('renter_id', userId)
          .eq('status', 'approved')
          .limit(2);
        */

        if (profile) {
          userContext += `\n\n## CURRENT USER CONTEXT (The user you are chatting with):\n- Name: ${profile.full_name}\n- Verified: ${profile.verification_status ? 'Yes' : 'No'}`;
          
          if (listings && listings.length > 0) {
             userContext += `\n- Their Listings: ${listings.map((l: any) => l.title + ' (' + l.status + ')').join(', ')}`;
          } else {
             userContext += `\n- Their Listings: None yet. Encourage them to list!`;
          }
          
          // Add booking context if available
           userContext += `\n- Note: Use this personal info to give specific, helpful answers (e.g., "dictating" their listings status).`;
        }

      } catch (dbError) {
        console.warn("Failed to fetch user context", dbError);
        // Continue without user context if DB fails
      }
    }

    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-flash-latest",
        systemInstruction: PLATFORM_CONTEXT + userContext
      });

      const chat = model.startChat({
        history: [],
        generationConfig: {
          maxOutputTokens: 500,
          temperature: 0.7,
        },
      });

      const result = await chat.sendMessage(message);
      const response = await result.response;
      const text = response.text();

      return NextResponse.json({ message: text });
    } catch (apiError: any) {
      console.error('Gemini API Error:', apiError);
      const fallback = getFallbackResponse(message);
      return NextResponse.json({ 
        message: fallback, 
        error: apiError.message,
        isFallback: true 
      });
    }

  } catch (error: any) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: "I'm having a little trouble connecting right now. Please try again!" },
      { status: 500 }
    );
  }
}

function isOffTopic(message: string): string | null {
  const lower = message.toLowerCase();
  
  // Detect off-topic questions
  const offTopicPatterns = [
    /what is \d+\s*[\+\-\*\/]/,  // Math
    /write (a |an )?code/,  // Coding
    /who (is|was|are) (the )?(?!neighbourfriendly|shakeeb|haashid|sinan|founder)/,  // General knowledge (allow founder questions)
    /what (is|are) (the )?(capital|president|prime minister)/,  // Geography/Politics
    /tell me about (?!(nfr|neighbourfriendly|rent|platform|shakeeb|drill))/,  // General topics
    /translate|weather|recipe|joke/,  // Other topics
  ];

  for (const pattern of offTopicPatterns) {
    if (pattern.test(lower)) {
      return "I'm specifically designed to help with NeighbourFriendly platform questions! 🏠 \n\nI can assist with:\n• Finding items/services/properties to rent\n• Listing your own items\n• Understanding how our platform works\n\nWhat would you like to know about NFR?";
    }
  }

  return null;
}

function getFallbackResponse(message: string): string {
  const lower = message.toLowerCase();

  if (lower.match(/^(hi|hello|hey|good morning|good afternoon)/)) {
    return "Hi! 👋 I'm your NeighbourFriendly assistant. I can help you browse items, list your own, or find properties and services. What can I help you with today?";
  }

  if (lower.includes('shakeeb') || lower.includes('founder') || lower.includes('drill')) {
      return "NFR was founded by Mohammed Shakeeb after he couldn't find a simple drill to borrow in his neighborhood! He realized we own too much and share too little. Co-founders Muhammad Haashid and Mohammed Sinan joined him to build this platform.";
  }

  if (lower.includes('camera') || lower.includes('photography')) {
    return "Looking for cameras? 📷 Check out our photography equipment at /listings! We have DSLRs, GoPros, and lenses available for rent. Most are ₹500-2000/day.";
  }

  if (lower.includes('property') || lower.includes('flat') || lower.includes('apartment')) {
    return "Looking for a property? 🏠 Visit /properties to browse flats, houses, and PG accommodations. Filter by price, location, and amenities!";
  }

  if (lower.includes('service') || lower.includes('event')) {
    return "Need service providers? 🎉 Visit /services to find photographers, caterers, DJs, and more for your events!";
  }

  if (lower.includes('list') || lower.includes('add') || lower.includes('earn')) {
    return "Want to list something? 📝 Go to /add-item to list items, /add-service for services, or /add-property for properties. Start earning today!";
  }

  if (lower.includes('premium') || lower.includes('subscription')) {
    return "Go Premium for ₹499/month! 👑 Get featured listings, unlimited posts, and a verified badge. Check it out at /premium.";
  }

  if (lower.includes('contact') || lower.includes('support') || lower.includes('help')) {
    return "Need help? 📞 Contact our support team at support@neighbourfriendly.in or visit /contact!";
  }

  return "I'm here to help with NeighbourFriendly! 🏠 Ask me about renting items, listing your stuff, finding properties, or how our platform works!";
}
