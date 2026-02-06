'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Loader2 } from 'lucide-react';

const blogTranslationEntrySchema = z.object({
  title: z.string().optional(),
  excerpt: z.string().optional(),
  content: z.string().optional(),
});

const blogPostSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  slug: z
    .string()
    .min(5, 'Slug must be at least 5 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens only'),
  excerpt: z.string().min(20, 'Excerpt must be at least 20 characters'),
  content: z.string().min(50, 'Content must be at least 50 characters'),
  coverImage: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  seoMetadata: z.string().optional(),
  isPublished: z.boolean(),
  translations: z.object({
    es: blogTranslationEntrySchema.optional(),
    en: blogTranslationEntrySchema.optional(),
  }).optional().nullable(),
});

export type BlogPostFormData = z.infer<typeof blogPostSchema>;

interface BlogPostFormProps {
  defaultValues?: Partial<BlogPostFormData>;
  onSubmit: (data: BlogPostFormData) => Promise<void>;
  isLoading?: boolean;
  submitLabel?: string;
}

export function BlogPostForm({
  defaultValues,
  onSubmit,
  isLoading,
  submitLabel = 'Save Post',
}: BlogPostFormProps) {
  const form = useForm<BlogPostFormData>({
    resolver: zodResolver(blogPostSchema),
    defaultValues: {
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      coverImage: '',
      seoMetadata: '',
      isPublished: false,
      translations: {
        es: { title: '', excerpt: '', content: '' },
        en: { title: '', excerpt: '', content: '' },
      },
      ...defaultValues,
    },
  });

  // Auto-generate slug from title
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    form.setValue('title', title);

    // Only auto-generate if slug is empty or was previously auto-generated
    const currentSlug = form.getValues('slug');
    if (!currentSlug || currentSlug === slugify(form.getValues('title'))) {
      form.setValue('slug', slugify(title));
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input
                  placeholder="How to Build a Modern Web App"
                  {...field}
                  onChange={handleTitleChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug</FormLabel>
              <FormControl>
                <Input placeholder="how-to-build-a-modern-web-app" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="excerpt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Excerpt</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="A brief summary of the post..."
                  rows={2}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content (Markdown)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Write your blog post content here..."
                  rows={15}
                  className="font-mono"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="coverImage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cover Image URL (optional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="https://example.com/image.jpg"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="seoMetadata"
          render={({ field }) => (
            <FormItem>
              <FormLabel>SEO Metadata (optional JSON)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder='{"description": "...", "keywords": ["..."]}'
                  rows={3}
                  className="font-mono"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isPublished"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <FormLabel>Published</FormLabel>
                <p className="text-sm text-muted-foreground">
                  Make this post visible on the website
                </p>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Translations */}
        <div className="space-y-4">
          <FormLabel className="text-base">Translations</FormLabel>
          <Tabs defaultValue="es" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="es">Spanish (ES)</TabsTrigger>
              <TabsTrigger value="en">English (EN)</TabsTrigger>
            </TabsList>

            <TabsContent value="es" className="space-y-4 mt-4">
              <FormField
                control={form.control}
                name="translations.es.title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title (ES)</FormLabel>
                    <FormControl>
                      <Input placeholder="Titulo en espanol..." {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="translations.es.excerpt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Excerpt (ES)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Resumen breve en espanol..."
                        rows={2}
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="translations.es.content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content (ES)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Contenido en espanol (Markdown)..."
                        rows={10}
                        className="font-mono"
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </TabsContent>

            <TabsContent value="en" className="space-y-4 mt-4">
              <FormField
                control={form.control}
                name="translations.en.title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title (EN)</FormLabel>
                    <FormControl>
                      <Input placeholder="Title in English..." {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="translations.en.excerpt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Excerpt (EN)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Brief summary in English..."
                        rows={2}
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="translations.en.content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content (EN)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Content in English (Markdown)..."
                        rows={10}
                        className="font-mono"
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </TabsContent>
          </Tabs>
        </div>

        <div className="flex gap-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              submitLabel
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}

// Helper function to convert title to slug
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
