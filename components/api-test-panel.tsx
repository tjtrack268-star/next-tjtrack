"use client"

import { useState } from "react"
import { testApiEndpoints, testDatabaseConnection } from "@/lib/connection-test"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, XCircle, Clock, Database, Server } from "lucide-react"

interface TestResult {
  endpoint: string
  name: string
  status?: number
  success: boolean
  error?: string
  responseTime?: number
}

export function ApiTestPanel() {
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<TestResult[]>([])
  const [dbStatus, setDbStatus] = useState<{ success: boolean; error?: string } | null>(null)

  const runTests = async () => {
    setIsLoading(true)
    try {
      const [apiResults, dbResult] = await Promise.all([
        testApiEndpoints(),
        testDatabaseConnection()
      ])
      
      setResults(apiResults)
      setDbStatus(dbResult)
    } catch (error) {
      console.error('Test failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Server className="h-5 w-5" />
          Test de Connectivité API
        </CardTitle>
        <Button onClick={runTests} disabled={isLoading} className="w-fit">
          {isLoading ? (
            <>
              <Clock className="mr-2 h-4 w-4 animate-spin" />
              Test en cours...
            </>
          ) : (
            "Lancer les tests"
          )}
        </Button>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {dbStatus && (
          <>
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              <span className="font-medium">Base de données</span>
              <Badge variant={dbStatus.success ? "default" : "destructive"}>
                {dbStatus.success ? "Connectée" : "Erreur"}
              </Badge>
              {dbStatus.error && (
                <span className="text-sm text-muted-foreground">
                  {dbStatus.error}
                </span>
              )}
            </div>
            <Separator />
          </>
        )}
        
        {results.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Endpoints API</h4>
            {results.map((result, index) => (
              <div key={index} className="flex items-center justify-between p-2 rounded border">
                <div className="flex items-center gap-2">
                  {result.success ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="font-mono text-sm">{result.endpoint}</span>
                  <span className="text-sm text-muted-foreground">
                    {result.name}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  {result.status && (
                    <Badge variant={result.success ? "default" : "destructive"}>
                      {result.status}
                    </Badge>
                  )}
                  {result.error && (
                    <span className="text-xs text-red-500 max-w-xs truncate">
                      {result.error}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {results.length > 0 && (
          <div className="text-sm text-muted-foreground">
            Tests terminés: {results.filter(r => r.success).length}/{results.length} réussis
          </div>
        )}
      </CardContent>
    </Card>
  )
}