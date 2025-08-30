"use client";

import Button from '../../components/Button';
import { useRouter } from 'next/navigation';

export default function HeroSection() {
  const router = useRouter();
  return (
    <section id="hero" className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20 px-4 pt-36">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Content */}
          <div className="text-center lg:text-left">
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Demystifying the Law with AI.
            </h1>
            <p className="text-xl lg:text-2xl text-gray-600 mb-8 leading-relaxed">
              Upload a legal document and get a plain-English summary, key term explanations, and potential risks—in seconds.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button 
                variant="primary" 
                size="lg"
                className="w-full sm:w-auto"
                onClick={() => router.push('/auth/register')}
              >
                Get Started for Free
              </Button>
              <a 
                href="#video-demo" 
                className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 rounded-md shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors w-full sm:w-auto"
              >
                Watch Video Demo
              </a>
            </div>
          </div>
          
          {/* Right: Visual Placeholder */}
          <div className="flex justify-center lg:justify-end">
            <div className="w-full max-w-md h-80 bg-gradient-to-br from-blue-200 to-indigo-300 rounded-2xl shadow-2xl flex items-center justify-center">
              <div className="text-center text-blue-800">
                <div className="text-6xl mb-4">📄⚖️</div>
                <p className="text-lg font-medium">Legal AI Assistant</p>
                <p className="text-sm opacity-75">Visual coming soon</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
