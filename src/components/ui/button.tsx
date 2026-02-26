import * as React from "react"
import {Slot} from "@radix-ui/react-slot"
import {cva, type VariantProps} from "class-variance-authority"
import {cn} from "@/lib/utils"

const buttonVariants = cva(
    "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
    {
        variants: {
            variant: {
                default: "bg-zinc-100 text-zinc-900 shadow hover:bg-zinc-200",
                destructive: "bg-red-600 text-zinc-100 shadow-sm hover:bg-red-700",
                outline: "border border-zinc-800 bg-transparent shadow-sm hover:bg-zinc-900",
                secondary: "bg-zinc-800 text-zinc-100 shadow-sm hover:bg-zinc-700",
                ghost: "hover:bg-zinc-900 hover:text-zinc-100",
            },
            size: {
                default: "h-9 px-4 py-2",
                sm: "h-8 rounded-md px-3 text-xs",
                lg: "h-10 rounded-md px-8",
                icon: "h-9 w-9",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
)

export function Button({
                           className,
                           variant,
                           size,
                           asChild = false,
                           ...props
                       }: React.ComponentProps<"button"> & VariantProps<typeof buttonVariants> & {
    asChild?: boolean
}) {
    const Comp = asChild ? Slot : "button"
    return <Comp className={cn(buttonVariants({variant, size, className}))} {...props} />
}