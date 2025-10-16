
'use client';

import { useState, useEffect, useRef } from 'react';
import { useUser } from '@/firebase/auth/use-user';
import { useRouter, useParams } from 'next/navigation';
import { Loader2, Send, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Complaint, ComplaintMessage } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const messageSchema = z.object({
  reply: z.string().min(1, 'Reply cannot be empty.'),
});

export default function ComplaintDetailPage() {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const complaintId = params.id as string;

  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const form = useForm<z.infer<typeof messageSchema>>({
    resolver: zodResolver(messageSchema),
    defaultValues: { reply: '' },
  });
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [complaint?.messages]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && !userLoading && !user) {
      router.replace('/');
    }
  }, [user, userLoading, router, isClient]);

  useEffect(() => {
    if (isClient && user && complaintId) {
      setLoading(true);
      const allComplaints: Complaint[] = JSON.parse(localStorage.getItem(`complaints_${user.uid}`) || '[]');
      const foundComplaint = allComplaints.find(c => c.id === complaintId);
      setComplaint(foundComplaint || null);
      setLoading(false);
    }
  }, [isClient, user, complaintId]);
  
  const updateComplaintInStorage = (updatedComplaint: Complaint) => {
    if (!user || !isClient) return;
    const allComplaints: Complaint[] = JSON.parse(localStorage.getItem(`complaints_${user.uid}`) || '[]');
    const complaintIndex = allComplaints.findIndex(c => c.id === complaintId);
    if(complaintIndex !== -1) {
        allComplaints[complaintIndex] = updatedComplaint;
        localStorage.setItem(`complaints_${user.uid}`, JSON.stringify(allComplaints));
    }
  }

  const onSubmit = (values: z.infer<typeof messageSchema>) => {
    if (!complaint || !user) return;
    setIsSubmitting(true);

    const newUserMessage: ComplaintMessage = {
      id: `MSG-${Date.now()}`,
      text: values.reply,
      sender: 'user',
      timestamp: new Date().toISOString(),
    };
    
    const updatedComplaint: Complaint = {
        ...complaint,
        messages: [...complaint.messages, newUserMessage],
        status: 'Open'
    }
    
    setComplaint(updatedComplaint);
    updateComplaintInStorage(updatedComplaint);
    form.reset();
    
    // Mock admin reply
    setTimeout(() => {
      const adminReply: ComplaintMessage = {
          id: `MSG-${Date.now() + 1}`,
          text: 'Thank you for your message. We have received your query and our team is looking into it. We will get back to you within 24 hours.',
          sender: 'admin',
          timestamp: new Date().toISOString(),
      };
      
      const complaintWithAdminReply = {
          ...updatedComplaint,
          messages: [...updatedComplaint.messages, adminReply],
          status: 'Answered' as 'Answered',
      };
      
      setComplaint(complaintWithAdminReply);
      updateComplaintInStorage(complaintWithAdminReply);
      setIsSubmitting(false);
      toast({
        title: "Message Sent",
        description: "An admin will reply shortly.",
      });

    }, 2000);
  };
  
  const getStatusBadgeVariant = (status: 'Open' | 'Answered' | 'Closed') => {
    switch (status) {
      case 'Open': return 'destructive';
      case 'Answered': return 'default';
      case 'Closed': return 'secondary';
      default: return 'outline';
    }
  }

  if (!isClient || userLoading || loading) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  if (!user) return null;
  
  if (!complaint) {
      return (
          <div className="container py-8 text-center">
              <h1 className="text-2xl font-bold">Complaint not found</h1>
              <p className="text-muted-foreground">The requested complaint could not be found.</p>
              <Button asChild className="mt-4">
                  <Link href="/complaints">Back to Complaints</Link>
              </Button>
          </div>
      )
  }

  return (
    <div className="container py-8 max-w-3xl mx-auto">
        <Button asChild variant="ghost" className="mb-4">
            <Link href="/complaints"><ArrowLeft className="mr-2 h-4 w-4" /> Back to all complaints</Link>
        </Button>
      <Card>
          <CardHeader>
              <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl">{complaint.title}</CardTitle>
                    <CardDescription>
                        #{complaint.id} &bull; Created on {format(new Date(complaint.createdAt), 'PPP')}
                    </CardDescription>
                  </div>
                  <Badge variant={getStatusBadgeVariant(complaint.status)} className="text-sm">{complaint.status}</Badge>
              </div>
          </CardHeader>
          <CardContent>
              <div className="h-[400px] overflow-y-auto p-4 space-y-4 bg-muted/50 rounded-lg border">
                  {complaint.messages.map(message => (
                      <div key={message.id} className={cn(
                          "flex flex-col gap-2 p-3 rounded-lg max-w-[80%]",
                          message.sender === 'user' ? 'bg-primary text-primary-foreground self-end' : 'bg-background self-start'
                      )}>
                          <p className="text-sm">{message.text}</p>
                          <p className={cn(
                              "text-xs opacity-70",
                              message.sender === 'user' ? 'text-right' : 'text-left'
                          )}>{format(new Date(message.timestamp), 'p')}</p>
                      </div>
                  ))}
                  <div ref={messagesEndRef} />
              </div>

              <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-4">
                  <Textarea placeholder="Type your reply here..." {...form.register('reply')} />
                  {form.formState.errors.reply && <p className="text-sm text-destructive">{form.formState.errors.reply.message}</p>}
                  <div className="flex justify-end">
                      <Button type="submit" disabled={isSubmitting}>
                          {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                          Send Reply
                      </Button>
                  </div>
              </form>
          </CardContent>
      </Card>
    </div>
  );
}
