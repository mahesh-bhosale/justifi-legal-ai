import { FileText, UserCheck, Search, Shield, FileSearch, ArrowRight } from 'lucide-react';
import VideoPlayer from './VideoPlayer';

export default function VideoDemoSection() {
  return (
    <section id="video-demo" className="py-20 px-4 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            See How JustiFi AI Works in Real Life <span className="text-blue-600">— in Under 2 Minutes</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Watch an end-to-end demo of how citizens and lawyers use JustiFi AI to simplify legal work — from summarizing documents to predicting case outcomes and connecting with legal experts.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Video Player */}
          <VideoPlayer />
          
          {/* Right: Feature Highlights */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-900 flex items-center">
              <span className="mr-2">✨</span> Key Features
            </h3>
            
            <div className="space-y-5">
              <div className="flex items-start space-x-4 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <FileSearch className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">AI Legal Document Summarizer</h4>
                  <p className="text-gray-600 text-sm">Upload a PDF or text → get short/medium/detailed summaries → export PDF.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <UserCheck className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Case Creation for Citizens</h4>
                  <p className="text-gray-600 text-sm">Citizens submit legal issues with documents and track their case.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Search className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Lawyer Match & Proposals</h4>
                  <p className="text-gray-600 text-sm">Lawyers view all posted cases and express interest.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="flex-shrink-0 w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Lawyer Dashboard + AI Tools</h4>
                  <p className="text-gray-600 text-sm">Lawyers view summaries → generate predictions → add private notes.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="flex-shrink-0 w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Role-Based Secure Platform</h4>
                  <p className="text-gray-600 text-sm">Separate flows for Citizen, Lawyer, and Admin with protected routing.</p>
                </div>
              </div>
            </div>
            
            <div className="pt-4">
              <a 
                href="#get-started" 
                className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium group"
              >
                Get started with JustiFi AI today
                <ArrowRight className="ml-2 w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
