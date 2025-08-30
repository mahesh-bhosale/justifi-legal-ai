export default function VideoDemoSection() {
  return (
    <section id="video-demo" className="py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            See the Magic in Under 2 Minutes.
          </h2>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Video Thumbnail */}
          <div className="flex justify-center lg:justify-start">
            <div className="relative w-full max-w-lg">
              <div className="bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl shadow-xl aspect-video flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <svg className="w-10 h-10 text-white ml-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-gray-600 font-medium">Demo video coming soon</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right: Content & Steps */}
          <div className="space-y-8">
            <div className="text-lg text-gray-600 leading-relaxed">
              <p className="mb-6">
                Watch how our AI transforms complex legal documents into clear, actionable insights in just seconds.
              </p>
            </div>
            
            {/* 3-Step Walkthrough */}
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">NDA Input</h4>
                  <p className="text-gray-600 text-sm">Upload your Non-Disclosure Agreement</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Highlighted Clauses</h4>
                  <p className="text-gray-600 text-sm">AI identifies and explains key terms</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  3
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Instant Summary</h4>
                  <p className="text-gray-600 text-sm">Get plain-English breakdown in seconds</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
