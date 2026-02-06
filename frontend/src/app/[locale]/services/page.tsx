'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { useServices, Service } from '@/hooks/use-services';
import { ServiceCard } from '@/components/sections/service-card';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

function ServicesPageSkeleton() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      {[1, 2, 3, 4, 5, 6].map((i) => (
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

export default function ServicesPage() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(headingRef, { once: true, margin: '-100px' });
  const { data, loading, error } = useServices();
  const prefersReducedMotion = useReducedMotion();
  const t = useTranslations('servicesPage');

  return (
    <>
      <Header />
      <main className="relative z-10 pt-24">
        {/* Hero Section */}
        <section ref={sectionRef} className="relative py-20 overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />

          {/* Decorative orbs */}
          <div className="absolute top-0 -left-32 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 -right-32 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />

          <div className="container mx-auto px-6 relative z-10">
            {/* Section Header */}
            <div ref={headingRef} className="text-center max-w-3xl mx-auto mb-16">
              <motion.span
                initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6 }}
                className="inline-block text-sm font-semibold text-primary uppercase tracking-wider mb-4"
              >
                {t('label')}
              </motion.span>

              <motion.h1
                initial={prefersReducedMotion ? false : { opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6"
              >
                {t.rich('title', {
                  highlight: (chunks) => <span className="gradient-text">{chunks}</span>,
                })}
              </motion.h1>

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
              <ServicesPageSkeleton />
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">{t('errorLoading')}</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {data?.services.map((service: Service, index: number) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    index={index}
                  />
                ))}
              </div>
            )}

            {/* CTA Section */}
            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-center mt-20"
            >
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                {t('ctaTitle')}
              </h2>
              <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                {t('ctaDescription')}
              </p>
              <Link
                href="/contact"
                className={cn(
                  'inline-flex items-center justify-center gap-2',
                  'px-8 py-4 rounded-full',
                  'bg-primary text-primary-foreground',
                  'text-base font-semibold',
                  'btn-premium',
                  'shadow-lg shadow-primary/25'
                )}
              >
                {t('ctaButton')}
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
              </Link>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
