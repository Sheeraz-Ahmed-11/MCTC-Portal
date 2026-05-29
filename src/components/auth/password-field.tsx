"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getPasswordStrength,
  getPasswordStrengthBar,
  getPasswordStrengthLabel,
  type PasswordStrength,
} from "@/lib/password-strength";
import { cn } from "@/lib/utils";

const strengthStyles: Record<Exclude<PasswordStrength, "empty">, string> = {
  weak: "text-red-400",
  fair: "text-amber-400",
  strong: "text-emerald-400",
};

type PasswordFieldProps = {
  id: string;
  name: string;
  label: string;
  autoComplete?: string;
  required?: boolean;
  minLength?: number;
  showStrength?: boolean;
  value?: string;
  onValueChange?: (value: string) => void;
  onFocus?: () => void;
};

export function PasswordField({
  id,
  name,
  label,
  autoComplete,
  required,
  minLength,
  showStrength = false,
  value,
  onValueChange,
  onFocus,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const strength = showStrength ? getPasswordStrength(value ?? "") : "empty";
  const strengthLabel = getPasswordStrengthLabel(strength);
  const strengthBar = getPasswordStrengthBar(strength);

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          required={required}
          minLength={minLength}
          value={value}
          onChange={(event) => onValueChange?.(event.target.value)}
          onFocus={onFocus}
          className="rounded-none pr-10"
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
      {showStrength && strength !== "empty" ? (
        <div className="space-y-1.5">
          <div className="h-1.5 w-full overflow-hidden bg-white/10">
            <div
              className={cn(
                "h-full transition-all duration-300 ease-out",
                strengthBar.barClass,
              )}
              style={{ width: strengthBar.width }}
            />
          </div>
          {strengthLabel ? (
            <p className={cn("text-xs font-medium", strengthStyles[strength])}>
              {strengthLabel}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
