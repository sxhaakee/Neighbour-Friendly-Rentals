'use client';

import React from 'react';
import Link from 'next/link';
import { Home, Mail, Phone, Facebook, Twitter, Instagram } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-300 border-t-4 border-yellow-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <img
                src="/LOGOOO.jpg"
                alt="NeighbourFriendly Rentals"
                className="w-8 h-8 object-contain rounded-lg"
              />
              <span className="font-bold text-xl text-white">
                Neighbour<span className="bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">Friendly</span>
              </span>
            </div>
            <p className="text-gray-400 mb-6 max-w-md">
              Building stronger communities by sharing resources. Rent smart, share local, and save together.
            </p>
            <div className="flex space-x-4">
              <a href="https://www.facebook.com/profile.php?id=61571045024945" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-yellow-400 transition-colors transform hover:scale-110">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="https://x.com/Neighbour_frien" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-yellow-400 transition-colors transform hover:scale-110">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="https://www.instagram.com/neighbour_friendly_rentals/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-yellow-400 transition-colors transform hover:scale-110">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-white mb-4 text-lg">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-400 hover:text-yellow-400 transition-colors hover:translate-x-1 inline-block">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/listings" className="text-gray-400 hover:text-yellow-400 transition-colors hover:translate-x-1 inline-block">
                  Browse Items
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-400 hover:text-yellow-400 transition-colors hover:translate-x-1 inline-block">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-400 hover:text-yellow-400 transition-colors hover:translate-x-1 inline-block">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-400 hover:text-yellow-400 transition-colors hover:translate-x-1 inline-block">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-yellow-400 transition-colors hover:translate-x-1 inline-block">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-white mb-4 text-lg">Contact</h3>
            <ul className="space-y-2">
              <li className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-yellow-400" />
                <span className="text-gray-400">friendlyrentals.mlr@gmail.com</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-yellow-400" />
                <span className="text-gray-400">+91 8197424986</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-yellow-400/30 mt-8 pt-8 text-center">
          <p className="text-gray-400">&copy; {currentYear} Neighbour-Friendly Rentals. All rights reserved.</p>
          <p className="text-yellow-400 text-sm mt-2">Made with ❤️ in India</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
