#!/bin/bash

echo "🚀 Setting up Email, Monitoring & Analytics..."
echo ""

# Install packages
echo "📦 Installing packages..."
npm install resend @sentry/react react-ga4

echo ""
echo "✅ Packages installed!"
echo ""
echo "📝 Next steps:"
echo ""
echo "1. Sign up for services:"
echo "   - Resend: https://resend.com"
echo "   - Sentry: https://sentry.io"
echo "   - Google Analytics: https://analytics.google.com"
echo "   - UptimeRobot: https://uptimerobot.com"
echo ""
echo "2. Get API keys and add to .env.local:"
echo "   VITE_RESEND_API_KEY=re_..."
echo "   VITE_SENTRY_DSN=https://..."
echo "   VITE_GA_MEASUREMENT_ID=G-..."
echo ""
echo "3. Follow the guide: SETUP_EMAIL_MONITORING_ANALYTICS.md"
echo ""
echo "🎉 Ready to implement!"
