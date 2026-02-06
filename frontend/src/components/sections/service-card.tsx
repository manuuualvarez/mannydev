'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { useTranslatedItem } from '@/hooks/use-translated-content';

export interface ServiceCardProps {
  service: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    icon: string | null;
    startingPrice?: number | null;
    translations?: Record<string, Record<string, string>> | null;
  };
  className?: string;
  index?: number;
}

// Premium icon components
const icons: Record<string, React.ReactNode> = {
  globe: (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
    </svg>
  ),
  rocket: (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
    </svg>
  ),
  code: (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
    </svg>
  ),
  gear: (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  chart: (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
  ),
  shield: (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  ),
  default: (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
    </svg>
  ),
};

export function ServiceCard({ service, className, index = 0 }: ServiceCardProps) {
  const t = useTranslations('services');
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const translatedService = useTranslatedItem(service, ['name', 'description']);

  const icon = icons[service.icon || ''] || icons.default;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion || !cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / 20;
    const y = (e.clientY - rect.top - rect.height / 2) / 20;
    setMousePosition({ x, y });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setMousePosition({ x: 0, y: 0 });
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 60, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{
        duration: 0.7,
        delay: index * 0.1,
        ease: [0.23, 1, 0.32, 1],
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className={cn('group', className)}
      style={{
        perspective: '1000px',
      }}
    >
      <Link href="/contact">
        <div
          className={cn(
            'relative bg-card rounded-2xl p-8 h-full',
            'border border-border/50',
            'shadow-premium',
            'transition-all duration-500 ease-out',
            'hover:shadow-premium-hover',
            'overflow-hidden'
          )}
          style={{
            transform: prefersReducedMotion
              ? undefined
              : `rotateY(${mousePosition.x}deg) rotateX(${-mousePosition.y}deg)`,
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Gradient overlay on hover */}
          <div
            className={cn(
              'absolute inset-0 opacity-0 transition-opacity duration-500',
              'bg-gradient-to-br from-primary/5 via-transparent to-primary/10',
              isHovered && 'opacity-100'
            )}
          />

          {/* Shine effect */}
          <div
            className={cn(
              'absolute inset-0 opacity-0 transition-opacity duration-500',
              isHovered && 'opacity-100'
            )}
            style={{
              background: `radial-gradient(circle at ${50 + mousePosition.x * 3}% ${50 + mousePosition.y * 3}%, var(--shine-color, rgba(255,255,255,0.15)) 0%, transparent 50%)`,
            }}
          />

          {/* Content */}
          <div className="relative z-10">
            {/* Icon */}
            <div
              className={cn(
                'w-16 h-16 rounded-2xl flex items-center justify-center mb-6',
                'bg-gradient-to-br from-primary/10 to-primary/5',
                'text-primary',
                'transition-all duration-500',
                'group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-primary/20'
              )}
              style={{
                transform: prefersReducedMotion ? undefined : 'translateZ(30px)',
              }}
            >
              {icon}
            </div>

            {/* Title */}
            <h3
              className={cn(
                'text-xl font-semibold mb-3',
                'transition-colors duration-300',
                'group-hover:text-primary'
              )}
              style={{
                transform: prefersReducedMotion ? undefined : 'translateZ(20px)',
              }}
            >
              {translatedService.name}
            </h3>

            {/* Description */}
            {translatedService.description && (
              <p
                className="text-muted-foreground leading-relaxed mb-4"
                style={{
                  transform: prefersReducedMotion ? undefined : 'translateZ(15px)',
                }}
              >
                {translatedService.description}
              </p>
            )}

            {/* Pricing */}
            {service.startingPrice ? (
              <div
                className="mb-4"
                style={{
                  transform: prefersReducedMotion ? undefined : 'translateZ(18px)',
                }}
              >
                <span className="text-2xl font-bold text-foreground">
                  USD ${Math.floor(service.startingPrice / 100)}
                </span>
                <span className="text-sm text-muted-foreground ml-1">
                  {t('startingFrom')}
                </span>
              </div>
            ) : (
              <div
                className="mb-4"
                style={{
                  transform: prefersReducedMotion ? undefined : 'translateZ(18px)',
                }}
              >
                <span className="text-lg font-semibold text-primary">
                  {t('getQuote')}
                </span>
              </div>
            )}

            {/* CTA */}
            <div
              className={cn(
                'inline-flex items-center gap-2',
                'text-sm font-medium text-primary',
                'transition-all duration-300',
                'group-hover:gap-3'
              )}
              style={{
                transform: prefersReducedMotion ? undefined : 'translateZ(25px)',
              }}
            >
              {t('contactUs')}
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
            </div>
          </div>

          {/* Border glow on hover */}
          <div
            className={cn(
              'absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500',
              'ring-2 ring-primary/20',
              isHovered && 'opacity-100'
            )}
          />
        </div>
      </Link>
    </motion.div>
  );
}
