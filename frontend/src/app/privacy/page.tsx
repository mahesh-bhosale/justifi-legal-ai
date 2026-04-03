export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-transparent py-12 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-900 shadow-2xl rounded-[2.5rem] p-8 md:p-16 border border-gray-100 dark:border-gray-800 backdrop-blur-sm relative overflow-hidden">
          {/* Decorative element */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-bl-full pointer-events-none"></div>
          
          <div className="border-l-4 border-amber-500 pl-8 mb-12">
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight">Privacy Policy</h1>
            <p className="text-amber-600 dark:text-amber-500 mt-2 font-bold uppercase tracking-[0.3em] text-[10px]">Data Protection Protocol</p>
          </div>
          
          <div className="space-y-12">
            <section className="relative">
              <div className="flex items-start gap-4">
                <span className="text-amber-600 dark:text-amber-500 font-serif italic text-4xl opacity-20 flex-shrink-0 mt-1">01</span>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Information We Collect</h2>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg font-medium">
                    We collect information you provide directly to us, such as when you create an account, submit legal documents, 
                    or contact us for support. This includes personal identifiers, encrypted legal documentation, and communication metadata 
                    essential for AI processing.
                  </p>
                </div>
              </div>
            </section>

            <section className="relative border-t border-gray-50 dark:border-gray-800/50 pt-12">
              <div className="flex items-start gap-4">
                <span className="text-amber-600 dark:text-amber-500 font-serif italic text-4xl opacity-20 flex-shrink-0 mt-1">02</span>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">How We Use Your Information</h2>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg font-medium">
                    Your data is strictly used to power our AI summarization models, generate legal insights, and maintain the integrity 
                    of your case files. We employ zero-knowledge principles where possible to ensure your sensitive legal data remains 
                    private and machine-readable only for your requested services.
                  </p>
                </div>
              </div>
            </section>

            <section className="relative border-t border-gray-50 dark:border-gray-800/50 pt-12">
              <div className="flex items-start gap-4">
                <span className="text-amber-600 dark:text-amber-500 font-serif italic text-4xl opacity-20 flex-shrink-0 mt-1">03</span>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Information Sharing</h2>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg font-medium">
                    We do not sell your personal information. Data sharing is limited to essential third-party service providers 
                    (e.g., identity verification) and legal requirements. Your legal documents are never exposed to public training sets.
                  </p>
                </div>
              </div>
            </section>

            <section className="relative border-t border-gray-50 dark:border-gray-800/50 pt-12">
              <div className="flex items-start gap-4">
                <span className="text-amber-600 dark:text-amber-500 font-serif italic text-4xl opacity-20 flex-shrink-0 mt-1">04</span>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Data Security & Sovereignty</h2>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg font-medium">
                    We implement industry-leading AES-256 encryption for data at rest and TLS 1.3 for data in transit. 
                    Security audits are performed regularly to defend against evolving cyber threats and ensure institutional-grade protection.
                  </p>
                </div>
              </div>
            </section>

            <div className="bg-gray-50 dark:bg-gray-800/40 rounded-[2rem] p-8 mt-16 border border-gray-100 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Privacy Inquiries</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 font-medium">
                For requests regarding data access, erasure, or portability, please contact our Data Protection Officer.
              </p>
              <div className="flex items-center gap-2 group cursor-pointer">
                <div className="bg-amber-600 text-white p-2 rounded-lg group-hover:scale-110 transition-transform shadow-lg shadow-amber-600/20">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-amber-600 dark:text-amber-500 font-black tracking-widest text-sm underline-offset-4 decoration-2">privacy@justifi-legal-ai.com</span>
              </div>
            </div>

            <div className="mt-12 pt-10 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center text-[10px] font-black tracking-[0.3em] uppercase text-gray-400 dark:text-gray-500">
              <span>Justifi Institutional</span>
              <span>Last Refined: {new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
