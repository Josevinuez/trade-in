import { useState } from 'react';
import { Smartphone, Menu, X, User, Shield } from 'lucide-react';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleNavigate = (sectionId: string) => {
    const isHome = typeof window !== 'undefined' && window.location.pathname === '/';
    if (isHome) {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      } else {
        // Fallback to hash navigation
        window.location.hash = `#${sectionId}`;
      }
    } else {
      window.location.href = `/#${sectionId}`;
    }
    setIsMenuOpen(false);
  };

  const handleStaffLogin = () => {
    // Navigate to staff login page
    window.location.href = '/staff-login';
  };

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <a href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">TradeIn Pro</span>
          </a>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <button 
              onClick={() => handleNavigate('how-it-works')}
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              How it Works
            </button>
            <button 
              onClick={() => handleNavigate('devices')}
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              Devices
            </button>
            <button 
              onClick={() => handleNavigate('about')}
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              About
            </button>
            <button 
              onClick={() => handleNavigate('contact')}
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              Contact
            </button>
          </nav>
          
          <div className="hidden md:flex items-center space-x-4">
            <a href="tel:1-800-TRADE-IN" className="text-blue-600 font-semibold hover:text-blue-700">
              1-800-TRADE-IN
            </a>
            <a href="/track-order" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Track My Offer
            </a>
            <button 
              onClick={handleStaffLogin}
              className="flex items-center space-x-1 text-gray-600 hover:text-purple-600 transition-colors px-3 py-2 rounded-lg hover:bg-purple-50"
            >
              <Shield className="w-4 h-4" />
              <span className="text-sm">Staff Login</span>
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
                onClick={() => handleNavigate('how-it-works')}
                className="text-gray-600 hover:text-blue-600 transition-colors text-left py-2"
              >
                How it Works
              </button>
              <button 
                onClick={() => handleNavigate('devices')}
                className="text-gray-600 hover:text-blue-600 transition-colors text-left py-2"
              >
                Devices
              </button>
              <button 
                onClick={() => handleNavigate('about')}
                className="text-gray-600 hover:text-blue-600 transition-colors text-left py-2"
              >
                About
              </button>
              <button 
                onClick={() => handleNavigate('contact')}
                className="text-gray-600 hover:text-blue-600 transition-colors text-left py-2"
              >
                Contact
              </button>
              <div className="pt-4 border-t border-gray-200">
                <a href="tel:1-800-TRADE-IN" className="text-blue-600 font-semibold hover:text-blue-700 block py-2">
                  1-800-TRADE-IN
                </a>
                <a href="/track-order" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors w-full mt-2 block text-center">
                  Track My Offer
                </a>
                <div className="mt-4 space-y-2">
                  <button 
                    onClick={handleStaffLogin}
                    className="flex items-center space-x-2 text-gray-600 hover:text-purple-600 transition-colors w-full py-2"
                  >
                    <Shield className="w-4 h-4" />
                    <span>Staff Login</span>
                  </button>
                </div>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
} 