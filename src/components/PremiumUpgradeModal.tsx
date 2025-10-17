import { X, Crown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PremiumUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  listingType: 'item' | 'property' | 'service';
  currentCount: number;
  limit: number;
}

export const PremiumUpgradeModal = ({
  isOpen,
  onClose,
  listingType,
  currentCount,
  limit,
}: PremiumUpgradeModalProps) => {
  const listingTypeNames = {
    item: 'Products',
    property: 'Properties',
    service: 'Services',
  };

  const premiumFeatures = [
    'Unlimited product listings',
    'Unlimited property listings',
    'Unlimited service listings',
    'Priority customer support',
    'Featured listings badge',
    'Advanced analytics',
    'No commission fees',
    'Early access to new features',
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="relative bg-gradient-to-br from-primary via-primary/90 to-accent p-8 text-white">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex items-center justify-center mb-4">
                  <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center">
                    <Crown className="w-8 h-8 text-gray-900" />
                  </div>
                </div>

                <h2 className="text-3xl font-bold text-center mb-2">
                  Upgrade to Premium
                </h2>
                <p className="text-center text-teal-100">
                  You have reached your free tier limit
                </p>
              </div>

              <div className="p-8">
                <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-6">
                  <p className="text-red-800 font-semibold text-center">
                    You have {currentCount} of {limit} {listingTypeNames[listingType]} listed
                  </p>
                  <p className="text-red-600 text-sm text-center mt-1">
                    Upgrade to premium to add unlimited listings!
                  </p>
                </div>

                <div className="mb-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    Premium Benefits
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {premiumFeatures.map((feature, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-3 h-3 text-green-600" />
                        </div>
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-secondary/10 to-secondary/5 rounded-xl p-6 mb-6">
                  <div className="flex items-baseline justify-center gap-2 mb-2">
                    <span className="text-5xl font-bold text-gray-900">₹29</span>
                    <span className="text-gray-600">/month</span>
                  </div>
                  <p className="text-center text-green-600 text-sm font-semibold">
                    Limited Time Offer!
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Maybe Later
                  </button>
                  <button
                    onClick={() => {
                      // TODO: Implement payment integration
                      alert('Payment integration coming soon!');
                    }}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <Crown className="w-5 h-5" />
                    Upgrade Now
                  </button>
                </div>

                <p className="text-center text-gray-500 text-sm mt-4">
                  Cancel anytime. No hidden fees.
                </p>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
