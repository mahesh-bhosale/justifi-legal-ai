export default function TermsPage() {
  return (
    <div className="min-h-screen bg-transparent py-12 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-900 shadow-2xl rounded-[2.5rem] p-8 md:p-16 border border-gray-100 dark:border-gray-800 backdrop-blur-sm relative overflow-hidden">
          {/* Decorative element */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-bl-full pointer-events-none"></div>
          
          <div className="border-l-4 border-amber-500 pl-8 mb-12">
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight">Terms of Service</h1>
            <p className="text-amber-600 dark:text-amber-500 mt-2 font-bold uppercase tracking-[0.3em] text-[10px]">Justifi Legal Framework</p>
          </div>
          
          <div className="space-y-12">
            <section className="relative">
              <div className="flex items-start gap-4">
                <span className="text-amber-600 dark:text-amber-500 font-serif italic text-4xl opacity-20 flex-shrink-0 mt-1">I</span>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Acceptance of Terms</h2>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg font-medium">
                    By accessing and using Justifi Legal AI (&quot;the Platform&quot;), you agree to be bound by these Terms of Service. 
                    Our Platform provides AI-driven legal summarization and management tools. If you disagree with any segment 
                    of these institutional terms, you must terminate usage immediately.
                  </p>
                </div>
              </div>
            </section>

            <section className="relative border-t border-gray-50 dark:border-gray-800/50 pt-12">
              <div className="flex items-start gap-4">
                <span className="text-amber-600 dark:text-amber-500 font-serif italic text-4xl opacity-20 flex-shrink-0 mt-1">II</span>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Service Scope & AI Accuracy</h2>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg font-medium">
                    Justifi Legal AI utilizes advanced language models to provide summaries. While we strive for institutional precision, 
                    AI-generated content does not constitute formal legal advice. Users must verify critical outputs with qualified 
                    legal professionals.
                  </p>
                </div>
              </div>
            </section>

            <section className="relative border-t border-gray-50 dark:border-gray-800/50 pt-12">
              <div className="flex items-start gap-4">
                <span className="text-amber-600 dark:text-amber-500 font-serif italic text-4xl opacity-20 flex-shrink-0 mt-1">III</span>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Intellectual Property</h2>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg font-medium">
                    All Platform software, algorithms, and branding are the exclusive property of Justifi. Permission is granted 
                    for personal, non-commercial transitory viewing of summarized reports. Title transfer of Platform data 
                    is strictly prohibited.
                  </p>
                </div>
              </div>
            </section>

            <section className="relative border-t border-gray-50 dark:border-gray-800/50 pt-12">
              <div className="flex items-start gap-4">
                <span className="text-amber-600 dark:text-amber-500 font-serif italic text-4xl opacity-20 flex-shrink-0 mt-1">IV</span>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Liability Disclaimer</h2>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg font-medium text-sm italic">
                    THE MATERIALS ON JUSTIFI LEGAL AI ARE PROVIDED ON AN &quot;AS IS&quot; BASIS. JUSTIFI DISCLAIMS ALL WARRANTIES, 
                    EXPRESSED OR IMPLIED, INCLUDING WITHOUT LIMITATION, IMPLIED WARRANTIES OF MERCHANTABILITY OR FITNESS 
                    FOR A PARTICULAR LEGAL PURPOSE.
                  </p>
                </div>
              </div>
            </section>

            <div className="bg-gray-50 dark:bg-gray-800/40 rounded-[2rem] p-8 mt-16 border border-gray-100 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Legal Inquiries</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 font-medium">
                For contract disputes, licensing questions, or institutional partnerships, please contact our legal department.
              </p>
              <div className="flex items-center gap-2 group cursor-pointer">
                <div className="bg-amber-600 text-white p-2 rounded-lg group-hover:scale-110 transition-transform shadow-lg shadow-amber-600/20">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-amber-600 dark:text-amber-500 font-black tracking-widest text-sm underline-offset-4 decoration-2">legal@justifi-legal-ai.com</span>
              </div>
            </div>

            <div className="mt-12 pt-10 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center text-[10px] font-black tracking-[0.3em] uppercase text-gray-400 dark:text-gray-500">
              <span>Jurisdictional Compliance: Global</span>
              <span>Revised: {new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
