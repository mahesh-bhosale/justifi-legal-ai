export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Cookie Policy</h1>
          
          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. What Are Cookies</h2>
              <p className="text-gray-600 mb-4">
                Cookies are small text files that are placed on your device when you visit our website. They help us provide 
                you with a better experience by remembering your preferences, analyzing how you use our site, and personalizing 
                content and advertisements.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. Types of Cookies We Use</h2>
              <p className="text-gray-600 mb-4">
                We use several types of cookies on our website: essential cookies that are necessary for the website to function, 
                performance cookies that help us understand how visitors interact with our site, functionality cookies that 
                remember your preferences, and targeting cookies that are used to deliver relevant advertisements.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. Essential Cookies</h2>
              <p className="text-gray-600 mb-4">
                These cookies are necessary for the website to function properly. They enable basic functions like page navigation, 
                access to secure areas, and form submissions. The website cannot function properly without these cookies.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. Performance Cookies</h2>
              <p className="text-gray-600 mb-4">
                These cookies help us understand how visitors interact with our website by collecting and reporting information 
                anonymously. This helps us improve our website and provide a better user experience.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. Functionality Cookies</h2>
              <p className="text-gray-600 mb-4">
                These cookies allow the website to remember choices you make and provide enhanced, more personal features. 
                They may be set by us or by third-party providers whose services we have added to our pages.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">6. Targeting Cookies</h2>
              <p className="text-gray-600 mb-4">
                These cookies may be set through our site by our advertising partners. They may be used by those companies 
                to build a profile of your interests and show you relevant advertisements on other sites.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">7. Managing Cookies</h2>
              <p className="text-gray-600 mb-4">
                You can control and manage cookies through your browser settings. You can delete existing cookies and prevent 
                new ones from being set. However, disabling certain cookies may affect the functionality of our website.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">8. Third-Party Cookies</h2>
              <p className="text-gray-600 mb-4">
                Our website may use third-party services that set their own cookies. These services include analytics providers, 
                advertising networks, and social media platforms. We do not control these cookies and they are subject to the 
                privacy policies of the respective third parties.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">9. Updates to This Policy</h2>
              <p className="text-gray-600 mb-4">
                We may update this cookie policy from time to time to reflect changes in our practices or for other operational, 
                legal, or regulatory reasons. We will notify you of any material changes by posting the updated policy on our website.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">10. Contact Us</h2>
              <p className="text-gray-600 mb-4">
                If you have any questions about our use of cookies or this cookie policy, please contact us at 
                cookies@justifi-legal-ai.com.
              </p>
            </section>

            <div className="mt-12 pt-8 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
