import React, { useEffect, useState } from 'react';
import { Twitter, Instagram, Youtube, Mail, Phone, MapPin, FacebookIcon } from 'lucide-react';
import { getSettings } from '../api/setting';

const Footer = () => {

  const [settings, setSettings] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await getSettings();
        setSettings(data);
        console.log(data)
      } catch (err) {
        console.error("❌ Failed to load settings:", err);
      }
    };
    fetchSettings();
  }, []);

  if (!settings) {
    return (
      <footer className="bg-gray-900 text-white py-6 text-center">
        <p className="text-gray-400">Loading site info...</p>
      </footer>
    );
  }
  const siteName = settings?.siteName || "MySite";

  // Split into first part + last word
  const words = siteName.split(/(?=[A-Z])/); // split on capital letters
  const firstPart = words.slice(0, -1).join("");
  const lastPart = words[words.length - 1];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-2xl font-bold mb-4">
            {firstPart}<span className="text-[#1c9199]">{lastPart}</span>
            </h3>
            <p className="text-gray-400 mb-4">
            {settings.siteDescription || "Your premium destination for fashion and style. Discover the latest trends and timeless classics."}
              
            </p>
            <div className="flex space-x-4">
              <FacebookIcon className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer" />
              <Twitter className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer" />
              <Instagram className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer" />
              <Youtube className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer" />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white">About Us</a></li>
              <li><a href="#" className="hover:text-white">Contact</a></li>
              <li><a href="#" className="hover:text-white">FAQ</a></li>
              <li><a href="#" className="hover:text-white">Size Guide</a></li>
              <li><a href="#" className="hover:text-white">Returns</a></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Categories</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white">Outerwear</a></li>
              <li><a href="#" className="hover:text-white">Accessories</a></li>
              <li><a href="#" className="hover:text-white">Footwear</a></li>
              <li><a href="#" className="hover:text-white">Top</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
            <div className="space-y-3 text-gray-400">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>{settings.address || "123 Fashion Street, Style City, SC 12345"}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>{settings.phone || "+1 (555) 123-4567"}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>{settings.contactEmail}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} {settings.siteName}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
