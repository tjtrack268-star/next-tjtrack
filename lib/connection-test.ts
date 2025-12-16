export async function testBackendConnection() {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://147.93.9.170:8080/api/v1.0"
  
  try {
    console.log('Testing connection to:', API_BASE_URL)
    
    // Test basic connectivity
    const response = await fetch(`${API_BASE_URL}/test-public`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ Backend connection successful:', data)
      return { success: true, data }
    } else {
      console.error('❌ Backend responded with error:', response.status, response.statusText)
      return { success: false, error: `HTTP ${response.status}: ${response.statusText}` }
    }
  } catch (error) {
    console.error('❌ Failed to connect to backend:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      suggestions: [
        '1. Check if Spring Boot backend is running on port 8080',
        '2. Verify PostgreSQL database is running on port 5432',
        '3. Check if CORS is properly configured',
        '4. Ensure no firewall is blocking the connection'
      ]
    }
  }
}

export async function testDatabaseConnection() {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://147.93.9.170:8080/api/v1.0"
  
  try {
    // Test an endpoint that requires database access
    const response = await fetch(`${API_BASE_URL}/ecommerce/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ Database connection successful')
      return { success: true, data }
    } else {
      console.error('❌ Database connection failed:', response.status)
      return { success: false, error: `Database error: ${response.status}` }
    }
  } catch (error) {
    console.error('❌ Database test failed:', error)
    return { success: false, error: 'Database connection failed' }
  }
}