'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Upload, X, Smartphone } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { serviceProviderService } from '@/services/serviceProviderService';
import { showToast } from '@/utils/toast';
import { notificationService } from '@/services/notificationService';
import { supabase } from '@/lib/supabase';
import { PremiumUpgradeModal } from '@/components/PremiumUpgradeModal';
import { compressImages } from '@/utils/imageCompression';

const AddServiceClient = () => {
    const router = useRouter();
    const { user, profile, canAddListing, listingCounts } = useAuth();
    const [loading, setLoading] = useState(false);
    const [showPremiumModal, setShowPremiumModal] = useState(false);
    const [images, setImages] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);
    const [locationLoading, setLocationLoading] = useState(false);

    const [formData, setFormData] = useState({
        business_name: '',
        category: 'event-management',
        custom_category: '',
        description: '',
        tagline: '',
        services: [] as string[],
        pricing_model: 'per-event',
        base_price: '',
        city: '',
        state: '',
        service_areas: [] as string[],
        contact_person: '',
        phone: '',
        email: '',
        whatsapp: '',
        years_experience: '',
        team_size: '',
        // Social Media (Optional)
        instagram_url: '',
        facebook_url: '',
        youtube_url: '',
        linkedin_url: '',
        twitter_url: '',
        website_url: '',
        latitude: null as number | null,
        longitude: null as number | null,
    });

    const categories = [
        // Event Services
        { value: 'event-management', label: 'Event Management' },
        { value: 'catering', label: 'Catering' },
        { value: 'decoration', label: 'Decoration' },
        { value: 'shamiyana', label: 'Shamiyana / Tent' },
        { value: 'mehendi', label: 'Mehendi Artist' },
        { value: 'makeup', label: 'Makeup Artist' },
        { value: 'venue', label: 'Venue / Banquet Hall' },
        { value: 'invitation', label: 'Invitation Cards' },
        { value: 'florist', label: 'Florist' },
        { value: 'cake', label: 'Cake & Desserts' },
        // Audio/Visual
        { value: 'dj', label: 'DJ' },
        { value: 'sound-system', label: 'Sound System' },
        { value: 'lighting', label: 'Lighting' },
        { value: 'photography', label: 'Photography' },
        { value: 'videography', label: 'Videography' },
        { value: 'live-streaming', label: 'Live Streaming' },
        // Performers
        { value: 'singer', label: 'Singer / Vocalist' },
        { value: 'musician', label: 'Musician / Band' },
        { value: 'dancer', label: 'Dancer / Choreographer' },
        { value: 'comedian', label: 'Comedian / Entertainer' },
        { value: 'magician', label: 'Magician' },
        { value: 'anchor', label: 'Anchor / Emcee' },
        // Fitness & Wellness
        { value: 'sports-coach', label: 'Sports Coach' },
        { value: 'fitness-trainer', label: 'Fitness Trainer' },
        { value: 'yoga-instructor', label: 'Yoga Instructor' },
        { value: 'nutritionist', label: 'Nutritionist / Dietician' },
        { value: 'physiotherapist', label: 'Physiotherapist' },
        // Professional Services
        { value: 'tutor', label: 'Tutor / Teacher' },
        { value: 'consultant', label: 'Business Consultant' },
        { value: 'accountant', label: 'Accountant / CA' },
        { value: 'lawyer', label: 'Lawyer / Legal Advisor' },
        { value: 'graphic-designer', label: 'Graphic Designer' },
        { value: 'web-developer', label: 'Web Developer' },
        { value: 'content-writer', label: 'Content Writer' },
        // Home Services
        { value: 'plumber', label: 'Plumber' },
        { value: 'electrician', label: 'Electrician' },
        { value: 'carpenter', label: 'Carpenter' },
        { value: 'painter', label: 'Painter' },
        { value: 'cleaning', label: 'Cleaning Service' },
        { value: 'pest-control', label: 'Pest Control' },
        { value: 'gardener', label: 'Gardener / Landscaping' },
        // Transportation
        { value: 'car-rental', label: 'Car Rental' },
        { value: 'bus-rental', label: 'Bus / Tempo Traveller' },
        { value: 'driver', label: 'Driver Service' },
        // Other
        { value: 'other', label: '🔧 Other (Specify Below)' },
    ];

    const servicesList: Record<string, string[]> = {
        'event-management': ['Wedding Planning', 'Corporate Events', 'Birthday Parties', 'Anniversary', 'Full Event Management'],
        'catering': ['Veg Catering', 'Non-Veg Catering', 'Live Counters', 'Desserts', 'Beverages'],
        'dj': ['Wedding DJ', 'Party DJ', 'Corporate DJ', 'Sound System', 'Lighting'],
        'decoration': ['Flower Decoration', 'Balloon Decoration', 'Stage Decoration', 'Entrance Decoration', 'Theme Decoration'],
        'photography': ['Wedding Photography', 'Pre-Wedding Shoot', 'Candid Photography', 'Traditional Photography', 'Drone Photography'],
        'videography': ['Wedding Video', 'Cinematic Video', 'Highlight Video', 'Traditional Video', 'Drone Video'],
        'singer': ['Wedding Singer', 'Bollywood Songs', 'Classical Music', 'Ghazals', 'Sufi Music', 'Live Band'],
        'musician': ['Live Band', 'Solo Performance', 'Instrumental', 'DJ + Live', 'Orchestra'],
        'dancer': ['Bollywood Dance', 'Classical Dance', 'Contemporary', 'Hip Hop', 'Choreography Services'],
        'comedian': ['Stand-up Comedy', 'Mimicry', 'Roast Comedy', 'Corporate Entertainment'],
        'sports-coach': ['Cricket Coaching', 'Football Coaching', 'Badminton', 'Tennis', 'Personal Training'],
        'fitness-trainer': ['Gym Training', 'Weight Loss', 'Muscle Building', 'Home Training', 'Group Classes'],
        'yoga-instructor': ['Hatha Yoga', 'Power Yoga', 'Meditation', 'Pranayama', 'Corporate Yoga'],
        'magician': ['Close-up Magic', 'Stage Magic', 'Kids Magic Show', 'Corporate Events'],
        'anchor': ['Wedding Anchor', 'Corporate Events', 'Birthday Parties', 'Stage Shows', 'Bilingual'],
        'tutor': ['Math', 'Science', 'English', 'Coding', 'Music', 'Languages'],
        'plumber': ['Pipe Repair', 'Tap Installation', 'Drainage', 'Bathroom Fitting', 'Emergency Service'],
        'electrician': ['Wiring', 'Appliance Repair', 'Fan Installation', 'Light Fitting', 'Emergency Service'],
        'other': ['Custom Service'],
    };

    // Require login
    useEffect(() => {
        if (!user) {
            showToast.error('Please login to list a service');
            router.push('/login');
        } else {
            detectLocation();
        }
    }, [user, router]);

    const detectLocation = () => {
        if ("geolocation" in navigator) {
            setLocationLoading(true);
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    setFormData(prev => ({ ...prev, latitude, longitude }));

                    try {
                        // Reverse geocode to get city/state
                        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1&accept-language=en`);
                        const data = await response.json();

                        if (data.address) {
                            const city = data.address.city || data.address.town || data.address.village || '';
                            const state = data.address.state || '';

                            setFormData(prev => ({
                                ...prev,
                                city: city || prev.city,
                                state: state || prev.state
                            }));
                        }
                    } catch (error) {
                        console.error('Error reverse geocoding:', error);
                    } finally {
                        setLocationLoading(false);
                    }
                },
                (error) => {
                    console.error('Geolocation error:', error);
                    setLocationLoading(false);
                }
            );
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleServiceToggle = (service: string) => {
        const services = formData.services.includes(service)
            ? formData.services.filter(s => s !== service)
            : [...formData.services, service];
        setFormData({ ...formData, services });
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        if (images.length + files.length > 6) {
            showToast.error('Maximum 6 images allowed');
            return;
        }

        setUploading(true);
        try {
            // COMPRESS IMAGES FIRST
            const loadingToast = showToast.loading('Compressing images...');
            const compressedFiles = await compressImages(Array.from(files));
            showToast.dismiss(loadingToast);

            const uploadPromises = compressedFiles.map(async (file) => {
                const fileExt = 'jpg'; // Always use jpg after compression
                const fileName = `${user!.id}-${Date.now()}-${Math.random()}.${fileExt}`;
                const filePath = `services/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('services')
                    .upload(filePath, file);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('services')
                    .getPublicUrl(filePath);

                return publicUrl;
            });

            const uploadedUrls = await Promise.all(uploadPromises);
            setImages([...images, ...uploadedUrls]);
            showToast.success(`${uploadedUrls.length} image(s) uploaded & compressed`);
        } catch (error: any) {
            console.error('Error uploading images:', error);
            showToast.error('Failed to upload images');
        } finally {
            setUploading(false);
        }
    };

    const handleRemoveImage = (index: number) => {
        setImages(images.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!canAddListing('service')) {
            setShowPremiumModal(true);
            return;
        }

        if (!user || !profile) {
            showToast.error('Please login to add a service');
            router.push('/login');
            return;
        }

        if (images.length === 0) {
            showToast.error('Please upload at least one image');
            return;
        }

        setLoading(true);
        try {
            const newService = await serviceProviderService.createProvider({
                business_name: formData.business_name,
                category: formData.category as any,
                subcategories: [],
                description: formData.description,
                tagline: formData.tagline || undefined,
                services: formData.services,
                pricing_model: formData.pricing_model as any,
                base_price: formData.base_price ? parseInt(formData.base_price) : undefined,
                city: formData.city,
                state: formData.state,
                service_areas: formData.service_areas.length > 0 ? formData.service_areas : [formData.city],
                latitude: formData.latitude ?? undefined,
                longitude: formData.longitude ?? undefined,
                owner_id: user.id,
                contact_person: formData.contact_person,
                phone: formData.phone,
                email: formData.email,
                whatsapp: formData.whatsapp || undefined,
                images,
                portfolio_images: images,
                years_experience: formData.years_experience ? parseInt(formData.years_experience) : undefined,
                team_size: formData.team_size ? parseInt(formData.team_size) : undefined,
                equipment_owned: [],
                certifications: [],
                // Social Media (Optional)
                instagram_url: formData.instagram_url || undefined,
                facebook_url: formData.facebook_url || undefined,
                youtube_url: formData.youtube_url || undefined,
                linkedin_url: formData.linkedin_url || undefined,
                twitter_url: formData.twitter_url || undefined,
                website_url: formData.website_url || undefined,
                status: 'pending',
                verified: false,
                featured: false,
            });

            // Notify admin of new service
            try {
                await notificationService.notifyAdminNewService(
                    formData.business_name,
                    formData.contact_person || user.email || 'User',
                    newService.id
                );
            } catch (notifError) {
                console.error('Error notifying admin:', notifError);
            }

            showToast.success('Service listed successfully! Awaiting admin approval.');
            router.push('/dashboard');
        } catch (error: any) {
            console.error('Error adding service:', error);

            // Handle specific database constraint errors
            if (error.message && error.message.includes('category_check')) {
                showToast.error('Category validation error. Please contact support or try a different category.');
            } else if (error.message && error.message.includes('violates check constraint')) {
                showToast.error('Invalid data format. Please check all fields and try again.');
            } else {
                showToast.error(error.message || 'Failed to add service. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const currentServices = servicesList[formData.category as keyof typeof servicesList] || [];

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-yellow-50 py-4 px-4 md:py-8">
            <div className="max-w-4xl mx-auto">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
                    <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
                        <ArrowLeft className="w-5 h-5" />
                        Back
                    </button>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">List Your Service</h1>
                    <p className="text-sm md:text-base text-gray-600">Fill in the details to list your service business</p>
                </motion.div>

                <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                    {/* Business Details */}
                    <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm">
                        <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4">Business Details</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Business Name *</label>
                                <input type="text" name="business_name" value={formData.business_name} onChange={handleInputChange} placeholder="e.g., Royal Events & Catering" required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Category *</label>
                                <select name="category" value={formData.category} onChange={handleInputChange} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent">
                                    {categories.map((cat) => (
                                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Custom Category Field - Shows when "Other" is selected */}
                            {formData.category === 'other' && (
                                <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        🔧 Specify Your Service Category *
                                    </label>
                                    <input
                                        type="text"
                                        name="custom_category"
                                        value={formData.custom_category}
                                        onChange={handleInputChange}
                                        placeholder="e.g., Mobile Repair, Astrology, Pet Grooming, etc."
                                        required={formData.category === 'other'}
                                        className="w-full px-4 py-3 border border-yellow-400 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                                    />
                                    <p className="text-xs text-gray-600 mt-2">
                                        💡 Be specific! This helps customers find your service easily.
                                    </p>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Tagline</label>
                                <input type="text" name="tagline" value={formData.tagline} onChange={handleInputChange} placeholder="e.g., Making your events memorable" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Description *</label>
                                <textarea name="description" value={formData.description} onChange={handleInputChange} placeholder="Describe your services..." required rows={4} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
                            </div>
                        </div>
                    </div>

                    {/* Services Offered */}
                    <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm">
                        <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4">Services Offered *</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {currentServices.map((service) => (
                                <label key={service} className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-orange-500 transition-colors">
                                    <input type="checkbox" checked={formData.services.includes(service)} onChange={() => handleServiceToggle(service)} className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500" />
                                    <span className="text-sm">{service}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Pricing */}
                    <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm">
                        <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4">Pricing</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Pricing Model *</label>
                                <select name="pricing_model" value={formData.pricing_model} onChange={handleInputChange} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent">
                                    <option value="per-event">Per Event</option>
                                    <option value="per-hour">Per Hour</option>
                                    <option value="per-day">Per Day</option>
                                    <option value="package">Package</option>
                                    <option value="custom">Custom Quote</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Starting Price (₹)</label>
                                <input type="number" name="base_price" value={formData.base_price} onChange={handleInputChange} placeholder="e.g., 50000" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
                            </div>
                        </div>
                    </div>

                    {/* Location */}
                    <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm">
                        <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4">Location</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">City * {locationLoading && <span className="text-amber-500 animate-pulse">(Detecting...)</span>}</label>
                                <input type="text" name="city" value={formData.city} onChange={handleInputChange} placeholder="e.g., Bangalore" required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">State *</label>
                                <input type="text" name="state" value={formData.state} onChange={handleInputChange} placeholder="e.g., Karnataka" required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
                            </div>
                        </div>
                    </div>

                    {/* Contact */}
                    <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm">
                        <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4">Contact Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Contact Person *</label>
                                <input type="text" name="contact_person" value={formData.contact_person} onChange={handleInputChange} placeholder="Your name" required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone *</label>
                                <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="9876543210" required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                                <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="your@email.com" required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">WhatsApp</label>
                                <input type="tel" name="whatsapp" value={formData.whatsapp} onChange={handleInputChange} placeholder="9876543210" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
                            </div>
                        </div>
                    </div>

                    {/* Experience */}
                    <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm">
                        <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4">Experience</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Years of Experience</label>
                                <input type="number" name="years_experience" value={formData.years_experience} onChange={handleInputChange} placeholder="e.g., 5" min="0" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Team Size</label>
                                <input type="number" name="team_size" value={formData.team_size} onChange={handleInputChange} placeholder="e.g., 10" min="0" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
                            </div>
                        </div>
                    </div>

                    {/* Social Media Links (Optional) */}
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 md:p-6 shadow-sm border border-purple-100">
                        <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-2">Social Media & Online Presence</h2>
                        <p className="text-sm text-gray-600 mb-4">Add your social media links to build trust (Optional)</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Instagram</label>
                                <input type="url" name="instagram_url" value={formData.instagram_url} onChange={handleInputChange} placeholder="https://instagram.com/yourprofile" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Facebook</label>
                                <input type="url" name="facebook_url" value={formData.facebook_url} onChange={handleInputChange} placeholder="https://facebook.com/yourpage" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">YouTube</label>
                                <input type="url" name="youtube_url" value={formData.youtube_url} onChange={handleInputChange} placeholder="https://youtube.com/@yourchannel" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">LinkedIn</label>
                                <input type="url" name="linkedin_url" value={formData.linkedin_url} onChange={handleInputChange} placeholder="https://linkedin.com/in/yourprofile" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Twitter / X</label>
                                <input type="url" name="twitter_url" value={formData.twitter_url} onChange={handleInputChange} placeholder="https://twitter.com/yourhandle" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Website</label>
                                <input type="url" name="website_url" value={formData.website_url} onChange={handleInputChange} placeholder="https://yourwebsite.com" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
                            </div>
                        </div>
                    </div>

                    {/* Images */}
                    <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm">
                        <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Upload className="w-5 h-5" />
                            Portfolio Images *
                        </h2>
                        <p className="text-sm text-gray-600 mb-4">Upload up to 6 images of your work</p>

                        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-4 mb-4">
                            {images.map((image, index) => (
                                <div key={index} className="relative group">
                                    <img src={image} alt={`Portfolio ${index + 1}`} className="w-full h-24 md:h-32 object-cover rounded-lg" />
                                    <button type="button" onClick={() => handleRemoveImage(index)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                        <X className="w-3 h-3 md:w-4 md:h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        {images.length < 6 && (
                            <div className="flex gap-4">
                                <label className="flex-1 flex flex-col items-center justify-center h-24 md:h-32 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:border-orange-500 transition-colors bg-gray-50/50">
                                    <Upload className="w-6 h-6 md:w-8 md:h-8 text-gray-400 mb-2" />
                                    <span className="text-xs md:text-sm text-gray-600">Gallery</span>
                                    <input type="file" accept="image/*" multiple onChange={handleImageUpload} disabled={uploading} className="hidden" />
                                </label>
                                <label className="flex-1 flex flex-col items-center justify-center h-24 md:h-32 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:border-orange-500 transition-colors bg-orange-50/30">
                                    <Smartphone className="w-6 h-6 md:w-8 md:h-8 text-orange-600 mb-2" />
                                    <span className="text-xs md:text-sm text-orange-700 font-medium">Take Photo</span>
                                    <input type="file" accept="image/*" capture="environment" onChange={handleImageUpload} disabled={uploading} className="hidden" />
                                </label>
                            </div>
                        )}
                    </div>

                    {/* Submit */}
                    <div className="flex flex-col md:flex-row gap-3 md:gap-4 sticky bottom-0 bg-white p-4 md:p-0 md:bg-transparent -mx-4 md:mx-0 border-t md:border-0">
                        <button type="button" onClick={() => router.back()} className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors">
                            Cancel
                        </button>
                        <button type="submit" disabled={loading || uploading} className="flex-1 px-6 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                            {loading ? 'Submitting...' : 'List Service'}
                        </button>
                    </div>
                </form>
            </div>

            <PremiumUpgradeModal
                isOpen={showPremiumModal}
                onClose={() => {
                    setShowPremiumModal(false);
                    router.push('/dashboard');
                }}
                listingType="service"
                currentCount={listingCounts.services}
                limit={2}
            />
        </div>
    );
};

export default AddServiceClient;
