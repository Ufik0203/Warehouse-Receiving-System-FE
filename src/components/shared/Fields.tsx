import { useRef, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { z } from "zod";
import {
  Button,
  TextField,
  Label,
  Input,
  FieldError,
  Select,
  ListBox,
} from "@heroui/react";

export function Field({
  label,
  value,
  onChange,
  type = "text",
  error,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: "text" | "number" | "email" | "password";
  error?: string;
  disabled?: boolean;
}) {
  return (
    <TextField
      value={value}
      onChange={onChange}
      isInvalid={!!error}
      isDisabled={disabled}
      className="w-full"
      validationBehavior="aria"
    >
      <Label>{label}</Label>
      <Input type={type} />
      {error && <FieldError>{error}</FieldError>}
    </TextField>
  );
}
export function Choice({
  label,
  value,
  onChange,
  options,
  disabled = false,
  error,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Array<{ value: string; label: string }>;
  disabled?: boolean;
  error?: string;
}) {
  return (
    <Select
      value={value || "__empty__"}
      onChange={(key) => {
        if (typeof key === "string") onChange(key === "__empty__" ? "" : key);
      }}
      isDisabled={disabled}
      isInvalid={!!error}
      className="w-full"
    >
      <Label>{label}</Label>
      <Select.Trigger>
        <Select.Value />
        <Select.Indicator />
      </Select.Trigger>
      <Select.Popover>
        <ListBox>
          {options.map((option) => (
            <ListBox.Item
              key={option.value || "__empty__"}
              id={option.value || "__empty__"}
              textValue={option.label}
            >
              {option.label}
              <ListBox.ItemIndicator />
            </ListBox.Item>
          ))}
        </ListBox>
      </Select.Popover>
      {error && <FieldError>{error}</FieldError>}
    </Select>
  );
}
export type FormField = {
  name: string;
  label: string;
  type?: "text" | "email" | "password";
  options?: Array<{ value: string; label: string }>;
};
export function DataForm<T>({
  fields,
  initial,
  schema,
  onSubmit,
  pending,
  label = "Simpan",
  children,
}: {
  fields: FormField[];
  initial: Record<string, string>;
  schema: z.ZodType<T>;
  onSubmit: (value: T) => Promise<unknown>;
  pending: boolean;
  label?: string;
  children?: ReactNode;
}) {
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const busy = useRef(false);
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (pending || busy.current) return;
    const result = schema.safeParse(values);
    if (!result.success) {
      setErrors(
        Object.fromEntries(
          result.error.issues.map((issue) => [
            String(issue.path[0]),
            issue.message,
          ]),
        ),
      );
      return;
    }
    setErrors({});
    busy.current = true;
    try {
      await onSubmit(result.data);
    } catch {
      /* Mutation state displays the server error. */
    } finally {
      busy.current = false;
    }
  }
  return (
    <form
      onSubmit={(event) => {
        void submit(event);
      }}
      noValidate
      className="space-y-4"
    >
      {fields.map((field) =>
        field.options ? (
          <Choice
            key={field.name}
            label={field.label}
            value={values[field.name] ?? ""}
            onChange={(v) => setValues({ ...values, [field.name]: v })}
            options={field.options}
            error={errors[field.name]}
            disabled={pending}
          />
        ) : (
          <Field
            key={field.name}
            label={field.label}
            type={field.type}
            value={values[field.name] ?? ""}
            onChange={(v) => setValues({ ...values, [field.name]: v })}
            error={errors[field.name]}
            disabled={pending}
          />
        ),
      )}
      {children}
      <Button type="submit" isDisabled={pending}>
        {pending ? "Menyimpan…" : label}
      </Button>
    </form>
  );
}
