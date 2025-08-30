const blogPosts = [
  {
    id: 1,
    title: "5 Clauses to Never Ignore in a Freelancer Contract",
    excerpt: "Discover the critical contract terms that can make or break your freelance business and how to spot potential red flags.",
    date: "2024-01-15",
    readTime: "5 min read",
    category: "Contract Law"
  },
  {
    id: 2,
    title: "How NLP is Making the Law Accessible to All",
    excerpt: "Explore how Natural Language Processing is revolutionizing legal document analysis and democratizing access to legal knowledge.",
    date: "2024-01-10",
    readTime: "6 min read",
    category: "AI & Technology"
  },
  {
    id: 3,
    title: "Case Study: Analyzing a Standard NDA with AI",
    excerpt: "A real-world example of how our AI breaks down complex non-disclosure agreements into understandable insights.",
    date: "2024-01-05",
    readTime: "7 min read",
    category: "Case Studies"
  }
];

export default function BlogPreviewSection() {
  return (
    <section id="blog" className="py-20 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Legal Insights & AI Trends
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Stay informed with the latest developments in legal technology and AI-powered document analysis
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {blogPosts.map((post) => (
            <article key={post.id} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="mb-4">
                <span className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                  {post.category}
                </span>
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3 leading-tight">
                {post.title}
              </h3>
              
              <p className="text-gray-600 mb-4 leading-relaxed">
                {post.excerpt}
              </p>
              
              <div className="flex items-center justify-between text-sm text-gray-500">
                <time dateTime={post.date}>
                  {new Date(post.date).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </time>
                <span>{post.readTime}</span>
              </div>
            </article>
          ))}
        </div>
        
        <div className="text-center">
          <a
            href="/blog"
            className="inline-flex items-center justify-center px-8 py-3 border border-gray-300 rounded-md shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            View All Articles
            <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
