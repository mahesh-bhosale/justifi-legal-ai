export default function Footer() {
  return (
    <footer id="contact" className="bg-gradient-to-b from-gray-900 to-gray-800 text-white py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-3">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                <span className="font-bold text-white">JL</span>
              </div>
              <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                Justifi Legal AI
              </h3>
            </div>
            <p className="text-gray-300 mb-6 max-w-md text-lg">
              Demystifying the law with AI-powered document analysis. Get instant insights into your legal documents.
            </p>
            <div className="flex space-x-5">
              {/* LinkedIn */}
              <a
                href="#"
                className="bg-gray-800 p-3 rounded-full text-gray-300 hover:text-white hover:bg-blue-600 transition-all duration-300 transform hover:-translate-y-1"
                aria-label="LinkedIn"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.047-1.032-3.047-1.033 0-1.191.847-1.191 2.051v4.565h-2.666V9h2.666v1.561c.703-1.273 1.449-2.066 3.032-2.066 2.449 0 2.865 1.657 2.865 3.119v5.836z"/>
                  <path d="M5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452z"/>
                </svg>
              </a>
              
              {/* Twitter */}
              <a
                href="#"
                className="bg-gray-800 p-3 rounded-full text-gray-300 hover:text-white hover:bg-blue-400 transition-all duration-300 transform hover:-translate-y-1"
                aria-label="Twitter"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
              
              {/* Email */}
              <a
                href="mailto:contact@justifilegal.ai"
                className="bg-gray-800 p-3 rounded-full text-gray-300 hover:text-white hover:bg-red-500 transition-all duration-300 transform hover:-translate-y-1"
                aria-label="Email"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </a>
            </div>
          </div>
          
          {/* Legal Links */}
          <div className="col-span-1 md:col-span-1">
            <h4 className="text-lg font-semibold mb-5 relative inline-block">
              Legal
              <span className="absolute -bottom-2 left-0 w-8 h-1 bg-blue-500 rounded-full"></span>
            </h4>
            <ul className="space-y-3">
              <li>
                <a href="/terms" className="text-gray-300 hover:text-white transition-colors flex items-center group">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3 group-hover:scale-125 transition-transform"></span>
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="/privacy" className="text-gray-300 hover:text-white transition-colors flex items-center group">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3 group-hover:scale-125 transition-transform"></span>
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/cookies" className="text-gray-300 hover:text-white transition-colors flex items-center group">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3 group-hover:scale-125 transition-transform"></span>
                  Cookie Policy
                </a>
              </li>
            </ul>
          </div>
          
          {/* Company Links */}
          <div className="col-span-1 md:col-span-1">
            <h4 className="text-lg font-semibold mb-5 relative inline-block">
              Company
              <span className="absolute -bottom-2 left-0 w-8 h-1 bg-purple-500 rounded-full"></span>
            </h4>
            <ul className="space-y-3">
              <li>
                <a href="/about" className="text-gray-300 hover:text-white transition-colors flex items-center group">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-3 group-hover:scale-125 transition-transform"></span>
                  About Us
                </a>
              </li>
              <li>
                <a href="/contact" className="text-gray-300 hover:text-white transition-colors flex items-center group">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-3 group-hover:scale-125 transition-transform"></span>
                  Contact
                </a>
              </li>
              <li>
                <a href="/careers" className="text-gray-300 hover:text-white transition-colors flex items-center group">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-3 group-hover:scale-125 transition-transform"></span>
                  Careers
                </a>
              </li>
            </ul>
          </div>
          
          {/* Newsletter Signup */}
          <div className="col-span-1 md:col-span-3 lg:col-span-1 mt-8 md:mt-0">
            <h4 className="text-lg font-semibold mb-5 relative inline-block">
              Stay Updated
              <span className="absolute -bottom-2 left-0 w-8 h-1 bg-green-500 rounded-full"></span>
            </h4>
            <p className="text-gray-300 mb-4">Subscribe to our newsletter for the latest updates.</p>
            <div className="flex">
              <input 
                type="email" 
                placeholder="Your email" 
                className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
              />
              <button className="bg-blue-600 hover:bg-blue-700 px-4 py-3 rounded-r-lg font-medium transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 mb-4 md:mb-0">
            © 2025 Justifi Legal AI. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Accessibility</a>
            <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Security</a>
            <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Disclaimer</a>
          </div>
        </div>
      </div>
    </footer>
  );
}