'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Loader2, Mail, Building, Calendar, User } from 'lucide-react';
import { GET_LEAD, UPDATE_LEAD, GET_ADMIN_LEADS } from '@/lib/graphql/admin';
import { toast } from 'sonner';

type LeadStatus = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'CONVERTED' | 'LOST';

interface LeadData {
  lead: {
    id: string;
    name: string;
    email: string;
    company: string | null;
    message: string;
    status: LeadStatus;
    notes: string | null;
    createdAt: string;
    updatedAt: string;
  };
}

const statusOptions: { value: LeadStatus; label: string }[] = [
  { value: 'NEW', label: 'New' },
  { value: 'CONTACTED', label: 'Contacted' },
  { value: 'QUALIFIED', label: 'Qualified' },
  { value: 'CONVERTED', label: 'Converted' },
  { value: 'LOST', label: 'Lost' },
];

const statusColors: Record<LeadStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  NEW: 'default',
  CONTACTED: 'secondary',
  QUALIFIED: 'default',
  CONVERTED: 'default',
  LOST: 'destructive',
};

export default function LeadDetailPage() {
  const params = useParams();
  const leadId = params.id as string;

  const [status, setStatus] = useState<LeadStatus | null>(null);
  const [notes, setNotes] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);

  const { data, loading, error, refetch } = useQuery<LeadData>(GET_LEAD, {
    variables: { id: leadId },
    skip: !leadId,
  });

  // Set initial values when data loads
  useEffect(() => {
    if (data?.lead) {
      setStatus(data.lead.status);
      setNotes(data.lead.notes || '');
    }
  }, [data]);

  const [updateLead] = useMutation(UPDATE_LEAD, {
    refetchQueries: [{ query: GET_ADMIN_LEADS }],
  });

  const handleUpdateLead = async () => {
    if (!status) return;

    setIsUpdating(true);
    try {
      await updateLead({
        variables: {
          id: leadId,
          input: {
            status,
            notes: notes || null,
          },
        },
      });
      toast.success('Lead updated successfully');
      refetch();
    } catch (err) {
      console.error('Update error:', err);
      toast.error('Failed to update lead');
    } finally {
      setIsUpdating(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  if (error || !data?.lead) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive mb-4">Lead not found</p>
        <Button asChild>
          <Link href="/admin/leads">Back to Leads</Link>
        </Button>
      </div>
    );
  }

  const lead = data.lead;

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/leads">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Leads
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Lead Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Lead Information</CardTitle>
              <Badge variant={statusColors[lead.status as LeadStatus]}>{lead.status}</Badge>
            </div>
            <CardDescription>
              Received on {formatDate(lead.createdAt)}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{lead.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <a
                  href={`mailto:${lead.email}`}
                  className="font-medium text-primary hover:underline"
                >
                  {lead.email}
                </a>
              </div>
            </div>

            {lead.company && (
              <div className="flex items-center gap-3">
                <Building className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Company</p>
                  <p className="font-medium">{lead.company}</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Last Updated</p>
                <p className="font-medium">{formatDate(lead.updatedAt)}</p>
              </div>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-2">Message</p>
              <p className="whitespace-pre-wrap bg-muted p-4 rounded-lg">
                {lead.message}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Update Lead */}
        <Card>
          <CardHeader>
            <CardTitle>Update Lead</CardTitle>
            <CardDescription>
              Change the status and add notes to track this lead
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={status || undefined}
                onValueChange={(value) => setStatus(value as LeadStatus)}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Add notes about this lead..."
                rows={6}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <Button
              onClick={handleUpdateLead}
              disabled={isUpdating}
              className="w-full"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Lead'
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
