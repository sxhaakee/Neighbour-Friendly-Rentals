import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';

const Privacy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-yellow-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <Shield className="w-16 h-16 text-primary mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
          <p className="text-gray-600">Last updated: October 12, 2025</p>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-8 shadow-sm space-y-8"
        >
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
            <p className="text-gray-700 leading-relaxed">
              Neighbour Friendly Rentals ("NFRR", "we", "us", or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Information We Collect</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-4">2.1 Information You Provide</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li><strong>Account Information:</strong> Name, email address, phone number, password</li>
              <li><strong>Profile Information:</strong> Profile photo, location, bio</li>
              <li><strong>ID Verification:</strong> Government-issued ID documents (Aadhar, PAN, Passport, Driving License)</li>
              <li><strong>Listing Information:</strong> Item descriptions, photos, pricing, availability</li>
              <li><strong>Booking Information:</strong> Rental dates, payment details, delivery addresses</li>
              <li><strong>Communication:</strong> Messages sent through our chat system</li>
              <li><strong>Dispute Videos:</strong> Videos recorded for dispute resolution</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-4">2.2 Automatically Collected Information</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li><strong>Usage Data:</strong> Pages visited, features used, time spent on platform</li>
              <li><strong>Device Information:</strong> IP address, browser type, operating system</li>
              <li><strong>Location Data:</strong> Approximate location based on IP address</li>
              <li><strong>Cookies:</strong> Session data, preferences, analytics</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How We Use Your Information</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              We use your information to:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Provide and maintain our services</li>
              <li>Process bookings and payments</li>
              <li>Verify user identities</li>
              <li>Facilitate communication between users</li>
              <li>Send booking confirmations and reminders</li>
              <li>Resolve disputes and provide customer support</li>
              <li>Improve our platform and user experience</li>
              <li>Detect and prevent fraud and abuse</li>
              <li>Comply with legal obligations</li>
              <li>Send marketing communications (with your consent)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Information Sharing</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              We share your information with:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li><strong>Other Users:</strong> Profile information, listings, reviews are visible to other users</li>
              <li><strong>Transaction Parties:</strong> Contact information is shared between Lenders and Renters for confirmed bookings</li>
              <li><strong>Service Providers:</strong> Third-party services for hosting, analytics, payment processing</li>
              <li><strong>Legal Authorities:</strong> When required by law or to protect rights and safety</li>
              <li><strong>Business Transfers:</strong> In case of merger, acquisition, or sale of assets</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-3">
              We do NOT sell your personal information to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Data Security</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              We implement security measures to protect your information:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Encryption of data in transit and at rest</li>
              <li>Secure authentication (JWT tokens)</li>
              <li>Row-level security in our database</li>
              <li>Regular security audits</li>
              <li>Access controls and monitoring</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-3">
              However, no method of transmission over the internet is 100% secure. We cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Data Retention</h2>
            <p className="text-gray-700 leading-relaxed">
              We retain your information for as long as necessary to provide our services and comply with legal obligations. Specifically:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mt-3">
              <li><strong>Account Data:</strong> Until you delete your account</li>
              <li><strong>Booking Data:</strong> 7 years for tax and legal compliance</li>
              <li><strong>ID Documents:</strong> Until verification is complete or account is deleted</li>
              <li><strong>Dispute Videos:</strong> Until dispute is resolved, then deleted</li>
              <li><strong>Chat Messages:</strong> Last 100 messages per conversation</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Your Rights</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              You have the right to:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Correction:</strong> Update inaccurate or incomplete information</li>
              <li><strong>Deletion:</strong> Request deletion of your data (subject to legal requirements)</li>
              <li><strong>Portability:</strong> Receive your data in a machine-readable format</li>
              <li><strong>Objection:</strong> Object to processing of your data for certain purposes</li>
              <li><strong>Withdraw Consent:</strong> Opt-out of marketing communications</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-3">
              To exercise these rights, contact us at privacy@nfrr.com
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Cookies and Tracking</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              We use cookies and similar technologies to:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Keep you logged in</li>
              <li>Remember your preferences</li>
              <li>Analyze platform usage (Google Analytics)</li>
              <li>Improve user experience</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-3">
              You can control cookies through your browser settings. Disabling cookies may affect platform functionality.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Third-Party Services</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              We use third-party services:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li><strong>Supabase:</strong> Database and authentication</li>
              <li><strong>Google Analytics:</strong> Usage analytics</li>
              <li><strong>Google OAuth:</strong> Social login (optional)</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-3">
              These services have their own privacy policies. We recommend reviewing them.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Children's Privacy</h2>
            <p className="text-gray-700 leading-relaxed">
              NFRR is not intended for users under 18 years of age. We do not knowingly collect information from children. If you believe a child has provided us with personal information, please contact us immediately.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. International Data Transfers</h2>
            <p className="text-gray-700 leading-relaxed">
              Your information may be transferred to and processed in countries other than India. We ensure appropriate safeguards are in place to protect your data in accordance with this Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Changes to Privacy Policy</h2>
            <p className="text-gray-700 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of significant changes via email or platform notification. Continued use after changes constitutes acceptance.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Contact Us</h2>
            <p className="text-gray-700 leading-relaxed">
              For privacy-related questions or requests, contact us at:
            </p>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-700"><strong>Email:</strong> privacy@nfrr.com</p>
              <p className="text-gray-700"><strong>Support:</strong> support@nfrr.com</p>
              <p className="text-gray-700"><strong>Address:</strong> Bangalore, Karnataka, India</p>
            </div>
          </section>

          <div className="border-t pt-6 mt-8">
            <p className="text-sm text-gray-600 text-center">
              By using Neighbour Friendly Rentals, you acknowledge that you have read and understood this Privacy Policy.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Privacy;
