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
  content: string;
  highlightedClauses: Array<{
    text: string;
    type: 'risk' | 'benefit' | 'neutral';
    explanation: string;
  }>;
  summary: string;
  riskFlags: Array<{
    level: 'high' | 'medium' | 'low';
    description: string;
    impact: string;
  }>;
}

const sampleDocuments: DocumentCard[] = [
  {
    id: 'nda',
    title: 'Non-Disclosure Agreement',
    type: 'NDA',
    description: 'Standard confidentiality agreement with common clauses',
    icon: '🔒',
    content: `NON-DISCLOSURE AGREEMENT

This Non-Disclosure Agreement (the "Agreement") is entered into as of [Date] by and between [Company Name] ("Disclosing Party") and [Recipient Name] ("Receiving Party").

1. CONFIDENTIAL INFORMATION
The Receiving Party acknowledges that it may receive confidential and proprietary information from the Disclosing Party, including but not limited to business plans, customer lists, technical specifications, and trade secrets.

2. NON-DISCLOSURE OBLIGATIONS
The Receiving Party agrees to:
- Maintain the confidentiality of all Confidential Information
- Use the Confidential Information solely for the purpose of [Purpose]
- Not disclose the Confidential Information to any third party without prior written consent
- Return or destroy all Confidential Information upon termination

3. TERM AND TERMINATION
This Agreement shall remain in effect for a period of two (2) years from the date of disclosure. The confidentiality obligations shall survive termination for an additional three (3) years.

4. REMEDIES
The Receiving Party acknowledges that monetary damages may not be sufficient to remedy a breach of this Agreement and that the Disclosing Party may seek injunctive relief.`,
    highlightedClauses: [
      {
        text: 'two (2) years',
        type: 'benefit',
        explanation: 'Reasonable term duration that balances protection with practicality'
      },
      {
        text: 'three (3) years',
        type: 'risk',
        explanation: 'Extended confidentiality period may be overly restrictive'
      },
      {
        text: 'injunctive relief',
        type: 'neutral',
        explanation: 'Standard legal remedy for confidentiality breaches'
      },
      {
        text: 'any third party',
        type: 'risk',
        explanation: 'Broad restriction that may limit business operations'
      }
    ],
    summary: 'This NDA establishes a 2-year confidentiality period with 3-year survival clause. It includes standard non-disclosure obligations and injunctive relief remedies. The agreement is comprehensive but may be overly restrictive in some areas.',
    riskFlags: [
      {
        level: 'medium',
        description: 'Extended confidentiality period',
        impact: 'May limit future business opportunities'
      },
      {
        level: 'low',
        description: 'Broad third-party restriction',
        impact: 'Could affect normal business operations'
      },
      {
        level: 'low',
        description: 'Injunctive relief clause',
        impact: 'Standard protection mechanism'
      }
    ]
  },
  {
    id: 'license',
    title: 'Software License Agreement',
    type: 'License',
    description: 'End-user license agreement for software products',
    icon: '💻',
    content: `SOFTWARE LICENSE AGREEMENT

This Software License Agreement (the "Agreement") is entered into between [Software Company] ("Licensor") and [User/Company] ("Licensee").

1. GRANT OF LICENSE
Subject to the terms of this Agreement, Licensor grants Licensee a non-exclusive, non-transferable license to use the Software solely for Licensee's internal business purposes.

2. RESTRICTIONS
Licensee shall not:
- Copy, modify, or create derivative works of the Software
- Reverse engineer, decompile, or disassemble the Software
- Remove or alter any proprietary notices
- Transfer, sublicense, or assign the license without written consent

3. TERM AND TERMINATION
This license is effective until terminated. Either party may terminate this Agreement upon 30 days written notice. Upon termination, Licensee must cease all use of the Software and destroy all copies.

4. WARRANTY DISCLAIMER
THE SOFTWARE IS PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND. LICENSOR DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED.

5. LIMITATION OF LIABILITY
IN NO EVENT SHALL LICENSOR BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, OR CONSEQUENTIAL DAMAGES.`,
    highlightedClauses: [
      {
        text: 'non-exclusive, non-transferable',
        type: 'neutral',
        explanation: 'Standard license restrictions'
      },
      {
        text: '30 days written notice',
        type: 'benefit',
        explanation: 'Reasonable termination period'
      },
      {
        text: 'AS IS',
        type: 'risk',
        explanation: 'No warranty protection for the user'
      },
      {
        text: 'INDIRECT, INCIDENTAL, SPECIAL, OR CONSEQUENTIAL DAMAGES',
        type: 'risk',
        explanation: 'Broad limitation of liability'
      }
    ],
    summary: 'This software license provides non-exclusive rights with standard restrictions. It includes a 30-day termination notice and broad warranty disclaimers. The liability limitations are extensive and may leave users without adequate protection.',
    riskFlags: [
      {
        level: 'high',
        description: 'No warranty protection',
        impact: 'User assumes all risk for software defects'
      },
      {
        level: 'high',
        description: 'Broad liability limitation',
        impact: 'Limited recourse for damages or losses'
      },
      {
        level: 'medium',
        description: 'Non-transferable license',
        impact: 'Cannot resell or transfer software rights'
      }
    ]
  },
  {
    id: 'rental',
    title: 'Rental Agreement Clause',
    type: 'Lease',
    description: 'Property rental terms and conditions',
    icon: '🏠',
    content: `RESIDENTIAL RENTAL AGREEMENT

This Residential Rental Agreement (the "Agreement") is made between [Landlord Name] ("Landlord") and [Tenant Name] ("Tenant") for the property located at [Address].

1. TERM AND RENT
The term of this lease is twelve (12) months beginning [Start Date]. Monthly rent is $[Amount] due on the 1st of each month. Late fees of $50 will be charged for payments received after the 5th of the month.

2. SECURITY DEPOSIT
Tenant shall pay a security deposit of $[Amount] upon signing this Agreement. The deposit will be returned within 30 days of lease termination, less any deductions for damages or unpaid rent.

3. UTILITIES AND MAINTENANCE
Tenant is responsible for all utilities including electricity, gas, water, and internet. Landlord is responsible for major repairs and structural maintenance. Tenant must report maintenance issues within 24 hours.

4. PET POLICY
No pets are allowed without written permission from Landlord. Pet deposits of $500 per pet may be required.

5. TERMINATION
Either party may terminate this Agreement with 60 days written notice. Early termination by Tenant requires payment of two months' rent as penalty.`,
    highlightedClauses: [
      {
        text: 'twelve (12) months',
        type: 'neutral',
        explanation: 'Standard lease term'
      },
      {
        text: '$50',
        type: 'risk',
        explanation: 'Late fee may be excessive for minor delays'
      },
      {
        text: '30 days',
        type: 'benefit',
        explanation: 'Reasonable timeframe for deposit return'
      },
      {
        text: '60 days written notice',
        type: 'benefit',
        explanation: 'Adequate notice period for both parties'
      },
      {
        text: 'two months\' rent as penalty',
        type: 'risk',
        explanation: 'High penalty for early termination'
      }
    ],
    summary: 'This rental agreement has a 12-month term with $50 late fees and 60-day termination notice. It includes standard utility responsibilities and a high early termination penalty. The pet policy is restrictive with significant deposits.',
    riskFlags: [
      {
        level: 'medium',
        description: 'High late fee',
        impact: '$50 penalty for payments after 5th day'
      },
      {
        level: 'high',
        description: 'Early termination penalty',
        impact: 'Two months rent penalty for breaking lease'
      },
      {
        level: 'medium',
        description: 'Restrictive pet policy',
        impact: '$500 deposit per pet required'
      }
    ]
  }
];

export default function DemoPage() {
  const router = useRouter();
  const [selectedDoc, setSelectedDoc] = useState<DocumentCard | null>(null);

  const getClauseColor = (type: string) => {
    switch (type) {
      case 'risk':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'benefit':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'neutral':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Try a Live Demo (No Sign-in)
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience how our AI analyzes legal documents with these sample agreements
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {!selectedDoc ? (
          /* Document Selection */
          <div>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Choose a Sample Document
              </h2>
              <p className="text-lg text-gray-600">
                Click on any document below to see our AI analysis in action
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {sampleDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-white border-2 border-gray-200 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all cursor-pointer hover:border-blue-300"
                  onClick={() => setSelectedDoc(doc)}
                >
                  <div className="text-5xl mb-6 text-center">{doc.icon}</div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-3 text-center">{doc.title}</h3>
                  <p className="text-gray-600 mb-6 text-center">{doc.description}</p>
                  <div className="inline-block bg-blue-100 text-blue-800 text-sm font-medium px-4 py-2 rounded-full mx-auto block text-center">
                    {doc.type}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Document Analysis View */
          <div className="space-y-8">
            {/* Back Button */}
            <button
              onClick={() => setSelectedDoc(null)}
              className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Document Selection
            </button>

            {/* Document Header */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="flex items-center space-x-4 mb-6">
                <span className="text-4xl">{selectedDoc.icon}</span>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">{selectedDoc.title}</h2>
                  <p className="text-gray-600">{selectedDoc.type} Document</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Document Content */}
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Document Content</h3>
                <div className="bg-gray-50 rounded-lg p-6 max-h-96 overflow-y-auto">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                    {selectedDoc.content}
                  </pre>
                </div>
              </div>

              {/* AI Analysis */}
              <div className="space-y-6">
                {/* Plain-English Summary */}
                <div className="bg-white rounded-2xl p-8 shadow-lg">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Plain-English Summary</h3>
                  <p className="text-gray-700 leading-relaxed">{selectedDoc.summary}</p>
                </div>

                {/* Highlighted Clauses */}
                <div className="bg-white rounded-2xl p-8 shadow-lg">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Key Clauses Analysis</h3>
                  <div className="space-y-4">
                    {selectedDoc.highlightedClauses.map((clause, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <span className={`inline-block px-2 py-1 text-xs font-medium rounded border ${getClauseColor(clause.type)}`}>
                            {clause.type.toUpperCase()}
                          </span>
                          <div className="flex-1">
                            <p className="text-sm text-gray-900 mb-1">
                              <span className="font-semibold">&quot;{clause.text}&quot;</span>
                            </p>
                            <p className="text-sm text-gray-600">{clause.explanation}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Risk Flags */}
                <div className="bg-white rounded-2xl p-8 shadow-lg">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Risk Assessment</h3>
                  <div className="space-y-3">
                    {selectedDoc.riskFlags.map((risk, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                        <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${getRiskLevelColor(risk.level)}`}>
                          {risk.level.toUpperCase()}
                        </span>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{risk.description}</p>
                          <p className="text-sm text-gray-600">{risk.impact}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* CTA Section */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-center text-white">
              <h3 className="text-2xl font-bold mb-4">
                Ready to Analyze Your Own Documents?
              </h3>
              <p className="text-lg mb-6 opacity-90">
                Create your free account to upload and analyze your legal documents with the same AI-powered insights.
              </p>
              <Button 
                variant="secondary" 
                size="lg"
                className="bg-white text-blue-600 hover:bg-gray-100"
                onClick={() => router.push('/auth/register')}
              >
                Create Your Free Account to Analyze Your Own Documents
              </Button>
              <p className="text-sm opacity-75 mt-3">
                No credit card required • Start analyzing in minutes
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
