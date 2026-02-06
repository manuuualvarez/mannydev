'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BlogPostForm, type BlogPostFormData } from '@/components/admin/forms/blog-post-form';
import { GET_BLOG_POST, UPDATE_BLOG_POST, GET_ADMIN_BLOG_POSTS } from '@/lib/graphql/admin';
import { toast } from 'sonner';
import { ArrowLeft, Loader2 } from 'lucide-react';

interface BlogTranslationEntry {
  title?: string;
  excerpt?: string;
  content?: string;
}

interface BlogPostData {
  adminBlogPost: {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    content: string;
    coverImage: string | null;
    seoMetadata: Record<string, unknown> | null;
    isPublished: boolean;
    publishedAt: string | null;
    translations: {
      es?: BlogTranslationEntry;
      en?: BlogTranslationEntry;
    } | null;
  };
}

interface UpdateBlogPostData {
  updateBlogPost: {
    id: string;
    slug: string;
    title: string;
  };
}

export default function EditBlogPostPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data, loading, error } = useQuery<BlogPostData>(GET_BLOG_POST, {
    variables: { id: postId },
    skip: !postId,
  });

  const [updateBlogPost] = useMutation<UpdateBlogPostData>(UPDATE_BLOG_POST, {
    refetchQueries: [{ query: GET_ADMIN_BLOG_POSTS }],
  });

  const handleSubmit = async (formData: BlogPostFormData) => {
    setIsSubmitting(true);
    try {
      // Parse SEO metadata if provided
      let seoMetadata = null;
      if (formData.seoMetadata) {
        try {
          seoMetadata = JSON.parse(formData.seoMetadata);
        } catch {
          toast.error('Invalid SEO metadata JSON');
          setIsSubmitting(false);
          return;
        }
      }

      const result = await updateBlogPost({
        variables: {
          id: postId,
          input: {
            title: formData.title,
            slug: formData.slug,
            excerpt: formData.excerpt,
            content: formData.content,
            coverImage: formData.coverImage || null,
            seoMetadata,
            isPublished: formData.isPublished,
            translations: formData.translations ?? null,
          },
        },
      });

      toast.success(`Post "${result.data?.updateBlogPost.title}" updated successfully`);
      router.push('/admin/blog');
    } catch (err) {
      console.error('Update error:', err);
      toast.error('Failed to update post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  if (error || !data?.adminBlogPost) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive mb-4">Blog post not found</p>
        <Button asChild>
          <Link href="/admin/blog">Back to Blog Posts</Link>
        </Button>
      </div>
    );
  }

  const post = data.adminBlogPost;

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
          <CardTitle>Edit Post: {post.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <BlogPostForm
            defaultValues={{
              title: post.title,
              slug: post.slug,
              excerpt: post.excerpt,
              content: post.content,
              coverImage: post.coverImage || '',
              seoMetadata: post.seoMetadata
                ? JSON.stringify(post.seoMetadata, null, 2)
                : '',
              isPublished: post.isPublished,
              translations: post.translations ?? {
                es: { title: '', excerpt: '', content: '' },
                en: { title: '', excerpt: '', content: '' },
              },
            }}
            onSubmit={handleSubmit}
            isLoading={isSubmitting}
            submitLabel="Update Post"
          />
        </CardContent>
      </Card>
    </div>
  );
}
