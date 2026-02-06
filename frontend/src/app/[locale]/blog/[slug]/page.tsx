'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { useTranslations, useLocale } from 'next-intl';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { cn } from '@/lib/utils';

const GET_BLOG_POST_BY_SLUG = gql`
  query GetBlogPostBySlug($slug: String!) {
    blogPostBySlug(slug: $slug) {
      id
      slug
      title
      excerpt
      content
      coverImage
      publishedAt
      isPublished
    }
  }
`;

interface BlogPostDetail {
  id: string;
  slug: string;
  title: string;
  excerpt?: string;
  content: string;
  coverImage?: string;
  publishedAt?: string;
  isPublished: boolean;
}

interface BlogPostBySlugData {
  blogPostBySlug: BlogPostDetail | null;
}

const localeMap: Record<string, string> = {
  es: 'es-ES',
  en: 'en-US',
};

function BlogDetailSkeleton() {
  return (
    <div className="max-w-3xl mx-auto animate-pulse">
      <div className="h-4 bg-muted rounded w-1/4 mb-8" />
      <div className="h-10 bg-muted rounded w-3/4 mb-4" />
      <div className="h-4 bg-muted rounded w-1/3 mb-8" />
      <div className="h-64 bg-muted rounded-2xl mb-8" />
      <div className="space-y-4">
        <div className="h-4 bg-muted rounded w-full" />
        <div className="h-4 bg-muted rounded w-5/6" />
        <div className="h-4 bg-muted rounded w-full" />
        <div className="h-4 bg-muted rounded w-4/6" />
        <div className="h-4 bg-muted rounded w-full" />
        <div className="h-4 bg-muted rounded w-3/4" />
      </div>
    </div>
  );
}

function BlogNotFound() {
  const t = useTranslations('blogPage');
  const tNotFound = useTranslations('notFound');
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="text-center py-20">
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="mb-6"
      >
        <span className="text-[80px] md:text-[120px] font-bold leading-none gradient-text select-none">
          404
        </span>
      </motion.div>
      <motion.h2
        initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="text-2xl font-bold mb-4"
      >
        {tNotFound('title')}
      </motion.h2>
      <motion.p
        initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-muted-foreground max-w-md mx-auto mb-8"
      >
        {tNotFound('description')}
      </motion.p>
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Link
          href="/blog"
          className={cn(
            'inline-flex items-center justify-center gap-2',
            'px-6 py-3 rounded-full',
            'bg-primary text-primary-foreground',
            'text-sm font-semibold',
            'btn-premium',
            'shadow-lg shadow-primary/25'
          )}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          {t('backToBlog')}
        </Link>
      </motion.div>
    </div>
  );
}

function renderMarkdownContent(content: string): string {
  // Basic markdown to HTML conversion for rendering
  let html = content
    // Headers
    .replace(/^### (.*$)/gm, '<h3 class="text-xl font-semibold mt-8 mb-3">$1</h3>')
    .replace(/^## (.*$)/gm, '<h2 class="text-2xl font-bold mt-10 mb-4">$1</h2>')
    .replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold mt-10 mb-4">$1</h1>')
    // Bold and Italic
    .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Code blocks
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre class="bg-muted rounded-xl p-4 overflow-x-auto my-6 font-mono text-sm"><code>$2</code></pre>')
    // Inline code
    .replace(/`(.*?)`/g, '<code class="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">$1</code>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary hover:underline" target="_blank" rel="noopener noreferrer">$1</a>')
    // Images
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="rounded-xl my-6 w-full" />')
    // Unordered lists
    .replace(/^\- (.*$)/gm, '<li class="ml-4 list-disc">$1</li>')
    // Ordered lists
    .replace(/^\d+\. (.*$)/gm, '<li class="ml-4 list-decimal">$1</li>')
    // Blockquotes
    .replace(/^> (.*$)/gm, '<blockquote class="border-l-4 border-primary/30 pl-4 my-4 italic text-muted-foreground">$1</blockquote>')
    // Horizontal rules
    .replace(/^---$/gm, '<hr class="my-8 border-border" />')
    // Paragraphs (double newlines)
    .replace(/\n\n/g, '</p><p class="mb-4 leading-relaxed">')
    // Single newlines within paragraphs
    .replace(/\n/g, '<br />');

  // Wrap in paragraph tags
  html = `<p class="mb-4 leading-relaxed">${html}</p>`;

  return html;
}

export default function BlogPostPage() {
  const params = useParams();
  const slug = params.slug as string;
  const t = useTranslations('blogPage');
  const locale = useLocale();
  const dateLocale = localeMap[locale] || 'en-US';
  const prefersReducedMotion = useReducedMotion();

  const { data, loading, error } = useQuery<BlogPostBySlugData>(GET_BLOG_POST_BY_SLUG, {
    variables: { slug },
    skip: !slug,
  });

  const post = data?.blogPostBySlug;

  return (
    <>
      <Header />
      <main className="relative z-10 pt-24 pb-20">
        <section className="relative py-8 overflow-hidden">
          <div className="container mx-auto px-6">
            {loading ? (
              <BlogDetailSkeleton />
            ) : error || !post ? (
              <BlogNotFound />
            ) : (
              <article className="max-w-3xl mx-auto">
                {/* Back link */}
                <motion.div
                  initial={prefersReducedMotion ? false : { opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4 }}
                  className="mb-8"
                >
                  <Link
                    href="/blog"
                    className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    {t('backToBlog')}
                  </Link>
                </motion.div>

                {/* Title */}
                <motion.h1
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4"
                >
                  {post.title}
                </motion.h1>

                {/* Date */}
                {post.publishedAt && (
                  <motion.div
                    initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="mb-8"
                  >
                    <time className="text-sm text-muted-foreground">
                      {t('publishedOn')}{' '}
                      {new Date(post.publishedAt).toLocaleDateString(dateLocale, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </time>
                  </motion.div>
                )}

                {/* Cover Image */}
                {post.coverImage && (
                  <motion.div
                    initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.25 }}
                    className="mb-10 rounded-2xl overflow-hidden shadow-premium"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      className="w-full h-auto object-cover"
                    />
                  </motion.div>
                )}

                {/* Content */}
                <motion.div
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="prose prose-lg dark:prose-invert max-w-none text-foreground"
                  dangerouslySetInnerHTML={{ __html: renderMarkdownContent(post.content) }}
                />

                {/* Back to blog (bottom) */}
                <motion.div
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="mt-16 pt-8 border-t border-border"
                >
                  <Link
                    href="/blog"
                    className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    {t('backToBlog')}
                  </Link>
                </motion.div>
              </article>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
