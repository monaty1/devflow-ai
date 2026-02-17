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
  { 
    code: 200, 
    name: "OK", 
    description: "La solicitud fue exitosa.", 
    category: "2xx", 
    whenToUse: "Respuesta estándar para GET, POST, PUT exitosos.", 
    example: "GET /api/users → 200", 
    isCommon: true,
    relatedHeaders: ["Content-Type", "ETag"],
    rfcLink: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/200",
    snippets: {
      express: "res.status(200).json(data);",
      fastapi: "return data",
      spring: "return ResponseEntity.ok(data);",
      go: "w.WriteHeader(http.StatusOK)\njson.NewEncoder(w).Encode(data)"
    }
  },
  { 
    code: 201, 
    name: "Created", 
    description: "La solicitud fue exitosa y se creó un nuevo recurso.", 
    category: "2xx", 
    whenToUse: "Después de crear un recurso con POST.", 
    example: "POST /api/users → 201", 
    isCommon: true,
    relatedHeaders: ["Location"],
    rfcLink: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/201",
    snippets: {
      express: "res.status(201).location(`/users/${id}`).json(user);",
      fastapi: "return JSONResponse(status_code=201, content=user)",
      spring: "return ResponseEntity.status(HttpStatus.CREATED).body(user);",
      go: "w.Header().Set(\"Location\", \"/users/1\")\nw.WriteHeader(http.StatusCreated)"
    }
  },
  { code: 204, name: "No Content", description: "Petición exitosa pero no hay contenido que devolver.", category: "2xx", whenToUse: "DELETE exitoso o PUT que no devuelve el objeto.", example: "DELETE /api/users/1 → 204", isCommon: true },

  // 3xx Redirection
  { code: 301, name: "Moved Permanently", description: "El recurso se ha movido permanentemente a una nueva URI.", category: "3xx", whenToUse: "Migración definitiva de URLs.", example: "http -> https redirect", isCommon: true, relatedHeaders: ["Location"] },
  { code: 302, name: "Found", description: "El recurso se encuentra temporalmente en otra URI.", category: "3xx", whenToUse: "Redirección temporal.", example: "Login exitoso -> /dashboard", isCommon: true, relatedHeaders: ["Location"] },
  { code: 304, name: "Not Modified", description: "El recurso no ha cambiado desde la última solicitud.", category: "3xx", whenToUse: "Cacheado de recursos (ETag/If-Modified-Since).", example: "Archivos estáticos (CSS/JS)", isCommon: true },
  { code: 307, name: "Temporary Redirect", description: "Redirección temporal manteniendo el método HTTP original.", category: "3xx", whenToUse: "Redirigir un POST a otra URL sin cambiar a GET.", example: "Proxy de microservicios", isCommon: false },
  { code: 308, name: "Permanent Redirect", description: "Redirección permanente manteniendo el método HTTP original.", category: "3xx", whenToUse: "Cambio de URL definitivo para un endpoint de escritura.", example: "API Versioning migration", isCommon: false },

  // 4xx Client Error
  { 
    code: 400, 
    name: "Bad Request", 
    description: "El servidor no puede procesar la solicitud por error del cliente.", 
    category: "4xx", 
    whenToUse: "Input inválido, JSON malformado, parámetros faltantes.", 
    example: "POST con body inválido → 400", 
    isCommon: true,
    rfcLink: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/400",
    snippets: {
      express: "res.status(400).send('Bad Request');",
      fastapi: "raise HTTPException(status_code=400, detail='Invalid input')",
      spring: "throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 'Invalid data');"
    }
  },
  { 
    code: 401, 
    name: "Unauthorized", 
    description: "Se requiere autenticación para acceder al recurso.", 
    category: "4xx", 
    whenToUse: "Token expirado, sin credenciales.", 
    example: "GET /api/me sin token → 401", 
    isCommon: true,
    relatedHeaders: ["WWW-Authenticate"],
    rfcLink: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/401"
  },
  { code: 403, name: "Forbidden", description: "El cliente no tiene permisos para el recurso solicitado.", category: "4xx", whenToUse: "Usuario autenticado pero sin rol de Admin.", example: "Usuario normal intentando borrar DB", isCommon: true },
  { 
    code: 404, 
    name: "Not Found", 
    description: "El recurso solicitado no existe en el servidor.", 
    category: "4xx", 
    whenToUse: "URL incorrecta, recurso eliminado.", 
    example: "GET /api/users/999 → 404", 
    isCommon: true,
    rfcLink: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/404"
  },
  { code: 405, name: "Method Not Allowed", description: "El método HTTP no está permitido para este recurso.", category: "4xx", whenToUse: "POST en una URL que solo acepta GET.", example: "POST /robots.txt", isCommon: false, relatedHeaders: ["Allow"] },
  { code: 409, name: "Conflict", description: "La solicitud no se pudo completar por un conflicto en el servidor.", category: "4xx", whenToUse: "Crear un usuario que ya existe por email.", example: "Duplicate unique key in DB", isCommon: true },
  { code: 410, name: "Gone", description: "El recurso existía pero ya no está disponible permanentemente.", category: "4xx", whenToUse: "Recursos eliminados a propósito (ofertas expiradas).", example: "Oferta de trabajo ya cerrada", isCommon: false },
  { 
    code: 429, 
    name: "Too Many Requests", 
    description: "El cliente ha enviado demasiadas solicitudes en un período.", 
    category: "4xx", 
    whenToUse: "Rate limiting, throttling de API.", 
    example: "100 req/min excedido → 429", 
    isCommon: true,
    relatedHeaders: ["Retry-After"],
    rfcLink: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/429"
  },

  // 5xx Server Error
  { 
    code: 500, 
    name: "Internal Server Error", 
    description: "Error genérico del servidor.", 
    category: "5xx", 
    whenToUse: "Error no manejado, excepción inesperada.", 
    example: "NullPointerException → 500", 
    isCommon: true,
    rfcLink: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/500",
    snippets: {
      express: "res.status(500).json({ error: 'Internal Server Error' });",
      spring: "return ResponseEntity.internalServerError().build();"
    }
  },
  { code: 502, name: "Bad Gateway", description: "El servidor actuando como proxy recibió una respuesta inválida.", category: "5xx", whenToUse: "Nginx no puede comunicar con el microservicio.", example: "Upstream server is down", isCommon: true },
  { code: 503, name: "Service Unavailable", description: "El servidor no puede manejar la solicitud (sobrecarga o mantenimiento).", category: "5xx", whenToUse: "Mantenimiento programado.", example: "Downtime por actualización", isCommon: true, relatedHeaders: ["Retry-After"] },
  { code: 504, name: "Gateway Timeout", description: "El servidor actuando como proxy no recibió respuesta a tiempo.", category: "5xx", whenToUse: "Microservicio tarda demasiado en responder.", example: "Query pesada que expira el proxy", isCommon: true },
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
