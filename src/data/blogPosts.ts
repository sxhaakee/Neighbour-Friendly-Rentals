export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  readTime: string;
  image: string;
  tags: string[];
}

export const blogPosts: BlogPost[] = [
  {
    id: '1',
    slug: 'how-average-bangalore-household-sitting-on-20000-rental-income',
    title: 'How the Average Bangalore Household is Sitting on ₹20,000 of Rental Income',
    excerpt: 'Take a look inside your storage loft. That dusty DSLR or unused tent could be paying your electricity bill. Here is how Bangaloreans are monetizing clutter.',
    author: 'NFR Team',
    date: 'February 1, 2026',
    readTime: '5 min read',
    image: '/blog/camera-rental-bangalore.png',
    tags: ['Passive Income', 'Bangalore', 'Side Hustle'],
    content: `
      <p class="lead text-xl text-gray-600 mb-8">Take a look inside your storage loft or that "junk drawer" in your kitchen. What do you see? A power drill you used once during the lockdown? A DSLR camera from your last trip to Coorg that's been sleeping in its bag? A camping tent that hasn’t seen the sun since your Nandi Hills sunrise plan got cancelled?</p>

      <p>In Bangalore, space is expensive—whether you're in a cozy flat in HSR Layout or a villa in Whitefield—yet we fill our homes with things we rarely use. At NFR, we did the math: the average household in neighborhoods like Koramangala or Indiranagar is sitting on nearly <strong>₹20,000 worth of "idle assets."</strong></p>

      <p>Here is how you can turn that clutter into a monthly paycheck, safely and easily.</p>

      <h2 class="text-2xl font-bold text-gray-900 mt-8 mb-4">The 'Rent-out' Checklist: What actually makes money?</h2>
      <p>You might think, "Who wants my old stuff?" You'd be surprised. In a city of startups, creators, and weekend travelers, buying new is out; renting is in. Here are the top categories seeing massive demand right now:</p>
      <ul class="list-disc pl-6 space-y-2 mb-6">
        <li><strong>Photography Gear:</strong> DSLRs, GoPros, and even ring lights. Everyone needs these for a weekend shoot or a birthday party but nobody wants to spend ₹50k to buy one.</li>
        <li><strong>DIY Tools:</strong> Power drills, ladders, and Sanders. People moving into new flats in Bellandur need these for just one day.</li>
        <li><strong>Travel & Trekking:</strong> Tents, rucksacks, and portable stoves. Perfect for those spontaneous trips to Gokarna or Ooty.</li>
        <li><strong>Party Essentials:</strong> Projectors, speakers, and barbecue grills. Essential for terrace parties!</li>
      </ul>

      <h2 class="text-2xl font-bold text-gray-900 mt-8 mb-4">"But is it safe?" (The Trust Factor)</h2>
      <p>We get it. The idea of handing over your expensive camera to a stranger feels scary. When we started NFR, ensuring <strong>trust</strong> was our #1 obsession. We didn't want this to be just a classifieds site; we wanted it to be a secure community.</p>
      
      <p>That’s why we built <strong>Digital Rental Agreements</strong> right into the platform. Every rental on NFR comes with:</p>
      <ul class="list-disc pl-6 space-y-2 mb-6">
        <li><strong>Verified Users:</strong> We check IDs so you know who you're dealing with.</li>
        <li><strong>Smart Contracts:</strong> A clear record of conditions and return dates.</li>
        <li><strong>Secure Payments:</strong> Money is held safely until the rental starts.</li>
      </ul>
      <p>It’s safer than lending a book to that friend who never returns it!</p>

      <h2 class="text-2xl font-bold text-gray-900 mt-8 mb-4">The Community Factor</h2>
      <p>It’s not just about the money. Renting out your gear connects you with your neighbors. You might be helping a student film their final project, a fellow founder prototype their device, or a family have a memorable camping trip.</p>
      <p>One of our users in Jayanagar rented his projector to a neighbor for a cricket match screening. He ended up getting invited to the party! That's the NFR spirit—safe, profit-making, but community-first.</p>

      <h2 class="text-2xl font-bold text-gray-900 mt-8 mb-4">How to List in 2 Minutes</h2>
      <p>Ready to unlock that ₹20,000? It’s easier than ordering a masala dosa on Swiggy.</p>
      <ol class="list-decimal pl-6 space-y-2 mb-8">
        <li><strong>Snap a Photo:</strong> Use good lighting. Show the item clearly.</li>
        <li><strong>Set a Price:</strong> Check what others possess, or use our suggested pricing (usually 5-10% of the item's value per day).</li>
        <li><strong>Publish:</strong> Hit list, and you're live to neighbors within 5km!</li>
      </ol>

      <div class="bg-amber-50 border-l-4 border-amber-500 p-6 rounded-r-lg mt-8">
        <h3 class="font-bold text-amber-900 text-lg mb-2">Got a Drill or Camera Lying Around?</h3>
        <p class="text-amber-800 mb-4">Don't let it rust, let it earn. Pass that idle asset to a neighbor who needs it.</p>
        <a href="/add-item" class="inline-block bg-amber-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-amber-700 transition-colors">
          List Your Item Now
        </a>
      </div>
    `
  },
  {
    id: '2',
    slug: 'top-5-high-demand-rental-items-bangalore-2026',
    title: 'Top 5 High-Demand Rental Items in Bangalore for 2026',
    excerpt: 'Want to make extra cash? Here are the most searched-for rental items in Bangalore right now, from party gear to travel essentials.',
    author: 'NFR Team',
    date: 'February 15, 2026',
    readTime: '4 min read',
    image: '/blog/rental-items-bangalore.png', // You might need to generate or add this image
    tags: ['Trends', 'Side Income', 'Bangalore'],
    content: `
      <p class="lead text-xl text-gray-600 mb-8">Bangalore is a city that never stops moving. Whether it's weekend treks to Skandagiri, terrace parties in Indiranagar, or DIY home improvement projects in Whitefield, the demand for short-term rentals is exploding. But what exactly are people looking for?</p>

      <p>We analyzed search data from thousands of NFR users to bring you the definitive list of high-demand items for 2026. If you have any of these gathering dust, you're sitting on a goldmine.</p>

      <h2 class="text-2xl font-bold text-gray-900 mt-8 mb-4">1. Action Cameras (GoPro / Insta360)</h2>
      <p><strong>Why:</strong> The travel bug has bitten hard. Everyone wants to document their trips to Bali or their bike rides to Nandi Hills, but buying a ₹40,000 camera for one trip doesn't make sense.</p>
      <p><strong>Potential Earnings:</strong> ₹500 - ₹800 per day.</p>
      
      <h2 class="text-2xl font-bold text-gray-900 mt-8 mb-4">2. Party Speakers (JBL PartyBox / Sony)</h2>
      <p><strong>Why:</strong> House parties are the new clubbing. A powerful Bluetooth speaker with lights can transform a living room into a dance floor.</p>
      <p><strong>Potential Earnings:</strong> ₹1,000 - ₹2,000 per weekend.</p>

      <h2 class="text-2xl font-bold text-gray-900 mt-8 mb-4">3. Trekking Gear (Tents & Rucksacks)</h2>
      <p><strong>Why:</strong> Decathlon is great, but renting is better for one-off trips. 4-person tents and high-capacity rucksacks are always in short supply during long weekends.</p>
      <p><strong>Potential Earnings:</strong> ₹300 - ₹600 per day.</p>

      <h2 class="text-2xl font-bold text-gray-900 mt-8 mb-4">4. Projectors</h2>
      <p><strong>Why:</strong> IPL season, movie nights, or romantic rooftop dates. A projector is a "nice to have" that people love to rent for special occasions.</p>
      <p><strong>Potential Earnings:</strong> ₹800 - ₹1,500 per day.</p>

      <h2 class="text-2xl font-bold text-gray-900 mt-8 mb-4">5. Power Tools (Drills & Sanders)</h2>
      <p><strong>Why:</strong> Influenced by Pinterest, many Bangaloreans are taking up DIY furniture projects. They need heavy-duty tools for a day or two, not a lifetime.</p>
      <p><strong>Potential Earnings:</strong> ₹200 - ₹500 per day.</p>

      <div class="bg-amber-50 border-l-4 border-amber-500 p-6 rounded-r-lg mt-8">
        <h3 class="font-bold text-amber-900 text-lg mb-2">Own any of these?</h3>
        <p class="text-amber-800 mb-4">List them on NFR today and start earning by the weekend. It's safe, secure, and helps your neighbors.</p>
        <a href="/add-item" class="inline-block bg-amber-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-amber-700 transition-colors">
          List Your Item Now
        </a>
      </div>
    `
  }
];
