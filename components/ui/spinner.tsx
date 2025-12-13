import type React from "react"
import { Loader2Icon } from "lucide-react"

import { cn } from "@/lib/utils"

interface SpinnerProps extends React.ComponentProps<"svg"> {
  size?: "sm" | "md" | "lg"
}

const sizeClasses = {
  sm: "size-4",
  md: "size-6",
  lg: "size-10",
}

function Spinner({ className, size = "md", ...props }: SpinnerProps) {
  return (
    <Loader2Icon
      role="status"
      aria-label="Loading"
      className={cn("animate-spin", sizeClasses[size], className)}
      {...props}
    />
  )
}

export { Spinner }
