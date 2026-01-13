import { useState, useEffect } from 'react';
import { DollarSign, Search, Filter, ArrowUpRight, ArrowDownRight, RefreshCw, Calendar, User, Tag } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { showToast } from '../../utils/toast';

interface RevenueRecord {
    id: string;
    amount: number;
    revenue_type: string;
    description: string | null;
    created_at: string | null;
    payment_status: string | null;
    payment_id: string | null;
    user_id: string | null;
    profiles: {
        full_name: string | null;
        email: string;
    } | null;
}

export const RevenueManagement = () => {
    const [revenue, setRevenue] = useState<RevenueRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchRevenue();
    }, [filter]);

    const fetchRevenue = async () => {
        try {
            setLoading(true);
            let query = supabase
                .from('revenue_tracking')
                .select(`
          *,
          profiles:user_id (
            full_name,
            email
          )
        `)
                .order('created_at', { ascending: false });

            if (filter !== 'all') {
                query = query.eq('revenue_type', filter);
            }

            const { data, error } = await query;

            if (error) throw error;
            setRevenue(data || []);
        } catch (error) {
            console.error('Error fetching revenue:', error);
            showToast.error('Failed to load revenue data');
        } finally {
            setLoading(false);
        }
    };

    const filteredRevenue = revenue.filter(record =>
        record.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.profiles?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.payment_id?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalRevenue = filteredRevenue.reduce((sum, r) => sum + r.amount, 0);

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'premium': return 'bg-purple-100 text-purple-800';
            case 'featured': return 'bg-amber-100 text-amber-800';
            case 'service_fee': return 'bg-blue-100 text-blue-800';
            case 'property_booking': return 'bg-orange-100 text-orange-800';
            case 'service_booking': return 'bg-teal-100 text-teal-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header & Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="md:col-span-2 bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden"
                >
                    <div className="relative z-10">
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mb-2">Total Managed Revenue</p>
                        <h3 className="text-5xl font-black tracking-tighter mb-4">₹{totalRevenue.toLocaleString()}</h3>
                        <div className="flex items-center gap-4 text-sm font-medium">
                            <span className="flex items-center gap-1 text-green-400">
                                <ArrowUpRight className="w-4 h-4" />
                                Live Tracking
                            </span>
                            <span className="text-gray-500">|</span>
                            <span className="text-gray-400">{filteredRevenue.length} Total Transactions</span>
                        </div>
                    </div>
                    <DollarSign className="absolute right-[-20px] bottom-[-20px] w-64 h-64 text-white/5 rotate-12" />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl flex flex-col justify-between"
                >
                    <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center mb-4">
                        <RefreshCw className={`w-6 h-6 text-amber-600 ${loading ? 'animate-spin' : ''}`} onClick={fetchRevenue} />
                    </div>
                    <div>
                        <h4 className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mb-1">Actions</h4>
                        <div className="flex flex-col gap-2">
                            <button
                                onClick={fetchRevenue}
                                className="w-full py-2 bg-gray-50 hover:bg-gray-100 rounded-xl text-sm font-bold text-gray-700 transition-all border border-gray-100"
                            >
                                Sync Database
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-gray-100 shadow-md">
                <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
                    <Filter className="w-4 h-4 text-gray-400" />
                    {['all', 'premium', 'featured', 'service_fee', 'property_booking', 'service_booking'].map((t) => (
                        <button
                            key={t}
                            onClick={() => setFilter(t)}
                            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${filter === t
                                ? 'bg-amber-500 text-white shadow-lg shadow-amber-200'
                                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            {t.charAt(0).toUpperCase() + t.slice(1)}
                        </button>
                    ))}
                </div>
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search transactions..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-transparent rounded-xl text-sm focus:bg-white focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10 transition-all"
                    />
                </div>
            </div>

            {/* Revenue Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Transaction</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">User Details</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Type</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Amount</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto"></div>
                                        <p className="text-xs text-gray-400 mt-2 font-bold uppercase tracking-widest">Loading records...</p>
                                    </td>
                                </tr>
                            ) : filteredRevenue.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center">
                                        <p className="text-gray-400 text-sm font-medium">No transactions found</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredRevenue.map((record) => (
                                    <tr key={record.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-gray-900 line-clamp-1">{record.description}</span>
                                                <span className="text-[10px] font-medium text-gray-400">ID: {record.payment_id || record.id.slice(0, 8)}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-black text-gray-500 uppercase">
                                                    {record.profiles?.full_name?.charAt(0) || <User className="w-4 h-4" />}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-gray-900">{record.profiles?.full_name || 'System'}</span>
                                                    <span className="text-[10px] font-medium text-gray-500">{record.profiles?.email || 'N/A'}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${getTypeColor(record.revenue_type)}`}>
                                                {record.revenue_type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-black text-gray-900">₹{record.amount.toLocaleString()}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5">
                                                <div className={`w-1.5 h-1.5 rounded-full ${record.payment_status === 'completed' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-600">
                                                    {record.payment_status || 'completed'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col items-end text-right">
                                                <span className="text-xs font-bold text-gray-900">{record.created_at ? new Date(record.created_at).toLocaleDateString() : 'N/A'}</span>
                                                <span className="text-[10px] font-medium text-gray-400">{record.created_at ? new Date(record.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
