"use strict";exports.id=954,exports.ids=[954,832],exports.modules={75925:(e,r,t)=>{t.d(r,{T:()=>o});var i=t(10326),a=t(76993),n=t(10832);let o=({url:e,title:r,description:t,className:o=""})=>{let s=async()=>{if(navigator.share)try{await navigator.share({title:r,text:t||r,url:e})}catch(t){"AbortError"!==t.name&&d(e,r)}else d(e,r)},d=(e,r)=>{navigator.clipboard.writeText(e).then(()=>{n.showToast.success("Link copied to clipboard!")}).catch(()=>{l(e,r)})},l=(e,r)=>{let t=encodeURIComponent(e),i=encodeURIComponent(r),a=[{name:"WhatsApp",url:`https://wa.me/?text=${i}%20${t}`,color:"bg-amber-500"},{name:"Facebook",url:`https://www.facebook.com/sharer/sharer.php?u=${t}`,color:"bg-blue-600"},{name:"Twitter",url:`https://twitter.com/intent/tweet?url=${t}&text=${i}`,color:"bg-blue-400"},{name:"Copy Link",url:null,color:"bg-gray-600"}],n=document.createElement("div");n.className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4",n.innerHTML=`
      <div class="bg-white rounded-xl p-6 max-w-sm w-full">
        <h3 class="text-lg font-bold mb-4">Share this listing</h3>
        <div class="space-y-2">
          ${a.map(r=>`
            <button
              onclick="${r.url?`window.open('${r.url}', '_blank')`:`navigator.clipboard.writeText('${e}'); alert('Link copied!')`}"
              class="${r.color} text-white px-4 py-3 rounded-lg w-full hover:opacity-90 transition-opacity"
            >
              ${r.name}
            </button>
          `).join("")}
        </div>
        <button
          onclick="this.closest('.fixed').remove()"
          class="mt-4 w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    `,n.onclick=e=>{e.target===n&&n.remove()},document.body.appendChild(n)};return(0,i.jsxs)("button",{onClick:s,className:`flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 text-white rounded-lg hover:bg-primary/90 transition-colors ${o}`,title:"Share this listing",children:[i.jsx(a.Z,{className:"w-4 h-4"}),i.jsx("span",{children:"Share"})]})}},10832:(e,r,t)=>{t.r(r),t.d(r,{showToast:()=>a});var i=t(40381);let a={success:e=>{i.ZP.success(e,{style:{border:"1px solid #10b981"}})},error:(e,r)=>{i.ZP.error(e,{style:{border:"1px solid #ef4444"},...r})},loading:e=>i.ZP.loading(e),promise:(e,r)=>i.ZP.promise(e,r),info:(e,r)=>{(0,i.ZP)(e,{icon:"ℹ️",style:{border:"1px solid #3b82f6"},...r})},custom:(e,r,t)=>{(0,i.ZP)(e,{icon:r,style:{border:"1px solid #f59e0b"},...t})},dismiss:e=>{i.ZP.dismiss(e)}}},1926:(e,r,t)=>{t.d(r,{O:()=>o});var i=t(37857);let a=process.env.NEXT_PUBLIC_SUPABASE_URL||"https://example.supabase.co",n=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY||"placeholder";a&&n||console.warn("Missing Supabase environment variables");let o=(0,i.eI)(a,n,{auth:{autoRefreshToken:!0,persistSession:!0,detectSessionInUrl:!0}})},41081:(e,r,t)=>{t.d(r,{y:()=>n});var i=t(1926);let a={welcome:e=>({subject:"\uD83C\uDF89 Welcome to NeighbourFriendly Rentals - Start Earning & Saving Today!",html:`
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #14b8a6 0%, #f59e0b 100%); color: white; padding: 40px 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .highlight-box { background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b; }
          .money-stat { font-size: 32px; font-weight: bold; color: #059669; text-align: center; margin: 10px 0; }
          .button { display: inline-block; background: #14b8a6; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; margin: 15px 0; font-weight: bold; }
          .feature { padding: 15px; margin: 10px 0; background: white; border-radius: 8px; border-left: 4px solid #14b8a6; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome to NFR!</h1>
            <p style="font-size: 18px; margin-top: 10px;">Your Journey to Smart Savings Starts Now</p>
          </div>
          
          <div class="content">
            <p>Hi ${e.userName},</p>
            <p><strong>Congratulations!</strong> You've just joined India's fastest-growing rental community where neighbors help neighbors save money and earn extra income!</p>

            <div class="highlight-box">
              <h2 style="margin-top: 0; color: #92400e;">💰 Did You Know?</h2>
              <p class="money-stat">₹15,000+</p>
              <p style="text-align: center; font-size: 16px;">Average annual savings for our active users!</p>
              <p style="text-align: center; margin-top: 15px;">Why buy when you can rent for 90% less?</p>
            </div>

            <h3>🚀 Start Making Money in 3 Simple Steps:</h3>
            <div class="feature">
              <strong>1. List Your Idle Items</strong><br>
              That camera gathering dust? List it for ₹500/day and earn ₹15,000/month!
            </div>
            <div class="feature">
              <strong>2. Rent What You Need</strong><br>
              Need a drill for 1 day? Pay ₹100 instead of buying for ₹5,000!
            </div>
            <div class="feature">
              <strong>3. Build Your Reputation</strong><br>
              Get verified, earn reviews, and watch your earnings grow!
            </div>

            <div style="background: #fee2e2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
              <h3 style="margin-top: 0; color: #991b1b;">⚡ Limited Time Offer!</h3>
              <p><strong>List your first 3 items FREE!</strong> No commission for the first month. But hurry - this offer won't last!</p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${e.dashboardUrl}" class="button">Start Listing Now →</a>
            </div>

            <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
              <strong>Pro Tip:</strong> Users who list items in their first week earn 3x more than those who wait!
            </p>
          </div>
        </div>
      </body>
      </html>
    `}),bookingConfirmation:e=>({subject:`Booking Confirmation - ${e.itemTitle}`,html:`
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #14b8a6 0%, #f59e0b 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .section { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #14b8a6; }
          .highlight { background: #fef3c7; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #f59e0b; }
          .warning { background: #fee2e2; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #ef4444; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
          .button { display: inline-block; background: #14b8a6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
          table { width: 100%; border-collapse: collapse; }
          td { padding: 8px; border-bottom: 1px solid #e5e7eb; }
          .label { font-weight: bold; color: #6b7280; }
          .value { text-align: right; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Booking Confirmed!</h1>
            <p>Order ID: ${e.orderId}</p>
          </div>
          
          <div class="content">
            <div class="section">
              <h2>📦 Item Details</h2>
              <table>
                <tr><td class="label">Item:</td><td class="value">${e.itemTitle}</td></tr>
                <tr><td class="label">Start Date:</td><td class="value">${e.startDate}</td></tr>
                <tr><td class="label">End Date:</td><td class="value">${e.endDate}</td></tr>
                <tr><td class="label">Duration:</td><td class="value">${e.totalDays} days</td></tr>
              </table>
            </div>

            <div class="section">
              <h2>💰 Payment Details</h2>
              <table>
                <tr><td class="label">Item Price:</td><td class="value">₹${e.itemPrice}</td></tr>
                <tr><td class="label">Service Charge (10%):</td><td class="value">₹${e.serviceCharge}</td></tr>
                ${e.deliveryCharge>0?`<tr><td class="label">Delivery & Pickup:</td><td class="value">₹${e.deliveryCharge}</td></tr>`:""}
                <tr><td class="label">Security Deposit (20%):</td><td class="value">₹${e.securityDeposit}</td></tr>
                <tr style="font-weight: bold; font-size: 18px; color: #14b8a6;">
                  <td class="label">TOTAL:</td><td class="value">₹${e.totalPrice}</td>
                </tr>
              </table>
              <p style="font-size: 12px; color: #6b7280; margin-top: 10px;">
                *Security deposit will be refunded after item return<br>
                *Service charge is for safe renting and trust
              </p>
            </div>

            <div class="highlight">
              <h3>💳 Payment Method</h3>
              <p><strong>${"cash"===e.paymentMethod?"Cash":"UPI"} on Delivery</strong></p>
              <p>Please pay ₹${e.totalPrice} to the owner when you receive the item.</p>
            </div>

            <div class="warning">
              <h3>📹 IMPORTANT: Video Recording Required</h3>
              <p><strong>You MUST record a video of the item during:</strong></p>
              <ul>
                <li>Handover (when you receive the item)</li>
                <li>Return (when you give it back)</li>
              </ul>
              <p>Show all sides, accessories, and condition clearly. This is mandatory for dispute resolution.</p>
            </div>

            <div class="section">
              <h2>👤 ${e.isRenter?"Owner":"Renter"} Contact</h2>
              <table>
                <tr><td class="label">Name:</td><td class="value">${e.contactName}</td></tr>
                <tr><td class="label">Phone:</td><td class="value">${e.contactPhone}</td></tr>
                <tr><td class="label">Address:</td><td class="value">${e.contactAddress}</td></tr>
              </table>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${e.dashboardUrl}" class="button">View Booking Details</a>
            </div>
          </div>

          <div class="footer">
            <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
              <p style="margin: 0; font-weight: bold; color: #92400e;">💡 Smart Saver Tip</p>
              <p style="margin: 5px 0; color: #78350f;">You just saved ₹${Math.round(10*e.totalPrice)} by renting instead of buying!</p>
            </div>
            <p>\xa9 2025 Neighbour Friendly Rentals. All rights reserved.</p>
            <p>Questions? Contact us at support@neighbourfriendly.in</p>
          </div>
        </div>
      </body>
      </html>
    `}),idVerificationApproved:e=>({subject:"✅ ID Verification Approved",html:`
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10b981; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #14b8a6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ ID Verified!</h1>
          </div>
          <div class="content">
            <p>Hi ${e.userName},</p>
            <p>Great news! Your ID has been verified successfully.</p>
            <p>You can now book items on Neighbour Friendly Rentals.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${e.dashboardUrl}" class="button">Start Booking</a>
            </div>
          </div>
        </div>
      </body>
      </html>
    `}),idVerificationRejected:e=>({subject:"❌ ID Verification Rejected",html:`
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #ef4444; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .reason { background: #fee2e2; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #ef4444; }
          .button { display: inline-block; background: #14b8a6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>❌ ID Verification Rejected</h1>
          </div>
          <div class="content">
            <p>Hi ${e.userName},</p>
            <p>Unfortunately, your ID verification was rejected.</p>
            <div class="reason">
              <strong>Reason:</strong> ${e.reason}
            </div>
            <p>Please upload a clear, valid ID document and try again.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${e.verifyUrl}" class="button">Upload Again</a>
            </div>
          </div>
        </div>
      </body>
      </html>
    `}),paymentReminder:e=>({subject:`Payment Reminder - Order ${e.orderId}`,html:`
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f59e0b; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💳 Payment Reminder</h1>
          </div>
          <div class="content">
            <p>Hi ${e.userName},</p>
            <p>This is a reminder to pay ₹${e.amount} via ${e.paymentMethod} when you receive the item.</p>
            <p><strong>Pickup Date:</strong> ${e.startDate}</p>
            <p>Please ensure you have the payment ready.</p>
          </div>
        </div>
      </body>
      </html>
    `}),premiumPaymentSuccess:e=>({subject:"\uD83C\uDF1F Premium Membership Activated!",html:`
      <p>Included in Edge Function</p>
    `}),premiumExpiryReminder:e=>({subject:"⏰ Action Required: Your Premium Membership Expires Soon",html:`
      <p>Included in Edge Function</p>
    `}),premiumExpired:e=>({subject:"Your Premium Membership Has Expired \uD83D\uDED1",html:`
      <p>Included in Edge Function</p>
    `})},n={async sendWelcomeEmail(e){try{console.log("\uD83D\uDCE7 Sending Welcome Email to:",e.email);let{data:r,error:t}=await i.O.functions.invoke("send-email",{body:{email:e.email,type:"welcome",data:{userName:e.userName,dashboardUrl:e.dashboardUrl}}});if(t)return console.error("Error sending welcome email:",t),{success:!1,error:t};return console.log("✅ Welcome email sent successfully"),{success:!0,data:r}}catch(e){return console.error("Error sending welcome email:",e),{success:!1,error:e}}},async resendVerificationEmail(e){try{console.log("\uD83D\uDCE7 Resending verification email to:",e);let{error:r}=await i.O.auth.resend({type:"signup",email:e});if(r)throw r;return{success:!0,message:"Verification email sent!"}}catch(e){return console.error("Error resending verification email:",e),{success:!1,error:e.message}}},async sendBookingConfirmation(e){try{console.log("\uD83D\uDCE7 Sending Booking Confirmation to:",e.email);let{data:r,error:t}=await i.O.functions.invoke("send-email",{body:{email:e.email,type:"bookingConfirmation",data:e}});if(t)return console.error("Error sending booking confirmation:",t),{success:!1,error:t};return console.log("✅ Booking confirmation sent successfully"),{success:!0,data:r}}catch(e){return console.error("Error sending booking confirmation:",e),{success:!1,error:e}}},async sendIDVerificationStatus(e,r,t){try{console.log(`📧 Sending ID Verification ${r} email to:`,e.email);let{data:a,error:n}=await i.O.functions.invoke("send-email",{body:{email:e.email,type:"approved"===r?"idVerificationApproved":"idVerificationRejected",data:{userName:e.userName||e.full_name,reason:t||"Document not clear or invalid"}}});if(n)return console.error("Error sending ID verification email:",n),{success:!1,error:n};return console.log("✅ ID verification email sent successfully"),{success:!0,data:a}}catch(e){throw console.error("Error sending ID verification email:",e),e}},async sendPaymentReminder(e){try{let r=a.paymentReminder(e);return console.log("\uD83D\uDCE7 Payment Reminder:",r.subject),console.log("Email HTML:",r.html),{success:!0}}catch(e){throw console.error("Error sending payment reminder:",e),e}},async sendRentalAgreement(e){try{console.log("\uD83D\uDCE7 Sending Rental Agreement to:",e.renterEmail,"and",e.ownerEmail);let{data:r,error:t}=await i.O.functions.invoke("send-email",{body:{email:e.renterEmail,type:"rentalAgreement",data:e}});if(await i.O.functions.invoke("send-email",{body:{email:e.ownerEmail,type:"rentalAgreement",data:e}}),t)return console.error("Error sending rental agreement:",t),{success:!1,error:t};return console.log("✅ Rental agreement emails sent successfully"),{success:!0,data:r}}catch(e){return console.error("Error sending rental agreement:",e),{success:!1,error:e}}},async sendListingConfirmation(e){try{console.log("\uD83D\uDCE7 Sending Listing Confirmation to:",e.email);let{data:r,error:t}=await i.O.functions.invoke("send-email",{body:{email:e.email,type:"listingCreated",data:e}});if(t)return console.error("Error sending listing confirmation:",t),{success:!1,error:t};return console.log("✅ Listing confirmation email sent successfully"),{success:!0,data:r}}catch(e){return console.error("Error sending listing confirmation:",e),{success:!1,error:e}}},getEmailTemplate(e,r){if(a[e])return a[e](r);throw Error(`Template ${e} not found`)},async sendPremiumPaymentSuccess(e){try{console.log("\uD83D\uDCE7 Sending Premium Success Email to:",e.email);let{data:r,error:t}=await i.O.functions.invoke("send-email",{body:{email:e.email,type:"premiumPaymentSuccess",data:{userName:e.userName||e.full_name,expiryDate:e.expiryDate,dashboardUrl:`${window.location.origin}/dashboard`}}});if(t)throw t;return{success:!0,data:r}}catch(e){return console.error("Error sending premium success email:",e),{success:!1,error:e}}},async sendPremiumExpiryReminder(e){try{console.log("\uD83D\uDCE7 Sending Premium Expiry Reminder to:",e.email);let{data:r,error:t}=await i.O.functions.invoke("send-email",{body:{email:e.email,type:"premiumExpiryReminder",data:{userName:e.userName||e.full_name,expiryDate:e.expiryDate,premiumUrl:`${window.location.origin}/premium`}}});if(t)throw t;return{success:!0,data:r}}catch(e){return console.error("Error sending premium expiry reminder:",e),{success:!1,error:e}}},async sendPremiumExpiredNotification(e){try{console.log("\uD83D\uDCE7 Sending Premium Expired Notification to:",e.email);let{data:r,error:t}=await i.O.functions.invoke("send-email",{body:{email:e.email,type:"premiumExpired",data:{userName:e.userName||e.full_name,premiumUrl:`${window.location.origin}/premium`}}});if(t)throw t;return{success:!0,data:r}}catch(e){return console.error("Error sending premium expired notification:",e),{success:!1,error:e}}}}}};