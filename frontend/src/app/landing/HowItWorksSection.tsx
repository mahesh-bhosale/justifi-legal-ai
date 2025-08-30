export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Three simple steps to transform your legal documents into clear, actionable insights
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Upload Card */}
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 mx-auto">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3 text-center">Upload</h3>
            <p className="text-gray-600 text-center leading-relaxed">
              Simply drag and drop your legal document or click to browse. We support PDF, DOC, and DOCX formats.
            </p>
          </div>
          
          {/* Analyze Card */}
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-6 mx-auto">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3 text-center">Analyze</h3>
            <p className="text-gray-600 text-center leading-relaxed">
              Our AI scans your document, identifies key clauses, and highlights important terms and potential risks.
            </p>
          </div>
          
          {/* Understand Card */}
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-6 mx-auto">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3 text-center">Understand</h3>
            <p className="text-gray-600 text-center leading-relaxed">
              Get a plain-English summary, explanations of legal terms, and actionable insights in seconds.
            </p>
          </div>
        </div>
        
        {/* Feature Blurbs */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Legal Simplifier</h4>
            <p className="text-gray-600">Understand Every Clause.</p>
          </div>
          
          <div className="text-center">
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Case Outcome Explorer</h4>
            <p className="text-gray-600 mb-1">Explore Possible Scenarios.</p>
            <p className="text-xs text-gray-500">*For educational purposes only</p>
          </div>
          
          <div className="text-center">
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Secure & Private</h4>
            <p className="text-gray-600">Your documents are protected with enterprise-grade security.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
