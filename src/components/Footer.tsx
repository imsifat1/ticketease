import Link from "next/link";
import { Bus, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function Footer() {
  return (
    <footer className="bg-muted/40 border-t py-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-6xl mx-auto px-4">
        <div className="space-y-4">
          <Link href="/" className="flex items-center space-x-2">
            <Bus className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold font-headline">
              TicketEase
            </span>
          </Link>
          <p className="text-muted-foreground text-sm">
            Your journey starts here. Find and book your bus tickets online with ease!
          </p>
          <div className="flex space-x-4">
            <Link href="#" className="text-muted-foreground hover:text-primary">
              <Facebook className="h-5 w-5" />
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-primary">
              <Twitter className="h-5 w-5" />
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-primary">
              <Instagram className="h-5 w-5" />
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-primary">
              <Linkedin className="h-5 w-5" />
            </Link>
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-4">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/about" className="text-muted-foreground hover:text-primary">About Us</Link></li>
            <li><Link href="/contact" className="text-muted-foreground hover:text-primary">Contact Us</Link></li>
            <li><Link href="/faq" className="text-muted-foreground hover:text-primary">FAQ</Link></li>
            <li><Link href="/bus-operators" className="text-muted-foreground hover:text-primary">Bus Operators</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-4">Legal</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/privacy-policy" className="text-muted-foreground hover:text-primary">Privacy Policy</Link></li>
            <li><Link href="/terms-of-service" className="text-muted-foreground hover:text-primary">Terms of Service</Link></li>
            <li><Link href="/cancellation-policy" className="text-muted-foreground hover:text-primary">Cancellation Policy</Link></li>
          </ul>
        </div>
        
        <div>
          <h4 className="font-semibold mb-4">Newsletter</h4>
          <p className="text-muted-foreground text-sm mb-2">
            Subscribe to our newsletter to get the latest updates and offers.
          </p>
          <div className="flex w-full max-w-sm items-center space-x-2">
            <Input type="email" placeholder="Email" />
            <Button type="submit" className="bg-accent hover:bg-accent/90">Subscribe</Button>
          </div>
        </div>
      </div>

      <div className="mt-12 pt-8 border-t text-center">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} TicketEase. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
