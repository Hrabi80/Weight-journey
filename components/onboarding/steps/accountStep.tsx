"use client";

import { ArrowRight, Lock, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { StepFormProps, StepNavProps } from "./types";

type AccountStepProps = StepFormProps &
  Required<Pick<StepNavProps, "onBack">> & {
    submitting: boolean;
  };

/**
 * Step 5: Account creation (email/password).
 * Junior note: the actual submit happens at the form level (type="submit").
 * This step only renders fields + submit button.
 */
export function AccountStep({ register, errors, onBack, submitting }: AccountStepProps) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right duration-300">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 rounded-full bg-primary/10">
          <User className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Create your account</h3>
          <p className="text-sm text-muted-foreground">Save your progress and continue tracking</p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            className="pl-10"
            {...register("email")}
          />
        </div>
        {errors.email?.message && (
          <p className="text-sm text-destructive mt-1">{String(errors.email.message)}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            className="pl-10"
            minLength={6}
            {...register("password")}
          />
        </div>
        {errors.password?.message && (
          <p className="text-sm text-destructive mt-1">{String(errors.password.message)}</p>
        )}
      </div>

      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={onBack} className="flex-1">
          Back
        </Button>
        <Button type="submit" className="flex-1" disabled={submitting}>
          {submitting ? "Creating..." : "Create account"}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
