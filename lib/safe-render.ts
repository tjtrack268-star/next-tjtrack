/**
 * Utility functions to safely render user data and prevent React object rendering errors
 */

export function safeString(value: unknown): string {
  if (value === null || value === undefined) {
    return ""
  }
  
  if (typeof value === "string") {
    return value
  }
  
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value)
  }
  
  if (typeof value === "object") {
    // If it's an object, don't render it directly
    console.warn("Attempted to render object as string:", value)
    return "[Object]"
  }
  
  return String(value)
}

export function safeUserName(user: any): string {
  return safeString(user?.name || user?.email || "Utilisateur")
}

export function safeUserEmail(user: any): string {
  return safeString(user?.email || "")
}

export function safeUserRole(user: any): string {
  const role = user?.roles?.[0] || user?.role || "CLIENT"
  return safeString(role)
}