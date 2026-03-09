'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Globe, ChevronDown } from 'lucide-react';

const languages = [
    { code: 'en', label: 'English', short: 'EN' },
    { code: 'hi', label: 'हिंदी', short: 'HI' },
    { code: 'kn', label: 'ಕನ್ನಡ', short: 'KN' },
    { code: 'ta', label: 'தமிழ்', short: 'TA' },
    { code: 'te', label: 'తెలుగు', short: 'TE' },
    { code: 'mr', label: 'मराठी', short: 'MR' },
];

export const LanguageSwitcher = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentLang, setCurrentLang] = useState('en');
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Read the current language from the googtrans cookie
        const match = document.cookie.match(/googtrans=\/en\/([a-z]{2})/);
        if (match && match[1]) {
            setCurrentLang(match[1]);
        }

        // Close dropdown when clicking outside
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLanguageChange = (langCode: string) => {
        if (langCode === currentLang) {
            setIsOpen(false);
            return;
        }

        // Google Translate uses the googtrans cookie
        // Set it for both the root domain and current host to be safe
        document.cookie = `googtrans=/en/${langCode}; path=/;`;
        document.cookie = `googtrans=/en/${langCode}; domain=.${window.location.hostname}; path=/;`;

        setCurrentLang(langCode);
        setIsOpen(false);

        // Reload to apply translation
        window.location.reload();
    };

    const currentLangObj = languages.find(l => l.code === currentLang) || languages[0];

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-1 px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 transition-colors"
                title="Change Language"
            >
                <Globe className="w-4 h-4 text-amber-600" />
                <span className="font-semibold text-sm hidden sm:inline-block">{currentLangObj.short}</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-50 mb-1">
                        Select Language
                    </div>
                    {languages.map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => handleLanguageChange(lang.code)}
                            className={`w-full text-left px-4 py-2 text-sm font-medium transition-colors ${currentLang === lang.code
                                    ? 'bg-amber-50 text-amber-700'
                                    : 'text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                <span>{lang.label}</span>
                                <span className="text-xs text-gray-400">{lang.short}</span>
                            </div>
                        </button>
                    ))}
                    <div className="px-3 pt-2 mt-1 border-t border-gray-50 text-[10px] text-gray-400 text-center">
                        Translated by Google
                    </div>
                </div>
            )}
        </div>
    );
};
