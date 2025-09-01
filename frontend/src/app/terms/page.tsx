export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>
          
          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-600 mb-4">
                By accessing and using Justifi Legal AI, you accept and agree to be bound by the terms and provision of this agreement. 
                If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. Use License</h2>
              <p className="text-gray-600 mb-4">
                Permission is granted to temporarily download one copy of the materials (information or software) on Justifi Legal AI&apos;s 
                website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. Disclaimer</h2>
              <p className="text-gray-600 mb-4">
                The materials on Justifi Legal AI&apos;s website are provided on an &apos;as is&apos; basis. Justifi Legal AI makes no warranties, 
                expressed or implied, and hereby disclaims and negates all other warranties including without limitation, implied 
                warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual 
                property or other violation of rights.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. Limitations</h2>
              <p className="text-gray-600 mb-4">
                In no event shall Justifi Legal AI or its suppliers be liable for any damages (including, without limitation, damages 
                for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials 
                on Justifi Legal AI&apos;s website.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. Revisions and Errata</h2>
              <p className="text-gray-600 mb-4">
                The materials appearing on Justifi Legal AI&apos;s website could include technical, typographical, or photographic errors. 
                Justifi Legal AI does not warrant that any of the materials on its website are accurate, complete or current.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">6. Links</h2>
              <p className="text-gray-600 mb-4">
                Justifi Legal AI has not reviewed all of the sites linked to its website and is not responsible for the contents of 
                any such linked site. The inclusion of any link does not imply endorsement by Justifi Legal AI of the site.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">7. Modifications</h2>
              <p className="text-gray-600 mb-4">
                Justifi Legal AI may revise these terms of service for its website at any time without notice. By using this website 
                you are agreeing to be bound by the then current version of these Terms and Conditions of Use.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">8. Contact Information</h2>
              <p className="text-gray-600 mb-4">
                If you have any questions about these Terms of Service, please contact us at legal@justifi-legal-ai.com.
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
