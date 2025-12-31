import { Users, Heart, Shield, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

const About = () => {
  const values = [
    {
      icon: Heart,
      title: 'Community First',
      description: 'We believe in the power of neighbors helping neighbors, creating stronger local communities through sharing.'
    },
    {
      icon: Shield,
      title: 'Trust & Safety',
      description: 'Every user is verified and all transactions are secure. We prioritize the safety of our community above all.'
    },
    {
      icon: Globe,
      title: 'Sustainable Living',
      description: 'By sharing resources, we reduce waste and environmental impact while saving money for everyone.'
    },
    {
      icon: Users,
      title: 'Inclusive Access',
      description: 'Everyone deserves access to the tools and items they need, regardless of their economic situation.'
    }
  ];

  const team = [
    {
      name: 'Mohammed Shakeeb',
      role: 'Founder',
      image: '/shakee.jpg', // Placeholder, user should update if they have it, or use generic
      bio: 'Visionary leader turning neighborly trust into a global movement.'
    },
    {
      name: 'Muhammad Haashid',
      role: 'Co-Founder',
      image: '/haash.jpg',
      bio: 'Tech architect building the digital bridges that connect communities safely.'
    },
    {
      name: 'Mohammed Sinan',
      role: 'Co-Founder',
      image: '/chinnu.jpg',
      bio: 'Operations strategist ensuring every rental experience is seamless and secure.'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-600 via-yellow-500 to-amber-400"></div>
        <div className="absolute inset-0 bg-[url('/images/community-bg.png')] opacity-20 bg-cover bg-center mix-blend-overlay"></div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          className="relative z-10 text-center px-4 max-w-5xl mx-auto"
        >
          <span className="inline-block py-1 px-3 border border-white/30 rounded-full text-white/90 text-sm font-medium mb-6 backdrop-blur-sm">
            Our Mission
          </span>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 tracking-tight">
            We're bringing <br /> <span className="text-yellow-200">neighbourhoods</span> back to life.
          </h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed">
            NFR is more than a marketplace. It's a movement to connect people, reduce waste, and build trust—one rental at a time.
          </p>
        </motion.div>
      </section>

      {/* Origin Story - Parallax/Visual */}
      <section className="py-24 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="absolute -inset-4 bg-amber-200/50 rounded-2xl transform -rotate-3 blur-sm"></div>
            <img
              src="/images/indian-uncle-drill.png"
              alt="Community interaction"
              className="relative rounded-2xl shadow-2xl w-full object-cover transform rotate-2 hover:rotate-0 transition-all duration-500"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-6">It started with a drill.</h2>
            <div className="space-y-6 text-lg text-gray-600 leading-relaxed">
              <p>
                Like many great ideas, Neighbour Friendly Rentals (NFR) began with a simple problem:
                <strong> why buy something you'll only use once?</strong>
              </p>
              <p>
                Our founder, Mohammed Shakeeb, needed a power drill for a quick weekend project. Walking through his neighbourhood, he realized that probably dozens of drills were sitting in closets within a 5-minute walk, unused. Yet, there was no easy, trusted way to ask for one.
              </p>
              <p>
                That realization sparked NFR. We built a platform that replaces awkward borrowing with secure, insured, and friendly renting. Today, we're empowering communities across India to own less and experience more.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Values Section - Grid */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">What drives us</h2>
            <p className="text-gray-500 mt-4 text-xl">The core values woven into every line of code.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gray-50 border border-gray-100 rounded-3xl p-8 hover:shadow-xl transition-all duration-300 group"
              >
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                  <value.icon className="w-7 h-7 text-amber-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section - Re-designed */}
      <section className="py-24 px-4 bg-gray-50 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 tracking-tight">Meet the <span className="text-amber-600">Builders</span></h2>
            <p className="text-gray-500 text-xl max-w-2xl mx-auto font-medium">
              A team of passionate engineers from Mangalore dedicated to building trust and sustainability in local communities.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {team.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="group relative bg-white rounded-[2.5rem] p-8 shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 flex flex-col items-center text-center"
              >
                <div className="relative mb-8 pt-4">
                  <div className="absolute -inset-2 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-[2rem] blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
                  <div className="relative w-40 h-40 rounded-[2rem] overflow-hidden border-4 border-white shadow-lg">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=f59e0b&color=fff&size=200`;
                      }}
                    />
                  </div>
                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-amber-600 text-white px-4 py-1 rounded-full text-xs font-bold shadow-md transform group-hover:scale-110 transition-transform">
                    {member.role}
                  </div>
                </div>

                <h3 className="text-2xl font-black text-gray-900 mb-3">{member.name}</h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-8 flex-grow">
                  {member.bio}
                </p>

                <div className="flex gap-4 pt-6 border-t border-gray-50 w-full justify-center">
                  <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer">
                    <Users className="w-4 h-4" />
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer">
                    <Shield className="w-4 h-4" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-yellow-500 via-amber-500 to-yellow-600 py-24 px-4">
        <div className="max-w-4xl mx-auto text-center text-white">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-8">Ready to join the neighbourhood?</h2>
            <p className="text-xl md:text-2xl text-amber-100 mb-10">
              Whether you have something to share or need something for a day, there's a place for you here.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/contact"
                className="bg-white text-amber-600 px-8 py-4 rounded-xl font-bold hover:bg-gray-100 transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
              >
                Contact Us
              </a>
              <a
                href="/listings"
                className="bg-amber-700/50 backdrop-blur-sm border border-amber-500/50 text-white px-8 py-4 rounded-xl font-bold hover:bg-amber-700 transition-all"
              >
                Explore Rentals
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default About;