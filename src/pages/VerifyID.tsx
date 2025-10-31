import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Upload, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { verificationService } from '../services/verificationService';
import { showToast } from '../utils/toast';

const VerifyID = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [documentType, setDocumentType] = useState<'aadhar' | 'pan' | 'passport' | 'driving_license'>('aadhar');
  const [documentNumber, setDocumentNumber] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState<any>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }
    fetchVerificationStatus();
  }, [user, authLoading, navigate]);

  const fetchVerificationStatus = async () => {
    try {
      setCheckingStatus(true);
      const status = await verificationService.getVerificationStatus(user!.id);
      setVerificationStatus(status);
    } catch (error) {
      console.error('Error fetching verification status:', error);
    } finally {
      setCheckingStatus(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file || !documentNumber) {
      showToast.error('Please provide document and number');
      return;
    }

    setLoading(true);
    const compressingToast = showToast.loading('Compressing image...');

    try {
      const result = await verificationService.uploadIDDocument(
        user!.id,
        file,
        documentType,
        documentNumber
      );

      showToast.dismiss(compressingToast);
      
      // Show compression success
      const originalSizeKB = (result.originalSize / 1024).toFixed(1);
      const compressedSizeKB = (result.compressedSize / 1024).toFixed(1);
      showToast.success(
        `✅ Compressed ${originalSizeKB}KB → ${compressedSizeKB}KB (${result.compressionRatio}% saved) & uploaded!`
      );
      
      setTimeout(() => {
        showToast.success('Document submitted! Awaiting admin verification.');
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      }, 2000);
    } catch (error: any) {
      console.error('Error uploading document:', error);
      showToast.dismiss(compressingToast);
      
      // Show specific error message
      const errorMessage = error?.message || 'Failed to upload document';
      showToast.error(`❌ Upload failed: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking status
  if (checkingStatus) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-yellow-50 flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show status if already submitted (only if document URL exists)
  if (verificationStatus?.id_verification_status === 'pending' && verificationStatus?.id_document_url) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-yellow-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-lg"
        >
          <Clock className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification Pending</h2>
          <p className="text-gray-600 mb-6">
            Your ID document is under review. We'll notify you once it's verified.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 text-white px-6 py-3 rounded-lg hover:shadow-xl hover:scale-105 transition-colors"
          >
            Back to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  // Show verified status (only if actually verified)
  if (verificationStatus?.id_verified && verificationStatus?.id_document_url) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-yellow-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-lg"
        >
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">ID Verified!</h2>
          <p className="text-gray-600 mb-6">
            Your ID has been verified. You can now book items.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 text-white px-6 py-3 rounded-lg hover:shadow-xl hover:scale-105 transition-colors"
          >
            Back to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  // Show rejected status (only if document was uploaded and rejected)
  if (verificationStatus?.id_verification_status === 'rejected' && verificationStatus?.id_document_url) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-yellow-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-lg"
        >
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification Rejected</h2>
          <p className="text-gray-600 mb-2">
            Your ID verification was rejected.
          </p>
          {verificationStatus.id_rejection_reason && (
            <p className="text-sm text-red-600 mb-6 bg-red-50 p-3 rounded-lg">
              Reason: {verificationStatus.id_rejection_reason}
            </p>
          )}
          <button
            onClick={() => {
              setVerificationStatus(null);
              fetchVerificationStatus();
            }}
            className="bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 text-white px-6 py-3 rounded-lg hover:shadow-xl hover:scale-105 transition-colors"
          >
            Upload Again
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-yellow-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <Shield className="w-16 h-16 text-amber-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Verify Your Identity</h1>
          <p className="text-gray-600">
            Upload a valid ID document to start booking items
          </p>
        </motion.div>

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6"
        >
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">Why do we need this?</p>
              <ul className="list-disc list-inside space-y-1">
                <li>To ensure trust and safety in our community</li>
                <li>To prevent fraud and misuse</li>
                <li>Required for creating rental agreements</li>
                <li>Your data is encrypted and secure</li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl p-8 shadow-sm"
        >
          {/* Document Type */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Select Document Type *
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'aadhar', label: 'Aadhar Card' },
                { value: 'pan', label: 'PAN Card' },
                { value: 'passport', label: 'Passport' },
                { value: 'driving_license', label: 'Driving License' },
              ].map((doc) => (
                <label
                  key={doc.value}
                  className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    documentType === doc.value
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-primary/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="documentType"
                    value={doc.value}
                    checked={documentType === doc.value}
                    onChange={(e) => setDocumentType(e.target.value as any)}
                    className="w-4 h-4 text-amber-600"
                  />
                  <span className="font-medium">{doc.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Document Number */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Document Number *
            </label>
            <input
              type="text"
              value={documentNumber}
              onChange={(e) => setDocumentNumber(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder={
                documentType === 'aadhar'
                  ? 'XXXX XXXX XXXX'
                  : documentType === 'pan'
                  ? 'ABCDE1234F'
                  : 'Enter document number'
              }
              required
            />
          </div>

          {/* File Upload */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Upload Document Image *
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
              {preview ? (
                <div className="relative">
                  <img
                    src={preview}
                    alt="Document preview"
                    className="max-h-64 mx-auto rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setFile(null);
                      setPreview('');
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                  >
                    <XCircle size={20} />
                  </button>
                </div>
              ) : (
                <>
                  <input
                    type="file"
                    id="document"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    required
                  />
                  <label
                    htmlFor="document"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <Upload className="w-12 h-12 text-gray-400 mb-2" />
                    <span className="text-gray-600 font-medium">
                      Click to upload document
                    </span>
                    <span className="text-sm text-gray-500 mt-1">
                      Clear image, all details visible • Max 5MB
                    </span>
                  </label>
                </>
              )}
            </div>
          </div>

          {/* Important Notes */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-sm font-semibold text-yellow-800 mb-2">
              Important Guidelines:
            </p>
            <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
              <li>Ensure the document is clear and all details are visible</li>
              <li>No blurred or edited images</li>
              <li>Document must be valid and not expired</li>
              <li>Admin will verify within 24-48 hours</li>
            </ul>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !file || !documentNumber}
            className="w-full bg-gradient-to-r from-primary to-accent text-white py-4 rounded-xl font-semibold text-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Uploading...
              </>
            ) : (
              <>
                <Shield size={20} />
                Submit for Verification
              </>
            )}
          </button>
        </motion.form>
      </div>
    </div>
  );
};

export default VerifyID;
