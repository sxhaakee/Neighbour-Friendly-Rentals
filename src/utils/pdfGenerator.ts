// Professional PDF Generation utility
// Note: This requires jsPDF library
// Install: npm install jspdf

export const generateAgreementPDF = async (agreementData: any) => {
  try {
    // Dynamic import to avoid bundling issues
    const { jsPDF } = await import('jspdf');
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);
    let yPos = margin;

    // Helper function to add text with proper spacing
    const addText = (text: string, x: number, size: number = 10, style: string = 'normal', align: 'left' | 'center' | 'right' = 'left') => {
      doc.setFontSize(size);
      doc.setFont('helvetica', style);
      const options: any = {};
      if (align !== 'left') {
        options.align = align;
      }
      doc.text(text, x, yPos, options);
      yPos += size * 0.5 + 3; // Consistent spacing
    };

    // Helper function to add wrapped text
    const addWrappedText = (text: string, x: number, maxWidth: number, size: number = 10, style: string = 'normal') => {
      doc.setFontSize(size);
      doc.setFont('helvetica', style);
      const lines = doc.splitTextToSize(text, maxWidth);
      doc.text(lines, x, yPos);
      yPos += lines.length * (size * 0.4) + 3;
    };

    // Helper function to check page break
    const checkPageBreak = (spaceNeeded: number = 20) => {
      if (yPos + spaceNeeded > pageHeight - margin) {
        doc.addPage();
        yPos = margin;
        return true;
      }
      return false;
    };

    // Helper to add section spacing
    const addSpacing = (space: number = 5) => {
      yPos += space;
    };

    // Professional Header with gradient effect
    doc.setFillColor(251, 191, 36); // Amber color
    doc.rect(0, 0, pageWidth, 35, 'F');
    doc.setTextColor(255, 255, 255);
    yPos = 15;
    addText('NEIGHBOURFRIENDLY RENTALS', pageWidth / 2, 14, 'bold', 'center');
    yPos = 25;
    addText('RENTAL AGREEMENT', pageWidth / 2, 12, 'normal', 'center');
    
    // Reset text color and position
    doc.setTextColor(0, 0, 0);
    yPos = 45;

    // Agreement metadata in a clean format
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Agreement Date: ${new Date().toLocaleDateString('en-IN')}`, margin, yPos);
    doc.text(`Order ID: ${agreementData.order_id || agreementData.orderId || 'N/A'}`, pageWidth - margin, yPos, { align: 'right' });
    yPos += 8;

    // Horizontal line
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 8;

    // Introduction with proper formatting
    const introText = 'This Rental Agreement is entered between the parties named below. NeighbourFriendly Rentals (the "Platform") acts only as a facilitator and is not a party to the contractual obligations between Lender and Renter except where expressly stated.';
    addWrappedText(introText, margin, contentWidth, 9, 'normal');
    addSpacing(5);

    checkPageBreak();

    // Parties Information with boxes
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('PARTIES TO THE AGREEMENT', margin, yPos);
    yPos += 8;

    // Lender box
    doc.setDrawColor(251, 191, 36);
    doc.setLineWidth(0.5);
    doc.rect(margin, yPos, (contentWidth / 2) - 5, 30);
    yPos += 5;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Lender (Owner)', margin + 3, yPos);
    yPos += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`Name: ${agreementData.owner?.name || agreementData.ownerName || 'N/A'}`, margin + 3, yPos);
    yPos += 5;
    doc.text(`Phone: ${agreementData.owner?.phone || agreementData.ownerPhone || 'N/A'}`, margin + 3, yPos);
    yPos += 5;
    const ownerAddr = agreementData.owner?.address || agreementData.ownerAddress || 'N/A';
    const ownerAddrLines = doc.splitTextToSize(`Address: ${ownerAddr}`, (contentWidth / 2) - 11);
    doc.text(ownerAddrLines, margin + 3, yPos);
    
    // Renter box (same row)
    const renterBoxX = margin + (contentWidth / 2) + 5;
    yPos = yPos - 16; // Reset to same height as lender box
    doc.rect(renterBoxX, yPos, (contentWidth / 2) - 5, 30);
    yPos += 5;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Renter (User)', renterBoxX + 3, yPos);
    yPos += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`Name: ${agreementData.renter?.name || agreementData.renterName || 'N/A'}`, renterBoxX + 3, yPos);
    yPos += 5;
    doc.text(`Phone: ${agreementData.renter?.phone || agreementData.renterPhone || 'N/A'}`, renterBoxX + 3, yPos);
    yPos += 5;
    const renterAddr = agreementData.renter?.address || agreementData.renterAddress || 'N/A';
    const renterAddrLines = doc.splitTextToSize(`Address: ${renterAddr}`, (contentWidth / 2) - 11);
    doc.text(renterAddrLines, renterBoxX + 3, yPos);
    
    yPos += 20;
    addSpacing(5);
    checkPageBreak();

    // Item Details section
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('1. ITEM DETAILS', margin, yPos);
    yPos += 8;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const itemDetails = [
      { label: 'Item Name', value: agreementData.listing?.title || agreementData.itemTitle || 'N/A' },
      { label: 'Condition at Handover', value: agreementData.listing?.condition || agreementData.itemCondition || 'Good' },
      { label: 'Rental Start Date', value: agreementData.rental_details?.start_date || agreementData.startDate || 'N/A' },
      { label: 'Rental End Date', value: agreementData.rental_details?.end_date || agreementData.endDate || 'N/A' },
      { label: 'Rental Duration', value: `${agreementData.rental_details?.total_days || agreementData.totalDays || 0} Day(s)` },
      { label: 'Rental Amount', value: `₹${agreementData.rental_details?.total_price || agreementData.totalPrice || 0}/-` },
      { label: 'Payment Method', value: agreementData.rental_details?.payment_method || agreementData.paymentMethod || 'Cash/UPI on Delivery' }
    ];
    
    itemDetails.forEach(item => {
      doc.setFont('helvetica', 'bold');
      doc.text(`${item.label}:`, margin + 5, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(item.value, margin + 60, yPos);
      yPos += 5;
    });
    
    addSpacing(5);
    checkPageBreak();

    // Payment Breakdown section
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('2. PAYMENT BREAKDOWN', margin, yPos);
    yPos += 8;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const itemPrice = agreementData.rental_details?.item_price || agreementData.itemPrice || 0;
    const serviceCharge = agreementData.rental_details?.service_charge || agreementData.serviceCharge || 0;
    const deliveryCharge = agreementData.rental_details?.delivery_charge || agreementData.deliveryCharge || 0;
    const securityDeposit = agreementData.rental_details?.security_deposit || agreementData.securityDeposit || 0;
    const totalPrice = agreementData.rental_details?.total_price || agreementData.totalPrice || 0;
    
    doc.text('Item Price:', margin + 5, yPos);
    doc.text(`₹${itemPrice}`, pageWidth - margin - 5, yPos, { align: 'right' });
    yPos += 5;
    
    doc.text('Service Charge (10%):', margin + 5, yPos);
    doc.text(`₹${serviceCharge}`, pageWidth - margin - 5, yPos, { align: 'right' });
    yPos += 5;
    
    if (deliveryCharge > 0) {
      doc.text('Delivery & Pickup:', margin + 5, yPos);
      doc.text(`₹${deliveryCharge}`, pageWidth - margin - 5, yPos, { align: 'right' });
      yPos += 5;
    }
    
    doc.text('Security Deposit (20%):', margin + 5, yPos);
    doc.text(`₹${securityDeposit}`, pageWidth - margin - 5, yPos, { align: 'right' });
    yPos += 5;
    
    // Total line
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 5;
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('TOTAL:', margin + 5, yPos);
    doc.text(`₹${totalPrice}`, pageWidth - margin - 5, yPos, { align: 'right' });
    yPos += 8;
    
    checkPageBreak();

    // Responsibilities section
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('3. RESPONSIBILITIES OF THE RENTER', margin, yPos);
    yPos += 8;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const responsibilities = [
      'The Renter shall use the rented item with due care and return it in the same working and physical condition as at handover (reasonable wear and tear excepted).',
      'The Renter is responsible for loss, theft, damage, or malfunction occurring during the rental period (except normal wear and tear).',
      'In case of loss or damage, the Renter must pay for repair or replacement as reasonably determined by the Lender and/or Platform.',
      'The Renter shall not sub-rent, loan, or otherwise transfer the item to a third party without written consent.',
      'The Renter must return the item by the agreed return date and time. Late returns may attract additional charges.',
    ];
    
    responsibilities.forEach((resp, index) => {
      checkPageBreak(15);
      const text = `${index + 1}. ${resp}`;
      const lines = doc.splitTextToSize(text, contentWidth - 10);
      doc.text(lines, margin + 5, yPos);
      yPos += lines.length * 4 + 3;
    });
    
    addSpacing(5);
    checkPageBreak();

    // Video Recording Requirement
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('4. VIDEO RECORDING REQUIREMENT', margin, yPos);
    yPos += 8;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const videoText = 'Both parties MUST record clear videos of the item during handover and return, showing all sides, accessories, and condition. These videos are mandatory for dispute resolution.';
    addWrappedText(videoText, margin + 5, contentWidth - 10, 9, 'normal');
    
    addSpacing(5);
    checkPageBreak();

    // Legal & Recovery
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('5. LEGAL & RECOVERY', margin, yPos);
    yPos += 8;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const legalText = 'If the item is not returned or charges are not paid, the Lender and/or Platform may pursue recovery including legal remedies under applicable law. The Renter authorises the Lender/Platform to use the contact and identification information provided for lawful recovery and dispute resolution.';
    addWrappedText(legalText, margin + 5, contentWidth - 10, 9, 'normal');
    
    addSpacing(5);
    checkPageBreak();

    // Digital Confirmation
    addSpacing(10);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('DIGITAL CONFIRMATION', margin, yPos);
    yPos += 8;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`Renter Name: ${agreementData.renterName}`, margin + 5, yPos);
    yPos += 5;
    doc.text(`Agreement Date: ${new Date().toLocaleDateString('en-IN')}`, margin + 5, yPos);
    yPos += 5;
    doc.text('Status: Digitally Agreed & Accepted', margin + 5, yPos);
    
    // Footer on every page
    const totalPages = doc.internal.pages.length - 1;
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.setFont('helvetica', 'normal');
      doc.text('NeighbourFriendly Rentals - Rental Agreement', pageWidth / 2, pageHeight - 10, { align: 'center' });
      doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
    }

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
