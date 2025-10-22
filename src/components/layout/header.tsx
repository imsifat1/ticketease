"use client";

import Link from 'next/link';
import { Bus, Ship, Hotel, Zap, Phone, User, LogOut, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useContext, useState, useTransition } from 'react';
import { AuthContext } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { sendOtp } from '@/ai/flows/send-otp-flow';


function LoginDialog({ open, onOpenChange, onLoginSuccess }: { open: boolean, onOpenChange: (open: boolean) => void, onLoginSuccess: () => void }) {
  const [step, setStep] = useState<'mobile' | 'otp'>('mobile');
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  
  const isDevMode = !process.env.NEXT_PUBLIC_TWILIO_ACCOUNT_SID || process.env.NEXT_PUBLIC_TWILIO_ACCOUNT_SID.startsWith('ACxxx');

  const handleOpenChange = (isOpen: boolean) => {
    onOpenChange(isOpen);
    if (!isOpen) {
      // Reset state when dialog is closed
      setTimeout(() => {
        setStep('mobile');
        setMobileNumber('');
        setOtp('');
        setGeneratedOtp('');
      }, 300);
    }
  };

  const handleSendOtp = () => {
    const mobileRegex = /^01[0-9]{9}$/;
    if (!mobileRegex.test(mobileNumber)) {
      toast({
        title: 'Invalid Mobile Number',
        description: 'Please enter a valid 11-digit Bangladeshi mobile number starting with 01.',
        variant: 'destructive',
      });
      return;
    }
    
    startTransition(async () => {
        // Generate a 6-digit OTP
        const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
        setGeneratedOtp(newOtp);

        // Twilio expects E.164 format, so we'll prepend +88
        const formattedNumber = `+88${mobileNumber}`;

        const result = await sendOtp({ to: formattedNumber, otp: newOtp });

        if (result.success) {
            toast({
                title: 'OTP Sent',
                description: 'An OTP has been sent to your mobile number.',
            });
            setStep('otp');
        } else {
            toast({
                title: 'Failed to Send OTP',
                description: result.error || 'Please try again later.',
                variant: 'destructive',
            });
        }
    });
  };

  const handleLogin = () => {
    // In a real app, you would verify the OTP here against a server-side value.
    // For now, we'll just check against the one we "sent".
    if (otp === generatedOtp) {
        onLoginSuccess();
    } else {
        toast({
            title: 'Invalid OTP',
            description: 'The OTP you entered is incorrect. Please try again.',
            variant: 'destructive',
        });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Login with Mobile</DialogTitle>
          <DialogDescription>
            {step === 'mobile'
              ? 'Please enter your mobile number to receive an OTP.'
              : `We've sent an OTP to ${mobileNumber}. Please enter it below.`}
          </DialogDescription>
        </DialogHeader>
        {step === 'mobile' ? (
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="mobile" className="text-right">
                Mobile
              </Label>
              <Input
                id="mobile"
                type="tel"
                placeholder="01..."
                className="col-span-3"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                maxLength={11}
              />
            </div>
            <Button onClick={handleSendOtp} className="w-full" disabled={!mobileNumber || isPending}>
              {isPending ? <Loader2 className="animate-spin" /> : 'Send OTP'}
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="otp" className="text-right">
                OTP
              </Label>
              <Input 
                id="otp" 
                type="text" 
                placeholder="123456" 
                className="col-span-3"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
              />
            </div>
             {isDevMode && generatedOtp && (
              <div className="text-center text-sm text-muted-foreground bg-muted p-2 rounded-md">
                Demo OTP: <span className="font-bold text-foreground">{generatedOtp}</span>
              </div>
            )}
            <div className="flex flex-col gap-2">
              <Button onClick={handleLogin} className="w-full" disabled={!otp || isPending}>
                 {isPending ? <Loader2 className="animate-spin" /> : 'Verify & Login'}
              </Button>
              <Button variant="link" size="sm" onClick={() => setStep('mobile')} className="text-muted-foreground">
                Change mobile number
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}


const Header = () => {
  const { isLoggedIn, login, logout, isLoginDialogOpen, setLoginDialogOpen } = useContext(AuthContext);
  const { toast } = useToast();
  const router = useRouter();

  const handleLoginClick = () => {
    setLoginDialogOpen(true);
  };
  
  const handleLoginSuccess = () => {
    login(); // Use context login function
    toast({
      title: 'Login Successful!',
      description: 'You can now proceed with your booking.',
    });
    setLoginDialogOpen(false);
  };


  return (
    <>
    <header className="bg-background/80 backdrop-blur-sm sticky top-0 z-40 border-b">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold font-headline text-primary">
          <Bus className="w-7 h-7" />
          <span>Shohoz Yatra</span>
        </Link>
        
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
          <Link href="/" className="flex items-center gap-2 text-foreground/80 hover:text-primary transition-colors">
            <Bus className="w-5 h-5" />
            <span>Bus</span>
          </Link>
          <Link href="#" className="flex items-center gap-2 text-foreground/80 hover:text-primary transition-colors">
            <Ship className="w-5 h-5" />
            <span>Ship</span>
          </Link>
          <Link href="#" className="flex items-center gap-2 text-foreground/80 hover:text-primary transition-colors">
            <Hotel className="w-5 h-5" />
            <span>Hotel</span>
          </Link>
          <Link href="#" className="flex items-center gap-2 text-foreground/80 hover:text-primary transition-colors">
            <Zap className="w-5 h-5" />
            <span>Flash Deals</span>
          </Link>
        </nav>

        <div className="flex items-center gap-3">
           <Button variant="destructive">
            <Phone className="w-4 h-4 mr-2" />
            Hotline: 16374
          </Button>
          {isLoggedIn && (
            <Button asChild variant="warning">
              <Link href="/my-bookings">My Bookings</Link>
            </Button>
          )}
          {isLoggedIn ? (
             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    <span>My Account</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>User Name</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/my-bookings">My Tickets</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="outline" onClick={handleLoginClick}>
              Login
            </Button>
          )}
        </div>
      </div>
    </header>
     <LoginDialog
        open={isLoginDialogOpen}
        onOpenChange={setLoginDialogOpen}
        onLoginSuccess={handleLoginSuccess}
      />
    </>
  );
};

export default Header;
