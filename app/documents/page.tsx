"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Header } from "@/components/layout/header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import DocumentViewer from "@/components/profile/DocumentViewer"
import DocumentUpload from "@/components/profile/DocumentUpload"
import { FileText, Upload } from "lucide-react"

export default function DocumentsPage() {
  const { user } = useAuth()
  const [refreshKey, setRefreshKey] = useState(0)

  const profileType = user?.roles?.includes("LIVREUR") 
    ? "LIVREUR" 
    : user?.roles?.includes("COMMERCANT") 
    ? "COMMERCANT" 
    : null

  if (!user || !profileType) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-muted-foreground">
              Cette section est réservée aux livreurs et commerçants.
            </p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Mes Documents</h1>

          <Tabs defaultValue="view" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="view">
                <FileText className="h-4 w-4 mr-2" />
                Voir
              </TabsTrigger>
              <TabsTrigger value="upload">
                <Upload className="h-4 w-4 mr-2" />
                Uploader
              </TabsTrigger>
            </TabsList>

            <TabsContent value="view">
              <DocumentViewer 
                key={refreshKey}
                userId={parseInt(user.userId)} 
                profileType={profileType}
              />
            </TabsContent>

            <TabsContent value="upload">
              <DocumentUpload 
                userEmail={user.email}
                profileType={profileType}
                onComplete={() => setRefreshKey(prev => prev + 1)}
              />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
