import { motion } from 'framer-motion';
import { Shield, Lock, Eye, UserCheck, Database, Bell } from 'lucide-react';

const Privacy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-yellow-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-12">
            <Shield className="w-16 h-16 text-amber-500 mx-auto mb-4" />
            <h1 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-amber-600 via-yellow-600 to-orange-600 bg-clip-text text-transparent">
                Privacy Policy
              </span>
            </h1>
            <p className="text-gray-600">Last Updated: November 9, 2025</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-yellow-100 p-8 space-y-8">
            {/* Introduction */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
              <p className="text-gray-700 leading-relaxed">
                Welcome to NeighbourFriendly Rentals ("we," "our," or "us"). We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our peer-to-peer rental marketplace platform.
              </p>
            </section>

            {/* Information We Collect */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Database className="w-6 h-6 text-amber-500" />
                <h2 className="text-2xl font-bold text-gray-900">2. Information We Collect</h2>
              </div>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">2.1 Personal Information</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Name, email address, and phone number</li>
                <li>Profile picture and bio</li>
                <li>Government-issued ID for verification (encrypted and securely stored)</li>
                <li>Payment information (processed securely through third-party providers)</li>
                <li>Location data (city/neighborhood for local connections)</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">2.2 Listing Information</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Items, services, or properties you list for rent</li>
                <li>Photos, descriptions, and pricing</li>
                <li>Availability and booking details</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">2.3 Usage Data</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Browsing activity and search queries</li>
                <li>Device information and IP address</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </section>

            {/* How We Use Your Information */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <UserCheck className="w-6 h-6 text-amber-500" />
                <h2 className="text-2xl font-bold text-gray-900">3. How We Use Your Information</h2>
              </div>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>To provide and maintain our rental marketplace services</li>
                <li>To verify user identity and prevent fraud</li>
                <li>To facilitate transactions between renters and owners</li>
                <li>To send notifications about bookings, messages, and account activity</li>
                <li>To improve our platform and user experience</li>
                <li>To comply with legal obligations</li>
                <li>To send promotional emails (with your consent)</li>
              </ul>
            </section>

            {/* Data Sharing */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Eye className="w-6 h-6 text-amber-500" />
                <h2 className="text-2xl font-bold text-gray-900">4. Data Sharing and Disclosure</h2>
              </div>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">We share your information with:</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li><strong>Other Users:</strong> Your public profile, listings, and reviews are visible to other users</li>
                <li><strong>Service Providers:</strong> Payment processors, hosting services, and analytics tools</li>
                <li><strong>Legal Authorities:</strong> When required by law or to protect our rights</li>
                <li><strong>Business Transfers:</strong> In case of merger, acquisition, or sale of assets</li>
              </ul>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
                <p className="text-gray-800 font-semibold">We DO NOT:</p>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4 mt-2">
                  <li>Sell your personal information to third parties</li>
                  <li>Share your data for advertising purposes without consent</li>
                  <li>Use your data to train AI/ML models without explicit permission</li>
                </ul>
              </div>
            </section>

            {/* Data Security */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Lock className="w-6 h-6 text-amber-500" />
                <h2 className="text-2xl font-bold text-gray-900">5. Data Security</h2>
              </div>
              <p className="text-gray-700 leading-relaxed mb-4">
                We implement industry-standard security measures to protect your information:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>SSL/TLS encryption for data transmission</li>
                <li>Encrypted storage for sensitive information</li>
                <li>Regular security audits and updates</li>
                <li>Access controls and authentication</li>
                <li>Secure payment processing through trusted providers</li>
              </ul>
            </section>

            {/* Your Rights */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Bell className="w-6 h-6 text-amber-500" />
                <h2 className="text-2xl font-bold text-gray-900">6. Your Rights</h2>
              </div>
              <p className="text-gray-700 leading-relaxed mb-4">You have the right to:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Access your personal data</li>
                <li>Correct inaccurate information</li>
                <li>Delete your account and data</li>
                <li>Export your data</li>
                <li>Opt-out of marketing communications</li>
                <li>Withdraw consent for data processing</li>
              </ul>
            </section>

            {/* Cookies */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Cookies and Tracking</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We use cookies and similar technologies to enhance your experience. You can control cookie preferences through your browser settings.
              </p>
            </section>

            {/* Children's Privacy */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Children's Privacy</h2>
              <p className="text-gray-700 leading-relaxed">
                Our services are not intended for users under 18 years of age. We do not knowingly collect information from children.
              </p>
            </section>

            {/* Changes to Policy */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Changes to This Policy</h2>
              <p className="text-gray-700 leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of significant changes via email or platform notification.
              </p>
            </section>

            {/* Contact */}
            <section className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-lg p-6 border border-amber-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Contact Us</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you have questions about this Privacy Policy or your data, please contact us:
              </p>
              <ul className="space-y-2 text-gray-700">
                <li><strong>Email:</strong> friendlyrentals.mlr@gmail.com</li>
                <li><strong>Phone:</strong> +91 8197424986</li>
                <li><strong>Address:</strong> India</li>
              </ul>
            </section>

            {/* Compliance */}
            <section className="border-t border-gray-200 pt-6">
              <p className="text-sm text-gray-600 text-center">
                This Privacy Policy complies with applicable data protection laws including the Information Technology Act, 2000 (India) and GDPR principles. Trademark and copyright registration is in progress.
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Privacy;
