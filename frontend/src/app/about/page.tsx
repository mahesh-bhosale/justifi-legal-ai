// import LandingNavbar from '../landing/Navbar';

export default function AboutPage() {
    const roadmapItems = [
        {
          year: '2025',
          quarter: 'Q3',
          title: 'Beta Launch',
          description: 'MVP website with AI-powered legal document summarization, user roles (lawyer/citizen), and dashboard with upload and history features.'
        },
        {
          year: '2025',
          quarter: 'Q4',
          title: 'Multi-language Support',
          description: 'Add translation and summarization in Spanish, French, German, and Hindi with improved frontend controls for summary customization.'
        },
        {
          year: '2026',
          quarter: 'Q1',
          title: 'Advanced Features',
          description: 'Introduce named entity extraction (judges, parties, case type), improved timeline summaries, and performance optimizations with caching.'
        },
        {
          year: '2026',
          quarter: 'Q2',
          title: 'Enterprise Features',
          description: 'Add collaboration tools with multi-user workspaces, role management, analytics dashboard, and secure cloud deployment with monitoring.'
        }
      ];
      
  const teamMembers = [
    {
      name: 'Mausam Yadav',
      role: 'Team Lead (Project & Coordination)',
      photo: '👨‍💼'
    },
    {
      name: 'Mahesh Bhosale',
      role: 'Project Lead (Full-Stack & AI Oversight)',
      photo: '👨‍💻'
    },
    {
      name: 'Vikas Maurya',
      role: 'AI/ML Engineer (Model Development)',
      photo: '🤖'
    },
    {
      name: 'Intaza Chaudhary',
      role: 'Co-Lead (AI Models & Finance)',
      photo: '👨‍🔬'
    }
  ];
  
  const techStack = [
    { name: 'Python', logo: '🐍' },
    { name: 'FastAPI', logo: '⚡' },
    { name: 'Node.js', logo: '🟢' },
    { name: 'Next.js', logo: '⚛️' },
    { name: 'PostgreSQL', logo: '🐘' },
    { name: 'AWS', logo: '☁️' }
  ];

  return (
    <div className="min-h-screen">
      {/* <LandingNavbar /> */}
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              About Justifi Legal AI
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Transforming legal document analysis through the power of artificial intelligence
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                To democratize access to legal knowledge by making complex legal documents 
                understandable for everyone through AI-powered analysis and plain-English explanations.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                We believe that legal understanding shouldn&apos;t be limited to those who can afford 
                expensive legal counsel or have years of legal training.
              </p>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Vision</h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                A world where legal documents are accessible, understandable, and actionable 
                for individuals and businesses of all sizes.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                We envision a future where AI bridges the gap between complex legal language 
                and everyday understanding, empowering people to make informed decisions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Story</h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto">
              Born from frustration with inaccessible legal language and a passion for AI innovation
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <p className="text-lg text-gray-600 leading-relaxed mb-6">
                Justifi Legal AI was founded in 2024 when our team experienced firsthand the 
                challenges of understanding complex legal documents. After spending countless hours 
                trying to decipher contracts, NDAs, and legal agreements, we realized there had 
                to be a better way.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed mb-6">
                Our founders, coming from backgrounds in AI, legal technology, and software 
                development, came together with a shared vision: to leverage the power of 
                artificial intelligence to make legal documents accessible to everyone.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                What started as a personal frustration has grown into a mission to transform 
                how people interact with legal documents, making the law more accessible, 
                understandable, and actionable for all.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Roadmap Timeline */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Product Roadmap</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our journey to revolutionize legal document analysis
            </p>
          </div>
          
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-1/2 transform -translate-x-px h-full w-0.5 bg-blue-200"></div>
            
            <div className="space-y-12">
              {roadmapItems.map((item, index) => (
                <div key={index} className={`relative flex items-center ${
                  index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'
                }`}>
                  {/* Timeline dot */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-blue-600 rounded-full border-4 border-white shadow-lg"></div>
                  
                  {/* Content */}
                  <div className={`w-5/12 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8 text-left'}`}>
                    <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
                      <div className="flex items-center justify-center mb-2">
                        <span className="inline-block bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full">
                          {item.year} {item.quarter}
                        </span>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                      <p className="text-gray-600">{item.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Grid */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Team</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The passionate minds behind Justifi Legal AI
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-lg text-center hover:shadow-xl transition-shadow">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">{member.photo}</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{member.name}</h3>
                <p className="text-gray-600">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Built With */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Built With</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Cutting-edge technologies powering our platform
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            {techStack.map((tech, index) => (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-100 transition-colors">
                  <span className="text-3xl">{tech.logo}</span>
                </div>
                <h3 className="text-sm font-medium text-gray-900">{tech.name}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}