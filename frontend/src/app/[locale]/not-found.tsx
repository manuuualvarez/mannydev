'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { cn } from '@/lib/utils';

export default function NotFound() {
  const t = useTranslations('notFound');
  const prefersReducedMotion = useReducedMotion();

  return (
    <>
      <Header />
      <main className="pt-24">
        <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />

          {/* Decorative orbs */}
          <div className="absolute top-0 -left-32 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 -right-32 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />

          <div className="container mx-auto px-6 relative z-10 text-center">
            {/* 404 Number */}
            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
              className="mb-8"
            >
              <span className="text-[120px] md:text-[180px] lg:text-[220px] font-bold leading-none gradient-text select-none">
                404
              </span>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={prefersReducedMotion ? false : { opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4"
            >
              {t('title')}
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="text-lg text-muted-foreground max-w-md mx-auto mb-10"
            >
              {t('description')}
            </motion.p>

            {/* Actions */}
            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link
                href="/"
                className={cn(
                  'inline-flex items-center justify-center gap-2',
                  'px-8 py-4 rounded-full',
                  'bg-primary text-primary-foreground',
                  'text-base font-semibold',
                  'btn-premium',
                  'shadow-lg shadow-primary/25'
                )}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                {t('backHome')}
              </Link>

              <Link
                href="/contact"
                className={cn(
                  'inline-flex items-center justify-center gap-2',
                  'px-8 py-4 rounded-full',
                  'border border-border/50',
                  'text-base font-semibold',
                  'hover:bg-muted',
                  'transition-colors duration-200'
                )}
              >
                {t('contactUs')}
              </Link>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
