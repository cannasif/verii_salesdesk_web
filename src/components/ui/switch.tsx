import * as React from 'react';
import * as SwitchPrimitive from '@radix-ui/react-switch';

import { cn } from '@/lib/utils';

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        'peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 p-0.5 shadow-sm transition-colors outline-none',
        'focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50',
        'data-[state=checked]:border-[var(--crm-brand-primary,hsl(var(--primary)))] data-[state=checked]:bg-[var(--crm-brand-primary,hsl(var(--primary)))]',
        'data-[state=unchecked]:border-slate-500 data-[state=unchecked]:bg-slate-400',
        'dark:data-[state=unchecked]:border-white/20 dark:data-[state=unchecked]:bg-slate-600',
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          'pointer-events-none block size-5 rounded-full bg-white shadow-md ring-1 ring-black/15 transition-transform',
          'data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0',
          'data-[state=checked]:ring-white/40',
          'dark:bg-white dark:ring-white/20'
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
