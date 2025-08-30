import LandingNavbar from './Navbar';
import HeroSection from './HeroSection';
import VideoDemoSection from './VideoDemoSection';
import HowItWorksSection from './HowItWorksSection';
import InteractiveDemoSection from './InteractiveDemoSection';
import BlogPreviewSection from './BlogPreviewSection';
import Footer from './Footer';

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <LandingNavbar />
      <HeroSection />
      <VideoDemoSection />
      <HowItWorksSection />
      <InteractiveDemoSection />
      <BlogPreviewSection />
      <Footer />
    </div>
  );
}
