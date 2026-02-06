'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { cn } from '@/lib/utils';

type PositionType = 'employee' | 'services';

const icons = {
  employee: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
      />
    </svg>
  ),
  services: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z"
      />
    </svg>
  ),
};

export function DualPositioningSection() {
  const t = useTranslations('dualPositioning');
  const [activePosition, setActivePosition] = useState<PositionType>('services');
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });
  const prefersReducedMotion = useReducedMotion();

  const positionKey = activePosition === 'employee' ? 'employee' : 'services';
  const highlights = t.raw(`${positionKey}.highlights`) as string[];

  return (
    <section ref={sectionRef} className="relative py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />

      {/* Decorative orbs */}
      <div className="absolute top-1/4 -left-32 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
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
        </div>

        {/* Toggle Tabs */}
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex justify-center mb-12"
        >
          <div className="inline-flex bg-muted dark:bg-muted/50 p-1.5 rounded-2xl">
            {(['employee', 'services'] as PositionType[]).map((position) => (
              <button
                key={position}
                onClick={() => setActivePosition(position)}
                className={cn(
                  'relative px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300',
                  activePosition === position
                    ? 'text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {activePosition === position && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-primary rounded-xl"
                    transition={{ type: 'spring', duration: 0.5 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  {icons[position]}
                  {t(`${position}.title`)}
                </span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Content Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activePosition}
            initial={prefersReducedMotion ? false : { opacity: 0, rotateY: 10, transformPerspective: 1200, z: -50 }}
            animate={{ opacity: 1, rotateY: 0, z: 0 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0, rotateY: -10, z: -50 }}
            transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
            style={{ transformStyle: 'preserve-3d' }}
            className="max-w-4xl mx-auto"
          >
            <div
              className={cn(
                'bg-card rounded-3xl p-8 md:p-12',
                'border border-border/50',
                'shadow-premium'
              )}
            >
              <div className="grid md:grid-cols-2 gap-8 md:gap-12">
                {/* Left: Description */}
                <div>
                  <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                    {t(`${positionKey}.subtitle`)}
                  </span>
                  <h3 className="text-2xl md:text-3xl font-bold mb-4">
                    {t(`${positionKey}.title`)}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    {t(`${positionKey}.description`)}
                  </p>

                  {/* CTAs */}
                  <div className="flex flex-wrap gap-4">
                    {activePosition === 'employee' ? (
                      <a
                        href="/Manuel_Alvarez_CV.pdf"
                        download
                        className={cn(
                          'inline-flex items-center justify-center gap-2',
                          'px-6 py-3 rounded-full',
                          'bg-primary text-primary-foreground',
                          'text-sm font-semibold',
                          'btn-premium'
                        )}
                      >
                        {t(`${positionKey}.ctaPrimary`)}
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </a>
                    ) : (
                      <Link
                        href="/contact"
                        className={cn(
                          'inline-flex items-center justify-center gap-2',
                          'px-6 py-3 rounded-full',
                          'bg-primary text-primary-foreground',
                          'text-sm font-semibold',
                          'btn-premium'
                        )}
                      >
                        {t(`${positionKey}.ctaPrimary`)}
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </Link>
                    )}
                    <Link
                      href={activePosition === 'employee' ? 'https://linkedin.com' : '/services'}
                      className={cn(
                        'inline-flex items-center justify-center gap-2',
                        'px-6 py-3 rounded-full',
                        'bg-secondary text-secondary-foreground',
                        'text-sm font-semibold',
                        'hover:bg-secondary/80 transition-colors'
                      )}
                    >
                      {t(`${positionKey}.ctaSecondary`)}
                    </Link>
                  </div>
                </div>

                {/* Right: Highlights */}
                <div>
                  <h4 className="text-lg font-semibold mb-4">{t('whatYouGet')}</h4>
                  <ul className="space-y-3">
                    {highlights.map((highlight, index) => (
                      <motion.li
                        key={index}
                        initial={prefersReducedMotion ? false : { opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="flex items-start gap-3"
                      >
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                          <svg
                            className="w-3.5 h-3.5 text-primary"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </span>
                        <span className="text-foreground">{highlight}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
