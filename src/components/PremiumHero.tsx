import { Crown, Sparkles, TrendingUp, Users, Shield, Zap } from 'lucide-react';

export const PremiumHero = () => {
  return (
    <section className="relative bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 py-16 px-4 overflow-hidden">
      {/* Premium Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, gold 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          {/* Premium Badge */}
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 text-white px-6 py-3 rounded-full shadow-2xl mb-6">
            <Crown className="w-6 h-6" />
            <span className="font-bold text-lg">Premium Member</span>
            <Sparkles className="w-6 h-6" />
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-amber-600 via-yellow-600 to-orange-600 bg-clip-text text-transparent">
            Welcome to Your
            <br />
            Premium Experience
          </h1>

          <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-3xl mx-auto">
            🎉 You're part of India's elite rental community! Enjoy unlimited listings, priority support, and exclusive features.
          </p>
        </div>

        {/* Premium Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
          {[
            { icon: TrendingUp, label: 'Unlimited Listings', value: '∞', color: 'from-amber-400 to-amber-500' },
            { icon: Users, label: 'Priority Support', value: '24/7', color: 'from-blue-400 to-cyan-500' },
            { icon: Shield, label: 'Verified Badge', value: '✓', color: 'from-purple-400 to-pink-500' },
            { icon: Zap, label: 'Featured Spots', value: '3x', color: 'from-orange-400 to-red-500' },
          ].map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 shadow-xl border-2 border-yellow-200 transform hover:scale-105 transition-transform duration-300"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3 mx-auto`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Premium Tips Section */}
        <div className="mt-12 bg-gradient-to-r from-amber-100 to-yellow-100 rounded-3xl p-8 border-2 border-yellow-300">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-6 h-6 text-amber-600" />
            <h3 className="text-2xl font-bold text-gray-900">Maximize Your Premium Earnings</h3>
            <Sparkles className="w-6 h-6 text-amber-600" />
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-md border border-yellow-100">
              <div className="text-amber-600 font-bold text-lg mb-2">📸 High Quality Photos</div>
              <p className="text-gray-600 text-sm">Listings with 5+ bright, clear photos get 3x more bookings. Use all your premium upload slots!</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-md border border-yellow-100">
              <div className="text-amber-600 font-bold text-lg mb-2">🏷️ Strategic Pricing</div>
              <p className="text-gray-600 text-sm">Check similar items in your area. Use our Featured Placement to stay ahead of the competition.</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-md border border-yellow-100">
              <div className="text-amber-600 font-bold text-lg mb-2">⚡ Quick Responses</div>
              <p className="text-gray-600 text-sm">Priority Support is here for you, but responding to renters quickly is the best way to build trust.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
