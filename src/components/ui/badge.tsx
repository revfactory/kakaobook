import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils/index"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border border-neutral-200 border-transparent px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-neutral-950 focus-visible:ring-neutral-950/50 focus-visible:ring-[3px] aria-invalid:ring-red-500/20 dark:aria-invalid:ring-red-500/40 aria-invalid:border-red-500 transition-[color,box-shadow] overflow-hidden dark:border-neutral-800 dark:focus-visible:border-neutral-300 dark:focus-visible:ring-neutral-300/50 dark:aria-invalid:ring-red-900/20 dark:dark:aria-invalid:ring-red-900/40 dark:aria-invalid:border-red-900",
  {
    variants: {
      variant: {
        default: "bg-neutral-900 text-neutral-50 [a&]:hover:bg-neutral-900/90 dark:bg-neutral-50 dark:text-neutral-900 dark:[a&]:hover:bg-neutral-50/90",
        secondary:
          "bg-neutral-100 text-neutral-900 [a&]:hover:bg-neutral-100/90 dark:bg-neutral-800 dark:text-neutral-50 dark:[a&]:hover:bg-neutral-800/90",
        destructive:
          "bg-red-500 text-white [a&]:hover:bg-red-500/90 focus-visible:ring-red-500/20 dark:focus-visible:ring-red-500/40 dark:bg-red-500/60 dark:bg-red-900 dark:[a&]:hover:bg-red-900/90 dark:focus-visible:ring-red-900/20 dark:dark:focus-visible:ring-red-900/40 dark:dark:bg-red-900/60",
        outline:
          "border-neutral-200 text-neutral-950 [a&]:hover:bg-neutral-100 [a&]:hover:text-neutral-900 dark:border-neutral-800 dark:text-neutral-50 dark:[a&]:hover:bg-neutral-800 dark:[a&]:hover:text-neutral-50",
        ghost: "[a&]:hover:bg-neutral-100 [a&]:hover:text-neutral-900 dark:[a&]:hover:bg-neutral-800 dark:[a&]:hover:text-neutral-50",
        link: "text-neutral-900 underline-offset-4 [a&]:hover:underline dark:text-neutral-50",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
