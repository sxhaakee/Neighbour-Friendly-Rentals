// Professional PDF Generation utility
// Note: This requires jsPDF library
// Install: npm install jspdf

export const generateAgreementPDF = async (agreementData: any) => {
  try {
    // Dynamic import to avoid bundling issues
    const { jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 14;
    
    // Header
    doc.setFillColor(251, 191, 36); // Amber color
    doc.rect(0, 0, pageWidth, 35, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('NEIGHBOURFRIENDLY RENTALS', pageWidth / 2, 18, { align: 'center' });
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('OFFICIAL RENTAL AGREEMENT', pageWidth / 2, 28, { align: 'center' });
    
    // Meta Information
    doc.setTextColor(50, 50, 50);
    doc.setFontSize(10);
    doc.text(`Agreement Date: ${new Date().toLocaleDateString('en-IN')}`, margin, 45);
    doc.text(`Order ID: ${agreementData.order_id || agreementData.orderId || 'N/A'}`, pageWidth - margin, 45, { align: 'right' });
    
    // Intro Text
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(10);
    const introText = 'This Rental Agreement is entered between the parties named below. NeighbourFriendly Rentals acts only as a facilitator and is not a party to the contractual obligations between Lender and Renter except where expressly stated.';
    const splitIntro = doc.splitTextToSize(introText, pageWidth - (margin * 2));
    doc.text(splitIntro, margin, 55);
    doc.setFont('helvetica', 'normal');

    let finalY = 55 + (splitIntro.length * 5) + 5;

    // Parties Table
    autoTable(doc, {
      startY: finalY,
      theme: 'grid',
      headStyles: { fillColor: [243, 244, 246], textColor: [17, 24, 39], fontStyle: 'bold' },
      bodyStyles: { textColor: [55, 65, 81] },
      head: [['Lender (Owner)', 'Renter (User)']],
      body: [
        [
          `Name: ${agreementData.owner?.name || agreementData.ownerName || 'N/A'}\nPhone: ${agreementData.owner?.phone || agreementData.ownerPhone || 'N/A'}\nAddress: ${agreementData.owner?.address || agreementData.ownerAddress || 'N/A'}`,
          `Name: ${agreementData.renter?.name || agreementData.renterName || 'N/A'}\nPhone: ${agreementData.renter?.phone || agreementData.renterPhone || 'N/A'}\nAddress: ${agreementData.renter?.address || agreementData.renterAddress || 'N/A'}`
        ]
      ]
    });

    finalY = (doc as any).lastAutoTable.finalY + 10;

    // Item Details Table
    autoTable(doc, {
      startY: finalY,
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold' },
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 60 } },
      head: [['1. ITEM DETAILS', '']],
      body: [
        ['Item Name', agreementData.listing?.title || agreementData.itemTitle || 'N/A'],
        ['Condition at Handover', agreementData.listing?.condition || agreementData.itemCondition || 'Good'],
        ['Rental Start Date', agreementData.rental_details?.start_date || agreementData.startDate || 'N/A'],
        ['Rental End Date', agreementData.rental_details?.end_date || agreementData.endDate || 'N/A'],
        ['Rental Duration', `${agreementData.rental_details?.total_days || agreementData.totalDays || 0} Day(s)`],
        ['Payment Method', agreementData.rental_details?.payment_method || agreementData.paymentMethod || 'Cash/UPI on Delivery']
      ],
      showHead: 'firstPage'
    });

    finalY = (doc as any).lastAutoTable.finalY + 10;

    // Payment Breakdown
    const itemPrice = agreementData.rental_details?.item_price || agreementData.itemPrice || 0;
    const serviceCharge = agreementData.rental_details?.service_charge || agreementData.serviceCharge || 0;
    const deliveryCharge = agreementData.rental_details?.delivery_charge || agreementData.deliveryCharge || 0;
    const securityDeposit = agreementData.rental_details?.security_deposit || agreementData.securityDeposit || 0;
    const totalPrice = agreementData.rental_details?.total_price || agreementData.totalPrice || 0;

    const paymentBody = [
      ['Item Price', `Rs. ${itemPrice}`],
      ['Service Charge (10%)', `Rs. ${serviceCharge}`],
    ];
    if (deliveryCharge > 0) {
      paymentBody.push(['Delivery & Pickup', `Rs. ${deliveryCharge}`]);
    }
    paymentBody.push(['Security Deposit (Refundable)', `Rs. ${securityDeposit}`]);
    paymentBody.push(['TOTAL PAYABLE', `Rs. ${totalPrice}`]);

    autoTable(doc, {
      startY: finalY,
      theme: 'grid',
      headStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: 'bold' },
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 100 }, 1: { halign: 'right', fontStyle: 'bold' } },
      head: [['2. PAYMENT BREAKDOWN', '']],
      body: paymentBody,
      willDrawCell: (data) => {
        if (data.row.index === paymentBody.length - 1 && data.section === 'body') {
          doc.setFillColor(243, 244, 246);
        }
      }
    });

    finalY = (doc as any).lastAutoTable.finalY + 10;

    // Terms and Conditions
    autoTable(doc, {
      startY: finalY,
      theme: 'plain',
      headStyles: { fontStyle: 'bold', textColor: [17, 24, 39], fontSize: 11 },
      bodyStyles: { textColor: [55, 65, 81], fontSize: 9 },
      head: [['3. RESPONSIBILITIES & LEGAL TERMS']],
      body: [
        ['1. The Renter shall use the rented item with due care and return it in the same working and physical condition as at handover.'],
        ['2. The Renter is responsible for loss, theft, damage, or malfunction occurring during the rental period.'],
        ['3. The Renter shall not sub-rent, loan, or otherwise transfer the item to a third party without written consent.'],
        ['4. Video Recording: Both parties MUST record clear videos of the item during handover and return. These videos are mandatory for dispute resolution.'],
        ['5. Legal Recovery: If the item is not returned or charges are not paid, the Lender and/or Platform may pursue recovery including legal remedies under applicable law.']
      ]
    });

    finalY = (doc as any).lastAutoTable.finalY + 15;

    // Digital Confirmation Signature
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('DIGITAL CONFIRMATION', margin, finalY);
    finalY += 8;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Target Renter: ${agreementData.renterName || agreementData.renter?.name || 'N/A'}`, margin, finalY);
    finalY += 6;
    doc.text(`Confirmed On: ${new Date().toLocaleDateString('en-IN')}`, margin, finalY);
    finalY += 6;
    doc.setTextColor(16, 185, 129); // Green
    doc.setFont('helvetica', 'bold');
    doc.text('Status: Digitally Agreed & Accepted', margin, finalY);

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(`NeighbourFriendly Rentals - Page ${i} of ${pageCount}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
    }

    return doc;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF. Make sure jspdf and jspdf-autotable are installed');
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
