"use client";

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import Button from '../../components/Button';
import heroSlides from '../../data/heroSlides.json';

export default function HeroSection() {
  const router = useRouter();
  const slides = useMemo(() => heroSlides, []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 3000);

    return () => clearInterval(timer);
  }, [slides.length]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  return (
    <section
      id="hero"
      className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-indigo-50 py-20 px-4 pt-36"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(79,70,229,0.08),transparent_25%),radial-gradient(circle_at_80%_10%,rgba(14,165,233,0.08),transparent_25%)]" />
      <div className="max-w-7xl mx-auto relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Content */}
          <div className="text-center lg:text-left space-y-6">
            <div
              className={`transition-all duration-700 ease-out ${
                isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
            >
              <p className="inline-flex items-center gap-2 rounded-full bg-indigo-100 px-4 py-2 text-sm font-semibold text-indigo-700">
                ✨ Trusted AI for legal teams
              </p>
            </div>
            <h1
              className={`text-5xl lg:text-6xl font-bold text-gray-900 leading-tight transition-all duration-700 ease-out delay-100 ${
                isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
            >
              Demystifying the Law with AI.
            </h1>
            <p
              className={`text-xl lg:text-2xl text-gray-600 leading-relaxed transition-all duration-700 ease-out delay-200 ${
                isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
            >
              Upload a legal document and get a plain-English summary, key term explanations,
              and potential risks—in seconds.
            </p>
            <div
              className={`flex flex-col sm:flex-row gap-4 justify-center lg:justify-start transition-all duration-700 ease-out delay-300 ${
                isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
            >
              <Button
                variant="primary"
                size="lg"
                className="w-full sm:w-auto shadow-lg shadow-indigo-200"
                onClick={() => router.push('/auth/register')}
              >
                Get Started for Free
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto"
                onClick={() => router.push('/demo')}
              >
                Try Live Demo
              </Button>
            </div>
          </div>

          {/* Right: Carousel */}
          <div className="relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-xl overflow-hidden rounded-3xl bg-white/60 shadow-2xl backdrop-blur-sm border border-white/50">
              <div className="relative h-[420px]">
                {slides.map((slide, index) => {
                  const isActive = index === currentIndex;
                  return (
                    <div
                      key={slide.src}
                      className={`absolute inset-0 transition-all duration-700 ease-out ${
                        isActive
                          ? 'opacity-100 translate-x-0 scale-100'
                          : 'opacity-0 translate-x-6 scale-95 pointer-events-none'
                      }`}
                    >
                      <Image
                        src={slide.src}
                        alt={slide.title}
                        fill
                        className="object-contain"
                        priority={isActive}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-slate-900/20 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-6 text-white space-y-2">
                        <p className="text-sm uppercase tracking-wide opacity-80">Legal AI</p>
                        <p className="text-2xl font-semibold">{slide.title}</p>
                        <p className="text-sm text-slate-100/80">{slide.subtitle}</p>
                      </div>
                      <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                        {slide.tags.map((tag) => (
                          <span
                            key={`${slide.src}-${tag}`}
                            className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-slate-800 shadow-md backdrop-blur"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              <>
                <button
                  aria-label="Previous slide"
                  onClick={handlePrev}
                  className="absolute left-4 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-transparent text-white/80 hover:bg-indigo-600 hover:text-white transition-all duration-200 z-10"
                >
                  ←
                </button>
                <button
                  aria-label="Next slide"
                  onClick={handleNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-transparent text-white/80 hover:bg-indigo-600 hover:text-white transition-all duration-200 z-10"
                >
                  →
                </button>
              </>

              <div className="absolute left-1/2 top-4 flex -translate-x-1/2 items-center gap-2">
                {slides.map((_, index) => (
                  <span
                    key={index}
                    className={`h-1.5 w-8 rounded-full transition-all ${
                      index === currentIndex ? 'bg-indigo-600' : 'bg-slate-200'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
