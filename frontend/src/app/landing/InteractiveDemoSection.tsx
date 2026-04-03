'use client';

import { useState } from 'react';
import Button from '../../components/Button';
import { useRouter } from 'next/navigation';

interface DocumentCard {
  id: string;
  title: string;
  type: string;
  description: string;
  icon: string;
}

const sampleDocuments: DocumentCard[] = [
  {
    id: 'nda',
    title: 'Non-Disclosure Agreement',
    type: 'NDA',
    description: 'Standard confidentiality agreement with common clauses',
    icon: '🔒'
  },
  {
    id: 'license',
    title: 'Software License Agreement',
    type: 'License',
    description: 'End-user license agreement for software products',
    icon: '💻'
  },
  {
    id: 'rental',
    title: 'Rental Agreement Clause',
    type: 'Lease',
    description: 'Property rental terms and conditions',
    icon: '🏠'
  }
];

export default function InteractiveDemoSection() {
  const router = useRouter();
  const [selectedDoc, setSelectedDoc] = useState<DocumentCard | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = (doc: DocumentCard) => {
    setSelectedDoc(doc);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedDoc(null);
  };

  return (
    <section id="interactive-demo" className="py-20 px-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold font-serif text-gray-900 dark:text-white mb-4">
            See It In Action.
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Explore how our AI analyzes different types of legal documents
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {sampleDocuments.map((doc) => (
            <div
              key={doc.id}
              className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all cursor-pointer hover:border-yellow-600 dark:hover:border-yellow-500"
              onClick={() => openModal(doc)}
            >
              <div className="text-4xl mb-4">{doc.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{doc.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{doc.description}</p>
              <div className="inline-block bg-yellow-50 dark:bg-yellow-500/20 border border-yellow-600/30 dark:border-yellow-500/30 text-yellow-700 dark:text-yellow-500 text-sm font-medium px-3 py-1 rounded-full">
                {doc.type}
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => router.push('/demo')}
          >
            Try Full Demo with All Sample Documents
          </Button>
        </div>
        
        {/* Modal */}
        {isModalOpen && selectedDoc && (
          <div className="fixed inset-0 bg-gray-900/40 dark:bg-gray-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-colors">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl">{selectedDoc.icon}</span>
                    <div>
                      <h3 className="text-2xl font-bold font-serif text-gray-900 dark:text-white">{selectedDoc.title}</h3>
                      <p className="text-gray-600 dark:text-gray-400">{selectedDoc.type}</p>
                    </div>
                  </div>
                  <button
                    onClick={closeModal}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                {/* Locked Preview */}
                <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 mb-6 transition-colors">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-white dark:bg-gray-900 border border-yellow-600/30 dark:border-yellow-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-yellow-600 dark:text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Preview Locked</h4>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      This is a sample preview. Create your free account to analyze your own documents.
                    </p>
                  </div>
                  
                  {/* Mock Summary */}
                  <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <h5 className="font-semibold text-gray-900 dark:text-white mb-2">AI Analysis Summary</h5>
                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <p>• <span className="text-yellow-600 dark:text-yellow-500 font-medium">Confidentiality obligations</span> clearly defined</p>
                      <p>• <span className="text-yellow-600 dark:text-yellow-500 font-medium">Term duration</span> is reasonable (2 years)</p>
                      <p>• <span className="text-yellow-600 dark:text-yellow-500 font-medium">Remedies clause</span> provides adequate protection</p>
                    </div>
                  </div>
                </div>
                
                {/* CTA */}
                <div className="text-center space-y-4">
                  <Button 
                    variant="primary" 
                    size="lg"
                    className="w-full"
                    onClick={() => {
                      closeModal();
                      router.push('/demo');
                    }}
                  >
                    Try Full Demo with Sample Documents
                  </Button>
                  <div className="text-sm text-gray-500">
                    <p>Or</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="w-full"
                    onClick={() => {
                      closeModal();
                      router.push('/auth/register');
                    }}
                  >
                    Create Your Free Account to Analyze Your Own Documents
                  </Button>
                  <p className="text-sm text-gray-500 mt-3">
                    No credit card required • Start analyzing in minutes
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
