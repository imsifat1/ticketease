'use client';

import { useState, useEffect, useRef } from 'react';
import { useUser } from '@/firebase/auth/use-user';
import { useRouter, useParams } from 'next/navigation';
import { Loader2, Send, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import type { Complaint, ComplaintMessage } from '@/lib/types';
import { collection, doc, getDoc, getFirestore, updateDoc } from 'firebase/firestore';

export default function ClientComplaintPage() {
    const [complaint, setComplaint] = useState<Complaint | null>(null);
    const [reply, setReply] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const params = useParams();
    const router = useRouter();
    const { user } = useUser();
    const complaintId = params.id as string;
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (!user) {
            router.push('/admin/login');
            return;
        }

        const fetchComplaint = async () => {
            setLoading(true);
            try {
                const db = getFirestore();
                const docRef = doc(collection(db, 'complaints'), complaintId);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setComplaint({ id: docSnap.id, ...docSnap.data() } as Complaint);
                }
            } catch (error) {
                console.error('Error fetching complaint:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchComplaint();
    }, [complaintId, user, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!reply.trim() || !complaint) return;

        setSubmitting(true);
        try {
            const db = getFirestore();
            const docRef = doc(collection(db, 'complaints'), complaintId);
            
            const newMessage: Omit<ComplaintMessage, 'id'> = {
                text: reply,
                sender: 'admin',
                timestamp: new Date().toISOString()
            };
            
            await updateDoc(docRef, {
                status: 'Answered',
                messages: [...(complaint.messages || []), { ...newMessage, id: Date.now().toString() }]
            });

            router.push('/admin/reports');
        } catch (error) {
            console.error('Error updating complaint:', error);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        );
    }

    if (!complaint) {
        return (
            <div className="container py-8">
                <h1 className="text-2xl font-bold mb-4">Complaint Not Found</h1>
                <p className="text-muted-foreground">The requested complaint could not be found.</p>
            </div>
        );
    }

    return (
        <div className="container max-w-4xl py-8">
            <Button
                variant="ghost"
                className="mb-6"
                onClick={() => router.back()}
            >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
            </Button>

            <Card>
                <CardHeader>
                    <CardTitle>Complaint Details</CardTitle>
                    <CardDescription>Review and respond to customer complaint</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-sm font-medium text-muted-foreground mb-1">Customer Name</h3>
                            <p className="text-lg">{complaint.title}</p>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-muted-foreground mb-1">Status</h3>
                            <p className="text-lg capitalize">{complaint.status}</p>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-muted-foreground mb-1">Created At</h3>
                            <p className="text-lg">{new Date(complaint.createdAt).toLocaleString()}</p>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-muted-foreground mb-1">Description</h3>
                            <p className="text-lg whitespace-pre-wrap">{complaint.description}</p>
                        </div>
                        
                        {complaint.status === 'Open' && (
                            <form onSubmit={handleSubmit} className="space-y-4 mt-8">
                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Your Response</h3>
                                    <Textarea
                                        ref={textareaRef}
                                        value={reply}
                                        onChange={(e) => setReply(e.target.value)}
                                        placeholder="Type your response here..."
                                        className="min-h-[120px]"
                                    />
                                </div>
                                <Button 
                                    type="submit" 
                                    className="w-full"
                                    disabled={!reply.trim() || submitting}
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Sending Response...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-4 h-4 mr-2" />
                                            Send Response
                                        </>
                                    )}
                                </Button>
                            </form>
                        )}

                        {complaint.status === 'Answered' && complaint.messages.length > 0 && (
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground mb-1">Messages</h3>
                                <div className="space-y-4">
                                    {complaint.messages.map(message => (
                                        <div key={message.id} className={`p-4 rounded-lg ${message.sender === 'admin' ? 'bg-primary/10 ml-4' : 'bg-muted mr-4'}`}>
                                            <p className="text-sm text-muted-foreground mb-1">{new Date(message.timestamp).toLocaleString()}</p>
                                            <p className="whitespace-pre-wrap">{message.text}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}