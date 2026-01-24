import { Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="py-6 mt-auto border-t border-border bg-background/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 text-center">
        <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
          Developed with{' '}
          <Heart className="h-4 w-4 text-destructive fill-destructive animate-pulse-soft" />{' '}
          by{' '}
          <a
            href="https://ahmed-hrabi.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-primary hover:underline transition-colors"
          >
            Ahmed
          </a>
        </p>
      </div>
    </footer>
  );
}
