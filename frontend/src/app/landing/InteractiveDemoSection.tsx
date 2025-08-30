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
    <section id="interactive-demo" className="py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            See It In Action.
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Explore how our AI analyzes different types of legal documents
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {sampleDocuments.map((doc) => (
            <div
              key={doc.id}
              className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all cursor-pointer hover:border-blue-300"
              onClick={() => openModal(doc)}
            >
              <div className="text-4xl mb-4">{doc.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{doc.title}</h3>
              <p className="text-gray-600 mb-4">{doc.description}</p>
              <div className="inline-block bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                {doc.type}
              </div>
            </div>
          ))}
        </div>
        
        {/* Modal */}
        {isModalOpen && selectedDoc && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl">{selectedDoc.icon}</span>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{selectedDoc.title}</h3>
                      <p className="text-gray-600">{selectedDoc.type}</p>
                    </div>
                  </div>
                  <button
                    onClick={closeModal}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                {/* Locked Preview */}
                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Preview Locked</h4>
                    <p className="text-gray-600 mb-4">
                      This is a sample preview. Create your free account to analyze your own documents.
                    </p>
                  </div>
                  
                  {/* Mock Summary */}
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <h5 className="font-semibold text-gray-900 mb-2">AI Analysis Summary</h5>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p>• <span className="bg-yellow-200 px-1 rounded">Confidentiality obligations</span> clearly defined</p>
                      <p>• <span className="bg-yellow-200 px-1 rounded">Term duration</span> is reasonable (2 years)</p>
                      <p>• <span className="bg-yellow-200 px-1 rounded">Remedies clause</span> provides adequate protection</p>
                    </div>
                  </div>
                </div>
                
                {/* CTA */}
                <div className="text-center">
                  <Button 
                    variant="primary" 
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
