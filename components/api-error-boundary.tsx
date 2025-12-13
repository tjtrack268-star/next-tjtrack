"use client"

import { Component, ReactNode } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCw } from "lucide-react"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ApiErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('API Error Boundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <Alert variant="destructive" className="m-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Erreur de connexion API</AlertTitle>
          <AlertDescription className="mt-2">
            <p className="mb-3">
              Une erreur s'est produite lors de la communication avec le serveur.
            </p>
            <p className="text-sm text-muted-foreground mb-3">
              {this.state.error?.message || "Erreur inconnue"}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                this.setState({ hasError: false, error: undefined })
                window.location.reload()
              }}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Réessayer
            </Button>
          </AlertDescription>
        </Alert>
      )
    }

    return this.props.children
  }
}