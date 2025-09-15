export interface Listing {
  id: number;
  title: string;
  category: string;
  price: number;
  originalPrice: number;
  image: string;
  images: string[];
  distance: string;
  rating: number;
  reviewCount: number;
  owner: string;
  ownerAvatar: string;
  location: string;
  postedDate: string;
  availability: string;
  condition: string;
  description: string;
  features: string[];
  specifications: Record<string, string>;
  rentalTerms: string[];
  reviews: Array<{
    id: number;
    user: string;
    rating: number;
    date: string;
    comment: string;
  }>;
}

export const listings: Listing[] = [
  {
    id: 1,
    title: 'Professional Power Drill Set',
    category: 'Tools',
    price: 1245,
    originalPrice: 15000,
    image: 'https://images.pexels.com/photos/162553/keys-workshop-mechanic-tools-162553.jpeg?auto=compress&cs=tinysrgb&w=400',
    images: [
      'https://images.pexels.com/photos/162553/keys-workshop-mechanic-tools-162553.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/162553/keys-workshop-mechanic-tools-162553.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/162553/keys-workshop-mechanic-tools-162553.jpeg?auto=compress&cs=tinysrgb&w=400'
    ],
    distance: '0.5 miles',
    rating: 4.8,
    reviewCount: 24,
    owner: 'Mike Johnson',
    ownerAvatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150',
    location: 'Downtown Area, Mumbai',
    postedDate: '2 days ago',
    availability: 'Available now',
    condition: 'Excellent',
    description: 'Professional-grade power drill set with multiple bits and accessories. Perfect for home improvement projects and professional use. Includes carrying case and all necessary attachments. This drill set is ideal for both beginners and professionals.',
    features: [
      'Variable speed control',
      'LED work light',
      'Keyless chuck',
      'Ergonomic grip',
      'Battery indicator',
      'Carrying case included'
    ],
    specifications: {
      'Power': '18V',
      'Battery Life': '2-3 hours continuous use',
      'Chuck Size': '13mm',
      'Weight': '1.2 kg',
      'Warranty': '1 year',
      'Brand': 'Bosch'
    },
    rentalTerms: [
      'Minimum rental period: 1 day',
      'Maximum rental period: 30 days',
      'Security deposit: ₹2,000',
      'Free delivery within 5km',
      '24/7 customer support',
      'Full refund if not satisfied'
    ],
    reviews: [
      {
        id: 1,
        user: 'Sarah Chen',
        rating: 5,
        date: '1 week ago',
        comment: 'Excellent drill set! Very powerful and easy to use. Mike was very helpful with delivery.'
      },
      {
        id: 2,
        user: 'David Wilson',
        rating: 4,
        date: '2 weeks ago',
        comment: 'Great quality tools. The battery lasted longer than expected. Would definitely rent again.'
      }
    ]
  },
  {
    id: 2,
    title: 'Vintage Road Bicycle',
    category: 'Vehicles',
    price: 1660,
    originalPrice: 25000,
    image: 'https://images.pexels.com/photos/100582/pexels-photo-100582.jpeg?auto=compress&cs=tinysrgb&w=400',
    images: [
      'https://images.pexels.com/photos/100582/pexels-photo-100582.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/100582/pexels-photo-100582.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/100582/pexels-photo-100582.jpeg?auto=compress&cs=tinysrgb&w=400'
    ],
    distance: '0.8 miles',
    rating: 4.9,
    reviewCount: 18,
    owner: 'Sarah Chen',
    ownerAvatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150',
    location: 'Suburban Area, Mumbai',
    postedDate: '1 day ago',
    availability: 'Available now',
    condition: 'Very Good',
    description: 'Beautiful vintage road bicycle in excellent condition. Perfect for city commuting and weekend rides. Recently serviced with new tires and brake pads. This classic bike offers a smooth and comfortable riding experience.',
    features: [
      'Lightweight aluminum frame',
      '21-speed gear system',
      'Disc brakes',
      'Comfortable saddle',
      'LED headlight',
      'Water bottle holder'
    ],
    specifications: {
      'Frame': 'Aluminum',
      'Gears': '21-speed',
      'Wheel Size': '26 inches',
      'Weight': '12.5 kg',
      'Brakes': 'Disc brakes',
      'Brand': 'Trek'
    },
    rentalTerms: [
      'Minimum rental period: 1 day',
      'Maximum rental period: 14 days',
      'Security deposit: ₹3,000',
      'Helmet included',
      'Free delivery within 10km',
      '24/7 roadside assistance'
    ],
    reviews: [
      {
        id: 1,
        user: 'Alex Kumar',
        rating: 5,
        date: '3 days ago',
        comment: 'Amazing bike! Very smooth ride and well maintained. Sarah was great to deal with.'
      },
      {
        id: 2,
        user: 'Priya Sharma',
        rating: 5,
        date: '1 week ago',
        comment: 'Perfect for weekend rides. The bike is in excellent condition and very comfortable.'
      }
    ]
  },
  {
    id: 3,
    title: 'Canon DSLR Camera',
    category: 'Electronics',
    price: 3735,
    originalPrice: 45000,
    image: 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=400',
    images: [
      'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=400'
    ],
    distance: '1.2 miles',
    rating: 5.0,
    reviewCount: 32,
    owner: 'David Wilson',
    ownerAvatar: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=150',
    location: 'Tech Park, Mumbai',
    postedDate: '3 days ago',
    availability: 'Available now',
    condition: 'Excellent',
    description: 'Professional Canon DSLR camera with 24.2MP sensor and 4K video recording. Perfect for photography enthusiasts and professionals. Includes multiple lenses and accessories. This camera delivers stunning image quality and professional results.',
    features: [
      '24.2MP APS-C sensor',
      '4K video recording',
      'Wi-Fi connectivity',
      'Touch screen display',
      'Image stabilization',
      'Multiple shooting modes'
    ],
    specifications: {
      'Sensor': '24.2MP APS-C',
      'Video': '4K at 30fps',
      'ISO Range': '100-25600',
      'Battery Life': '600 shots',
      'Weight': '485g',
      'Brand': 'Canon EOS'
    },
    rentalTerms: [
      'Minimum rental period: 1 day',
      'Maximum rental period: 7 days',
      'Security deposit: ₹5,000',
      'Memory card included',
      'Free delivery within 15km',
      'Professional support available'
    ],
    reviews: [
      {
        id: 1,
        user: 'Emma Davis',
        rating: 5,
        date: '2 days ago',
        comment: 'Outstanding camera! The image quality is incredible. David provided excellent support.'
      },
      {
        id: 2,
        user: 'Mike Johnson',
        rating: 5,
        date: '1 week ago',
        comment: 'Perfect for professional photography. The camera is in mint condition.'
      }
    ]
  },
  {
    id: 4,
    title: 'Camping Tent 4-Person',
    category: 'Miscellaneous',
    price: 2075,
    originalPrice: 12000,
    image: 'https://images.pexels.com/photos/2398220/pexels-photo-2398220.jpeg?auto=compress&cs=tinysrgb&w=400',
    images: [
      'https://images.pexels.com/photos/2398220/pexels-photo-2398220.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/2398220/pexels-photo-2398220.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/2398220/pexels-photo-2398220.jpeg?auto=compress&cs=tinysrgb&w=400'
    ],
    distance: '0.3 miles',
    rating: 4.7,
    reviewCount: 15,
    owner: 'Emma Davis',
    ownerAvatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150',
    location: 'Beach Area, Mumbai',
    postedDate: '4 days ago',
    availability: 'Available now',
    condition: 'Good',
    description: 'Spacious 4-person camping tent perfect for outdoor adventures. Waterproof and wind-resistant design. Easy to set up and includes all necessary accessories. Ideal for family camping trips and outdoor events.',
    features: [
      'Waterproof material',
      'Wind-resistant design',
      'Easy setup (5 minutes)',
      'Mesh windows',
      'Carrying bag included',
      'Guy ropes included'
    ],
    specifications: {
      'Capacity': '4 people',
      'Material': 'Polyester',
      'Weight': '3.2 kg',
      'Dimensions': '240x240x140 cm',
      'Waterproof': '2000mm',
      'Brand': 'Coleman'
    },
    rentalTerms: [
      'Minimum rental period: 2 days',
      'Maximum rental period: 14 days',
      'Security deposit: ₹1,500',
      'Setup guide included',
      'Free delivery within 20km',
      'Cleaning service available'
    ],
    reviews: [
      {
        id: 1,
        user: 'Alex Kumar',
        rating: 4,
        date: '1 week ago',
        comment: 'Great tent for camping! Easy to set up and very spacious. Emma was helpful with instructions.'
      },
      {
        id: 2,
        user: 'Sarah Chen',
        rating: 5,
        date: '2 weeks ago',
        comment: 'Perfect for our family camping trip. The tent kept us dry during the rain.'
      }
    ]
  },
  {
    id: 5,
    title: 'Gaming Console',
    category: 'Electronics',
    price: 1494,
    originalPrice: 35000,
    image: 'https://images.pexels.com/photos/4522994/pexels-photo-4522994.jpeg?auto=compress&cs=tinysrgb&w=400',
    images: [
      'https://images.pexels.com/photos/4522994/pexels-photo-4522994.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/4522994/pexels-photo-4522994.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/4522994/pexels-photo-4522994.jpeg?auto=compress&cs=tinysrgb&w=400'
    ],
    distance: '0.7 miles',
    rating: 4.6,
    reviewCount: 28,
    owner: 'Alex Kumar',
    ownerAvatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150',
    location: 'Gaming District, Mumbai',
    postedDate: '1 day ago',
    availability: 'Available now',
    condition: 'Excellent',
    description: 'Latest gaming console with 4K gaming capabilities and ultra-fast SSD storage. Perfect for gaming enthusiasts. Includes multiple controllers and popular games. Experience next-generation gaming with stunning graphics and smooth performance.',
    features: [
      '4K gaming support',
      'Ultra-fast SSD',
      'Ray tracing technology',
      'Multiple controllers',
      'Popular games included',
      'Online multiplayer'
    ],
    specifications: {
      'Storage': '1TB SSD',
      'Graphics': '4K capable',
      'Controllers': '2 included',
      'Games': '5 popular titles',
      'Weight': '4.5 kg',
      'Brand': 'PlayStation 5'
    },
    rentalTerms: [
      'Minimum rental period: 1 day',
      'Maximum rental period: 7 days',
      'Security deposit: ₹4,000',
      'Games included',
      'Free delivery within 10km',
      'Technical support available'
    ],
    reviews: [
      {
        id: 1,
        user: 'David Wilson',
        rating: 4,
        date: '3 days ago',
        comment: 'Great gaming console! The graphics are amazing. Alex was very helpful with setup.'
      },
      {
        id: 2,
        user: 'Emma Davis',
        rating: 5,
        date: '1 week ago',
        comment: 'Perfect for weekend gaming sessions. The console is in excellent condition.'
      }
    ]
  },
  {
    id: 6,
    title: 'Office Chair',
    category: 'Furniture',
    price: 2490,
    originalPrice: 18000,
    image: 'https://images.pexels.com/photos/276583/pexels-photo-276583.jpeg?auto=compress&cs=tinysrgb&w=400',
    images: [
      'https://images.pexels.com/photos/276583/pexels-photo-276583.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/276583/pexels-photo-276583.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/276583/pexels-photo-276583.jpeg?auto=compress&cs=tinysrgb&w=400'
    ],
    distance: '1.0 miles',
    rating: 4.5,
    reviewCount: 12,
    owner: 'Priya Sharma',
    ownerAvatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150',
    location: 'Business District, Mumbai',
    postedDate: '5 days ago',
    availability: 'Available now',
    condition: 'Very Good',
    description: 'Ergonomic office chair with lumbar support and adjustable height. Perfect for home office or workspace. Breathable mesh back and comfortable cushioning. This chair provides excellent support for long working hours.',
    features: [
      'Lumbar support',
      'Adjustable height',
      'Breathable mesh back',
      '360-degree swivel',
      'Armrests included',
      'Easy assembly'
    ],
    specifications: {
      'Material': 'Mesh and foam',
      'Weight Capacity': '120 kg',
      'Height Range': '45-55 cm',
      'Weight': '15 kg',
      'Warranty': '2 years',
      'Brand': 'Herman Miller'
    },
    rentalTerms: [
      'Minimum rental period: 7 days',
      'Maximum rental period: 30 days',
      'Security deposit: ₹2,500',
      'Assembly service included',
      'Free delivery within 15km',
      'Cleaning service available'
    ],
    reviews: [
      {
        id: 1,
        user: 'Mike Johnson',
        rating: 4,
        date: '1 week ago',
        comment: 'Very comfortable chair! Great for long work sessions. Priya was professional and helpful.'
      },
      {
        id: 2,
        user: 'Alex Kumar',
        rating: 5,
        date: '2 weeks ago',
        comment: 'Excellent ergonomic support. The chair is in great condition and very comfortable.'
      }
    ]
  }
];

export const getListingById = (id: number): Listing | undefined => {
  return listings.find(listing => listing.id === id);
};
