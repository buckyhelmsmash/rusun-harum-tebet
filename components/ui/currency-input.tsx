"use client";

import type * as React from "react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import { cn } from "@/lib/utils";

interface CurrencyInputProps
  extends Omit<React.ComponentProps<"input">, "type"> {
  suffix?: string;
}

function CurrencyInput({ className, suffix, ...props }: CurrencyInputProps) {
  return (
    <InputGroup className={cn(className)}>
      <InputGroupAddon align="inline-start">
        <InputGroupText className="font-medium">Rp</InputGroupText>
      </InputGroupAddon>
      <InputGroupInput type="number" min={0} {...props} />
      {suffix && (
        <InputGroupAddon align="inline-end">
          <InputGroupText className="text-xs">{suffix}</InputGroupText>
        </InputGroupAddon>
      )}
    </InputGroup>
  );
}

export { CurrencyInput };
export type { CurrencyInputProps };
