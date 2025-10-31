import { useState, useEffect } from 'react';
import { Shield, Check, X, Eye, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { verificationService } from '../../services/verificationService';
import { showToast } from '../../utils/toast';
import { useAuth } from '../../contexts/AuthContext';

interface PendingVerification {
  id: string;
  email: string;
  full_name: string;
  id_document_type: string;
  id_document_number: string;
  id_document_url: string;
  created_at: string;
}

export const IDVerificationDashboard = () => {
  const { user } = useAuth();
  const [verifications, setVerifications] = useState<PendingVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVerification, setSelectedVerification] = useState<PendingVerification | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'pending' | 'verified' | 'rejected'>('pending');

  useEffect(() => {
    fetchVerifications();
  }, [activeTab]);

  const fetchVerifications = async () => {
    try {
      setLoading(true);
      console.log(`Fetching ${activeTab} verifications...`);
      
      let data;
      if (activeTab === 'pending') {
        data = await verificationService.getPendingVerifications();
      } else if (activeTab === 'verified') {
        data = await verificationService.getVerifiedUsers();
      } else {
        data = await verificationService.getRejectedVerifications();
      }
      
      console.log(`Received ${activeTab} verifications:`, data);
      setVerifications(data || []);
    } catch (error) {
      console.error('Error fetching verifications:', error);
      showToast.error('Failed to load verifications');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId: string) => {
    if (!user?.id) {
      showToast.error('Admin user not found');
      return;
    }
    
    setProcessing(true);
    try {
      console.log('Starting approval process for user:', userId, 'by admin:', user.id);
      await verificationService.verifyUser(userId, user.id);
      console.log('Verification service completed');
      showToast.success('User verified successfully!');
      setSelectedVerification(null);
      setRejectionReason('');
      console.log('Refreshing verifications list...');
      await fetchVerifications();
      console.log('List refreshed');
    } catch (error) {
      console.error('Error approving verification:', error);
      showToast.error('Failed to approve verification');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (userId: string) => {
    if (!rejectionReason.trim()) {
      showToast.error('Please provide a rejection reason');
      return;
    }

    setProcessing(true);
    try {
      console.log('Starting rejection process for user:', userId);
      await verificationService.rejectVerification(userId, rejectionReason);
      console.log('Rejection service completed');
      showToast.success('Verification rejected');
      setSelectedVerification(null);
      setRejectionReason('');
      console.log('Refreshing verifications list...');
      await fetchVerifications();
      console.log('List refreshed');
    } catch (error) {
      console.error('Error rejecting verification:', error);
      showToast.error('Failed to reject verification');
    } finally {
      setProcessing(false);
    }
  };

  const getDocumentTypeLabel = (type: string) => {
    const labels: any = {
      aadhar: 'Aadhar Card',
      pan: 'PAN Card',
      passport: 'Passport',
      driving_license: 'Driving License',
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Shield className="w-8 h-8 text-amber-600" />
        <div>
          <h2 className="text-2xl font-bold text-gray-900">ID Verification</h2>
          <p className="text-gray-600">Review and approve user ID documents</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm p-2">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'pending'
                ? 'bg-yellow-500 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            ⏳ Pending
          </button>
          <button
            onClick={() => setActiveTab('verified')}
            className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'verified'
                ? 'bg-green-500 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            ✅ Verified
          </button>
          <button
            onClick={() => setActiveTab('rejected')}
            className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'rejected'
                ? 'bg-red-500 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            ❌ Rejected
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-gray-600" />
          <span className="font-semibold text-gray-800">
            {verifications.length} {activeTab} verification{verifications.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Verifications List */}
      {verifications.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No {activeTab} verifications</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {verifications.map((verification: PendingVerification) => (
            <motion.div
              key={verification.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-gray-900">
                    {verification.full_name || verification.email}
                  </h3>
                  <p className="text-sm text-gray-600">{verification.email}</p>
                  <div className="mt-3 space-y-1">
                    <p className="text-sm">
                      <span className="font-medium">Document Type:</span>{' '}
                      {getDocumentTypeLabel(verification.id_document_type)}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Document Number:</span>{' '}
                      {verification.id_document_number}
                    </p>
                    <p className="text-sm text-gray-500">
                      Submitted: {new Date(verification.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {activeTab === 'pending' ? (
                  <button
                    onClick={() => setSelectedVerification(verification)}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 text-white rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    <Eye size={18} />
                    Review
                  </button>
                ) : (
                  <button
                    onClick={() => setSelectedVerification(verification)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    <Eye size={18} />
                    View Details
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      {selectedVerification && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
              <h2 className="text-2xl font-bold text-gray-900">Review ID Document</h2>
              <p className="text-gray-600">{selectedVerification.full_name || selectedVerification.email}</p>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* User Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold mb-3">User Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Name:</span>
                    <p className="font-medium">{selectedVerification.full_name}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Email:</span>
                    <p className="font-medium">{selectedVerification.email}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Document Type:</span>
                    <p className="font-medium">{getDocumentTypeLabel(selectedVerification.id_document_type)}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Document Number:</span>
                    <p className="font-medium">{selectedVerification.id_document_number}</p>
                  </div>
                </div>
              </div>

              {/* Document Image */}
              <div>
                <h3 className="font-semibold mb-3">Document Image</h3>
                {selectedVerification.id_document_url ? (
                  <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                    <img
                      src={selectedVerification.id_document_url}
                      alt="ID Document"
                      className="w-full h-auto"
                      onError={(e) => {
                        console.error('Image load error:', selectedVerification.id_document_url);
                        e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="400" height="300" fill="%23f3f4f6"/><text x="50%" y="50%" text-anchor="middle" fill="%23666" font-size="16">Image failed to load</text></svg>';
                      }}
                      onLoad={() => console.log('Image loaded successfully:', selectedVerification.id_document_url)}
                    />
                  </div>
                ) : (
                  <div className="border border-gray-200 rounded-lg p-8 text-center bg-gray-50">
                    <p className="text-gray-500">No document image available</p>
                  </div>
                )}
                <p className="text-sm text-gray-600 mt-2">
                  ⚠️ Verify that the document is clear, valid, and matches the user information
                </p>
                <p className="text-xs text-gray-500 mt-1 font-mono break-all">
                  URL: {selectedVerification.id_document_url || 'No URL'}
                </p>
              </div>

              {/* Rejection Reason (if pending or showing rejected reason) */}
              {activeTab === 'pending' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Rejection Reason (optional)
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Enter reason if rejecting..."
                  />
                </div>
              )}
              
              {/* Show rejection reason for rejected verifications */}
              {activeTab === 'rejected' && (selectedVerification as any).id_rejection_reason && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="font-semibold text-red-800 mb-2">Rejection Reason:</h3>
                  <p className="text-red-700">{(selectedVerification as any).id_rejection_reason}</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex gap-4">
              <button
                onClick={() => {
                  setSelectedVerification(null);
                  setRejectionReason('');
                }}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                disabled={processing}
              >
                {activeTab === 'pending' ? 'Cancel' : 'Close'}
              </button>
              
              {/* Only show approve/reject for pending */}
              {activeTab === 'pending' && (
                <>
                  <button
                    onClick={() => handleReject(selectedVerification.id)}
                    className="flex-1 px-6 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                    disabled={processing}
                  >
                    {processing ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <X size={20} />
                        Reject
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleApprove(selectedVerification.id)}
                    className="flex-1 px-6 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                    disabled={processing}
                  >
                    {processing ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <Check size={20} />
                        Approve
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
