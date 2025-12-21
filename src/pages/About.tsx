import React from 'react';
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

  const stats = [
    { number: '100+', label: 'Active Users' },
    { number: '150+', label: 'Items Shared' },
    { number: '20+', label: 'Cities' },
    { number: '98%', label: 'Satisfaction Rate' }
  ];

  const team = [
    {
      name: 'Mohammed Shakeeb',
      role: 'CEO & Founder',
      image: '/shakee.jpg',
      bio: ' Third year Engineering student in P. A. College of Engineering, Mangalore'
    },
    {
      name: 'Muhammad Haashid',
      role: 'Co-Founder',
      image: '/haash.jpg',
      bio: 'Third year Engineering student in P. A. College of Engineering, Mangalore'
    },
    {
      name: 'Mohammed Sinan',
      role: 'Co-founder',
      image: '/chinnu.jpg',
      bio: 'First year Engineering student in P. A. College of Engineering, Mangalore'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-yellow-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-500 py-20 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center text-white"
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Building Stronger<br />
            <span className="text-white drop-shadow-lg">Communities</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-white/90">
            We're on a mission to transform how neighbors share resources and build lasting connections.
          </p>
        </motion.div>
      </section>

      {/* Story Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Story</h2>
            <div className="bg-gradient-to-br from-white to-amber-50 rounded-xl shadow-lg border border-yellow-100 p-8 text-left">
              <p className="text-lg text-gray-600 leading-relaxed mb-6">
                Neighbour-Friendly Rentals started with a simple idea: what if we could help neighbors share the tools and items they occasionally need, instead of everyone buying everything individually?
              </p>
              <p className="text-lg text-gray-600 leading-relaxed mb-6">
                Our founder, Mohammed Shakeeb, experienced this firsthand when he needed a power drill for a weekend project. After asking around the neighborhood, he discovered that five different households owned drills that sat unused 99% of the time.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                This sparked the vision for a platform that would make sharing easy, safe, and beneficial for everyone involved. Today, we're proud to serve thousands of communities worldwide, helping people save money, reduce waste, and most importantly, get to know their neighbors.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Values Section */}
      <section className="bg-white py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-xl text-gray-600">The principles that guide everything we do</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gray-50 rounded-xl p-8"
              >
                <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                  <value.icon className="w-8 h-8 text-amber-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-primary py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-white mb-4">Impact by Numbers</h2>
            <p className="text-xl text-amber-100">See how we're making a difference</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-bold text-secondary mb-2">{stat.number}</div>
                <div className="text-amber-100 font-semibold">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
            <p className="text-xl text-gray-600">The people behind the platform</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gradient-to-br from-white to-amber-50 rounded-xl shadow-lg border border-yellow-100 overflow-hidden"
              >
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-64 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
                  <p className="text-amber-600 font-semibold mb-3">{member.role}</p>
                  <p className="text-gray-600">{member.bio}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="bg-gray-100 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Want to get in touch?</h2>
            <p className="text-xl text-gray-600 mb-8">We'd love to hear your feedback and suggestions.</p>
            <a
              href="/contact"
              className="inline-block bg-amber-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-amber-700 transition-colors shadow-lg"
            >
              Contact Us & Give Feedback
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default About;