export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-transparent py-12 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-900 shadow-xl rounded-3xl p-8 md:p-12 border border-gray-100 dark:border-gray-800 backdrop-blur-sm">
          <div className="border-l-4 border-amber-500 pl-6 mb-10">
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">Cookie Policy</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">How we use cookies to improve your experience.</p>
          </div>
          
          <div className="space-y-10">
            <section className="group">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
                <span className="text-amber-600 dark:text-amber-500 font-serif italic text-3xl opacity-50">01</span>
                What Are Cookies
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg font-medium">
                Cookies are small text files that are placed on your device when you visit our website. They help us provide 
                you with a better experience by remembering your preferences, analyzing how you use our site, and personalizing 
                content and advertisements.
              </p>
            </section>

            <section className="group">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
                <span className="text-amber-600 dark:text-amber-500 font-serif italic text-3xl opacity-50">02</span>
                Types of Cookies We Use
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg font-medium">
                We use several types of cookies on our website: essential cookies that are necessary for the website to function, 
                performance cookies that help us understand how visitors interact with our site, functionality cookies that 
                remember your preferences, and targeting cookies that are used to deliver relevant advertisements.
              </p>
            </section>

            <section className="group border-t border-gray-50 dark:border-gray-800/50 pt-10">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">3. Essential Cookies</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                These cookies are necessary for the website to function properly. They enable basic functions like page navigation, 
                access to secure areas, and form submissions. The website cannot function properly without these cookies.
              </p>
            </section>

            <section className="group">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">4. Performance Cookies</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                These cookies help us understand how visitors interact with our website by collecting and reporting information 
                anonymously. This helps us improve our website and provide a better user experience.
              </p>
            </section>

            <section className="group">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">5. Functionality Cookies</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                These cookies allow the website to remember choices you make and provide enhanced, more personal features. 
                They may be set by us or by third-party providers whose services we have added to our pages.
              </p>
            </section>

            <section className="group">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">6. Analytics & Targeting</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                These cookies may be used by our partners to build a profile of your interests and show you relevant content 
                across the web. They help us understand the effectiveness of our platform outreach.
              </p>
            </section>

            <section className="group border-t border-gray-50 dark:border-gray-800/50 pt-10">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">7. Managing Your Preferences</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                You can control and manage cookies through your browser settings. You can delete existing cookies and prevent 
                new ones from being set. However, disabling certain cookies may affect the functionality of our website.
              </p>
            </section>

            <section className="group border-l-4 border-amber-900/20 dark:border-amber-500/20 pl-6 py-2 bg-amber-50/30 dark:bg-amber-900/10 rounded-r-xl">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 mt-2">10. Contact Us</h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                If you have any questions about our use of cookies or this cookie policy, please reach out to our privacy team at:
              </p>
              <p className="text-amber-600 dark:text-amber-500 font-bold mt-2 hover:underline cursor-pointer">
                cookies@justifi-legal-ai.com
              </p>
            </section>

            <div className="mt-12 pt-8 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center text-xs font-semibold tracking-widest uppercase text-gray-400 dark:text-gray-500">
              <span>Justifi Legal AI</span>
              <span>Last updated: {new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
