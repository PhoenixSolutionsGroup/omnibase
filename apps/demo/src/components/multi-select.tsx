"use client";

/**
 * MultiSelect: shadcn-style multi select. Items come in as a prop, the selection is shown
 * as removable badges, with client-side search, optional limit and a react-hook-form wrapper.
 *
 * Requires shadcn components: badge, command, label, popover
 *   npx shadcn@latest add badge command label popover
 * plus lucide-react and react-hook-form.
 *
 * The form value is an array of strings (string[]).
 *
 * Usage:
 *
 * const items = [
 *   { value: "apple", label: "Apple" },
 *   { value: "banana", label: "Banana" },
 * ]
 *
 * <FormMultiSelect control={control} name="fruits" label="Fruits" items={items} limit={3} />
 *
 * Without react-hook-form:
 *
 * <MultiSelect items={items} value={value} onChange={setValue} />
 */

import * as React from "react";
import { Check, ChevronDown, X } from "lucide-react";
import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
} from "react-hook-form";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface MultiSelectItem {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface MultiSelectProps {
  items: MultiSelectItem[];
  value: string[];
  onChange: (value: string[]) => void;
  /** Maximum number of selectable items. */
  limit?: number;
  /** Show a search input inside the popover. Default: true. */
  searchable?: boolean;
  id?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  invalid?: boolean;
  className?: string;
  /** Called when the popover closes (wire to RHF's field.onBlur). */
  onBlur?: () => void;
}

export default function MultiSelect({
  items,
  value,
  onChange,
  limit,
  searchable = true,
  id,
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  emptyText = "No results found.",
  disabled,
  invalid,
  className,
  onBlur,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);

  const labelOf = React.useCallback(
    (v: string) => items.find((i) => i.value === v)?.label ?? v,
    [items],
  );

  const limitReached = limit != null && value.length >= limit;

  const handleOpenChange = (next: boolean) => {
    if (disabled && next) return;
    setOpen(next);
    if (!next) onBlur?.();
  };

  const toggle = (item: MultiSelectItem) => {
    const isSelected = value.includes(item.value);
    if (!isSelected && limitReached) return;
    onChange(
      isSelected
        ? value.filter((v) => v !== item.value)
        : [...value, item.value],
    );
  };

  const remove = (v: string) => onChange(value.filter((x) => x !== v));

  const onTriggerKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
    }
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      {/* A div (not a button) so the badges can contain their own remove buttons */}
      <PopoverTrigger asChild>
        <div
          id={id}
          role="combobox"
          aria-expanded={open}
          aria-invalid={invalid || undefined}
          aria-disabled={disabled || undefined}
          tabIndex={disabled ? -1 : 0}
          onKeyDown={onTriggerKeyDown}
          className={cn(
            "flex min-h-9 w-full cursor-pointer items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 py-1.5 text-sm shadow-xs outline-none transition-[color,box-shadow]",
            "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
            "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
            "aria-disabled:pointer-events-none aria-disabled:opacity-50",
            className,
          )}
        >
          <div className="flex flex-1 flex-wrap items-center gap-1">
            {value.length === 0 ? (
              <span className="text-muted-foreground">{placeholder}</span>
            ) : (
              value.map((v) => (
                <Badge key={v} variant="secondary" className="gap-1 pr-1">
                  <span className="max-w-48 truncate">{labelOf(v)}</span>
                  <button
                    type="button"
                    aria-label={`Remove ${labelOf(v)}`}
                    disabled={disabled}
                    className="rounded-sm opacity-60 hover:opacity-100 focus-visible:opacity-100"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      remove(v);
                    }}
                  >
                    <X className="size-3" />
                  </button>
                </Badge>
              ))
            )}
          </div>
          <ChevronDown className="size-4 shrink-0 opacity-50" />
        </div>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className="w-[var(--radix-popover-trigger-width)] min-w-[8rem] p-0"
      >
        {/* Match on the label, not on the value/id */}
        <Command
          filter={(_value, search, keywords) =>
            (keywords ?? [])
              .join(" ")
              .toLowerCase()
              .includes(search.toLowerCase())
              ? 1
              : 0
          }
        >
          {searchable && <CommandInput placeholder={searchPlaceholder} />}
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {items.map((item) => {
                const isSelected = value.includes(item.value);
                return (
                  <CommandItem
                    key={item.value}
                    value={item.value}
                    keywords={[item.label]}
                    disabled={item.disabled || (!isSelected && limitReached)}
                    onSelect={() => toggle(item)}
                    className="relative pr-8"
                  >
                    <span className="truncate">{item.label}</span>
                    {isSelected && (
                      <span className="absolute right-2 flex size-3.5 items-center justify-center">
                        <Check className="size-4" />
                      </span>
                    )}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>

          {limit != null && (
            <div className="border-t px-3 py-1.5 text-xs text-muted-foreground">
              {value.length} / {limit} selected
            </div>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
}

/* -------------------------------------------------------------------------- */
/* react-hook-form wrapper                                                    */
/* -------------------------------------------------------------------------- */

type FormMultiSelectProps<T extends FieldValues> = Omit<
  MultiSelectProps,
  "value" | "onChange" | "onBlur" | "invalid" | "id"
> & {
  control: Control<T>;
  name: Path<T>;
  label?: string;
};

export function FormMultiSelect<T extends FieldValues>({
  control,
  name,
  label,
  ...props
}: FormMultiSelectProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <div className="grid gap-2">
          {label && <Label htmlFor={name}>{label}</Label>}
          <MultiSelect
            {...props}
            id={name}
            value={(field.value as string[] | undefined) ?? []}
            onChange={field.onChange}
            onBlur={field.onBlur}
            invalid={!!fieldState.error}
          />
          {fieldState.error?.message && (
            <p className="text-sm text-destructive">
              {fieldState.error.message}
            </p>
          )}
        </div>
      )}
    />
  );
}
