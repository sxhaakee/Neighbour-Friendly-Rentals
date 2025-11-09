import { motion } from 'framer-motion';
import { FileText, AlertCircle, Shield, Users, DollarSign, Ban } from 'lucide-react';

const Terms = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-yellow-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-12">
            <FileText className="w-16 h-16 text-amber-500 mx-auto mb-4" />
            <h1 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-amber-600 via-yellow-600 to-orange-600 bg-clip-text text-transparent">
                Terms of Service
              </span>
            </h1>
            <p className="text-gray-600">Last Updated: November 9, 2025</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-yellow-100 p-8 space-y-8">
            {/* Introduction */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                By accessing or using NeighbourFriendly Rentals ("Platform"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
              </p>
            </section>

            {/* Service Description */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-6 h-6 text-amber-500" />
                <h2 className="text-2xl font-bold text-gray-900">2. Service Description</h2>
              </div>
              <p className="text-gray-700 leading-relaxed mb-4">
                NeighbourFriendly Rentals is a peer-to-peer marketplace that connects neighbors to rent items, services, and properties. We provide the platform but are not a party to the rental agreements between users.
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li><strong>Items:</strong> Tools, electronics, furniture, and other physical goods</li>
                <li><strong>Services:</strong> Photography, catering, event planning, and professional services</li>
                <li><strong>Properties:</strong> Apartments, houses, rooms, and commercial spaces</li>
              </ul>
            </section>

            {/* User Accounts */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. User Accounts</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">3.1 Registration</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>You must be at least 18 years old to use our services</li>
                <li>You must provide accurate and complete information</li>
                <li>You are responsible for maintaining account security</li>
                <li>One person may only create one account</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">3.2 ID Verification</h3>
              <p className="text-gray-700 leading-relaxed">
                To build trust and safety, we require ID verification for certain activities. Verified users receive a badge and may access premium features.
              </p>
            </section>

            {/* User Responsibilities */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-6 h-6 text-amber-500" />
                <h2 className="text-2xl font-bold text-gray-900">4. User Responsibilities</h2>
              </div>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">4.1 As a Renter:</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Treat rented items with care and respect</li>
                <li>Return items on time and in the same condition</li>
                <li>Pay agreed-upon rental fees promptly</li>
                <li>Report any damage or issues immediately</li>
                <li>Follow the owner's usage guidelines</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">4.2 As an Owner:</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Provide accurate descriptions and photos</li>
                <li>Ensure items are clean, safe, and functional</li>
                <li>Honor confirmed bookings</li>
                <li>Respond to inquiries promptly</li>
                <li>Maintain appropriate insurance coverage</li>
              </ul>
            </section>

            {/* Prohibited Activities */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Ban className="w-6 h-6 text-red-500" />
                <h2 className="text-2xl font-bold text-gray-900">5. Prohibited Activities</h2>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-gray-800 font-semibold mb-3">You may NOT:</p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>List illegal items or services</li>
                  <li>Engage in fraudulent activities</li>
                  <li>Harass, threaten, or abuse other users</li>
                  <li>Scrape or copy platform data</li>
                  <li>Create fake accounts or reviews</li>
                  <li>Circumvent payment systems</li>
                  <li>Violate intellectual property rights</li>
                  <li>Use the platform for commercial resale</li>
                </ul>
              </div>
            </section>

            {/* Payments and Fees */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <DollarSign className="w-6 h-6 text-amber-500" />
                <h2 className="text-2xl font-bold text-gray-900">6. Payments and Fees</h2>
              </div>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">6.1 Platform Fees</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>We may charge a service fee on transactions</li>
                <li>Premium membership offers additional features</li>
                <li>Fees are subject to change with notice</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">6.2 Payment Processing</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Payments are processed securely through third-party providers</li>
                <li>Refunds are subject to our refund policy</li>
                <li>Disputes should be reported within 48 hours</li>
              </ul>
            </section>

            {/* Liability */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="w-6 h-6 text-amber-500" />
                <h2 className="text-2xl font-bold text-gray-900">7. Limitation of Liability</h2>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-gray-700 leading-relaxed mb-3">
                  <strong>IMPORTANT:</strong> NeighbourFriendly Rentals acts as an intermediary platform only. We are NOT responsible for:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>Quality, safety, or legality of listed items/services</li>
                  <li>Accuracy of user-provided information</li>
                  <li>Disputes between users</li>
                  <li>Loss, damage, or theft of items</li>
                  <li>Personal injury or property damage</li>
                  <li>Actions or inactions of users</li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-3">
                  Users engage in rental transactions at their own risk and should maintain appropriate insurance coverage.
                </p>
              </div>
            </section>

            {/* Intellectual Property */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Intellectual Property</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                All platform content, including logos, designs, and code, is owned by NeighbourFriendly Rentals and protected by copyright and trademark laws.
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>You retain ownership of content you upload</li>
                <li>You grant us a license to display your content on the platform</li>
                <li>You may not copy, modify, or distribute our platform code</li>
              </ul>
            </section>

            {/* Termination */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Termination</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We reserve the right to suspend or terminate accounts that violate these terms, without notice or liability.
              </p>
              <p className="text-gray-700 leading-relaxed">
                You may delete your account at any time through account settings.
              </p>
            </section>

            {/* Dispute Resolution */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Dispute Resolution</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Users should first attempt to resolve disputes directly</li>
                <li>Platform support can mediate disputes</li>
                <li>Unresolved disputes are subject to Indian law and jurisdiction</li>
              </ul>
            </section>

            {/* Changes to Terms */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Changes to Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                We may modify these terms at any time. Continued use of the platform after changes constitutes acceptance of the new terms.
              </p>
            </section>

            {/* Governing Law */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Governing Law</h2>
              <p className="text-gray-700 leading-relaxed">
                These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in India.
              </p>
            </section>

            {/* Contact */}
            <section className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-lg p-6 border border-amber-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Contact Us</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Questions about these Terms of Service? Contact us:
              </p>
              <ul className="space-y-2 text-gray-700">
                <li><strong>Email:</strong> friendlyrentals.mlr@gmail.com</li>
                <li><strong>Phone:</strong> +91 8197424986</li>
                <li><strong>Website:</strong> https://neighbourfriendly.in</li>
              </ul>
            </section>

            {/* Acknowledgment */}
            <section className="border-t border-gray-200 pt-6">
              <p className="text-sm text-gray-600 text-center">
                By using NeighbourFriendly Rentals, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Terms;
