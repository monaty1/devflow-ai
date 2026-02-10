// HTTP Status Code Finder Application Logic

import type {
  HttpStatusCategory,
  HttpStatusCode,
  SearchResult,
  CategoryInfo,
} from "@/types/http-status-finder";

export const HTTP_STATUS_CODES: HttpStatusCode[] = [
  // 1xx Informational
  { code: 100, name: "Continue", description: "El servidor recibió los headers y el cliente puede continuar enviando el body.", category: "1xx", whenToUse: "En solicitudes grandes con Expect: 100-continue.", example: "POST con archivo grande", isCommon: false },
  { code: 101, name: "Switching Protocols", description: "El servidor acepta cambiar de protocolo según lo solicitado.", category: "1xx", whenToUse: "Al hacer upgrade de HTTP a WebSocket.", example: "Upgrade: websocket", isCommon: false },
  { code: 102, name: "Processing", description: "El servidor recibió la solicitud y la está procesando, pero no hay respuesta aún.", category: "1xx", whenToUse: "Operaciones WebDAV largas.", example: "WebDAV COPY/MOVE", isCommon: false },
  { code: 103, name: "Early Hints", description: "Permite al cliente precargar recursos mientras el servidor prepara la respuesta.", category: "1xx", whenToUse: "Enviar Link headers anticipados para preload.", example: "Link: </style.css>; rel=preload", isCommon: false },

  // 2xx Success
  { code: 200, name: "OK", description: "La solicitud fue exitosa.", category: "2xx", whenToUse: "Respuesta estándar para GET, POST, PUT exitosos.", example: "GET /api/users → 200", isCommon: true },
  { code: 201, name: "Created", description: "La solicitud fue exitosa y se creó un nuevo recurso.", category: "2xx", whenToUse: "Después de crear un recurso con POST.", example: "POST /api/users → 201", isCommon: true },
  { code: 202, name: "Accepted", description: "La solicitud fue aceptada pero aún no procesada.", category: "2xx", whenToUse: "Procesamiento asíncrono, colas de trabajo.", example: "POST /api/jobs → 202", isCommon: true },
  { code: 203, name: "Non-Authoritative Information", description: "La respuesta fue modificada por un proxy intermedio.", category: "2xx", whenToUse: "Proxy que transforma la respuesta del origen.", example: "Proxy CDN modificando headers", isCommon: false },
  { code: 204, name: "No Content", description: "La solicitud fue exitosa pero no hay contenido que retornar.", category: "2xx", whenToUse: "DELETE exitoso, PUT sin body de respuesta.", example: "DELETE /api/users/1 → 204", isCommon: true },
  { code: 206, name: "Partial Content", description: "El servidor retorna solo una parte del recurso solicitado.", category: "2xx", whenToUse: "Descargas parciales con Range headers.", example: "Range: bytes=0-1023", isCommon: true },
  { code: 207, name: "Multi-Status", description: "Respuesta con múltiples códigos de estado para múltiples operaciones.", category: "2xx", whenToUse: "Operaciones batch en WebDAV.", example: "WebDAV batch operations", isCommon: false },

  // 3xx Redirection
  { code: 301, name: "Moved Permanently", description: "El recurso se movió permanentemente a una nueva URL.", category: "3xx", whenToUse: "Migración de URLs, cambio de dominio.", example: "old.com → new.com", isCommon: true },
  { code: 302, name: "Found", description: "El recurso se encuentra temporalmente en otra URL.", category: "3xx", whenToUse: "Redirecciones temporales, login redirects.", example: "POST /login → 302 /dashboard", isCommon: true },
  { code: 303, name: "See Other", description: "Redirige a otro recurso usando GET.", category: "3xx", whenToUse: "Después de un POST, redirigir al resultado.", example: "POST /orders → 303 /orders/123", isCommon: false },
  { code: 304, name: "Not Modified", description: "El recurso no ha cambiado desde la última solicitud.", category: "3xx", whenToUse: "Caché con ETag o If-Modified-Since.", example: "If-None-Match: etag → 304", isCommon: true },
  { code: 307, name: "Temporary Redirect", description: "Redirige temporalmente manteniendo el método HTTP.", category: "3xx", whenToUse: "Redirección temporal que preserva POST/PUT.", example: "POST /api/v1 → 307 /api/v2", isCommon: true },
  { code: 308, name: "Permanent Redirect", description: "Redirige permanentemente manteniendo el método HTTP.", category: "3xx", whenToUse: "Migración permanente preservando método.", example: "POST /old → 308 /new", isCommon: false },

  // 4xx Client Error
  { code: 400, name: "Bad Request", description: "El servidor no puede procesar la solicitud por error del cliente.", category: "4xx", whenToUse: "Input inválido, JSON malformado, parámetros faltantes.", example: "POST con body inválido → 400", isCommon: true },
  { code: 401, name: "Unauthorized", description: "Se requiere autenticación para acceder al recurso.", category: "4xx", whenToUse: "Token expirado, sin credenciales.", example: "GET /api/me sin token → 401", isCommon: true },
  { code: 403, name: "Forbidden", description: "El servidor entiende la solicitud pero se niega a autorizarla.", category: "4xx", whenToUse: "Sin permisos suficientes aunque autenticado.", example: "User intenta admin endpoint → 403", isCommon: true },
  { code: 404, name: "Not Found", description: "El recurso solicitado no existe en el servidor.", category: "4xx", whenToUse: "URL incorrecta, recurso eliminado.", example: "GET /api/users/999 → 404", isCommon: true },
  { code: 405, name: "Method Not Allowed", description: "El método HTTP no está permitido para este recurso.", category: "4xx", whenToUse: "DELETE en recurso que solo acepta GET.", example: "DELETE /api/config → 405", isCommon: true },
  { code: 406, name: "Not Acceptable", description: "El servidor no puede producir una respuesta acorde al Accept header.", category: "4xx", whenToUse: "Accept: application/xml en API solo JSON.", example: "Accept: text/xml → 406", isCommon: false },
  { code: 407, name: "Proxy Authentication Required", description: "Se requiere autenticación con el proxy.", category: "4xx", whenToUse: "Proxy corporativo que requiere login.", example: "Proxy sin credenciales → 407", isCommon: false },
  { code: 408, name: "Request Timeout", description: "El servidor agotó el tiempo de espera de la solicitud.", category: "4xx", whenToUse: "Cliente tardó demasiado en enviar la solicitud.", example: "Conexión lenta sin datos → 408", isCommon: true },
  { code: 409, name: "Conflict", description: "La solicitud conflicta con el estado actual del recurso.", category: "4xx", whenToUse: "Email duplicado, conflicto de versiones.", example: "POST /users con email existente → 409", isCommon: true },
  { code: 410, name: "Gone", description: "El recurso ya no está disponible y no volverá.", category: "4xx", whenToUse: "Recurso eliminado permanentemente.", example: "API v1 deprecada → 410", isCommon: false },
  { code: 411, name: "Length Required", description: "El servidor requiere el header Content-Length.", category: "4xx", whenToUse: "POST sin Content-Length header.", example: "POST sin Content-Length → 411", isCommon: false },
  { code: 412, name: "Precondition Failed", description: "Una precondición en los headers no se cumplió.", category: "4xx", whenToUse: "If-Match con ETag desactualizado.", example: "If-Match: old-etag → 412", isCommon: false },
  { code: 413, name: "Payload Too Large", description: "El body de la solicitud excede el límite del servidor.", category: "4xx", whenToUse: "Upload de archivo muy grande.", example: "Upload 100MB con límite de 10MB → 413", isCommon: true },
  { code: 414, name: "URI Too Long", description: "La URL de la solicitud es demasiado larga.", category: "4xx", whenToUse: "Query string extremadamente larga.", example: "GET con 10000 chars en URL → 414", isCommon: false },
  { code: 415, name: "Unsupported Media Type", description: "El servidor no soporta el tipo de contenido enviado.", category: "4xx", whenToUse: "Enviar XML cuando solo acepta JSON.", example: "Content-Type: text/xml → 415", isCommon: true },
  { code: 416, name: "Range Not Satisfiable", description: "El rango solicitado no puede ser servido.", category: "4xx", whenToUse: "Range header con bytes fuera de rango.", example: "Range: bytes=1000-2000 en archivo de 500 bytes", isCommon: false },
  { code: 418, name: "I'm a Teapot", description: "El servidor es una tetera y se niega a preparar café.", category: "4xx", whenToUse: "Easter egg de la RFC 2324 (HTCPCP).", example: "BREW /coffee → 418", isCommon: false },
  { code: 422, name: "Unprocessable Entity", description: "El servidor entiende el formato pero no puede procesar las instrucciones.", category: "4xx", whenToUse: "Validación de negocio: email válido pero dominio bloqueado.", example: "POST con email en blacklist → 422", isCommon: true },
  { code: 429, name: "Too Many Requests", description: "El cliente ha enviado demasiadas solicitudes en un período.", category: "4xx", whenToUse: "Rate limiting, throttling de API.", example: "100 req/min excedido → 429", isCommon: true },
  { code: 431, name: "Request Header Fields Too Large", description: "Los headers de la solicitud son demasiado grandes.", category: "4xx", whenToUse: "Cookies o headers excesivamente grandes.", example: "Cookie gigante → 431", isCommon: false },
  { code: 451, name: "Unavailable For Legal Reasons", description: "El recurso no está disponible por razones legales.", category: "4xx", whenToUse: "Contenido bloqueado por orden judicial o DMCA.", example: "Contenido censurado → 451", isCommon: false },

  // 5xx Server Error
  { code: 500, name: "Internal Server Error", description: "Error genérico del servidor.", category: "5xx", whenToUse: "Error no manejado, excepción inesperada.", example: "NullPointerException → 500", isCommon: true },
  { code: 501, name: "Not Implemented", description: "El servidor no soporta la funcionalidad requerida.", category: "5xx", whenToUse: "Método HTTP no implementado.", example: "PATCH no soportado → 501", isCommon: false },
  { code: 502, name: "Bad Gateway", description: "El servidor actuando como gateway recibió una respuesta inválida.", category: "5xx", whenToUse: "Proxy/load balancer con backend caído.", example: "Nginx → backend muerto → 502", isCommon: true },
  { code: 503, name: "Service Unavailable", description: "El servidor no está disponible temporalmente.", category: "5xx", whenToUse: "Mantenimiento, sobrecarga, deploy en curso.", example: "Servidor en mantenimiento → 503", isCommon: true },
  { code: 504, name: "Gateway Timeout", description: "El servidor actuando como gateway no recibió respuesta a tiempo.", category: "5xx", whenToUse: "Backend tardó demasiado en responder.", example: "Query lenta → proxy timeout → 504", isCommon: true },
  { code: 505, name: "HTTP Version Not Supported", description: "El servidor no soporta la versión HTTP usada.", category: "5xx", whenToUse: "Cliente usando HTTP/0.9 en servidor moderno.", example: "HTTP/0.9 → 505", isCommon: false },
  { code: 507, name: "Insufficient Storage", description: "El servidor no tiene espacio suficiente para completar la solicitud.", category: "5xx", whenToUse: "Disco lleno en servidor WebDAV.", example: "Upload a disco lleno → 507", isCommon: false },
  { code: 508, name: "Loop Detected", description: "El servidor detectó un bucle infinito al procesar la solicitud.", category: "5xx", whenToUse: "Referencia circular en WebDAV.", example: "Symlink circular → 508", isCommon: false },
  { code: 510, name: "Not Extended", description: "Se necesitan extensiones adicionales para cumplir la solicitud.", category: "5xx", whenToUse: "Extensiones HTTP adicionales requeridas.", example: "Extensión HTTP no proporcionada → 510", isCommon: false },
  { code: 511, name: "Network Authentication Required", description: "Se requiere autenticación de red para acceder.", category: "5xx", whenToUse: "Portal cautivo de WiFi.", example: "WiFi de hotel → 511", isCommon: false },
  { code: 205, name: "Reset Content", description: "El servidor procesó la solicitud y pide al cliente resetear la vista.", category: "2xx", whenToUse: "Después de enviar un formulario, resetear campos.", example: "POST /form → 205 (limpiar formulario)", isCommon: false },
  { code: 226, name: "IM Used", description: "El servidor cumplió la solicitud GET y la respuesta es una representación delta.", category: "2xx", whenToUse: "Delta encoding con Instance Manipulations.", example: "GET con A-IM: feed → 226", isCommon: false },
  { code: 417, name: "Expectation Failed", description: "El servidor no puede cumplir los requisitos del header Expect.", category: "4xx", whenToUse: "Servidor no soporta Expect: 100-continue.", example: "Expect: 100-continue rechazado → 417", isCommon: false },
];

const CATEGORY_INFO: Record<HttpStatusCategory, CategoryInfo> = {
  "1xx": { category: "1xx", label: "Informational", description: "Respuestas informativas", color: "blue" },
  "2xx": { category: "2xx", label: "Success", description: "Respuestas exitosas", color: "green" },
  "3xx": { category: "3xx", label: "Redirection", description: "Redirecciones", color: "yellow" },
  "4xx": { category: "4xx", label: "Client Error", description: "Errores del cliente", color: "orange" },
  "5xx": { category: "5xx", label: "Server Error", description: "Errores del servidor", color: "red" },
};

/**
 * Search by exact or partial code number
 */
export function searchByCode(code: number): HttpStatusCode | null {
  return HTTP_STATUS_CODES.find((s) => s.code === code) ?? null;
}

/**
 * Search by keyword in name and description
 */
export function searchByKeyword(query: string): HttpStatusCode[] {
  if (!query.trim()) return [];

  const lower = query.toLowerCase();
  return HTTP_STATUS_CODES.filter(
    (s) =>
      s.name.toLowerCase().includes(lower) ||
      s.description.toLowerCase().includes(lower) ||
      s.whenToUse.toLowerCase().includes(lower)
  );
}

/**
 * Get all codes in a category
 */
export function getByCategory(category: HttpStatusCategory): HttpStatusCode[] {
  return HTTP_STATUS_CODES.filter((s) => s.category === category);
}

/**
 * Get common status codes
 */
export function getCommonCodes(): HttpStatusCode[] {
  return HTTP_STATUS_CODES.filter((s) => s.isCommon);
}

/**
 * Check if a code is a known HTTP status code
 */
export function isValidStatusCode(code: number): boolean {
  return HTTP_STATUS_CODES.some((s) => s.code === code);
}

/**
 * Get category info
 */
export function getCategoryInfo(category: HttpStatusCategory): CategoryInfo {
  return CATEGORY_INFO[category];
}

/**
 * Process a search query (number or keyword)
 */
export function processSearch(query: string, category?: HttpStatusCategory): SearchResult {
  let codes: HttpStatusCode[] = [];

  const trimmed = query.trim();

  if (!trimmed && !category) {
    codes = getCommonCodes();
  } else if (!trimmed && category) {
    codes = getByCategory(category);
  } else {
    // Try numeric search first
    const num = parseInt(trimmed, 10);
    if (!isNaN(num) && trimmed === num.toString()) {
      // Exact code search
      const exact = searchByCode(num);
      if (exact) {
        codes = [exact];
      } else {
        // Partial numeric match (e.g., "40" matches 400, 401, etc.)
        codes = HTTP_STATUS_CODES.filter((s) =>
          s.code.toString().startsWith(trimmed)
        );
      }
    } else {
      // Keyword search
      codes = searchByKeyword(trimmed);
    }

    // Apply category filter
    if (category) {
      codes = codes.filter((c) => c.category === category);
    }
  }

  return {
    codes,
    query: trimmed,
    timestamp: new Date().toISOString(),
  };
}
