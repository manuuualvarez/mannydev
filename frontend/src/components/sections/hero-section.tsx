'use client';

import { useRef, useEffect, useState } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap-config';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

// Floating Orb Component
function GradientOrb({
  className,
  color,
  delay = 0,
}: {
  className?: string;
  color: 'blue' | 'purple' | 'cyan';
  delay?: number;
}) {
  const colorMap = {
    blue: 'from-blue-500/40 via-blue-400/30 to-blue-600/20',
    purple: 'from-indigo-500/30 via-purple-400/20 to-violet-500/25',
    cyan: 'from-cyan-400/30 via-sky-400/20 to-blue-400/25',
  };

  return (
    <div
      className={cn(
        'absolute rounded-full bg-gradient-to-br blur-3xl',
        colorMap[color],
        className
      )}
      style={{
        animationDelay: `${delay}ms`,
      }}
    />
  );
}

export function HeroSection() {
  const t = useTranslations('hero');
  const sectionRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subheadlineRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const orbsRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion || !isLoaded) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      // Animate orbs first (subtle scale in)
      if (orbsRef.current) {
        tl.fromTo(
          orbsRef.current.children,
          { scale: 0.8, opacity: 0 },
          { scale: 1, opacity: 1, duration: 1.5, stagger: 0.2 },
          0
        );
      }

      // Animate headline words with stagger
      const words = headlineRef.current?.querySelectorAll('.word');
      if (words) {
        tl.fromTo(
          words,
          { opacity: 0, y: 80, rotateX: -40 },
          {
            opacity: 1,
            y: 0,
            rotateX: 0,
            duration: 1,
            stagger: 0.08,
            ease: 'power3.out',
          },
          0.3
        );
      }

      // Animate subheadline
      tl.fromTo(
        subheadlineRef.current,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.8 },
        '-=0.4'
      );

      // Animate CTA with bounce
      tl.fromTo(
        ctaRef.current,
        { opacity: 0, y: 30, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'back.out(1.7)' },
        '-=0.3'
      );

      // Parallax on scroll
      if (orbsRef.current) {
        gsap.to(orbsRef.current.children, {
          y: -200,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: 1,
          },
        });
      }

      // Headline parallax + fade
      if (headlineRef.current) {
        gsap.to(headlineRef.current, {
          y: -80,
          opacity: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: '10% top',
            end: '60% top',
            scrub: 1,
          },
        });
      }

      // Subheadline parallax
      if (subheadlineRef.current) {
        gsap.to(subheadlineRef.current, {
          y: -120,
          opacity: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: '5% top',
            end: '50% top',
            scrub: 1,
          },
        });
      }

      // CTA parallax + scale
      if (ctaRef.current) {
        gsap.to(ctaRef.current, {
          y: -40,
          opacity: 0,
          scale: 0.9,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: '15% top',
            end: '55% top',
            scrub: 1,
          },
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [prefersReducedMotion, isLoaded]);

  const headline = t('headline');
  const highlightWords = t.raw('highlightWords') as string[];

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Animated Background */}
      <div className="absolute inset-0 animated-gradient" />

      {/* Gradient Orbs */}
      <div ref={orbsRef} className="absolute inset-0 overflow-hidden pointer-events-none">
        <GradientOrb
          color="blue"
          className="w-[600px] h-[600px] -top-32 -left-32 animate-float"
          delay={0}
        />
        <GradientOrb
          color="purple"
          className="w-[500px] h-[500px] top-1/4 right-0 animate-float-slow"
          delay={1000}
        />
        <GradientOrb
          color="cyan"
          className="w-[400px] h-[400px] bottom-0 left-1/4 animate-float"
          delay={2000}
        />
        <GradientOrb
          color="blue"
          className="w-[300px] h-[300px] bottom-1/4 right-1/4 animate-pulse-glow"
          delay={500}
        />
      </div>

      {/* Subtle grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Content */}
      <div className="container mx-auto px-6 text-center relative z-10 pt-20">
        {/* Badge */}
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card/60 backdrop-blur-sm border border-border/40 text-sm font-medium text-muted-foreground shadow-sm">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            {t('badge')}
          </span>
        </motion.div>

        {/* Headline */}
        <h1
          ref={headlineRef}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold leading-[1.1] tracking-tight mb-8"
          style={{ perspective: '1000px' }}
        >
          {headline.split(' ').map((word, i) => (
            <span
              key={i}
              className={cn(
                'word inline-block mr-3 md:mr-4 lg:mr-5',
                highlightWords.some(hw => word.toLowerCase().includes(hw.toLowerCase())) && 'gradient-text'
              )}
              style={{
                transformStyle: 'preserve-3d',
                opacity: prefersReducedMotion ? 1 : 0,
              }}
            >
              {word}
            </span>
          ))}
        </h1>

        {/* Subheadline */}
        <p
          ref={subheadlineRef}
          className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed"
          style={{ opacity: prefersReducedMotion ? 1 : 0 }}
        >
          {t.rich('subheadline', {
            mvps: (chunks) => <span className="text-foreground font-medium">{chunks}</span>,
            webApps: (chunks) => <span className="text-foreground font-medium">{chunks}</span>,
            automation: (chunks) => <span className="text-foreground font-medium">{chunks}</span>,
          })}
        </p>

        {/* CTA Buttons */}
        <div
          ref={ctaRef}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
          style={{ opacity: prefersReducedMotion ? 1 : 0 }}
        >
          <Link
            href="/contact"
            className={cn(
              'inline-flex items-center justify-center gap-2',
              'px-8 py-4 rounded-full',
              'bg-primary text-primary-foreground',
              'text-base font-semibold',
              'btn-premium',
              'shadow-lg shadow-primary/25',
              'min-w-[200px]'
            )}
          >
            {t('ctaPrimary')}
            <svg
              className="w-4 h-4 transition-transform group-hover:translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </Link>
          <Link
            href="/services"
            className={cn(
              'inline-flex items-center justify-center gap-2',
              'px-8 py-4 rounded-full',
              'bg-secondary/80 backdrop-blur-sm text-foreground',
              'text-base font-semibold',
              'border border-border/50',
              'hover:bg-secondary hover:shadow-lg',
              'transition-all duration-300',
              'min-w-[200px]'
            )}
          >
            {t('ctaSecondary')}
          </Link>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2"
          >
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5], scaleY: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              className="w-1 h-2 bg-muted-foreground/50 rounded-full"
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
