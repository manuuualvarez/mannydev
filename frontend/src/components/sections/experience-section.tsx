'use client';

import { useRef, useEffect } from 'react';
import { gsap } from '@/lib/gsap-config';
import { motion, useInView } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { cn } from '@/lib/utils';

// Company data from CV - will be fetched from backend in future
const companies = [
  {
    name: 'PayPal',
    role: 'Senior iOS Developer',
    period: '2023 - Present',
    logo: '/logos/paypal.svg',
  },
  {
    name: 'SmartJob',
    role: 'iOS Developer',
    period: '2022 - 2023',
    logo: '/logos/smartjob.svg',
  },
  {
    name: 'Kubikware',
    role: 'iOS Developer',
    period: '2021 - 2022',
    logo: '/logos/kubikware.svg',
  },
  {
    name: 'PedidosYa',
    role: 'iOS Developer',
    period: '2019 - 2021',
    logo: '/logos/pedidosya.svg',
  },
  {
    name: 'Lipo',
    role: 'Junior iOS Developer',
    period: '2017 - 2019',
    logo: '/logos/lipo.svg',
  },
];

function AnimatedCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const counterRef = useRef<HTMLSpanElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion || !counterRef.current) return;

    const counter = { value: 0 };

    gsap.to(counter, {
      value: value,
      duration: 1.5,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: counterRef.current,
        start: 'top 80%',
        toggleActions: 'play none none none',
      },
      onUpdate: () => {
        if (counterRef.current) {
          counterRef.current.textContent = Math.round(counter.value) + suffix;
        }
      },
    });
  }, [value, suffix, prefersReducedMotion]);

  return (
    <span ref={counterRef} className="block text-3xl md:text-4xl font-bold gradient-text mb-2">
      {prefersReducedMotion ? `${value}${suffix}` : `0${suffix}`}
    </span>
  );
}

function CompanyLogo({ company, index }: { company: typeof companies[0]; index: number }) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative"
    >
      <div
        className={cn(
          'flex flex-col items-center gap-3 p-6',
          'bg-card rounded-2xl',
          'border border-border/50',
          'shadow-sm hover:shadow-premium',
          'transition-all duration-500',
          'cursor-default'
        )}
      >
        {/* Logo placeholder - grayscale to color on hover */}
        <div
          className={cn(
            'w-16 h-16 rounded-xl',
            'bg-gradient-to-br from-primary/10 to-primary/5',
            'flex items-center justify-center',
            'grayscale group-hover:grayscale-0',
            'transition-all duration-500'
          )}
        >
          <span className="text-2xl font-bold text-primary/60 group-hover:text-primary transition-colors">
            {company.name.charAt(0)}
          </span>
        </div>

        {/* Company name */}
        <span className="font-semibold text-foreground">{company.name}</span>

        {/* Role - hidden, shown on hover */}
        <div
          className={cn(
            'absolute inset-x-0 bottom-0',
            'bg-gradient-to-t from-primary/90 to-primary/70 dark:from-primary/80 dark:to-primary/60',
            'text-primary-foreground dark:text-foreground',
            'rounded-b-2xl p-4',
            'opacity-0 group-hover:opacity-100',
            'translate-y-2 group-hover:translate-y-0',
            'transition-all duration-300'
          )}
        >
          <p className="text-sm font-medium">{company.role}</p>
          <p className="text-xs opacity-80">{company.period}</p>
        </div>
      </div>
    </motion.div>
  );
}

export function ExperienceSection() {
  const t = useTranslations('experience');
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });
  const prefersReducedMotion = useReducedMotion();

  const yearsOfExperience = new Date().getFullYear() - 2017;

  const stats = [
    { value: yearsOfExperience, suffix: '+', label: t('stats.years') },
    { value: 5, suffix: '', label: t('stats.companies') },
    { value: 20, suffix: '+', label: t('stats.projects') },
    { value: 4, suffix: '', label: t('stats.certifications') },
  ];

  return (
    <section id="experience" ref={sectionRef} className="relative py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-muted/30 via-background to-muted/30" />

      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
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
              years: yearsOfExperience,
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

        {/* Stats with counter animation */}
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
        >
          {stats.map((stat, index) => (
            <div
              key={index}
              className={cn(
                'text-center p-6 rounded-2xl',
                'bg-card',
                'border border-border/50',
                'shadow-sm'
              )}
            >
              <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              <span className="text-sm text-muted-foreground">{stat.label}</span>
            </div>
          ))}
        </motion.div>

        {/* Company logos - infinite carousel */}
        <div className="overflow-hidden">
          <div className="logo-carousel">
            {/* Double the logos for seamless infinite scroll */}
            {[...companies, ...companies].map((company, index) => (
              <CompanyLogo key={`${company.name}-${index}`} company={company} index={index % companies.length} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
