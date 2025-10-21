'use client';

import type React from 'react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

export function ContactForm() {
  const [formState, setFormState] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormState('submitting');

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setFormState('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch {
      setFormState('error');
    }
  };

  return (
    <Card className="border-primary/20 shadow-md">
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl md:text-2xl text-foreground">
          Get in Touch
        </CardTitle>
        <CardDescription className="text-sm sm:text-base text-muted-foreground">
          Fill out the form below and we&apos;ll get back to you as soon as possible.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 bg-card">
        {formState === 'success' && (
          <Alert
            className="mb-6 border-green-500 text-green-600 bg-green-50 dark:bg-green-950/30 dark:text-green-400"
            role="status"
            aria-live="polite"
          >
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            <AlertTitle className="text-base sm:text-lg">Success!</AlertTitle>
            <AlertDescription className="text-sm sm:text-base">
              Your message has been sent successfully. We&apos;ll get back to you soon.
            </AlertDescription>
          </Alert>
        )}

        {formState === 'error' && (
          <Alert
            className="mb-6 border-red-500 text-red-600 bg-red-50 dark:bg-red-950/30 dark:text-red-400"
            role="alert"
            aria-live="assertive"
          >
            <AlertCircle className="h-4 w-4" aria-hidden="true" />
            <AlertTitle className="text-base sm:text-lg">Error</AlertTitle>
            <AlertDescription className="text-sm sm:text-base">
              There was an error sending your message. Please try again later.
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" aria-label="Contact form">
          <div className="space-y-2">
            <Label htmlFor="name" className="form-label text-foreground">
              Name
            </Label>
            <Input
              id="name"
              name="name"
              autoComplete="name"
              inputMode="text"
              value={formData.name}
              onChange={handleChange}
              required
              className="form-input bg-background border-primary/20 focus:border-primary/50 focus:ring-primary/30"
              aria-required="true"
              aria-invalid={formData.name === ''}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="form-label text-foreground">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              inputMode="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="form-input bg-background border-primary/20 focus:border-primary/50 focus:ring-primary/30"
              aria-required="true"
              aria-invalid={formData.email === ''}
              autoComplete="email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject" className="form-label text-foreground">
              Subject
            </Label>
            <Input
              id="subject"
              name="subject"
              autoComplete="on"
              value={formData.subject}
              onChange={handleChange}
              required
              className="form-input bg-background border-primary/20 focus:border-primary/50 focus:ring-primary/30"
              aria-required="true"
              aria-invalid={formData.subject === ''}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message" className="form-label text-foreground">
              Message
            </Label>
            <Textarea
              id="message"
              name="message"
              rows={5}
              autoComplete="on"
              aria-describedby="message-help"
              value={formData.message}
              onChange={handleChange}
              required
              className="form-input bg-background border-primary/20 focus:border-primary/50 focus:ring-primary/30"
              aria-required="true"
              aria-invalid={formData.message === ''}
            />
            <p id="message-help" className="sr-only">
              メッセージ欄です。500文字以内で入力してください。
            </p>
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleSubmit}
          disabled={formState === 'submitting'}
          className="w-full btn-text focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          aria-busy={formState === 'submitting'}
        >
          {formState === 'submitting' ? 'Sending...' : 'Send Message'}
        </Button>
      </CardFooter>
    </Card>
  );
}

