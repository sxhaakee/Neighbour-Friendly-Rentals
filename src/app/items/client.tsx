'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Search, MapPin, Smartphone, Camera, PenTool as Tool, Dumbbell, Music, Sofa, Book, Shirt, PartyPopper, Gamepad2, Tent, Baby, Package } from 'lucide-react';
import { motion } from 'framer-motion';
import { listingService } from '@/services/listingService';
import { Database } from '@/lib/database.types';
import { SearchFilters, FilterValues } from '@/components/SearchFilters';
import { formatPricingModel } from '@/utils/pricing';

type Listing = Database['public']['Tables']['listings']['Row'];

const ItemsClient = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [listings, setListings] = useState<Listing[]>([]);
    const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState(searchParams?.get('search') || '');
    const [maxPrice, setMaxPrice] = useState(10000);
    const [loading, setLoading] = useState(true);
    const [userLocation, setUserLocation] = useState<string>('');
    const [sortBy, setSortBy] = useState<'relevance' | 'price-low' | 'price-high' | 'distance'>('relevance');

    const itemCategories = [
        { name: 'All', icon: Package, color: 'bg-amber-100 text-amber-600' },
        { name: 'Electronics', icon: Smartphone, color: 'bg-purple-100 text-purple-600' },
        { name: 'Cameras & Photography', icon: Camera, color: 'bg-indigo-100 text-indigo-600' },
        { name: 'Tools & Equipment', icon: Tool, color: 'bg-blue-100 text-blue-600' },
        { name: 'Sports & Fitness', icon: Dumbbell, color: 'bg-red-100 text-red-600' },
        { name: 'Musical Instruments', icon: Music, color: 'bg-pink-100 text-pink-600' },
        { name: 'Furniture', icon: Sofa, color: 'bg-orange-100 text-orange-600' },
        { name: 'Books', icon: Book, color: 'bg-amber-100 text-amber-600' },
        { name: 'Media', icon: Book, color: 'bg-amber-100 text-amber-600' },
        { name: 'Clothing & Accessories', icon: Shirt, color: 'bg-amber-100 text-amber-600' },
        { name: 'Party & Events', icon: PartyPopper, color: 'bg-yellow-100 text-yellow-600' },
        { name: 'Gaming & Consoles', icon: Gamepad2, color: 'bg-violet-100 text-violet-600' },
        { name: 'Outdoor & Camping', icon: Tent, color: 'bg-amber-100 text-amber-600' },
        { name: 'Baby & Kids', icon: Baby, color: 'bg-rose-100 text-rose-600' },
    ];

    useEffect(() => {
        fetchListings();
        getUserLocation();
    }, []);

    useEffect(() => {
        filterListings();
    }, [listings, selectedCategory, searchQuery, maxPrice, sortBy, userLocation]);

    const fetchListings = async () => {
        try {
            setLoading(true);
            const data = await listingService.getApprovedListings();
            setListings(data);
        } catch (error) {
            console.error('Error fetching listings:', error);
        } finally {
            setLoading(false);
        }
    };

    const getUserLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    // For demo purposes, we'll use a placeholder location
                    // In production, you'd reverse geocode the coordinates
                    setUserLocation('Current Location');
                },
                (error) => {
                    console.log('Location access denied:', error);
                }
            );
        }
    };

    const calculateDistance = (location1: string, location2: string): number => {
        // Simple string similarity for demo - in production use actual geocoding
        const loc1 = location1.toLowerCase();
        const loc2 = location2.toLowerCase();

        if (loc1 === loc2) return 0;
        if (loc1.includes(loc2) || loc2.includes(loc1)) return 1;

        // Extract city names and compare
        const city1 = loc1.split(',')[0].trim();
        const city2 = loc2.split(',')[0].trim();

        if (city1 === city2) return 2;
        return 10;
    };

    const filterListings = () => {
        let filtered = listings;

        if (selectedCategory !== 'All') {
            filtered = filtered.filter(item => item.category === selectedCategory);
        }

        if (searchQuery) {
            filtered = filtered.filter(item =>
                item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.location.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        filtered = filtered.filter(item => item.price <= maxPrice);

        // Sort listings - OLX/JustDial style: Featured items first!
        filtered.sort((a, b) => {
            // First priority: Featured items come first
            const aFeatured = (a as any).featured || false;
            const bFeatured = (b as any).featured || false;

            if (aFeatured && !bFeatured) return -1;
            if (!aFeatured && bFeatured) return 1;

            // Second priority: Apply user's selected sort
            if (sortBy === 'price-low') {
                return a.price - b.price;
            } else if (sortBy === 'price-high') {
                return b.price - a.price;
            } else if (sortBy === 'distance' && userLocation) {
                const distA = calculateDistance(userLocation, a.location);
                const distB = calculateDistance(userLocation, b.location);
                return distA - distB;
            }

            // Default: Most recent first
            const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
            const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
            return dateB - dateA;
        });

        setFilteredListings(filtered);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-yellow-50">
            <div className="max-w-7xl mx-auto px-4 py-4 lg:py-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-4 lg:mb-12"
                >
                    <h1 className="text-2xl lg:text-4xl font-bold mb-2 lg:mb-4"><span className="bg-gradient-to-r from-amber-600 via-yellow-600 to-orange-600 bg-clip-text text-transparent">Browse</span> Rentals</h1>
                    <p className="text-lg lg:text-xl text-gray-600">Find the perfect item to rent from your neighbors</p>
                </motion.div>

                {/* Tabs */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="flex justify-center gap-2 mb-4 lg:mb-8"
                >
                    <button
                        className="px-6 py-3 rounded-lg font-semibold transition-all bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 text-white shadow-lg hover:shadow-xl"
                    >
                        📦 Items
                    </button>
                    <Link
                        href="/services"
                        className="px-6 py-3 rounded-lg font-semibold transition-all bg-white text-gray-700 hover:bg-amber-50 border border-yellow-200"
                    >
                        🛠️ Services
                    </Link>
                    <Link
                        href="/properties"
                        className="px-6 py-3 rounded-lg font-semibold transition-all bg-white text-gray-700 hover:bg-amber-50 border border-yellow-200"
                    >
                        🏠 Properties
                    </Link>
                </motion.div>

                {/* Categories Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="mb-4 lg:mb-8"
                >
                    <div className="bg-gradient-to-br from-white to-amber-50 rounded-2xl shadow-lg border border-yellow-100 p-4 lg:p-6">
                        <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-3 lg:mb-4">Browse by Category</h3>
                        <div className="flex lg:grid lg:grid-cols-7 overflow-x-auto lg:overflow-visible gap-3 pb-2 lg:pb-0 scrollbar-hide -mx-2 px-2 lg:mx-0 lg:px-0">
                            {itemCategories.map((category) => (
                                <motion.button
                                    key={category.name}
                                    whileHover={{ y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setSelectedCategory(category.name)}
                                    className={`p-3 rounded-lg transition-all flex-shrink-0 min-w-[100px] lg:min-w-0 ${selectedCategory === category.name
                                        ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-md'
                                        : 'bg-white hover:bg-amber-50 border border-gray-200'
                                        }`}
                                >
                                    <div className="flex flex-col items-center gap-2">
                                        <category.icon className="w-5 h-5" />
                                        <span className="text-xs font-medium text-center line-clamp-2">{category.name}</span>
                                    </div>
                                </motion.button>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Search and Filters */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gradient-to-br from-white to-amber-50 rounded-2xl shadow-lg border border-yellow-100 p-4 lg:p-6 mb-4 lg:mb-8"
                >
                    <div className="flex items-center gap-4 mb-4 lg:mb-6">
                        {/* Search */}
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search items or location..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                            />
                        </div>

                        {/* Advanced Filters */}
                        <SearchFilters
                            onApplyFilters={(filters: FilterValues) => {
                                if (filters.category) setSelectedCategory(filters.category);
                                if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
                                    setMaxPrice(filters.priceMax || 10000);
                                }
                                if (filters.sortBy) {
                                    const sortMap: Record<string, string> = {
                                        newest: 'relevance',
                                        price_low: 'price-low',
                                        price_high: 'price-high',
                                        popular: 'relevance'
                                    };
                                    setSortBy(sortMap[filters.sortBy] as any);
                                }
                            }}
                            onReset={() => {
                                setSelectedCategory('All');
                                setMaxPrice(10000);
                                setSortBy('relevance');
                            }}
                        />
                    </div>

                    {/* Price Range - Hidden on Mobile to save space (accessible via Filters) */}
                    <div className="hidden md:block">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Max Price: ₹{maxPrice}
                        </label>
                        <input
                            type="range"
                            min="0"
                            max="10000"
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(Number(e.target.value))}
                            className="w-full accent-amber-500"
                        />
                    </div>
                </motion.div>

                {/* Results Count */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="mb-4"
                >
                    <p className="text-gray-600">
                        Showing <span className="font-semibold">{filteredListings.length}</span> items
                    </p>
                </motion.div>

                {/* Listings Grid */}
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
                    </div>
                ) : filteredListings.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-gray-600 text-lg">No items found matching your criteria</p>
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3"
                    >
                        {filteredListings.map((item, index) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: Math.min(index * 0.05, 0.5) }}
                                whileHover={{ y: -3 }}
                                onClick={() => router.push(`/items/${item.id}`)}
                                className="bg-gradient-to-br from-white to-amber-50 rounded-lg shadow-md border border-yellow-100 hover:shadow-lg transition-all duration-200 overflow-hidden cursor-pointer group flex flex-col"
                            >
                                <div className="relative overflow-hidden">
                                    <img
                                        src={(item.images && item.images[0]) || '/placeholder.jpg'}
                                        alt={item.title}
                                        className="w-full h-32 sm:h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                    {/* Featured Badge - OLX/JustDial Style */}
                                    {(item as any).featured && (
                                        <div className="absolute top-2 left-2">
                                            <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded text-xs font-bold shadow-lg flex items-center gap-1">
                                                ⭐ FEATURED
                                            </span>
                                        </div>
                                    )}
                                    {!(item as any).featured && (
                                        <div className="absolute top-2 left-2">
                                            <span className="bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 text-white px-1.5 py-0.5 rounded text-xs font-semibold">
                                                {item.category}
                                            </span>
                                        </div>
                                    )}
                                    {item.availability === 'Available' && (
                                        <div className="absolute top-2 right-2">
                                            <span className="bg-amber-500 text-white px-1.5 py-0.5 rounded text-xs font-semibold">
                                                ✓
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="p-2 sm:p-3 flex flex-col h-full">
                                    <h3 className="font-semibold text-sm text-gray-900 mb-1 line-clamp-2 group-hover:text-amber-600 transition-colors min-h-[2.5rem]">
                                        {item.title}
                                    </h3>
                                    <p className="text-xs text-gray-500 mb-2 truncate">by {item.owner_name}</p>

                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-base sm:text-lg font-bold text-amber-600">
                                            ₹{item.price}<span className="text-xs text-gray-500">{formatPricingModel(item.pricing_model)}</span>
                                        </span>
                                    </div>

                                    <div className="flex items-center text-gray-500 mb-3">
                                        <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                                        <span className="text-xs truncate">{item.location}</span>
                                    </div>

                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            router.push(`/items/${item.id}`);
                                        }}
                                        className="w-full bg-amber-100 text-gray-900 py-1.5 sm:py-2 rounded text-xs sm:text-sm font-semibold hover:bg-amber-200 transition-colors mt-auto"
                                    >
                                        View
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default ItemsClient;
