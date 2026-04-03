export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 px-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-600/30 dark:border-yellow-500/30 text-yellow-700 dark:text-yellow-500 font-medium mb-4">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
            </svg>
            How JustiFi Works
          </div>
          <h2 className="text-5xl font-bold font-serif text-gray-900 dark:text-white mb-6">
            Your Complete AI Legal Assistant
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            From document analysis to outcome prediction, our platform transforms complex legal processes into simple, actionable insights
          </p>
        </div>

        {/* Main Steps */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-16">
          {/* Step 1: Upload */}
          <div className="relative">
            <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:border-yellow-600/30 dark:hover:border-yellow-500/30 h-full">
              <div className="absolute -top-4 -left-4 w-10 h-10 bg-white dark:bg-gray-800 border-2 border-yellow-600 dark:border-yellow-500 text-yellow-600 dark:text-yellow-500 rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                1
              </div>
              <div className="w-20 h-20 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-6 mx-auto border border-gray-100 dark:border-gray-700">
                <svg className="w-10 h-10 text-yellow-600 dark:text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 text-center">Upload Legal Documents</h3>
              <p className="text-gray-600 dark:text-gray-400 text-center leading-relaxed">
                Upload case files, contracts, or legal documents in PDF, DOC, or DOCX format. Our system supports complex legal formatting and maintains document integrity.
              </p>
            </div>
          </div>

          {/* Step 2: AI Analysis */}
          <div className="relative">
            <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:border-yellow-600/30 dark:hover:border-yellow-500/30 h-full">
              <div className="absolute -top-4 -left-4 w-10 h-10 bg-white dark:bg-gray-800 border-2 border-yellow-600 dark:border-yellow-500 text-yellow-600 dark:text-yellow-500 rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                2
              </div>
              <div className="w-20 h-20 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-6 mx-auto border border-gray-100 dark:border-gray-700">
                <svg className="w-10 h-10 text-yellow-600 dark:text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 text-center">AI-Powered Analysis</h3>
              <p className="text-gray-600 dark:text-gray-400 text-center leading-relaxed">
                Our transformer-based models analyze legal language, identify key clauses, extract entities, and apply NLP techniques for deep understanding.
              </p>
            </div>
          </div>

          {/* Step 3: Get Insights */}
          <div className="relative">
            <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:border-yellow-600/30 dark:hover:border-yellow-500/30 h-full">
              <div className="absolute -top-4 -left-4 w-10 h-10 bg-white dark:bg-gray-800 border-2 border-yellow-600 dark:border-yellow-500 text-yellow-600 dark:text-yellow-500 rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                3
              </div>
              <div className="w-20 h-20 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-6 mx-auto border border-gray-100 dark:border-gray-700">
                <svg className="w-10 h-10 text-yellow-600 dark:text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 text-center">Get Actionable Insights</h3>
              <p className="text-gray-600 dark:text-gray-400 text-center leading-relaxed">
                Receive plain-English summaries, risk assessments, and confidence-scored predictions using ML algorithms like Random Forest and SVM.
              </p>
            </div>
          </div>

          {/* Step 4: Connect */}
          <div className="relative">
            <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:border-yellow-600/30 dark:hover:border-yellow-500/30 h-full">
              <div className="absolute -top-4 -left-4 w-10 h-10 bg-white dark:bg-gray-800 border-2 border-yellow-600 dark:border-yellow-500 text-yellow-600 dark:text-yellow-500 rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                4
              </div>
              <div className="w-20 h-20 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-6 mx-auto border border-gray-100 dark:border-gray-700">
                <svg className="w-10 h-10 text-yellow-600 dark:text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 text-center">Connect with Legal Experts</h3>
              <p className="text-gray-600 dark:text-gray-400 text-center leading-relaxed">
                Based on your case analysis, connect with verified lawyers, share insights, and get professional consultation through our secure platform.
              </p>
            </div>
          </div>
        </div>

        {/* Key Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-8 bg-gray-50 dark:bg-gray-900 rounded-2xl shadow-lg border-t-4 border-yellow-600/50 dark:border-yellow-500/50 hover:border-yellow-600 dark:hover:border-yellow-500 transition-colors border-x border-b border-gray-200 dark:border-gray-800">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white dark:bg-gray-800 rounded-2xl mb-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <svg className="w-8 h-8 text-yellow-600 dark:text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Legal Document Simplifier</h4>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Transform complex legal jargon into clear, understandable language using advanced AI summarization
            </p>
            <div className="inline-flex items-center text-yellow-600 dark:text-yellow-500 font-medium cursor-pointer group">
              <span className="group-hover:underline">Understand Every Clause</span>
              <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          
          <div className="text-center p-8 bg-gray-50 dark:bg-gray-900 rounded-2xl shadow-lg border-t-4 border-yellow-600/50 dark:border-yellow-500/50 hover:border-yellow-600 dark:hover:border-yellow-500 transition-colors border-x border-b border-gray-200 dark:border-gray-800">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white dark:bg-gray-800 rounded-2xl mb-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <svg className="w-8 h-8 text-yellow-600 dark:text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Case Outcome Predictor</h4>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              AI-driven analysis of historical data to predict possible case outcomes with confidence scoring
            </p>
            <div className="inline-flex items-center text-yellow-600 dark:text-yellow-500 font-medium cursor-pointer group">
              <span className="group-hover:underline">Explore Possible Scenarios</span>
              <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          
          <div className="text-center p-8 bg-gray-50 dark:bg-gray-900 rounded-2xl shadow-lg border-t-4 border-yellow-600/50 dark:border-yellow-500/50 hover:border-yellow-600 dark:hover:border-yellow-500 transition-colors border-x border-b border-gray-200 dark:border-gray-800">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white dark:bg-gray-800 rounded-2xl mb-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <svg className="w-8 h-8 text-yellow-600 dark:text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Secure Legal Ecosystem</h4>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Enterprise-grade security with JWT authentication, encrypted data, and privacy-focused architecture
            </p>
            <div className="inline-flex items-center text-yellow-600 dark:text-yellow-500 font-medium cursor-pointer group">
              <span className="group-hover:underline">Your Data is Protected</span>
              <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}