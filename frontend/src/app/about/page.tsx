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
    <div className="min-h-screen bg-transparent transition-colors duration-500 pb-20">
      {/* Institutional Hero Section */}
      <section className="relative pt-32 pb-24 overflow-hidden border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-amber-500/5 dark:bg-amber-500/5 rounded-bl-[10rem] pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="border-l-8 border-amber-600 pl-10">
            <h1 className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white tracking-tighter leading-none mb-8">
              The Future of <br/>
              <span className="text-amber-600 dark:text-amber-500 underline decoration-amber-500/30 underline-offset-8">Legal Intelligence</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-500 dark:text-gray-400 max-w-2xl font-serif italic leading-relaxed">
              &ldquo;Architecting neural systems that resolve the complexity of global legal frameworks into actionable human wisdom.&rdquo;
            </p>
          </div>
        </div>
      </section>

      {/* Corporate Mission & Vision */}
      <section className="py-24 px-4 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div className="bg-white dark:bg-gray-950 p-12 rounded-[3rem] shadow-xl border border-gray-100 dark:border-gray-800 transition-all hover:shadow-amber-900/5">
              <div className="bg-amber-100 dark:bg-amber-900/30 w-16 h-16 rounded-2xl flex items-center justify-center mb-8">
                <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-6 uppercase tracking-tight">The Mission</h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-6 leading-relaxed font-medium">
                To democratize administrative justice through ethical AI intervention. We synthesize complex legal statutes 
                into precise, understandable formats, ensuring every citizen and professional operates with institutional-grade clarity.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-950 p-12 rounded-[3rem] shadow-xl border border-gray-100 dark:border-gray-800 transition-all hover:shadow-amber-900/5">
              <div className="bg-amber-100 dark:bg-amber-900/30 w-16 h-16 rounded-2xl flex items-center justify-center mb-8">
                <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-6 uppercase tracking-tight">The Vision</h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-6 leading-relaxed font-medium">
                A globally unified legal ecosystem where Justifi acts as the cognitive layer for justice. 
                Our vision is a future where AI transparency eliminates the procedural friction that separates 
                rights from their realization.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Strategic Roadmap */}
      <section className="py-24 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20 space-y-4">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight uppercase">Strategic Trajectory</h2>
            <div className="w-24 h-1.5 bg-amber-600 mx-auto rounded-full"></div>
            <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto font-bold uppercase tracking-widest text-xs">Phased deployment of institutional capabilities</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {roadmapItems.map((item, index) => (
              <div key={index} className="relative group p-8 rounded-[2rem] bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 transition-all hover:bg-white dark:hover:bg-gray-950 hover:shadow-2xl hover:shadow-amber-600/10 hover:-translate-y-2">
                <div className="mb-6 flex justify-between items-center">
                  <span className="text-amber-600 dark:text-amber-500 font-black text-4xl opacity-20">{item.quarter}</span>
                  <span className="text-gray-400 dark:text-gray-600 font-black text-xs tracking-widest">{item.year}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-amber-600 transition-colors uppercase tracking-tight">{item.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed font-medium">{item.description}</p>
                <div className="mt-8 w-full h-1 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-600 w-1/4 group-hover:w-full transition-all duration-1000"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Leadership */}
      <section className="py-24 px-4 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-4">Core Leadership</h2>
            <p className="text-amber-600 dark:text-amber-500 font-black tracking-[0.4em] uppercase text-[10px]">Architects of the Cognitive Protocol</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {teamMembers.map((member, index) => (
              <div key={index} className="group relative">
                <div className="absolute inset-0 bg-amber-600/10 dark:bg-amber-600/5 rounded-[2.5rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative bg-white dark:bg-gray-950 rounded-[2.5rem] p-8 text-center border border-gray-100 dark:border-gray-800 transition-all group-hover:border-amber-500/50 group-hover:shadow-2xl">
                  <div className="w-24 h-24 bg-gradient-to-br from-amber-500 to-amber-700 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-xl rotate-3 group-hover:rotate-0 transition-transform">
                    <span className="text-5xl drop-shadow-lg scale-110">{member.photo}</span>
                  </div>
                  <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2 tracking-tight group-hover:text-amber-600 transition-colors">{member.name}</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-xs font-black uppercase tracking-widest leading-loose">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technological Infrastructure */}
      <section className="py-24 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-sm font-black text-amber-600 uppercase tracking-[0.5em] mb-4">Technological Infrastructure</h2>
            <p className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Forged with Industry Standards</p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6">
            {techStack.map((tech, index) => (
              <div key={index} className="bg-gray-50 dark:bg-gray-900 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 flex flex-col items-center gap-4 transition-all hover:bg-amber-600 hover:scale-110 hover:-rotate-3 group shadow-lg">
                <span className="text-4xl group-hover:scale-125 transition-transform duration-500">{tech.logo}</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-white transition-colors">{tech.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}