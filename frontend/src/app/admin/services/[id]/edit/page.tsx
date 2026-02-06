'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ServiceForm, type ServiceFormData } from '@/components/admin/forms/service-form';
import { GET_SERVICE, UPDATE_SERVICE, GET_ADMIN_SERVICES } from '@/lib/graphql/admin';
import { toast } from 'sonner';
import { ArrowLeft, Loader2 } from 'lucide-react';

interface TranslationEntry {
  name?: string;
  description?: string;
}

interface ServiceData {
  service: {
    id: string;
    name: string;
    slug: string;
    description: string;
    icon: string | null;
    order: number;
    isActive: boolean;
    startingPrice: number | null;
    translations: {
      es?: TranslationEntry;
      en?: TranslationEntry;
    } | null;
  };
}

interface UpdateServiceData {
  updateService: {
    id: string;
    name: string;
    slug: string;
  };
}

export default function EditServicePage() {
  const router = useRouter();
  const params = useParams();
  const serviceId = params.id as string;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data, loading, error } = useQuery<ServiceData>(GET_SERVICE, {
    variables: { id: serviceId },
    skip: !serviceId,
  });

  const [updateService] = useMutation<UpdateServiceData>(UPDATE_SERVICE, {
    refetchQueries: [{ query: GET_ADMIN_SERVICES }],
  });

  const handleSubmit = async (formData: ServiceFormData) => {
    setIsSubmitting(true);
    try {
      const result = await updateService({
        variables: {
          id: serviceId,
          input: {
            name: formData.name,
            slug: formData.slug,
            description: formData.description,
            icon: formData.icon || null,
            order: formData.order,
            isActive: formData.isActive,
            startingPrice: formData.startingPrice ?? null,
            translations: formData.translations ?? null,
          },
        },
      });

      toast.success(`Service "${result.data?.updateService.name}" updated successfully`);
      router.push('/admin/services');
    } catch (err) {
      console.error('Update error:', err);
      toast.error('Failed to update service. Please try again.');
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

  if (error || !data?.service) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive mb-4">Service not found</p>
        <Button asChild>
          <Link href="/admin/services">Back to Services</Link>
        </Button>
      </div>
    );
  }

  const service = data.service;

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/services">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Services
          </Link>
        </Button>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Edit Service: {service.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <ServiceForm
            defaultValues={{
              name: service.name,
              slug: service.slug,
              description: service.description,
              icon: service.icon || '',
              order: service.order,
              isActive: service.isActive,
              startingPrice: service.startingPrice,
              translations: service.translations ?? {
                es: { name: '', description: '' },
                en: { name: '', description: '' },
              },
            }}
            onSubmit={handleSubmit}
            isLoading={isSubmitting}
            submitLabel="Update Service"
          />
        </CardContent>
      </Card>
    </div>
  );
}
