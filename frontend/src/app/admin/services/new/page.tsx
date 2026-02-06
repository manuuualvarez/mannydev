'use client';

import { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ServiceForm, type ServiceFormData } from '@/components/admin/forms/service-form';
import { CREATE_SERVICE, GET_ADMIN_SERVICES } from '@/lib/graphql/admin';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';

interface CreateServiceData {
  createService: {
    id: string;
    name: string;
    slug: string;
  };
}

export default function NewServicePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [createService] = useMutation<CreateServiceData>(CREATE_SERVICE, {
    refetchQueries: [{ query: GET_ADMIN_SERVICES }],
  });

  const handleSubmit = async (data: ServiceFormData) => {
    setIsSubmitting(true);
    try {
      const result = await createService({
        variables: {
          input: {
            name: data.name,
            slug: data.slug,
            description: data.description,
            icon: data.icon || null,
            order: data.order,
            isActive: data.isActive,
            startingPrice: data.startingPrice ?? null,
            translations: data.translations ?? null,
          },
        },
      });

      toast.success(`Service "${result.data?.createService.name}" created successfully`);
      router.push('/admin/services');
    } catch (error) {
      console.error('Create error:', error);
      toast.error('Failed to create service. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <CardTitle>Create New Service</CardTitle>
        </CardHeader>
        <CardContent>
          <ServiceForm
            onSubmit={handleSubmit}
            isLoading={isSubmitting}
            submitLabel="Create Service"
          />
        </CardContent>
      </Card>
    </div>
  );
}
