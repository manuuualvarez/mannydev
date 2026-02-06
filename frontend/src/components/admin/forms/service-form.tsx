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
  FormDescription,
} from '@/components/ui/form';
import { Loader2 } from 'lucide-react';

const translationEntrySchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
});

const serviceSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  slug: z
    .string()
    .min(3, 'Slug must be at least 3 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens only'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  icon: z.string().optional(),
  order: z.number().int().min(0),
  isActive: z.boolean(),
  startingPrice: z.number().int().min(0).optional().nullable(),
  translations: z.object({
    es: translationEntrySchema.optional(),
    en: translationEntrySchema.optional(),
  }).optional().nullable(),
});

export type ServiceFormData = z.infer<typeof serviceSchema>;

interface ServiceFormProps {
  defaultValues?: Partial<ServiceFormData>;
  onSubmit: (data: ServiceFormData) => Promise<void>;
  isLoading?: boolean;
  submitLabel?: string;
}

export function ServiceForm({
  defaultValues,
  onSubmit,
  isLoading,
  submitLabel = 'Save Service',
}: ServiceFormProps) {
  const form = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      icon: '',
      order: 0,
      isActive: true,
      startingPrice: null,
      translations: {
        es: { name: '', description: '' },
        en: { name: '', description: '' },
      },
      ...defaultValues,
    },
  });

  // Auto-generate slug from name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    form.setValue('name', name);

    // Only auto-generate if slug is empty or was previously auto-generated
    const currentSlug = form.getValues('slug');
    if (!currentSlug || currentSlug === slugify(form.getValues('name'))) {
      form.setValue('slug', slugify(name));
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Web Development"
                  {...field}
                  onChange={handleNameChange}
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
                <Input placeholder="web-development" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe the service..."
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="icon"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Icon (optional)</FormLabel>
              <FormControl>
                <Input placeholder="code" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="order"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Display Order</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="startingPrice"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Starting Price (optional)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="29900"
                  value={field.value ?? ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    field.onChange(val === '' ? null : parseInt(val) || 0);
                  }}
                />
              </FormControl>
              <FormDescription>
                Price in cents (e.g., 29900 = $299)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <FormLabel>Active</FormLabel>
                <p className="text-sm text-muted-foreground">
                  Show this service on the website
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
                name="translations.es.name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name (ES)</FormLabel>
                    <FormControl>
                      <Input placeholder="Desarrollo Web" {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="translations.es.description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (ES)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descripcion del servicio en espanol..."
                        rows={3}
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
                name="translations.en.name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name (EN)</FormLabel>
                    <FormControl>
                      <Input placeholder="Web Development" {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="translations.en.description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (EN)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Service description in English..."
                        rows={3}
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

// Helper function to convert name to slug
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
