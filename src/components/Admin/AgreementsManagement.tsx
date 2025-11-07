import { useState, useEffect } from 'react';
import { FileText, Eye, Trash2, Download, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { rentalAgreementService } from '../../services/rentalAgreementService';
import { downloadAgreementPDF } from '../../utils/pdfGenerator';

export const AgreementsManagement = () => {
  const [agreements, setAgreements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'cancelled' | 'disputed'>('all');
  const [showDeleted, setShowDeleted] = useState(false);
  const [selectedAgreement, setSelectedAgreement] = useState<any>(null);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    completed: 0,
    cancelled: 0,
    disputed: 0,
  });

  useEffect(() => {
    loadAgreements();
    loadStats();
  }, [showDeleted, filter]);

  const loadAgreements = async () => {
    try {
      setLoading(true);
      const data = await rentalAgreementService.getAllAgreements(showDeleted);
      
      // Filter by status
      const filteredData = filter === 'all' 
        ? data 
        : data.filter(a => a.status === filter);
      
      setAgreements(filteredData);
    } catch (error: any) {
      console.error('Error loading agreements:', error);
      
      // Check if table doesn't exist
      if (error?.message?.includes('relation') || error?.code === '42P01') {
        alert('⚠️ Rental Agreements table not found!\n\nPlease run "create-rental-agreements-table.sql" in Supabase SQL Editor.\n\nSee SETUP_AGREEMENTS_NOW.md for instructions.');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await rentalAgreementService.getAgreementStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleDelete = async (agreementId: string) => {
    if (!confirm('Are you sure you want to delete this agreement? It will be soft-deleted and can be restored later.')) {
      return;
    }

    try {
      await rentalAgreementService.softDeleteAgreement(agreementId);
      loadAgreements();
      loadStats();
      alert('Agreement deleted successfully');
    } catch (error) {
      console.error('Error deleting agreement:', error);
      alert('Failed to delete agreement');
    }
  };

  const handleRestore = async (agreementId: string) => {
    try {
      await rentalAgreementService.restoreAgreement(agreementId);
      loadAgreements();
      loadStats();
      alert('Agreement restored successfully');
    } catch (error) {
      console.error('Error restoring agreement:', error);
      alert('Failed to restore agreement');
    }
  };

  const handlePermanentDelete = async (agreementId: string) => {
    if (!confirm('⚠️ PERMANENT DELETE: This action cannot be undone! Are you absolutely sure?')) {
      return;
    }

    try {
      await rentalAgreementService.permanentlyDeleteAgreement(agreementId);
      loadAgreements();
      loadStats();
      alert('Agreement permanently deleted');
    } catch (error) {
      console.error('Error permanently deleting agreement:', error);
      alert('Failed to permanently delete agreement');
    }
  };

  const handleDownloadPDF = async (agreement: any) => {
    try {
      await downloadAgreementPDF(agreement.agreement_data, `agreement-${agreement.id}.pdf`);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Failed to download PDF');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-amber-100 text-amber-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'disputed': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      case 'disputed': return <AlertCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm">
          <div className="text-xl sm:text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-xs sm:text-sm text-gray-600">Total</div>
        </div>
        <div className="bg-amber-50 rounded-xl p-3 sm:p-4 shadow-sm">
          <div className="text-xl sm:text-2xl font-bold text-amber-900">{stats.active}</div>
          <div className="text-xs sm:text-sm text-amber-700">Active</div>
        </div>
        <div className="bg-blue-50 rounded-xl p-3 sm:p-4 shadow-sm">
          <div className="text-xl sm:text-2xl font-bold text-blue-900">{stats.completed}</div>
          <div className="text-xs sm:text-sm text-blue-700">Completed</div>
        </div>
        <div className="bg-red-50 rounded-xl p-3 sm:p-4 shadow-sm">
          <div className="text-xl sm:text-2xl font-bold text-red-900">{stats.cancelled}</div>
          <div className="text-xs sm:text-sm text-red-700">Cancelled</div>
        </div>
        <div className="bg-yellow-50 rounded-xl p-3 sm:p-4 shadow-sm col-span-2 md:col-span-1">
          <div className="text-xl sm:text-2xl font-bold text-yellow-900">{stats.disputed}</div>
          <div className="text-xs sm:text-sm text-yellow-700">Disputed</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-center sm:justify-between">
          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                filter === 'all' ? 'bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                filter === 'active' ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                filter === 'completed' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Completed
            </button>
            <button
              onClick={() => setFilter('cancelled')}
              className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                filter === 'cancelled' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Cancelled
            </button>
            <button
              onClick={() => setFilter('disputed')}
              className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                filter === 'disputed' ? 'bg-yellow-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Disputed
            </button>
          </div>
          <div className="flex gap-2 items-center justify-between sm:justify-start">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showDeleted}
                onChange={(e) => setShowDeleted(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-xs sm:text-sm text-gray-700 whitespace-nowrap">Show Deleted</span>
            </label>
            <button
              onClick={() => {
                loadAgreements();
                loadStats();
              }}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Agreements List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {agreements.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">No Agreements Found</h3>
            <p className="text-sm sm:text-base text-gray-600">No rental agreements match your current filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <table className="w-full min-w-[800px]">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Renter
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Owner
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dates
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {agreements.map((agreement) => (
                  <motion.tr
                    key={agreement.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={agreement.deleted_at ? 'bg-red-50' : ''}
                  >
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">
                      {agreement.id.slice(0, 8)}...
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                      {agreement.item_title}
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                      <div>{agreement.renter_name}</div>
                      <div className="text-xs text-gray-500">{agreement.renter_email}</div>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                      <div>{agreement.owner_name}</div>
                      <div className="text-xs text-gray-500">{agreement.owner_email}</div>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                      <div>{new Date(agreement.start_date).toLocaleDateString()}</div>
                      <div className="text-xs text-gray-500">to {new Date(agreement.end_date).toLocaleDateString()}</div>
                      <div className="text-xs text-gray-500">{agreement.total_days} days</div>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-semibold text-gray-900">
                      ₹{agreement.total_price}
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(agreement.status)}`}>
                        {getStatusIcon(agreement.status)}
                        {agreement.status}
                      </span>
                      {agreement.deleted_at && (
                        <div className="text-xs text-red-600 mt-1">Deleted</div>
                      )}
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium">
                      <div className="flex gap-1 sm:gap-2">
                        <button
                          onClick={() => setSelectedAgreement(agreement)}
                          className="text-amber-600 hover:text-amber-600/80"
                          title="View Details"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDownloadPDF(agreement)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Download PDF"
                        >
                          <Download className="w-5 h-5" />
                        </button>
                        {agreement.deleted_at ? (
                          <>
                            <button
                              onClick={() => handleRestore(agreement.id)}
                              className="text-amber-600 hover:text-amber-800"
                              title="Restore"
                            >
                              <RefreshCw className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handlePermanentDelete(agreement.id)}
                              className="text-red-600 hover:text-red-800"
                              title="Permanently Delete"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleDelete(agreement.id)}
                            className="text-red-600 hover:text-red-800"
                            title="Delete"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Agreement Details Modal */}
      {selectedAgreement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Agreement Details</h2>
                <button
                  onClick={() => setSelectedAgreement(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Agreement ID</label>
                    <p className="text-gray-900">{selectedAgreement.id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Booking ID</label>
                    <p className="text-gray-900">{selectedAgreement.booking_id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Status</label>
                    <p>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedAgreement.status)}`}>
                        {getStatusIcon(selectedAgreement.status)}
                        {selectedAgreement.status}
                      </span>
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Created At</label>
                    <p className="text-gray-900">{new Date(selectedAgreement.created_at).toLocaleString()}</p>
                  </div>
                </div>

                <hr />

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Item Details</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="font-semibold text-gray-900">{selectedAgreement.item_title}</p>
                    <p className="text-sm text-gray-600 mt-1">{selectedAgreement.item_description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Renter</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="font-semibold text-gray-900">{selectedAgreement.renter_name}</p>
                      <p className="text-sm text-gray-600">{selectedAgreement.renter_email}</p>
                      <p className="text-sm text-gray-600">{selectedAgreement.renter_phone}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Owner</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="font-semibold text-gray-900">{selectedAgreement.owner_name}</p>
                      <p className="text-sm text-gray-600">{selectedAgreement.owner_email}</p>
                      <p className="text-sm text-gray-600">{selectedAgreement.owner_phone}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Rental Details</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-700">Start Date:</span>
                      <span className="font-semibold text-gray-900">{new Date(selectedAgreement.start_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">End Date:</span>
                      <span className="font-semibold text-gray-900">{new Date(selectedAgreement.end_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Total Days:</span>
                      <span className="font-semibold text-gray-900">{selectedAgreement.total_days} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Security Deposit:</span>
                      <span className="font-semibold text-gray-900">₹{selectedAgreement.security_deposit || 0}</span>
                    </div>
                    <hr />
                    <div className="flex justify-between text-lg">
                      <span className="font-semibold text-gray-900">Total Amount:</span>
                      <span className="font-bold text-amber-600">₹{selectedAgreement.total_price}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => handleDownloadPDF(selectedAgreement)}
                    className="flex-1 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                  >
                    <Download className="w-5 h-5" />
                    Download PDF
                  </button>
                  <button
                    onClick={() => setSelectedAgreement(null)}
                    className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
