'use client';

import { motion } from 'framer-motion';
import { FileText } from 'lucide-react';

const TermsClient = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-yellow-50">
            <div className="max-w-4xl mx-auto px-4 py-12">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <FileText className="w-16 h-16 text-amber-600 mx-auto mb-4" />
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Terms & Conditions</h1>
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
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
                        <p className="text-gray-700 leading-relaxed">
                            By accessing and using Neighbour Friendly Rentals ("NFR", "we", "us", or "our"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these Terms & Conditions, please do not use our services.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Description of Service</h2>
                        <p className="text-gray-700 leading-relaxed mb-3">
                            NFR is a peer-to-peer rental marketplace platform that facilitates connections between item owners ("Lenders") and people who need to rent items ("Renters"). We act solely as a facilitator and are not a party to the rental transactions between users.
                        </p>
                        <p className="text-gray-700 leading-relaxed">
                            Our platform provides:
                        </p>
                        <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mt-2">
                            <li>Listing creation and management</li>
                            <li>Search and discovery features</li>
                            <li>Communication tools (chat)</li>
                            <li>Digital rental agreements</li>
                            <li>ID verification services</li>
                            <li>Payment facilitation (Cash/UPI on delivery)</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">3. User Eligibility</h2>
                        <p className="text-gray-700 leading-relaxed">
                            You must be at least 18 years old to use NFR. By using our services, you represent and warrant that you meet this age requirement and have the legal capacity to enter into binding contracts.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">4. ID Verification</h2>
                        <p className="text-gray-700 leading-relaxed mb-3">
                            All users must complete ID verification before booking items. You agree to:
                        </p>
                        <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                            <li>Provide accurate and valid identification documents</li>
                            <li>Keep your information up to date</li>
                            <li>Not use someone else's identity</li>
                            <li>Allow us to verify your identity through third-party services</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Listing Requirements</h2>
                        <p className="text-gray-700 leading-relaxed mb-3">
                            Lenders must:
                        </p>
                        <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                            <li>Own or have legal authority to rent the listed items</li>
                            <li>Provide accurate descriptions and photos</li>
                            <li>Set fair and reasonable rental prices</li>
                            <li>Maintain items in the condition described</li>
                            <li>Comply with all applicable laws and regulations</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Booking and Payment</h2>
                        <p className="text-gray-700 leading-relaxed mb-3">
                            When you book an item:
                        </p>
                        <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                            <li>You enter into a binding rental agreement with the Lender</li>
                            <li>Payment is made via Cash or UPI on delivery</li>
                            <li>A 10% service charge applies for platform maintenance and trust</li>
                            <li>Delivery & pickup service (₹40) is optional</li>
                            <li>A 20% security deposit is required and refundable upon item return</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Video Recording Requirement</h2>
                        <p className="text-gray-700 leading-relaxed mb-3">
                            <strong>MANDATORY:</strong> Both Lenders and Renters must record clear videos of the item:
                        </p>
                        <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                            <li>During handover (when item is delivered/picked up)</li>
                            <li>During return (when item is returned)</li>
                            <li>Videos must show all sides, accessories, and condition</li>
                            <li>Videos are stored until rental is completed without disputes</li>
                            <li>Failure to record videos may result in disputes being resolved against you</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">8. User Responsibilities</h2>
                        <p className="text-gray-700 leading-relaxed mb-3">
                            <strong>Renters must:</strong>
                        </p>
                        <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
                            <li>Use items with reasonable care</li>
                            <li>Return items on time and in the same condition</li>
                            <li>Pay for any damage, loss, or theft</li>
                            <li>Not sub-rent or transfer items to third parties</li>
                            <li>Follow all safety guidelines and instructions</li>
                        </ul>
                        <p className="text-gray-700 leading-relaxed mb-3">
                            <strong>Lenders must:</strong>
                        </p>
                        <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                            <li>Provide items in the described condition</li>
                            <li>Be available for handover and return</li>
                            <li>Respond to Renter inquiries promptly</li>
                            <li>Not discriminate against Renters</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Cancellation and Refunds</h2>
                        <p className="text-gray-700 leading-relaxed">
                            Cancellation policies are determined by individual Lenders. Security deposits are refundable upon successful return of items in the agreed condition. Service charges are non-refundable once a booking is confirmed.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Dispute Resolution</h2>
                        <p className="text-gray-700 leading-relaxed mb-3">
                            In case of disputes:
                        </p>
                        <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                            <li>Video recordings will be the primary evidence</li>
                            <li>Users should attempt to resolve disputes amicably</li>
                            <li>NFR may mediate but is not obligated to do so</li>
                            <li>Legal remedies are available under applicable law</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Limitation of Liability</h2>
                        <p className="text-gray-700 leading-relaxed">
                            NFR acts solely as a platform facilitator. We are not responsible for the quality, safety, legality, or availability of listed items. We are not liable for any damages, losses, or injuries arising from rental transactions. Users engage in transactions at their own risk.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Prohibited Activities</h2>
                        <p className="text-gray-700 leading-relaxed mb-3">
                            You may not:
                        </p>
                        <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                            <li>List illegal, stolen, or counterfeit items</li>
                            <li>Engage in fraudulent activities</li>
                            <li>Harass or threaten other users</li>
                            <li>Manipulate reviews or ratings</li>
                            <li>Circumvent platform fees</li>
                            <li>Use the platform for commercial purposes without authorization</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Account Termination</h2>
                        <p className="text-gray-700 leading-relaxed">
                            We reserve the right to suspend or terminate accounts that violate these terms, engage in prohibited activities, or pose risks to other users. You may close your account at any time by contacting us.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">14. Intellectual Property</h2>
                        <p className="text-gray-700 leading-relaxed">
                            All content on NFR, including logos, designs, text, and software, is owned by us or our licensors. You may not copy, modify, or distribute our content without permission.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">15. Changes to Terms</h2>
                        <p className="text-gray-700 leading-relaxed">
                            We may update these Terms & Conditions from time to time. Continued use of our services after changes constitutes acceptance of the new terms. We will notify users of significant changes via email or platform notifications.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">16. Governing Law</h2>
                        <p className="text-gray-700 leading-relaxed">
                            These Terms & Conditions are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in Bangalore, Karnataka.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">17. Contact Us</h2>
                        <p className="text-gray-700 leading-relaxed">
                            If you have questions about these Terms & Conditions, please contact us at:
                        </p>
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                            <p className="text-gray-700"><strong>Email:</strong> support@nfrr.com</p>
                            <p className="text-gray-700"><strong>Address:</strong> Bangalore, Karnataka, India</p>
                        </div>
                    </section>

                    <div className="border-t pt-6 mt-8">
                        <p className="text-sm text-gray-600 text-center">
                            By using Neighbour Friendly Rentals, you acknowledge that you have read, understood, and agree to be bound by these Terms & Conditions.
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default TermsClient;
