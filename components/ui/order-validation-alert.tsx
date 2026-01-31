import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, CheckCircle, Info } from "lucide-react"

interface OrderValidationAlertProps {
  type: 'warning' | 'error' | 'info' | 'success'
  title?: string
  message: string
  className?: string
}

export function OrderValidationAlert({ type, title, message, className }: OrderValidationAlertProps) {
  const getIcon = () => {
    switch (type) {
      case 'warning':
      case 'error':
        return <AlertTriangle className="h-4 w-4" />
      case 'success':
        return <CheckCircle className="h-4 w-4" />
      case 'info':
      default:
        return <Info className="h-4 w-4" />
    }
  }

  const getVariant = () => {
    switch (type) {
      case 'error':
        return 'destructive'
      default:
        return 'default'
    }
  }

  return (
    <Alert variant={getVariant() as any} className={className}>
      {getIcon()}
      <AlertDescription>
        {title && <strong>{title}: </strong>}
        {message}
      </AlertDescription>
    </Alert>
  )
}
