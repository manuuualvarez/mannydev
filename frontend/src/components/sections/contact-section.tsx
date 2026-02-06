'use client';

import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@apollo/client/react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { gsap, ScrollTrigger } from '@/lib/gsap-config';
import { useTranslations } from 'next-intl';
import { CREATE_LEAD } from '@/lib/graphql/mutations/leads';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  company: z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

type FormData = z.infer<typeof schema>;

// Premium Input Component
function FormInput({
  label,
  error,
  className,
  id,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
}) {
  // Generate a unique id if not provided
  const inputId = id || `input-${label.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

  return (
    <div className="relative form-field">
      <input
        {...props}
        id={inputId}
        placeholder=" "
        aria-label={label}
        className={cn(
          'peer w-full px-4 pt-6 pb-2 rounded-xl',
          'bg-card border-2 border-border/50',
          'text-foreground placeholder-transparent',
          'transition-all duration-300',
          'focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10',
          'hover:border-border',
          error && 'border-destructive focus:border-destructive focus:ring-destructive/10',
          className
        )}
      />
      <label
        htmlFor={inputId}
        className={cn(
          'absolute left-4 top-4 text-muted-foreground',
          'transition-all duration-200 pointer-events-none',
          'peer-placeholder-shown:top-4 peer-placeholder-shown:text-base',
          'peer-focus:top-2 peer-focus:text-xs peer-focus:text-primary',
          'peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-xs',
          error && 'peer-focus:text-destructive'
        )}
      >
        {label}
      </label>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-destructive text-sm mt-2 ml-1"
          role="alert"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}

// Premium Textarea Component
function FormTextarea({
  label,
  error,
  className,
  id,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  error?: string;
}) {
  // Generate a unique id if not provided
  const textareaId = id || `textarea-${label.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

  return (
    <div className="relative form-field">
      <textarea
        {...props}
        id={textareaId}
        placeholder=" "
        aria-label={label}
        className={cn(
          'peer w-full px-4 pt-6 pb-2 rounded-xl min-h-[140px] resize-none',
          'bg-card border-2 border-border/50',
          'text-foreground placeholder-transparent',
          'transition-all duration-300',
          'focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10',
          'hover:border-border',
          error && 'border-destructive focus:border-destructive focus:ring-destructive/10',
          className
        )}
      />
      <label
        htmlFor={textareaId}
        className={cn(
          'absolute left-4 top-4 text-muted-foreground',
          'transition-all duration-200 pointer-events-none',
          'peer-placeholder-shown:top-4 peer-placeholder-shown:text-base',
          'peer-focus:top-2 peer-focus:text-xs peer-focus:text-primary',
          'peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-xs',
          error && 'peer-focus:text-destructive'
        )}
      >
        {label}
      </label>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-destructive text-sm mt-2 ml-1"
          role="alert"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}

export function ContactSection() {
  const t = useTranslations('contact');
  const [submitted, setSubmitted] = useState(false);
  const [createLead, { loading }] = useMutation(CREATE_LEAD);
  const sectionRef = useRef<HTMLElement>(null);
  const formCardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });
  const prefersReducedMotion = useReducedMotion();

  // GSAP staggered field reveal
  useEffect(() => {
    if (prefersReducedMotion || !formCardRef.current) return;

    const fields = formCardRef.current.querySelectorAll('.form-field');
    if (!fields.length) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        fields,
        { opacity: 0, y: 30, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: formCardRef.current,
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, [prefersReducedMotion, submitted]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      await createLead({
        variables: {
          input: {
            name: data.name,
            email: data.email,
            company: data.company || '',
            message: data.message,
          },
        },
      });
      setSubmitted(true);
      reset();
      setTimeout(() => setSubmitted(false), 5000);
    } catch (error) {
      // Error is handled by Apollo Client error state
    }
  };

  return (
    <section id="contact" ref={sectionRef} className="relative py-32 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />

      {/* Decorative orbs */}
      <div className="absolute top-1/4 -left-32 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left column - Text */}
            <div>
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
                className="text-lg text-muted-foreground leading-relaxed mb-8"
              >
                {t('description')}
              </motion.p>

              {/* Contact info */}
              <motion.div
                initial={prefersReducedMotion ? false : { opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('email')}</p>
                    <p className="font-medium">hello@manuelalvarez.cloud</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('responseTime')}</p>
                    <p className="font-medium">{t('within24')}</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right column - Form */}
            <motion.div
              ref={formCardRef}
              initial={prefersReducedMotion ? false : { opacity: 0, x: 40 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-card rounded-3xl p-8 shadow-premium border border-border/50"
            >
              <AnimatePresence mode="wait">
                {submitted ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-12"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', duration: 0.6 }}
                      className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6"
                    >
                      <svg
                        className="w-10 h-10 text-green-600"
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
                    </motion.div>
                    <h3 className="text-2xl font-bold mb-2">{t('form.success')}</h3>
                    <p className="text-muted-foreground">
                      {t('form.successSub')}
                    </p>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    onSubmit={handleSubmit(onSubmit)}
                    className="space-y-5"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <FormInput
                      {...register('name')}
                      label={t('form.name')}
                      error={errors.name?.message}
                    />

                    <FormInput
                      {...register('email')}
                      type="email"
                      label={t('form.email')}
                      error={errors.email?.message}
                    />

                    <FormInput
                      {...register('company')}
                      label={t('form.company')}
                    />

                    <FormTextarea
                      {...register('message')}
                      label={t('form.message')}
                      error={errors.message?.message}
                    />

                    <button
                      type="submit"
                      disabled={loading}
                      className={cn(
                        'w-full py-4 rounded-xl form-field',
                        'bg-primary text-primary-foreground',
                        'font-semibold text-base',
                        'btn-premium',
                        'disabled:opacity-50 disabled:cursor-not-allowed',
                        'flex items-center justify-center gap-2'
                      )}
                    >
                      {loading ? (
                        <>
                          <svg
                            className="w-5 h-5 animate-spin"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          {t('form.sending')}
                        </>
                      ) : (
                        <>
                          {t('form.submit')}
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
                        </>
                      )}
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
