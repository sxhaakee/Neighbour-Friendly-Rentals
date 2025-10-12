// PDF Generation utility
// Note: This requires jsPDF library
// Install: npm install jspdf

export const generateAgreementPDF = async (agreementData: any) => {
  try {
    // Dynamic import to avoid bundling issues
    const { jsPDF } = await import('jspdf');
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPos = 20;

    // Helper function to add text
    const addText = (text: string, x: number, size: number = 10, style: string = 'normal') => {
      doc.setFontSize(size);
      doc.setFont('helvetica', style);
      doc.text(text, x, yPos);
      yPos += size / 2 + 2;
    };

    // Helper function to check page break
    const checkPageBreak = () => {
      if (yPos > pageHeight - 20) {
        doc.addPage();
        yPos = 20;
      }
    };

    // Header
    doc.setFillColor(20, 184, 166);
    doc.rect(0, 0, pageWidth, 30, 'F');
    doc.setTextColor(255, 255, 255);
    addText('NEIGHBOUR FRIENDLY RENTALS', pageWidth / 2, 16, 'bold');
    doc.setTextColor(0, 0, 0);
    yPos = 40;

    // Title
    addText('RENTAL AGREEMENT', pageWidth / 2, 18, 'bold');
    yPos += 5;

    // Agreement Details
    addText(`Agreement Date: ${new Date().toLocaleDateString('en-IN')}`, 15, 10);
    addText(`Order ID: ${agreementData.order_id || agreementData.orderId || 'N/A'}`, 15, 10);
    yPos += 5;

    // Introduction
    doc.setFontSize(9);
    const introText = 'This Rental Agreement is entered between the parties named below. Neighbour Friendly Rentals (the Platform) acts only as a facilitator and is not a party to the contractual obligations between Lender and Renter except where expressly stated.';
    const splitIntro = doc.splitTextToSize(introText, pageWidth - 30);
    doc.text(splitIntro, 15, yPos);
    yPos += splitIntro.length * 5 + 5;

    checkPageBreak();

    // Parties Information
    addText('PARTIES TO THE AGREEMENT', 15, 12, 'bold');
    yPos += 2;

    // Lender
    addText('Lender (Owner):', 15, 10, 'bold');
    addText(`Name: ${agreementData.owner?.name || agreementData.ownerName || 'N/A'}`, 20, 9);
    addText(`Phone: ${agreementData.owner?.phone || agreementData.ownerPhone || 'N/A'}`, 20, 9);
    addText(`Address: ${agreementData.owner?.address || agreementData.ownerAddress || 'N/A'}`, 20, 9);
    yPos += 3;

    // Renter
    addText('Renter (User):', 15, 10, 'bold');
    addText(`Name: ${agreementData.renter?.name || agreementData.renterName || 'N/A'}`, 20, 9);
    addText(`Phone: ${agreementData.renter?.phone || agreementData.renterPhone || 'N/A'}`, 20, 9);
    addText(`Address: ${agreementData.renter?.address || agreementData.renterAddress || 'N/A'}`, 20, 9);
    yPos += 5;

    checkPageBreak();

    // Item Details
    addText('1. ITEM DETAILS', 15, 12, 'bold');
    addText(`Item Name: ${agreementData.listing?.title || agreementData.itemTitle || 'N/A'}`, 20, 9);
    addText(`Condition: ${agreementData.listing?.condition || agreementData.itemCondition || 'Good'}`, 20, 9);
    addText(`Start Date: ${agreementData.rental_details?.start_date || agreementData.startDate || 'N/A'}`, 20, 9);
    addText(`Return Date: ${agreementData.rental_details?.end_date || agreementData.endDate || 'N/A'}`, 20, 9);
    addText(`Duration: ${agreementData.rental_details?.total_days || agreementData.totalDays || 0} days`, 20, 9);
    addText(`Rental Amount: ₹${agreementData.rental_details?.total_price || agreementData.totalPrice || 0}/-`, 20, 9);
    addText(`Payment Method: ${agreementData.rental_details?.payment_method || agreementData.paymentMethod || 'Cash'}`, 20, 9);
    yPos += 5;

    checkPageBreak();

    // Payment Breakdown
    addText('2. PAYMENT BREAKDOWN', 15, 12, 'bold');
    addText(`Item Price: ₹${agreementData.rental_details?.item_price || agreementData.itemPrice || 0}`, 20, 9);
    addText(`Service Charge (10%): ₹${agreementData.rental_details?.service_charge || agreementData.serviceCharge || 0}`, 20, 9);
    const deliveryCharge = agreementData.rental_details?.delivery_charge || agreementData.deliveryCharge || 0;
    if (deliveryCharge > 0) {
      addText(`Delivery & Pickup: ₹${deliveryCharge}`, 20, 9);
    }
    addText(`Security Deposit (20%): ₹${agreementData.rental_details?.security_deposit || agreementData.securityDeposit || 0}`, 20, 9);
    addText(`TOTAL: ₹${agreementData.rental_details?.total_price || agreementData.totalPrice || 0}`, 20, 10, 'bold');
    yPos += 5;

    checkPageBreak();

    // Responsibilities
    addText('3. RESPONSIBILITIES OF THE RENTER', 15, 12, 'bold');
    const responsibilities = [
      'The Renter shall use the rented item with due care and return it in the same condition.',
      'The Renter is responsible for loss, theft, or damage during the rental period.',
      'In case of damage, the Renter must pay for repair or replacement.',
      'The Renter shall not sub-rent or transfer the item to a third party.',
      'The Renter must return the item by the agreed return date.',
    ];
    responsibilities.forEach((resp, index) => {
      checkPageBreak();
      const text = `${index + 1}. ${resp}`;
      const split = doc.splitTextToSize(text, pageWidth - 40);
      doc.text(split, 20, yPos);
      yPos += split.length * 4 + 2;
    });
    yPos += 3;

    checkPageBreak();

    // Video Recording Requirement
    addText('4. VIDEO RECORDING REQUIREMENT', 15, 12, 'bold');
    const videoText = 'Both parties MUST record clear videos of the item during handover and return, showing all sides, accessories, and condition. These videos are mandatory for dispute resolution.';
    const splitVideo = doc.splitTextToSize(videoText, pageWidth - 40);
    doc.text(splitVideo, 20, yPos);
    yPos += splitVideo.length * 4 + 5;

    checkPageBreak();

    // Legal
    addText('5. LEGAL & RECOVERY', 15, 12, 'bold');
    const legalText = 'If the item is not returned or charges are not paid, the Lender and/or Platform may pursue recovery including legal remedies under applicable law.';
    const splitLegal = doc.splitTextToSize(legalText, pageWidth - 40);
    doc.text(splitLegal, 20, yPos);
    yPos += splitLegal.length * 4 + 5;

    checkPageBreak();

    // Signatures
    yPos += 10;
    addText('DIGITAL CONFIRMATION', 15, 12, 'bold');
    addText(`Renter: ${agreementData.renterName}`, 20, 9);
    addText(`Date: ${new Date().toLocaleDateString('en-IN')}`, 20, 9);
    addText('Status: Digitally Agreed', 20, 9);

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text('Neighbour Friendly Rentals - Rental Agreement', pageWidth / 2, pageHeight - 10, { align: 'center' });

    return doc;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF. Make sure jsPDF is installed: npm install jspdf');
  }
};

export const downloadAgreementPDF = async (agreementData: any, filename: string = 'rental-agreement.pdf') => {
  try {
    const doc = await generateAgreementPDF(agreementData);
    doc.save(filename);
    return { success: true, message: 'PDF downloaded successfully' };
  } catch (error) {
    console.error('Error downloading PDF:', error);
    throw error;
  }
};

export const getAgreementPDFBlob = async (agreementData: any): Promise<Blob> => {
  try {
    const doc = await generateAgreementPDF(agreementData);
    return doc.output('blob');
  } catch (error) {
    console.error('Error generating PDF blob:', error);
    throw error;
  }
};
