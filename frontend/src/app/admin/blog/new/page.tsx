'use client';

import { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BlogPostForm, type BlogPostFormData } from '@/components/admin/forms/blog-post-form';
import { CREATE_BLOG_POST, GET_ADMIN_BLOG_POSTS } from '@/lib/graphql/admin';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';

interface CreateBlogPostData {
  createBlogPost: {
    id: string;
    slug: string;
    title: string;
  };
}

export default function NewBlogPostPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [createBlogPost] = useMutation<CreateBlogPostData>(CREATE_BLOG_POST, {
    refetchQueries: [{ query: GET_ADMIN_BLOG_POSTS }],
  });

  const handleSubmit = async (data: BlogPostFormData) => {
    setIsSubmitting(true);
    try {
      // Parse SEO metadata if provided
      let seoMetadata = null;
      if (data.seoMetadata) {
        try {
          seoMetadata = JSON.parse(data.seoMetadata);
        } catch {
          toast.error('Invalid SEO metadata JSON');
          setIsSubmitting(false);
          return;
        }
      }

      const result = await createBlogPost({
        variables: {
          input: {
            title: data.title,
            slug: data.slug,
            excerpt: data.excerpt,
            content: data.content,
            coverImage: data.coverImage || null,
            seoMetadata,
            isPublished: data.isPublished,
            translations: data.translations ?? null,
          },
        },
      });

      toast.success(`Post "${result.data?.createBlogPost.title}" created successfully`);
      router.push('/admin/blog');
    } catch (error) {
      console.error('Create error:', error);
      toast.error('Failed to create post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/blog">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blog Posts
          </Link>
        </Button>
      </div>

      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>Create New Blog Post</CardTitle>
        </CardHeader>
        <CardContent>
          <BlogPostForm
            onSubmit={handleSubmit}
            isLoading={isSubmitting}
            submitLabel="Create Post"
          />
        </CardContent>
      </Card>
    </div>
  );
}
