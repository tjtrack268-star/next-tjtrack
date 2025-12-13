"use client"

import { Component, ReactNode } from "react"

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class DebugWrapper extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    console.error('DebugWrapper caught error:', error)
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('DebugWrapper componentDidCatch:', error.message, 'Stack:', error.stack)
    // Don't log errorInfo as it might contain objects that could cause rendering issues
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 border border-red-500 bg-red-50 text-red-700">
          <h3>Erreur de rendu détectée</h3>
          <p>{this.state.error?.message}</p>
          <button 
            onClick={() => this.setState({ hasError: false, error: undefined })}
            className="mt-2 px-3 py-1 bg-red-600 text-white rounded"
          >
            Réessayer
          </button>
        </div>
      )
    }

    return this.props.children
  }
}