'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Package, Briefcase, Home, MapPin, Filter, X } from 'lucide-react';
import { listingService } from '@/services/listingService';
import { serviceProviderService } from '@/services/serviceProviderService';
import { propertyService } from '@/services/propertyService';
import { formatPricingModel } from '@/utils/pricing';

type Tab = 'items' | 'services' | 'properties';

export default function ListingsClient() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [activeTab, setActiveTab] = useState<Tab>('items');
    const [searchQuery, setSearchQuery] = useState('');
    const [category, setCategory] = useState('');
    const [location, setLocation] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    const [items, setItems] = useState<any[]>([]);
    const [services, setServices] = useState<any[]>([]);
    const [properties, setProperties] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const tab = searchParams.get('tab') as Tab;
        const search = searchParams.get('search');

        if (tab && ['items', 'services', 'properties'].includes(tab)) {
            setActiveTab(tab);
        }
        if (search) {
            setSearchQuery(search);
        }
    }, [searchParams]);

    useEffect(() => {
        fetchListings();
    }, [activeTab, searchQuery, category, location]);

    const fetchListings = async () => {
        setLoading(true);
        try {
            if (activeTab === 'items') {
                const data = await listingService.getApprovedListings();
                setItems(filterData(data));
            } else if (activeTab === 'services') {
                const data = await serviceProviderService.getAllProviders();
                setServices(filterData(data));
            } else if (activeTab === 'properties') {
                const data = await propertyService.getAllProperties();
                setProperties(filterData(data));
            }
        } catch (error) {
            console.error('Error fetching listings:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterData = (data: any[]) => {
        return data.filter(item => {
            // Enhanced search: match title, business name, description, OR category
            const matchesSearch = !searchQuery ||
                item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.business_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.category?.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesCategory = !category || item.category === category;

            const matchesLocation = !location ||
                item.location?.toLowerCase().includes(location.toLowerCase()) ||
                item.city?.toLowerCase().includes(location.toLowerCase());

            return matchesSearch && matchesCategory && matchesLocation;
        });
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchListings();
    };

    const clearFilters = () => {
        setSearchQuery('');
        setCategory('');
        setLocation('');
    };

    const renderItems = () => {
        if (loading) {
            return (
                <div className="flex justify-center py-20">
                    <div className="w-16 h-16 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin"></div>
                </div>
            );
        }

        if (items.length === 0) {
            return (
                <div className="text-center py-20">
                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No items found</h3>
                    <p className="text-gray-500">Try adjusting your search criteria</p>
                </div>
            );
        }

        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {items.map((item: any) => (
                    <div
                        key={item.id}
                        onClick={() => router.push(`/items/${item.id}`)}
                        className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 group"
                    >
                        <div className="relative aspect-[4/3] overflow-hidden">
                            <img
                                src={item.images?.[0] || '/placeholder.jpg'}
                                alt={item.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                            <div className="absolute top-3 left-3">
                                <span className="bg-white/90 backdrop-blur-sm text-gray-900 px-3 py-1 rounded-full text-xs font-bold uppercase">
                                    {item.category}
                                </span>
                            </div>
                        </div>
                        <div className="p-5">
                            <h3 className="font-bold text-gray-900 mb-2 line-clamp-1">{item.title}</h3>
                            <p className="text-sm text-gray-500 mb-4 line-clamp-2">{item.description}</p>
                            <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                <div>
                                    <span className="text-xl font-black text-amber-600">
                                        ₹{item.price}
                                        <span className="text-xs font-medium text-gray-400">
                                            /{formatPricingModel(item.pricing_model)}
                                        </span>
                                    </span>
                                </div>
                                <div className="text-xs text-gray-500 flex items-center">
                                    <MapPin className="w-3 h-3 mr-1 text-amber-500" />
                                    {item.location?.split(',')[0]}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const renderServices = () => {
        if (loading) {
            return (
                <div className="flex justify-center py-20">
                    <div className="w-16 h-16 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin"></div>
                </div>
            );
        }

        if (services.length === 0) {
            return (
                <div className="text-center py-20">
                    <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No services found</h3>
                    <p className="text-gray-500">Try adjusting your search criteria</p>
                </div>
            );
        }

        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {services.map((service: any) => (
                    <div
                        key={service.id}
                        onClick={() => router.push(`/services/${service.id}`)}
                        className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 group"
                    >
                        <div className="relative aspect-video overflow-hidden">
                            <img
                                src={service.images?.[0] || '/placeholder.jpg'}
                                alt={service.business_name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                        </div>
                        <div className="p-6">
                            <div className="mb-3">
                                <span className="text-xs font-bold uppercase text-amber-600 bg-amber-50 px-2 py-1 rounded">
                                    {service.category}
                                </span>
                            </div>
                            <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-1">
                                {service.business_name}
                            </h3>
                            <p className="text-sm text-gray-500 mb-4 line-clamp-2">{service.description}</p>
                            <div className="flex items-center text-xs text-gray-500">
                                <MapPin className="w-3 h-3 mr-1 text-amber-500" />
                                {service.city}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const renderProperties = () => {
        if (loading) {
            return (
                <div className="flex justify-center py-20">
                    <div className="w-16 h-16 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin"></div>
                </div>
            );
        }

        if (properties.length === 0) {
            return (
                <div className="text-center py-20">
                    <Home className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No properties found</h3>
                    <p className="text-gray-500">Try adjusting your search criteria</p>
                </div>
            );
        }

        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((property: any) => (
                    <div
                        key={property.id}
                        onClick={() => router.push(`/properties/${property.id}`)}
                        className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 group"
                    >
                        <div className="relative aspect-[16/10] overflow-hidden">
                            <img
                                src={property.images?.[0] || '/placeholder.jpg'}
                                alt={property.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                            <div className="absolute bottom-4 left-4 right-4">
                                <div className="bg-white/95 backdrop-blur-sm p-3 rounded-xl">
                                    <span className="text-2xl font-black text-gray-900">
                                        ₹{property.rent_amount}
                                        <span className="text-xs font-normal text-gray-500">/mo</span>
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="p-6">
                            <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-1">{property.title}</h3>
                            <div className="flex items-center text-sm text-gray-500 mb-2">
                                <MapPin className="w-4 h-4 mr-1 text-amber-500" />
                                {property.city}
                            </div>
                            <span className="text-xs text-gray-400 uppercase">{property.property_type}</span>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-yellow-50 pt-24 pb-12 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-black text-gray-900 mb-2">Browse Listings</h1>
                    <p className="text-gray-600">Find items, services, and properties near you</p>
                </div>

                {/* Search and Filters */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
                    <form onSubmit={handleSearch} className="space-y-4">
                        <div className="flex gap-4">
                            <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 focus-within:bg-white focus-within:ring-2 focus-within:ring-amber-100">
                                <Search className="text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Search for anything..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="flex-1 bg-transparent text-gray-900 placeholder-gray-400 focus:outline-none"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowFilters(!showFilters)}
                                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-semibold flex items-center gap-2 transition-colors"
                            >
                                <Filter className="w-5 h-5" />
                                Filters
                            </button>
                            <button
                                type="submit"
                                className="px-8 py-3 bg-gradient-to-r from-amber-500 to-yellow-600 text-white rounded-xl font-bold hover:shadow-lg transition-all"
                            >
                                Search
                            </button>
                        </div>

                        {showFilters && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                                <input
                                    type="text"
                                    placeholder="Location"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-100"
                                />
                                <input
                                    type="text"
                                    placeholder="Category"
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-100"
                                />
                                <button
                                    type="button"
                                    onClick={clearFilters}
                                    className="px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                    Clear Filters
                                </button>
                            </div>
                        )}
                    </form>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 mb-8 border-b border-gray-200">
                    {[
                        { key: 'items', label: 'Items', icon: Package },
                        { key: 'services', label: 'Services', icon: Briefcase },
                        { key: 'properties', label: 'Properties', icon: Home },
                    ].map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key as Tab)}
                            className={`flex items-center gap-2 px-6 py-3 font-bold border-b-2 transition-colors ${activeTab === tab.key
                                ? 'border-amber-600 text-amber-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <tab.icon className="w-5 h-5" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div>
                    {activeTab === 'items' && renderItems()}
                    {activeTab === 'services' && renderServices()}
                    {activeTab === 'properties' && renderProperties()}
                </div>
            </div>
        </div>
    );
}
