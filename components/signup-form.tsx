"use client";

import { useState } from "react";
import { ArrowRight, Loader2, Lock, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QuestionnaireData } from "@/components/questionnaire-form";

interface SignupFormProps {
  userData: QuestionnaireData;
  onComplete: () => void;
  onToggleMode: () => void;
  isLogin: boolean;
}

export function SignupForm({
  userData,
  onComplete,
  onToggleMode,
  isLogin,
}: SignupFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    // Fake network delay to mimic signup/login before showing the dashboard.
    await new Promise((resolve) => setTimeout(resolve, 700));

    setLoading(false);
    onComplete();
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-xl border-0 bg-card">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-serif text-foreground">
          {isLogin ? "Welcome Back" : "Create Your Account"}
        </CardTitle>
        <CardDescription>
          {isLogin
            ? "Sign in to continue tracking"
            : "Save your progress and track your journey"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
                minLength={6}
                required
              />
            </div>
          </div>
          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                {isLogin ? "Sign In" : "Create Account"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={onToggleMode}
            className="text-sm text-primary hover:underline"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
        {!isLogin && (
          <div className="mt-6 rounded-lg bg-accent text-accent-foreground p-4 text-sm text-left">
            We&apos;ll start you off with your current metrics:
            <div className="mt-2 grid grid-cols-2 gap-2 text-foreground">
              <span className="text-muted-foreground">Age</span>
              <span className="font-semibold">{userData.age}</span>
              <span className="text-muted-foreground">Height</span>
              <span className="font-semibold">{userData.height} cm</span>
              <span className="text-muted-foreground">Starting weight</span>
              <span className="font-semibold">{userData.weight} kg</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
