'use client';

import { useRef, useEffect } from 'react';
import { gsap } from '@/lib/gsap-config';
import { motion, useInView } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useServices, Service } from '@/hooks/use-services';
import { ServiceCard } from './service-card';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

function ServicesSkeleton() {
  return (
    <div
      data-testid="services-loading"
      className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
    >
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="bg-card rounded-2xl p-8 shadow-premium border border-border/50 animate-pulse"
        >
          <div className="w-16 h-16 bg-muted rounded-2xl mb-6" />
          <div className="h-6 bg-muted rounded-lg w-3/4 mb-3" />
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded w-full" />
            <div className="h-4 bg-muted rounded w-5/6" />
            <div className="h-4 bg-muted rounded w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ServicesSection() {
  const t = useTranslations('services');
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(headingRef, { once: true, margin: '-100px' });
  const { data, loading, error } = useServices();
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion || loading || !data?.services?.length) return;

    const ctx = gsap.context(() => {
      const cards = cardsContainerRef.current?.querySelectorAll('.service-card');
      if (!cards || cards.length === 0) return;

      // Only pin on desktop
      const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 1024;

      if (isDesktop) {
        // Set initial state
        gsap.set(cards, {
          opacity: 0,
          y: 100,
          rotateX: -15,
          transformPerspective: 1000,
        });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top top',
            end: `+=${cards.length * 300}`,
            pin: true,
            scrub: 1,
            anticipatePin: 1,
          },
        });

        // Heading reveal
        tl.fromTo(
          headingRef.current,
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, duration: 0.3 }
        );

        // Stagger cards
        tl.to(cards, {
          opacity: 1,
          y: 0,
          rotateX: 0,
          stagger: 0.15,
          duration: 0.5,
          ease: 'power3.out',
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [prefersReducedMotion, loading, data]);

  if (error) return null;

  return (
    <section
      id="services"
      ref={sectionRef}
      className="relative py-32 overflow-hidden"
    >
      {/* Subtle background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/30 to-background" />

      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div ref={headingRef} className="text-center max-w-3xl mx-auto mb-20">
          <motion.span
            initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="inline-block text-sm font-semibold text-primary uppercase tracking-wider mb-4"
          >
            {t('label')}
          </motion.span>

          <motion.h2
            initial={prefersReducedMotion ? false : { opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6"
          >
            {t.rich('title', {
              highlight: (chunks) => <span className="gradient-text">{chunks}</span>,
            })}
          </motion.h2>

          <motion.p
            initial={prefersReducedMotion ? false : { opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-muted-foreground leading-relaxed"
          >
            {t('description')}
          </motion.p>
        </div>

        {/* Services Grid */}
        {loading ? (
          <ServicesSkeleton />
        ) : (
          <div ref={cardsContainerRef} className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {data?.services.map((service: Service, index: number) => (
              <div key={service.id} className="service-card">
                <ServiceCard
                  service={service}
                  index={index}
                />
              </div>
            ))}
          </div>
        )}

        {/* CTA at bottom */}
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-16"
        >
          <p className="text-muted-foreground mb-6">
            {t('notSure')}
          </p>
          <a
            href="#contact"
            className={cn(
              'inline-flex items-center gap-2',
              'text-primary font-medium',
              'hover:gap-3 transition-all duration-300'
            )}
          >
            {t('discuss')}
            <svg
              className="w-4 h-4"
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
          </a>
        </motion.div>
      </div>
    </section>
  );
}
