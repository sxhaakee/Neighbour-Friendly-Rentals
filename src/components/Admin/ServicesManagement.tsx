import { useState, useEffect } from 'react';
import { PartyPopper, CheckCircle, XCircle, Eye, Trash2, MapPin, IndianRupee, Star } from 'lucide-react';
import { serviceProviderService, ServiceProvider } from '../../services/serviceProviderService';
import { showToast } from '../../utils/toast';

export const ServicesManagement = () => {
  const [services, setServices] = useState<ServiceProvider[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<ServiceProvider | null>(null);

  useEffect(() => {
    fetchServices();
  }, [filter]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const filters: any = {};
      if (filter !== 'all') {
        filters.status = filter;
      }
      // Admin should see ALL services, not just approved ones
      const data = await serviceProviderService.getAllProviders(filters);
      setServices(data);
    } catch (error) {
      console.error('Error fetching services:', error);
      showToast.error('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await serviceProviderService.updateProvider(id, { status: 'approved' });
      showToast.success('Service approved');
      fetchServices();
    } catch (error) {
      console.error('Error approving service:', error);
      showToast.error('Failed to approve service');
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;

    try {
      await serviceProviderService.updateProvider(id, { status: 'rejected' });
      showToast.success('Service rejected');
      fetchServices();
    } catch (error) {
      console.error('Error rejecting service:', error);
      showToast.error('Failed to reject service');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return;

    try {
      await serviceProviderService.deleteProvider(id);
      showToast.success('Service deleted');
      setSelectedService(null);
      fetchServices();
    } catch (error) {
      console.error('Error deleting service:', error);
      showToast.error('Failed to delete service');
    }
  };

  const stats = {
    total: services.length,
    pending: services.filter(s => s.status === 'pending').length,
    approved: services.filter(s => s.status === 'approved').length,
    rejected: services.filter(s => s.status === 'rejected').length,
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Services</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
            </div>
            <PartyPopper className="w-10 h-10 text-orange-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Pending</p>
              <p className="text-3xl font-bold text-yellow-600 mt-1">{stats.pending}</p>
            </div>
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
              <span className="text-yellow-600 text-xl">⏳</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Approved</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{stats.approved}</p>
            </div>
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Rejected</p>
              <p className="text-3xl font-bold text-red-600 mt-1">{stats.rejected}</p>
            </div>
            <XCircle className="w-10 h-10 text-red-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex gap-2 overflow-x-auto">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-colors ${
                filter === status
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Services List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      ) : services.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center">
          <PartyPopper className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No services found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div key={service.id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow">
              {/* Image */}
              <div className="relative h-48 bg-gradient-to-br from-orange-100 to-pink-100">
                {service.images && service.images.length > 0 ? (
                  <img
                    src={service.images[0]}
                    alt={service.business_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <PartyPopper className="w-16 h-16 text-orange-300" />
                  </div>
                )}
                
                {/* Status Badge */}
                <div className="absolute top-3 right-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      service.status === 'approved'
                        ? 'bg-green-500 text-white'
                        : service.status === 'pending'
                        ? 'bg-yellow-500 text-white'
                        : 'bg-red-500 text-white'
                    }`}
                  >
                    {service.status}
                  </span>
                </div>

                {/* Verified Badge */}
                {service.verified && (
                  <div className="absolute top-3 left-3">
                    <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full">
                      ✓ Verified
                    </span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-1">{service.business_name}</h3>
                
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <MapPin className="w-4 h-4" />
                  <span className="line-clamp-1">{service.city}, {service.state}</span>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
                    {service.category}
                  </span>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs font-semibold">{service.rating?.toFixed(1) || '0.0'}</span>
                  </div>
                </div>

                {service.base_price && (
                  <div className="flex items-center gap-1 text-lg font-bold text-orange-600 mb-4">
                    <IndianRupee className="w-5 h-5" />
                    {service.base_price.toLocaleString('en-IN')}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedService(service)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                  
                  {service.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleApprove(service.id)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(service.id)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                    </>
                  )}
                  
                  <button
                    onClick={() => handleDelete(service.id)}
                    className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Service Details Modal */}
      {selectedService && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold">{selectedService.business_name}</h2>
                <button
                  onClick={() => setSelectedService(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              {/* Images */}
              {selectedService.images && selectedService.images.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {selectedService.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`Service ${idx + 1}`}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  ))}
                </div>
              )}

              {/* Details */}
              <div className="space-y-4">
                {selectedService.tagline && (
                  <p className="text-lg text-gray-600 italic">{selectedService.tagline}</p>
                )}

                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-gray-600">{selectedService.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold mb-2">Business Details</h3>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>Category: {selectedService.category}</li>
                      <li>Contact: {selectedService.contact_person}</li>
                      <li>Phone: {selectedService.phone}</li>
                      <li>Email: {selectedService.email}</li>
                      {selectedService.years_experience && (
                        <li>Experience: {selectedService.years_experience} years</li>
                      )}
                      {selectedService.team_size && (
                        <li>Team Size: {selectedService.team_size}</li>
                      )}
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Pricing</h3>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>Model: {selectedService.pricing_model}</li>
                      {selectedService.base_price && (
                        <li>Starting: ₹{selectedService.base_price.toLocaleString('en-IN')}</li>
                      )}
                      <li>Rating: {selectedService.rating?.toFixed(1) || '0.0'} ⭐</li>
                      <li>Bookings: {selectedService.total_bookings || 0}</li>
                    </ul>
                  </div>
                </div>

                {selectedService.services && selectedService.services.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Services Offered</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedService.services.map((srv, idx) => (
                        <span key={idx} className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
                          {srv}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                {selectedService.status === 'pending' && (
                  <div className="flex gap-3 pt-4 border-t">
                    <button
                      onClick={() => {
                        handleApprove(selectedService.id);
                        setSelectedService(null);
                      }}
                      className="flex-1 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                      Approve Service
                    </button>
                    <button
                      onClick={() => {
                        handleReject(selectedService.id);
                        setSelectedService(null);
                      }}
                      className="flex-1 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      Reject Service
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
