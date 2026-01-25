import type { InputHTMLAttributes } from "react";

import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  id: string;
};

export function TextField({ label, id, ...props }: TextFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} {...props} />
    </div>
  );
}
