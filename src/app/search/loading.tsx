"use client";

import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Skeleton className="h-9 w-64 mb-2" />
          <Skeleton className="h-5 w-80" />
        </div>
        <Skeleton className="h-10 w-48" />
      </div>

      <div className="relative flex flex-col items-center justify-center p-16 border rounded-lg overflow-hidden bg-background">
        <div className="absolute inset-0 z-0">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-muted"></div>
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 animate-road-lines"></div>
        </div>
        
        <div className="relative z-10 animate-bus-move">
          <div className="w-48 h-24 bg-primary rounded-t-2xl flex items-end justify-center relative shadow-lg p-2">
            <div className="w-full h-full bg-primary/70 absolute top-0 left-0 rounded-t-2xl transform -skew-y-3"></div>
            <div className="w-full h-full flex flex-col justify-between relative">
                <div className="flex justify-between items-center px-2">
                    <div className="w-10 h-6 bg-background/30 rounded-sm border-2 border-primary-foreground/20"></div>
                    <div className="w-10 h-6 bg-background/30 rounded-sm border-2 border-primary-foreground/20"></div>
                    <div className="w-10 h-6 bg-background/30 rounded-sm border-2 border-primary-foreground/20"></div>
                </div>
                 <div className="w-full h-2 bg-accent rounded-full"></div>
            </div>
             <div className="absolute -bottom-2 left-4 w-6 h-4 bg-yellow-300 rounded-sm transform skew-x-12"></div>
             <div className="absolute -bottom-2 right-4 w-6 h-4 bg-red-500 rounded-sm transform -skew-x-12"></div>
          </div>
          <div className="flex justify-between px-2 -mt-4">
            <div className="w-10 h-10 bg-foreground rounded-full animate-wheel-spin border-4 border-muted flex items-center justify-center"><div className="w-4 h-4 bg-muted rounded-full"></div></div>
            <div className="w-10 h-10 bg-foreground rounded-full animate-wheel-spin border-4 border-muted flex items-center justify-center"><div className="w-4 h-4 bg-muted rounded-full"></div></div>
          </div>
        </div>
        <p className="mt-8 text-lg font-semibold animate-pulse">Searching for available buses...</p>
      </div>

      <style jsx>{`
        @keyframes wheel-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-wheel-spin {
          animation: wheel-spin 1s linear infinite;
        }
        @keyframes bus-move {
          0% { transform: translateX(-20px) translateY(2px) scale(0.95) rotate(-1deg); }
          50% { transform: translateX(20px) translateY(-2px) scale(1) rotate(1deg); }
          100% { transform: translateX(-20px) translateY(2px) scale(0.95) rotate(-1deg); }
        }
        .animate-bus-move {
          animation: bus-move 3s ease-in-out infinite;
        }
        @keyframes road-lines {
          from { background-position: 100% 0; }
          to { background-position: 0 0; }
        }
        .animate-road-lines {
          background-image: repeating-linear-gradient(90deg, transparent, transparent 20px, hsl(var(--border)) 20px, hsl(var(--border)) 40px);
          background-size: 60px 100%;
          animation: road-lines 0.5s linear infinite;
        }
      `}</style>
    </div>
  );
}
