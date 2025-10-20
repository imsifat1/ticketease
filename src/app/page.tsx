import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Bus, CreditCard, Ticket } from 'lucide-react';
import RouteSearchForm from '@/components/route-search-form';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function Home() {
  const heroImage = PlaceHolderImages.find((img) => img.id === 'hero-bus');

  const howItWorksSteps = [
    {
      icon: <Search className="w-10 h-10 text-primary" />,
      title: 'Search Your Route',
      description: 'Enter your departure & arrival locations and travel dates.',
    },
    {
      icon: <Bus className="w-10 h-10 text-primary" />,
      title: 'Choose Your Bus',
      description: 'Select your preferred bus operator and desired seats.',
    },
    {
      icon: <CreditCard className="w-10 h-10 text-primary" />,
      title: 'Pay Securely',
      description: 'Complete your booking with our secure payment options.',
    },
    {
      icon: <Ticket className="w-10 h-10 text-primary" />,
      title: 'Get Your Ticket',
      description: 'Receive your e-ticket instantly via email and SMS.',
    },
  ];

  return (
    <div className="flex flex-col items-center">
      <section className="relative w-full h-[50vh] md:h-[60vh] flex items-center justify-center text-center text-white">
        {heroImage && (
          <Image
            src={heroImage.imageUrl}
            alt={heroImage.description}
            data-ai-hint={heroImage.imageHint}
            fill
            className="object-cover"
            priority
          />
        )}
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 px-4">
          <h1 className="text-4xl md:text-6xl font-headline font-bold drop-shadow-lg">
            Your Journey, Your Way
          </h1>
          <p className="mt-4 text-lg md:text-xl max-w-2xl mx-auto drop-shadow-md">
            Discover the easiest way to book bus tickets online across Bangladesh.
          </p>
        </div>
      </section>

      <div className="relative z-20 -mt-24 md:-mt-32 w-full max-w-4xl px-4">
        <RouteSearchForm />
      </div>

      <section className="w-full py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-headline font-bold mb-4">How It Works</h2>
          <p className="text-muted-foreground mb-12 max-w-2xl mx-auto">
            Booking your bus ticket is just a few clicks away. Follow these simple steps.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorksSteps.map((step, index) => (
              <Card key={index} className="text-center border-none shadow-none bg-transparent">
                <CardHeader className="flex items-center justify-center">
                  <div className="bg-accent rounded-full p-4 mb-4">
                    {step.icon}
                  </div>
                  <CardTitle className="font-headline">{step.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
