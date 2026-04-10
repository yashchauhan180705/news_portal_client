import { Newspaper, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-charcoal-900 text-charcoal-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                <Newspaper className="w-5 h-5 text-white" />
              </div>
              <span className="font-display font-bold text-xl text-white">
                News<span className="text-primary-400">Portal</span>
              </span>
            </div>
            <p className="text-sm text-charcoal-400 leading-relaxed">
              Your trusted source for the latest news, in-depth analysis,
              and comprehensive coverage of events that matter.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-display font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="/" className="hover:text-primary-400 transition-colors">Home</a></li>
              <li><a href="/epapers" className="hover:text-primary-400 transition-colors">E-Paper</a></li>
              <li><a href="/subscribe" className="hover:text-primary-400 transition-colors">Subscribe</a></li>
              <li><a href="/login" className="hover:text-primary-400 transition-colors">Login</a></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-display font-semibold text-white mb-4">Categories</h3>
            <ul className="space-y-2 text-sm">
              <li><span className="hover:text-primary-400 transition-colors cursor-pointer">National</span></li>
              <li><span className="hover:text-primary-400 transition-colors cursor-pointer">Technology</span></li>
              <li><span className="hover:text-primary-400 transition-colors cursor-pointer">Sports</span></li>
              <li><span className="hover:text-primary-400 transition-colors cursor-pointer">Business</span></li>
              <li><span className="hover:text-primary-400 transition-colors cursor-pointer">Health</span></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-charcoal-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-charcoal-500">
            &copy; {new Date().getFullYear()} NewsPortal. All rights reserved.
          </p>
          <p className="text-xs text-charcoal-500 flex items-center gap-1">
            Made with <Heart className="w-3 h-3 text-primary-500 fill-primary-500" /> for quality journalism
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
