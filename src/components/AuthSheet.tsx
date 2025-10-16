

"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuthSheet } from "@/hooks/use-auth-sheet";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  type ConfirmationResult,
  signOut,
} from "firebase/auth";
import { useState, useEffect }from "react";
import { useAuth } from "@/firebase";

const phoneSchema = z.object({
  phone: z.string().min(11, { message: "Mobile number must be 11 digits." }).max(11, { message: "Mobile number must be 11 digits." }),
});

const otpSchema = z.object({
  otp: z.string().min(6, { message: "OTP must be 6 digits." }),
});

const passwordLoginSchema = z.object({
    phone: z.string().min(11, "Mobile number must be 11 digits.").max(11, "Mobile number must be 11 digits."),
    password: z.string().min(6, "OTP must be 6 digits."),
});

type View = "PHONE_INPUT" | "OTP_INPUT" | "PASSWORD_LOGIN";

export function AuthSheet() {
  const { toast } = useToast();
  const { isOpen, close, onSuccess } = useAuthSheet();
  const [view, setView] = useState<View>("PHONE_INPUT");
  const [isLoading, setIsLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  
  const auth = useAuth();
  const [isDemo, setIsDemo] = useState(false);


  const phoneForm = useForm<z.infer<typeof phoneSchema>>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phone: "" },
  });

  const otpForm = useForm<z.infer<typeof otpSchema>>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: "" },
  });

  const passwordLoginForm = useForm<z.infer<typeof passwordLoginSchema>>({
    resolver: zodResolver(passwordLoginSchema),
    defaultValues: { phone: "", password: "" },
  });

  useEffect(() => {
    if (!auth || !isOpen) return;

    if (!(window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': (response: any) => {
          // reCAPTCHA solved, allow signInWithPhoneNumber.
        }
      });
    }
  }, [auth, isOpen]);


  const onPhoneSubmit = async (values: z.infer<typeof phoneSchema>) => {
    if (!auth) return;
    setIsLoading(true);
    setIsDemo(false);

    if (values.phone === "01234567890") {
        setIsDemo(true);
        setView("OTP_INPUT");
        toast({ title: "Demo Mode", description: "Please use OTP 123456" });
        setIsLoading(false);
        return;
    }

    try {
      const verifier = (window as any).recaptchaVerifier;
      // Firebase expects the phone number in E.164 format. Assuming BD numbers.
      const phoneNumber = `+88${values.phone}`;
      const result = await signInWithPhoneNumber(auth, phoneNumber, verifier);
      setConfirmationResult(result);
      setView("OTP_INPUT");
      toast({ title: "OTP Sent", description: "An OTP has been sent to your mobile." });
    } catch (error: any) {
      console.error("OTP Send Error:", error);
      toast({
        variant: "destructive",
        title: "Failed to Send OTP",
        description: "Please check the number and try again. " + error.message,
      });
      // Reset reCAPTCHA if it fails
      if ((window as any).recaptchaVerifier) {
        (window as any).recaptchaVerifier.render().then((widgetId: any) => {
            if (typeof grecaptcha !== 'undefined' && grecaptcha) {
                grecaptcha.reset(widgetId);
            }
        });
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleLoginSuccess = () => {
    toast({ title: "Login Successful", description: "Welcome back!" });
    close();
    if(onSuccess) onSuccess();
  }


  const onOtpSubmit = async (values: z.infer<typeof otpSchema>) => {
    if (!auth) return;
    setIsLoading(true);

    if(isDemo) {
        if(values.otp === '123456') {
             try {
                // This is a mock sign-in for demo purposes.
                await signOut(auth); 
                
                const mockUser = {
                    uid: 'demo-user-uid',
                    phoneNumber: '+8801234567890',
                    displayName: 'Demo User',
                    photoURL: '',
                    email: null,
                };
                
                // This is a hack to update the auth state for the demo
                if (typeof window !== 'undefined') {
                    document.dispatchEvent(new CustomEvent('demo-user-update', { detail: { currentUser: mockUser } }));
                }
                
                handleLoginSuccess();
             } catch (error) {
                 toast({
                    variant: "destructive",
                    title: "Demo Login Failed",
                    description: "An unexpected error occurred in demo mode.",
                  });
             }
             finally {
                setIsLoading(false);
             }

        } else {
            toast({
                variant: "destructive",
                title: "Invalid Demo OTP",
                description: "Please use OTP 123456 for demo login.",
            });
            setIsLoading(false);
        }
        return;
    }

    if (!confirmationResult) {
        toast({
            variant: "destructive",
            title: "OTP process not started",
            description: "Please enter your phone number first to receive an OTP.",
        });
        setIsLoading(false);
        return;
    }

    try {
      await confirmationResult.confirm(values.otp);
      handleLoginSuccess();
    } catch (error: any) {
       toast({
        variant: "destructive",
        title: "Login Failed",
        description: "Invalid OTP. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onPasswordLoginSubmit = async (values: z.infer<typeof passwordLoginSchema>) => {
      const isDemoNumber = values.phone === '01234567890';
      const otpValue = values.password;
      
      if(isDemoNumber) {
        setIsDemo(true);
        phoneForm.setValue('phone', values.phone);
        await onOtpSubmit({ otp: otpValue });
      } else {
        setIsDemo(false);
        if(!confirmationResult) {
             await onPhoneSubmit({ phone: values.phone });
        }
        await onOtpSubmit({ otp: otpValue });
      }
  };


  const handleOpenChange = (open: boolean) => {
    if (!open) {
      close();
      phoneForm.reset();
      otpForm.reset();
      passwordLoginForm.reset();
      setView('PHONE_INPUT');
      setConfirmationResult(null);
      setIsDemo(false);
    }
  }

  const resendOtp = () => {
    let phone = phoneForm.getValues('phone');
    if (!phone && view === 'PASSWORD_LOGIN') {
      phone = passwordLoginForm.getValues('phone');
    }

    if(phone) {
        onPhoneSubmit({ phone });
    }
  }

  const getTitle = () => {
    switch(view) {
        case "PHONE_INPUT": return "Login with Mobile";
        case "OTP_INPUT": return "Enter OTP";
        case "PASSWORD_LOGIN": return "Login with OTP";
    }
  }
   const getDescription = () => {
    switch(view) {
        case "PHONE_INPUT": return "Please enter your mobile number to receive an OTP.";
        case "OTP_INPUT": return `Enter the 6-digit OTP sent to +88${phoneForm.getValues('phone') || passwordLoginForm.getValues('phone')}`;
        case "PASSWORD_LOGIN": return "Enter your mobile and the OTP you received.";
    }
  }


  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{getTitle()}</SheetTitle>
          <SheetDescription>
            {getDescription()}
          </SheetDescription>
        </SheetHeader>
        <div className="py-8">
            {view === "PHONE_INPUT" ? (
                <form onSubmit={phoneForm.handleSubmit(onPhoneSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="phone">Mobile Number</Label>
                        <Input id="phone" type="tel" placeholder="01XXXXXXXXX" {...phoneForm.register("phone")} />
                        {phoneForm.formState.errors.phone && <p className="text-destructive text-sm">{phoneForm.formState.errors.phone.message}</p>}
                        <p className="text-xs text-muted-foreground pt-2">For demo, use phone: <strong className="text-primary">01234567890</strong></p>
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading || !auth}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Send OTP
                    </Button>
                </form>
            ) : view === 'OTP_INPUT' ? (
                 <form onSubmit={otpForm.handleSubmit(onOtpSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="otp">OTP</Label>
                        <Input id="otp" type="text" placeholder="XXXXXX" {...otpForm.register("otp")} />
                        {otpForm.formState.errors.otp && <p className="text-destructive text-sm">{otpForm.formState.errors.otp.message}</p>}
                         {isDemo && <p className="text-xs text-muted-foreground pt-2">For demo, use OTP: <strong className="text-primary">123456</strong></p>}
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading || !auth}>
                         {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Confirm & Login
                    </Button>
                </form>
            ) : (
                 <form onSubmit={passwordLoginForm.handleSubmit(onPasswordLoginSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="password-phone">Mobile Number</Label>
                        <Input id="password-phone" type="tel" placeholder="01XXXXXXXXX" {...passwordLoginForm.register("phone")} />
                        {passwordLoginForm.formState.errors.phone && <p className="text-destructive text-sm">{passwordLoginForm.formState.errors.phone.message}</p>}
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="password">OTP</Label>
                        <Input id="password" type="text" placeholder="XXXXXX" {...passwordLoginForm.register("password")} />
                         {passwordLoginForm.formState.errors.password && <p className="text-destructive text-sm">{passwordLoginForm.formState.errors.password.message}</p>}
                    </div>
                     <div className="text-xs text-muted-foreground pt-2">For demo, use phone: <strong className="text-primary">01234567890</strong> and OTP: <strong className="text-primary">123456</strong></div>
                    <Button type="submit" className="w-full" disabled={isLoading || !auth}>
                         {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Login
                    </Button>
                </form>
            )}

             <div className="mt-4 text-center text-sm">
                {(view === 'OTP_INPUT' || view === 'PASSWORD_LOGIN') && !isDemo && (
                   <> Didn't receive code? <Button variant="link" onClick={resendOtp} disabled={isLoading} className="p-0 h-auto">Resend OTP</Button> </>
                )}
                {view === 'PHONE_INPUT' && (
                    <p>
                        Already have an OTP? 
                        <Button variant="link" onClick={() => setView('PASSWORD_LOGIN')} className="p-1 h-auto">Login with OTP.</Button>
                    </p>
                )}
                 {view === 'PASSWORD_LOGIN' && (
                    <p>
                        Need to generate a new OTP?
                        <Button variant="link" onClick={() => setView('PHONE_INPUT')} className="p-1 h-auto">Click here</Button>
                    </p>
                )}
            </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
