import Image from "next/image";
import RouteSearchForm from "@/components/RouteSearchForm";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function Home() {
  const heroImage = PlaceHolderImages.find((img) => img.id === "hero-background");

  return (
    <div>
      <div className="relative h-[60vh] min-h-[400px] w-full -mb-24">
        {heroImage && (
          <Image
            src={heroImage.imageUrl}
            alt={heroImage.description}
            fill
            className="object-cover"
            data-ai-hint={heroImage.imageHint}
            priority
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/20" />
        <div className="relative z-10 flex h-full flex-col items-center justify-center text-center text-white p-4">
          <h1 className="text-4xl md:text-6xl font-bold font-headline tracking-tight">
            TicketEase
          </h1>
          <p className="mt-4 max-w-2xl text-lg md:text-xl">
            Your journey starts here. Find and book your bus tickets online with ease!
          </p>
        </div>
      </div>
      <div className="relative z-20 w-full max-w-4xl mx-auto px-4 pb-16">
        <RouteSearchForm />
      </div>
      <div className="py-8">
        <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-bold font-headline mb-4">We Accept</h2>
            <Image 
                src="https://bdtickets.com/_next/image?url=%2Fimages%2Fwe-accept-web-v2.webp&w=3840&q=80"
                alt="Accepted payment methods"
                width={1000}
                height={250}
                className="rounded-lg shadow-md inline-block"
            />
        </div>
    </div>
    </div>
  );
}
