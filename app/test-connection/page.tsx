"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { testBackendConnection, testDatabaseConnection } from "@/lib/connection-test"

export default function TestConnectionPage() {
  const [backendResult, setBackendResult] = useState<any>(null)
  const [dbResult, setDbResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testBackend = async () => {
    setLoading(true)
    const result = await testBackendConnection()
    setBackendResult(result)
    setLoading(false)
  }

  const testDatabase = async () => {
    setLoading(true)
    const result = await testDatabaseConnection()
    setDbResult(result)
    setLoading(false)
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Backend Connection Test</h1>
      
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Backend Server Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={testBackend} disabled={loading}>
              Test Backend Connection
            </Button>
            
            {backendResult && (
              <div className={`p-4 rounded ${backendResult.success ? 'bg-green-100' : 'bg-red-100'}`}>
                <h3 className="font-semibold">
                  {backendResult.success ? '✅ Success' : '❌ Failed'}
                </h3>
                <pre className="text-sm mt-2 overflow-auto">
                  {JSON.stringify(backendResult, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Database Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={testDatabase} disabled={loading}>
              Test Database Connection
            </Button>
            
            {dbResult && (
              <div className={`p-4 rounded ${dbResult.success ? 'bg-green-100' : 'bg-red-100'}`}>
                <h3 className="font-semibold">
                  {dbResult.success ? '✅ Success' : '❌ Failed'}
                </h3>
                <pre className="text-sm mt-2 overflow-auto">
                  {JSON.stringify(dbResult, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configuration Info</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p><strong>API URL:</strong> {process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1.0"}</p>
            <p><strong>Expected Backend:</strong> Spring Boot on port 8080</p>
            <p><strong>Expected Database:</strong> PostgreSQL on port 5432</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Troubleshooting Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Start PostgreSQL database server</li>
            <li>Create database: <code className="bg-gray-100 px-1 rounded">createdb tjtrack_dev</code></li>
            <li>Start Spring Boot backend: <code className="bg-gray-100 px-1 rounded">mvn spring-boot:run</code></li>
            <li>Check backend logs for any errors</li>
            <li>Verify CORS configuration allows localhost:3000</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}