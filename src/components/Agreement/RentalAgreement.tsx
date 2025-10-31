import { motion } from 'framer-motion';
import { FileText, Check } from 'lucide-react';

interface RentalAgreementProps {
  listing: any;
  renterName: string;
  renterPhone: string;
  renterAddress: string;
  ownerName: string;
  ownerPhone: string;
  ownerAddress: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  totalPrice: number;
  orderId: string;
  onAgree: () => void;
  onCancel: () => void;
}

export const RentalAgreement = ({
  listing,
  renterName,
  renterPhone,
  renterAddress,
  ownerName,
  ownerPhone,
  ownerAddress,
  startDate,
  endDate,
  totalDays,
  totalPrice,
  orderId,
  onAgree,
  onCancel,
}: RentalAgreementProps) => {
  const today = new Date().toLocaleDateString('en-IN');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-8 h-8 text-amber-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Rental Agreement</h2>
              <p className="text-sm text-gray-600">Please review and agree to the terms</p>
            </div>
          </div>
        </div>

        {/* Agreement Content */}
        <div className="p-6 space-y-6">
          {/* Header Info */}
          <div className="text-center border-b pb-4">
            <h1 className="text-3xl font-bold text-gray-900">NEIGHBOUR FRIENDLY RENTALS</h1>
            <p className="text-lg font-semibold text-gray-700 mt-1">RENTAL AGREEMENT</p>
          </div>

          {/* Agreement Date and Order ID */}
          <div className="flex justify-between text-sm">
            <div>
              <span className="font-semibold">Agreement Date:</span> {today}
            </div>
            <div>
              <span className="font-semibold">Order ID:</span> {orderId}
            </div>
          </div>

          {/* Introduction */}
          <p className="text-sm text-gray-700 leading-relaxed">
            This Rental Agreement is entered between the parties named below. Neighbour Friendly Rentals (the Platform) 
            acts only as a facilitator and is not a party to the contractual obligations between Lender and Renter except 
            where expressly stated.
          </p>

          {/* Parties Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Lender */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-bold text-gray-900 mb-3">Lender (Owner)</h3>
              <div className="space-y-2 text-sm">
                <div><span className="font-semibold">Name:</span> {ownerName}</div>
                <div><span className="font-semibold">Phone:</span> {ownerPhone}</div>
                <div><span className="font-semibold">Address:</span> {ownerAddress}</div>
              </div>
            </div>

            {/* Renter */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-bold text-gray-900 mb-3">Renter (User)</h3>
              <div className="space-y-2 text-sm">
                <div><span className="font-semibold">Name:</span> {renterName}</div>
                <div><span className="font-semibold">Phone:</span> {renterPhone}</div>
                <div><span className="font-semibold">Address:</span> {renterAddress}</div>
              </div>
            </div>
          </div>

          {/* Item Details */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-bold text-gray-900 mb-3">1. Item Details</h3>
            <div className="space-y-2 text-sm">
              <div><span className="font-semibold">Item Name:</span> {listing.title}</div>
              <div><span className="font-semibold">Condition at Handover:</span> {listing.condition}</div>
              <div><span className="font-semibold">Start Date:</span> {new Date(startDate).toLocaleDateString('en-IN')}</div>
              <div><span className="font-semibold">Return Date:</span> {new Date(endDate).toLocaleDateString('en-IN')}</div>
              <div><span className="font-semibold">Rental Duration:</span> {totalDays} Day{totalDays > 1 ? 's' : ''}</div>
              <div><span className="font-semibold">Rental Amount:</span> ₹{totalPrice}/- (Rupees {numberToWords(totalPrice)} Only)</div>
              <div><span className="font-semibold">Payment Method:</span> Cash/UPI on Delivery</div>
            </div>
          </div>

          {/* Responsibilities */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-bold text-gray-900 mb-3">2. Responsibilities of the Renter</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
              <li>The Renter shall use the rented item with due care and return it in the same working and physical condition as at handover (reasonable wear and tear excepted).</li>
              <li>The Renter is responsible for loss, theft, damage, or malfunction occurring during the rental period (except normal wear and tear).</li>
              <li>In case of loss or damage, the Renter must pay for repair or replacement as reasonably determined by the Lender and/or Platform.</li>
              <li>The Renter shall not sub-rent, loan, or otherwise transfer the item to a third party.</li>
              <li>The Renter must return the item by the agreed return date and time. Late returns may attract additional charges.</li>
            </ol>
          </div>

          {/* Legal & Recovery */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-bold text-gray-900 mb-3">3. Legal & Recovery</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
              <li>If the item is not returned or charges are not paid, the Lender and/or Platform may pursue recovery including legal remedies under applicable law.</li>
              <li>The Renter authorises the Lender/Platform to use the contact and identification information provided for lawful recovery and dispute resolution.</li>
              <li>The Renter shall cooperate with reasonable recovery or investigation efforts.</li>
            </ol>
          </div>

          {/* Handover & Return */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-bold text-gray-900 mb-3">4. Handover & Return Check</h3>
            <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
              <li>The Lender and Renter shall jointly inspect the item at handover and again at return; any defects or missing accessories observed at return will be recorded.</li>
              <li>All discrepancies should be documented and confirmed by both parties at the time of return to avoid disputes.</li>
            </ul>
          </div>

          {/* Liability */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-bold text-gray-900 mb-3">5. Liability</h3>
            <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
              <li>The Platform acts solely as a facilitator and is not liable for disputes, losses, or damages arising from the use or condition of the item, except where required by law.</li>
              <li>The Lender and Renter agree to resolve disputes amicably; if resolution is not possible, they may pursue remedies available under applicable law.</li>
            </ul>
          </div>

          {/* Payment Terms */}
          <div className="border border-gray-200 rounded-lg p-4 bg-yellow-50">
            <h3 className="font-bold text-gray-900 mb-3">6. Payment Terms</h3>
            <p className="text-sm text-gray-700">
              Payment of ₹{totalPrice}/- shall be made via <span className="font-semibold">Cash or UPI on Delivery</span>. 
              The Renter agrees to pay the full rental amount to the Lender at the time of item handover. 
              No booking is confirmed until payment is received by the Lender.
            </p>
          </div>

          {/* Governing Law */}
          <div className="text-sm text-gray-700 border-t pt-4">
            <p><span className="font-semibold">Governing Law:</span> This Agreement shall be governed by and interpreted in accordance with the laws of India.</p>
            <p className="mt-2"><span className="font-semibold">Entire Agreement:</span> This document represents the entire agreement between the parties with respect to the subject matter hereof.</p>
          </div>

          {/* Agreement Checkbox */}
          <div className="bg-primary/5 border-2 border-amber-500 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <Check className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
              <div>
                <p className="font-semibold text-gray-900 mb-2">Digital Confirmation</p>
                <p className="text-sm text-gray-700">
                  By clicking "I Agree" below, you confirm that you have read, understood, and agree to all the terms 
                  and conditions of this Rental Agreement. This constitutes your digital signature and is legally binding.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex gap-4">
          <button
            onClick={onCancel}
            className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onAgree}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <Check className="w-5 h-5" />
            I Agree & Confirm Booking
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Helper function to convert number to words (simplified for Indian Rupees)
function numberToWords(num: number): string {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

  if (num === 0) return 'Zero';
  if (num < 10) return ones[num];
  if (num < 20) return teens[num - 10];
  if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 !== 0 ? ' ' + ones[num % 10] : '');
  if (num < 1000) return ones[Math.floor(num / 100)] + ' Hundred' + (num % 100 !== 0 ? ' ' + numberToWords(num % 100) : '');
  if (num < 100000) return numberToWords(Math.floor(num / 1000)) + ' Thousand' + (num % 1000 !== 0 ? ' ' + numberToWords(num % 1000) : '');
  if (num < 10000000) return numberToWords(Math.floor(num / 100000)) + ' Lakh' + (num % 100000 !== 0 ? ' ' + numberToWords(num % 100000) : '');
  
  return num.toString();
}
