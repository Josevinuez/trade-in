import { useState } from 'react';
import { Smartphone, Menu, X } from 'lucide-react';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">TradeIn Pro</span>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <button 
              onClick={() => scrollToSection('how-it-works')}
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              How it Works
            </button>
            <button 
              onClick={() => scrollToSection('devices')}
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              Devices
            </button>
            <button 
              onClick={() => scrollToSection('about')}
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              About
            </button>
            <button 
              onClick={() => scrollToSection('contact')}
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              Contact
            </button>
          </nav>
          
          <div className="hidden md:flex items-center space-x-4">
            <a href="tel:1-800-TRADE-IN" className="text-blue-600 font-semibold hover:text-blue-700">
              1-800-TRADE-IN
            </a>
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Track My Offer
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-gray-600" />
            ) : (
              <Menu className="w-6 h-6 text-gray-600" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-200">
            <nav className="flex flex-col space-y-4 mt-4">
              <button 
                onClick={() => scrollToSection('how-it-works')}
                className="text-gray-600 hover:text-blue-600 transition-colors text-left py-2"
              >
                How it Works
              </button>
              <button 
                onClick={() => scrollToSection('devices')}
                className="text-gray-600 hover:text-blue-600 transition-colors text-left py-2"
              >
                Devices
              </button>
              <button 
                onClick={() => scrollToSection('about')}
                className="text-gray-600 hover:text-blue-600 transition-colors text-left py-2"
              >
                About
              </button>
              <button 
                onClick={() => scrollToSection('contact')}
                className="text-gray-600 hover:text-blue-600 transition-colors text-left py-2"
              >
                Contact
              </button>
              <div className="pt-4 border-t border-gray-200">
                <a href="tel:1-800-TRADE-IN" className="text-blue-600 font-semibold hover:text-blue-700 block py-2">
                  1-800-TRADE-IN
                </a>
                <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors w-full mt-2">
                  Track My Offer
                </button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
} 