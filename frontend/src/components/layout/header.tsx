'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { SignedIn, SignedOut, UserButton, SignInButton } from '@clerk/nextjs';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { LanguageSwitcher } from '@/components/ui/language-switcher';

export function Header() {
  const t = useTranslations('header');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '/services', label: t('services') },
    { href: '/blog', label: t('blog') },
    { href: '/contact', label: t('contact') },
  ];

  return (
    <motion.header
      initial={prefersReducedMotion ? false : { y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
        isScrolled
          ? 'glass-strong shadow-sm'
          : 'bg-transparent'
      )}
      role="banner"
    >
      <nav
        className="container mx-auto px-6 h-20 flex items-center justify-between"
        role="navigation"
      >
        {/* Logo */}
        <Link
          href="/"
          className="relative group"
        >
          <span className="text-xl font-semibold tracking-tight text-foreground">
            Manuel Alvarez
          </span>
          <span
            className={cn(
              "absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full",
              prefersReducedMotion && "transition-none"
            )}
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-10">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="link-underline text-muted-foreground hover:text-foreground transition-colors duration-300 text-[15px] font-medium"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* CTA, Auth, Language, and Theme Toggle */}
        <div className="hidden md:flex items-center gap-4">
          <LanguageSwitcher />
          <ThemeToggle />

          {/* Auth Status */}
          <SignedOut>
            <SignInButton mode="modal">
              <button
                className={cn(
                  "inline-flex items-center justify-center",
                  "px-4 py-2 rounded-full",
                  "border border-border",
                  "text-[14px] font-medium text-muted-foreground",
                  "hover:text-foreground hover:border-foreground/50",
                  "transition-colors duration-300"
                )}
              >
                {t('signIn')}
              </button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: 'h-9 w-9 ring-2 ring-border hover:ring-primary/50 transition-all duration-300',
                  userButtonPopoverCard: 'shadow-xl border border-border',
                  userButtonPopoverActionButton: 'hover:bg-muted',
                },
              }}
            />
          </SignedIn>

          <Link
            href="/contact"
            className={cn(
              "inline-flex items-center justify-center",
              "px-6 py-2.5 rounded-full",
              "bg-primary text-primary-foreground",
              "text-[15px] font-medium",
              "btn-premium",
              "hover:bg-primary/90"
            )}
          >
            {t('startProject')}
          </Link>
        </div>

        {/* Mobile: Auth, Language, Theme Toggle and Menu Button */}
        <div className="md:hidden flex items-center gap-2">
          <SignedIn>
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: 'h-8 w-8 ring-2 ring-border',
                },
              }}
            />
          </SignedIn>
          <LanguageSwitcher />
          <ThemeToggle />
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="relative w-10 h-10 flex items-center justify-center"
            aria-label="Toggle menu"
            aria-expanded={isMobileMenuOpen}
          >
          <div className="relative w-6 h-5 flex flex-col justify-between">
            <span
              className={cn(
                "w-full h-0.5 bg-foreground transition-all duration-300 origin-center",
                isMobileMenuOpen && "rotate-45 translate-y-2"
              )}
            />
            <span
              className={cn(
                "w-full h-0.5 bg-foreground transition-all duration-300",
                isMobileMenuOpen && "opacity-0 scale-0"
              )}
            />
            <span
              className={cn(
                "w-full h-0.5 bg-foreground transition-all duration-300 origin-center",
                isMobileMenuOpen && "-rotate-45 -translate-y-2"
              )}
            />
          </div>
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            className="md:hidden glass-strong border-t border-border/50"
          >
            <div className="container mx-auto px-6 py-6 flex flex-col gap-4">
              {navLinks.map((link, index) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block text-lg font-medium text-foreground py-2"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <SignedOut>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <SignInButton mode="modal">
                    <button
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        "inline-flex items-center justify-center w-full mt-2",
                        "px-6 py-3 rounded-full",
                        "border border-border",
                        "text-base font-medium text-foreground",
                        "hover:bg-muted"
                      )}
                    >
                      {t('signIn')}
                    </button>
                  </SignInButton>
                </motion.div>
              </SignedOut>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Link
                  href="/contact"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "inline-flex items-center justify-center w-full mt-2",
                    "px-6 py-3 rounded-full",
                    "bg-primary text-primary-foreground",
                    "text-base font-medium"
                  )}
                >
                  {t('startProject')}
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
