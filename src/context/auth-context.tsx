"use client";

import React, { createContext, useState, ReactNode, useEffect, useTransition, useContext } from 'react';
import { useToast } from '@/hooks/use-toast';
import { sendOtp } from '@/ai/flows/send-otp-flow';
import { Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface User {
  mobileNumber: string;
}

interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  isLoginDialogOpen: boolean;
  setLoginDialogOpen: (isOpen: boolean) => void;
}

export const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  user: null,
  login: () => {},
  logout: () => {},
  isLoginDialogOpen: false,
  setLoginDialogOpen: () => {},
});

// Custom hook to use the AuthContext
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};


function LoginDialog() {
  const { isLoginDialogOpen, setLoginDialogOpen, login } = useContext(AuthContext);
  const [step, setStep] = useState<'mobile' | 'otp'>('mobile');
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  
  const isDevMode = !process.env.NEXT_PUBLIC_TWILIO_ACCOUNT_SID || process.env.NEXT_PUBLIC_TWILIO_ACCOUNT_SID.startsWith('ACxxx');

  const handleOpenChange = (isOpen: boolean) => {
    setLoginDialogOpen(isOpen);
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
        const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
        setGeneratedOtp(newOtp);
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
  
  const handleLoginSuccess = () => {
    login({ mobileNumber });
    toast({
      title: 'Login Successful!',
      description: 'You can now proceed with your booking.',
    });
    setLoginDialogOpen(false);
  }

  const handleLogin = () => {
    if (otp === generatedOtp) {
        handleLoginSuccess();
    } else {
        toast({
            title: 'Invalid OTP',
            description: 'The OTP you entered is incorrect. Please try again.',
            variant: 'destructive',
        });
    }
  };

  return (
    <Dialog open={isLoginDialogOpen} onOpenChange={handleOpenChange}>
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


export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoginDialogOpen, setLoginDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.error("Could not access localStorage", error);
    }
    setIsLoading(false);
  }, []);
  
  const login = (userData: User) => {
    try {
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
       console.error("Could not access localStorage", error);
    }
    setUser(userData);
    setIsLoggedIn(true);
  };

  const logout = () => {
    try {
      localStorage.removeItem('user');
    } catch (error) {
      console.error("Could not access localStorage", error);
    }
    setUser(null);
    setIsLoggedIn(false);
  };
  
  if (isLoading) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout, isLoginDialogOpen, setLoginDialogOpen }}>
      {children}
      <LoginDialog />
    </AuthContext.Provider>
  );
};
