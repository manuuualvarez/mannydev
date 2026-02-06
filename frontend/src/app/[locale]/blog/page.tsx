'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { useQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { useTranslations, useLocale } from 'next-intl';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { cn } from '@/lib/utils';

// GraphQL query for blog posts
const GET_BLOG_POSTS = gql`
  query GetBlogPosts {
    blogPosts {
      id
      slug
      title
      excerpt
      coverImage
      publishedAt
      isPublished
    }
  }
`;

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt?: string;
  coverImage?: string;
  publishedAt?: string;
  isPublished: boolean;
}

interface BlogPostsData {
  blogPosts: BlogPost[];
}

const localeMap: Record<string, string> = {
  es: 'es-ES',
  en: 'en-US',
};

function BlogPostCard({ post, index }: { post: BlogPost; index: number }) {
  const prefersReducedMotion = useReducedMotion();
  const t = useTranslations('blogPage');
  const locale = useLocale();
  const dateLocale = localeMap[locale] || 'en-US';

  return (
    <motion.article
      initial={prefersReducedMotion ? false : { opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        ease: [0.23, 1, 0.32, 1],
      }}
      className="group"
    >
      <Link href={`/blog/${post.slug}`}>
        <div
          className={cn(
            'bg-card rounded-2xl overflow-hidden',
            'border border-border/50',
            'shadow-premium hover:shadow-premium-hover',
            'transition-all duration-500'
          )}
        >
          {/* Image */}
          <div className="relative h-48 bg-gradient-to-br from-primary/10 to-primary/5 overflow-hidden">
            {post.coverImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={post.coverImage}
                alt={post.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <svg
                  className="w-12 h-12 text-primary/30"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                  />
                </svg>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-6">
            {post.publishedAt && (
              <time className="text-sm text-muted-foreground mb-2 block">
                {new Date(post.publishedAt).toLocaleDateString(dateLocale, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
            )}

            <h2 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
              {post.title}
            </h2>

            {post.excerpt && (
              <p className="text-muted-foreground line-clamp-2">{post.excerpt}</p>
            )}

            <div className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
              {t('readMore')}
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
        </div>
      </Link>
    </motion.article>
  );
}

function BlogSkeleton() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="bg-card rounded-2xl overflow-hidden shadow-premium border border-border/50 animate-pulse"
        >
          <div className="h-48 bg-muted" />
          <div className="p-6 space-y-3">
            <div className="h-3 bg-muted rounded w-1/4" />
            <div className="h-5 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-full" />
            <div className="h-4 bg-muted rounded w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyBlogState() {
  const t = useTranslations('blogPage');

  return (
    <div className="text-center py-20">
      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
        <svg
          className="w-10 h-10 text-primary"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
          />
        </svg>
      </div>
      <h2 className="text-2xl font-bold mb-2">{t('noPostsTitle')}</h2>
      <p className="text-muted-foreground max-w-md mx-auto">
        {t('noPostsDescription')}
      </p>
    </div>
  );
}

export default function BlogPage() {
  const headingRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(headingRef, { once: true, margin: '-100px' });
  const prefersReducedMotion = useReducedMotion();
  const t = useTranslations('blogPage');

  const { data, loading, error } = useQuery<BlogPostsData>(GET_BLOG_POSTS);

  const publishedPosts = data?.blogPosts?.filter((post: BlogPost) => post.isPublished) || [];

  return (
    <>
      <Header />
      <main className="relative z-10 pt-24">
        {/* Hero */}
        <section className="relative py-20 overflow-hidden">
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

            {/* Blog Posts Grid */}
            {loading ? (
              <BlogSkeleton />
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">{t('errorLoading')}</p>
              </div>
            ) : publishedPosts.length === 0 ? (
              <EmptyBlogState />
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {publishedPosts.map((post: BlogPost, index: number) => (
                  <BlogPostCard key={post.id} post={post} index={index} />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
