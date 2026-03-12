import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateAgreementPDF = async (agreementData: any) => {
  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20; // Increased margin for better breathing room
    
    // Header - Professional Dark Blue
    doc.setFillColor(15, 23, 42); 
    doc.rect(0, 0, pageWidth, 45, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('NeighbourFriendly', margin, 22);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184); // Slate 400
    doc.text('Trust & Transparency in Every Rental', margin, 32);

    // Document Title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('RENTAL AGREEMENT', pageWidth - margin, 28, { align: 'right' });

    // Meta Information
    doc.setTextColor(71, 85, 105); // Slate 600
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Agreement Details:', margin, 60);
    
    doc.setFont('helvetica', 'normal');
    doc.text(`Date of Issue: ${new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}`, margin, 68);
    doc.text(`Order ID: ${agreementData.order_id || agreementData.orderId || 'N/A'}`, margin, 74);
    
    // Intro Text
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139); // Slate 500
    const introText = 'This binding Rental Agreement constitutes a formal contract between the Lender and the Renter named below. NeighbourFriendly Rentals serves solely as the digital facilitation platform and is not a direct party to these contractual obligations unless explicitly stated.';
    const splitIntro = doc.splitTextToSize(introText, pageWidth - (margin * 2));
    doc.text(splitIntro, margin, 90);
    doc.setFont('helvetica', 'normal');

    let finalY = 90 + (splitIntro.length * 5) + 8;

    // Parties Table - Modern grid theme
    autoTable(doc, {
      startY: finalY,
      theme: 'grid',
      headStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42], fontStyle: 'bold', halign: 'center' },
      bodyStyles: { textColor: [51, 65, 85], valign: 'top' },
      columnStyles: { 0: { cellWidth: (pageWidth - margin * 2) / 2 }, 1: { cellWidth: (pageWidth - margin * 2) / 2 } },
      head: [['Lender (Owner)', 'Renter (User)']],
      body: [
        [
          `Name: ${agreementData.owner?.name || agreementData.ownerName || 'N/A'}\nPhone: ${agreementData.owner?.phone || agreementData.ownerPhone || 'N/A'}\nAddress: ${agreementData.owner?.address || agreementData.ownerAddress || 'N/A'}`,
          `Name: ${agreementData.renter?.name || agreementData.renterName || 'N/A'}\nPhone: ${agreementData.renter?.phone || agreementData.renterPhone || 'N/A'}\nAddress: ${agreementData.renter?.address || agreementData.renterAddress || 'N/A'}`
        ]
      ]
    });

    finalY = (doc as any).lastAutoTable.finalY + 12;

    // Item Details Table
    autoTable(doc, {
      startY: finalY,
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold' },
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 70, fillColor: [248, 250, 252] } },
      head: [['1. ITEM & RENTAL DURATION', '']],
      body: [
        ['Item Description', agreementData.listing?.title || agreementData.itemTitle || 'N/A'],
        ['Declared Condition', agreementData.listing?.condition || agreementData.itemCondition || 'Good Working Condition'],
        ['Rental Period Begins', agreementData.rental_details?.start_date || agreementData.startDate || 'N/A'],
        ['Rental Period Ends', agreementData.rental_details?.end_date || agreementData.endDate || 'N/A'],
        ['Total Duration', `${agreementData.rental_details?.total_days || agreementData.totalDays || 0} Day(s)`],
        ['Agreed Payment Method', agreementData.rental_details?.payment_method || agreementData.paymentMethod || 'Cash/UPI upon Handover']
      ],
      showHead: 'firstPage'
    });

    finalY = (doc as any).lastAutoTable.finalY + 12;

    // Payment Breakdown
    const itemPrice = agreementData.rental_details?.item_price || agreementData.itemPrice || 0;
    const serviceCharge = agreementData.rental_details?.service_charge || agreementData.serviceCharge || 0;
    const deliveryCharge = agreementData.rental_details?.delivery_charge || agreementData.deliveryCharge || 0;
    const securityDeposit = agreementData.rental_details?.security_deposit || agreementData.securityDeposit || 0;
    const totalPrice = agreementData.rental_details?.total_price || agreementData.totalPrice || 0;

    const paymentBody = [
      ['Base Rental Fee', `Rs. ${itemPrice}`],
      ['Platform Service Charge', `Rs. ${serviceCharge}`],
    ];
    if (deliveryCharge > 0) {
      paymentBody.push(['Delivery & Logistics', `Rs. ${deliveryCharge}`]);
    }
    paymentBody.push(['Refundable Security Deposit', `Rs. ${securityDeposit}`]);
    paymentBody.push(['TOTAL PAYABLE AMOUNT', `Rs. ${totalPrice}`]);

    autoTable(doc, {
      startY: finalY,
      theme: 'grid',
      headStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: 'bold' },
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 110, fillColor: [248, 250, 252] }, 1: { halign: 'right', fontStyle: 'bold', textColor: [15, 23, 42] } },
      head: [['2. FINANCIAL CONSIDERATION', '']],
      body: paymentBody,
      willDrawCell: (data) => {
        if (data.row.index === paymentBody.length - 1 && data.section === 'body') {
          doc.setFillColor(226, 232, 240); // Slate 200 for total row
        }
      }
    });

    finalY = (doc as any).lastAutoTable.finalY + 16;

    // Terms and Conditions
    autoTable(doc, {
      startY: finalY,
      theme: 'plain',
      headStyles: { fontStyle: 'bold', textColor: [15, 23, 42], fontSize: 12 },
      bodyStyles: { textColor: [51, 65, 85], fontSize: 9, cellPadding: { top: 3, right: 0, bottom: 3, left: 0 } },
      head: [['3. LEGAL RESPONSIBILITIES & COVENANTS']],
      body: [
        ['3.1. Duty of Care: The Renter shall exercise utmost care in utilizing the rented item and must return it in identical physical and functional condition as documented at handover.'],
        ['3.2. Liability: The Renter assumes full financial responsibility for any loss, theft, cosmetic damage, or functional malfunction that occurs during the active rental period, ordinary wear and tear excepted.'],
        ['3.3. Transfer Restriction: The Renter is strictly prohibited from sub-renting, loaning, or transferring possession of the item to any third party under any circumstances.'],
        ['3.4. Video Verification Protocol: Both parties are REQUIRED to individually record continuous, unedited video footage of the item during both handover and return processes. This visual evidence is mandatory for resolving any subsequent disputes regarding item condition.'],
        ['3.5. Dispute Resolution & Recovery: In the event of non-return, severe damage, or failure to remit agreed charges, the Lender maintains the right to pursue full financial recovery, including seeking legal remedies and involving law enforcement authorities within the applicable jurisdiction.']
      ]
    });

    finalY = (doc as any).lastAutoTable.finalY + 24;

    // Digital Confirmation Signature Section
    doc.setDrawColor(203, 213, 225); // Slate 300
    doc.setLineWidth(0.5);
    doc.line(margin, finalY, pageWidth - margin, finalY); // Horizontal separator

    finalY += 12;
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42); // Slate 900
    doc.setFont('helvetica', 'bold');
    doc.text('ELECTRONIC EXECUTORY SIGNATURE', margin, finalY);
    
    finalY += 10;
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    doc.setFont('helvetica', 'normal');
    doc.text('This document constitutes a legally binding agreement under applicable electronic signature laws.', margin, finalY);
    
    finalY += 12;
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text(`Authenticated Renter Identity: `, margin, finalY);
    doc.setFont('helvetica', 'bold');
    doc.text(`${agreementData.renterName || agreementData.renter?.name || 'N/A'}`, margin + 60, finalY);
    
    finalY += 8;
    doc.setFont('helvetica', 'normal');
    doc.text(`Execution Timestamp: `, margin, finalY);
    doc.setFont('helvetica', 'bold');
    doc.text(`${new Date().toLocaleString('en-IN')}`, margin + 60, finalY);
    
    finalY += 12;
    // Seal / Badge
    doc.setFillColor(236, 253, 245); // Emerald 50
    doc.setDrawColor(16, 185, 129); // Emerald 500
    doc.setLineWidth(1);
    doc.roundedRect(margin, finalY, 120, 10, 2, 2, 'FD');
    doc.setTextColor(4, 120, 87); // Emerald 700
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('STATUS: DIGITALLY VERIFIED AND BOUND', margin + 5, finalY + 7);

    // Footer with pagination
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      
      // Footer Line
      doc.setDrawColor(226, 232, 240); // Slate 200
      doc.setLineWidth(0.5);
      doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
      
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184); // Slate 400
      doc.setFont('helvetica', 'normal');
      doc.text('NeighbourFriendly Rentals - Official Document', margin, pageHeight - 10);
      doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
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
