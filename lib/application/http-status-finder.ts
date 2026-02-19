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
  { code: 202, name: "Accepted", description: "La solicitud fue aceptada para procesamiento, pero no completada aún.", category: "2xx", whenToUse: "Operaciones asíncronas (colas, jobs, emails).", example: "POST /api/reports/generate → 202", isCommon: true },
  { code: 203, name: "Non-Authoritative Information", description: "La respuesta fue modificada por un proxy intermedio.", category: "2xx", whenToUse: "Proxy que transforma la respuesta del origen.", example: "CDN con headers modificados", isCommon: false },
  { code: 204, name: "No Content", description: "Petición exitosa pero no hay contenido que devolver.", category: "2xx", whenToUse: "DELETE exitoso o PUT que no devuelve el objeto.", example: "DELETE /api/users/1 → 204", isCommon: true },
  { code: 205, name: "Reset Content", description: "El servidor procesó la solicitud y pide al cliente resetear la vista.", category: "2xx", whenToUse: "Después de enviar un formulario, resetear campos.", example: "POST /form → 205 (limpiar formulario)", isCommon: false },
  { code: 206, name: "Partial Content", description: "El servidor envía solo una parte del recurso (rango solicitado).", category: "2xx", whenToUse: "Descarga parcial, streaming de video/audio.", example: "Range: bytes=0-1023 → 206", isCommon: true, relatedHeaders: ["Content-Range", "Range"] },
  { code: 207, name: "Multi-Status", description: "Respuesta XML con múltiples códigos de estado para operaciones batch.", category: "2xx", whenToUse: "WebDAV operaciones sobre múltiples recursos.", example: "PROPFIND multi-recurso → 207", isCommon: false },
  { code: 208, name: "Already Reported", description: "Los miembros de un binding DAV ya fueron enumerados previamente.", category: "2xx", whenToUse: "Evitar duplicados en respuestas WebDAV.", example: "WebDAV con bindings → 208", isCommon: false },
  { code: 226, name: "IM Used", description: "El servidor cumplió la solicitud GET y la respuesta es una representación delta.", category: "2xx", whenToUse: "Delta encoding con Instance Manipulations.", example: "GET con A-IM: feed → 226", isCommon: false },

  // 3xx Redirection
  { code: 300, name: "Multiple Choices", description: "Hay múltiples opciones para el recurso solicitado.", category: "3xx", whenToUse: "Recurso disponible en varios formatos (JSON, XML, PDF).", example: "GET /report → 300 (JSON o PDF)", isCommon: false },
  { code: 301, name: "Moved Permanently", description: "El recurso se ha movido permanentemente a una nueva URI.", category: "3xx", whenToUse: "Migración definitiva de URLs.", example: "http -> https redirect", isCommon: true, relatedHeaders: ["Location"] },
  { code: 302, name: "Found", description: "El recurso se encuentra temporalmente en otra URI.", category: "3xx", whenToUse: "Redirección temporal.", example: "Login exitoso -> /dashboard", isCommon: true, relatedHeaders: ["Location"] },
  { code: 303, name: "See Other", description: "La respuesta al request se encuentra en otra URI (siempre GET).", category: "3xx", whenToUse: "Después de POST, redirigir a página de confirmación con GET.", example: "POST /order → 303 → GET /order/123", isCommon: true, relatedHeaders: ["Location"] },
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
  { code: 402, name: "Payment Required", description: "Reservado para uso futuro. Indica que se requiere pago.", category: "4xx", whenToUse: "APIs de pago, suscripciones expiradas, créditos agotados.", example: "API con plan gratuito agotado → 402", isCommon: false },
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
  { code: 406, name: "Not Acceptable", description: "El servidor no puede generar una respuesta compatible con los headers Accept del cliente.", category: "4xx", whenToUse: "Cliente pide XML pero servidor solo genera JSON.", example: "Accept: application/xml → 406", isCommon: false, relatedHeaders: ["Accept"] },
  { code: 407, name: "Proxy Authentication Required", description: "Se requiere autenticación ante el proxy.", category: "4xx", whenToUse: "Proxy corporativo que requiere credenciales.", example: "Proxy empresarial sin auth → 407", isCommon: false, relatedHeaders: ["Proxy-Authenticate"] },
  { code: 408, name: "Request Timeout", description: "El servidor agotó el tiempo esperando la solicitud del cliente.", category: "4xx", whenToUse: "Cliente envía datos muy lento, conexión idle.", example: "Upload lento que expira → 408", isCommon: true },
  { code: 409, name: "Conflict", description: "La solicitud no se pudo completar por un conflicto en el servidor.", category: "4xx", whenToUse: "Crear un usuario que ya existe por email.", example: "Duplicate unique key in DB", isCommon: true },
  { code: 410, name: "Gone", description: "El recurso existía pero ya no está disponible permanentemente.", category: "4xx", whenToUse: "Recursos eliminados a propósito (ofertas expiradas).", example: "Oferta de trabajo ya cerrada", isCommon: false },
  { code: 411, name: "Length Required", description: "El servidor rechaza la solicitud porque falta el header Content-Length.", category: "4xx", whenToUse: "APIs que requieren saber el tamaño del body antes de procesarlo.", example: "PUT sin Content-Length → 411", isCommon: false, relatedHeaders: ["Content-Length"] },
  { code: 412, name: "Precondition Failed", description: "Las precondiciones del header no se cumplieron.", category: "4xx", whenToUse: "If-Match con ETag desactualizado (optimistic locking).", example: "PUT con If-Match incorrecto → 412", isCommon: false, relatedHeaders: ["If-Match", "If-Unmodified-Since"] },
  { code: 413, name: "Content Too Large", description: "El cuerpo de la solicitud excede el límite del servidor.", category: "4xx", whenToUse: "Upload de archivo mayor al máximo permitido.", example: "Upload 100MB en servidor con límite 10MB → 413", isCommon: true },
  { code: 414, name: "URI Too Long", description: "La URI de la solicitud es demasiado larga para el servidor.", category: "4xx", whenToUse: "Query strings extremadamente largos.", example: "GET /search?q=... (10K chars) → 414", isCommon: false },
  { code: 415, name: "Unsupported Media Type", description: "El tipo de medio de la solicitud no es soportado.", category: "4xx", whenToUse: "Enviar XML cuando la API solo acepta JSON.", example: "Content-Type: text/xml → 415", isCommon: true, relatedHeaders: ["Content-Type"] },
  { code: 416, name: "Range Not Satisfiable", description: "El rango solicitado no puede ser satisfecho.", category: "4xx", whenToUse: "Solicitar bytes más allá del tamaño del archivo.", example: "Range: bytes=9999-10000 en archivo de 100 bytes → 416", isCommon: false, relatedHeaders: ["Content-Range"] },
  { code: 417, name: "Expectation Failed", description: "El servidor no puede cumplir los requisitos del header Expect.", category: "4xx", whenToUse: "Servidor no soporta Expect: 100-continue.", example: "Expect: 100-continue rechazado → 417", isCommon: false },
  { code: 418, name: "I'm a Teapot", description: "El servidor es una tetera y no puede preparar café (RFC 2324).", category: "4xx", whenToUse: "Easter egg, health checks con humor.", example: "GET /coffee → 418", isCommon: false },
  { code: 421, name: "Misdirected Request", description: "La solicitud fue dirigida a un servidor que no puede producir una respuesta.", category: "4xx", whenToUse: "HTTP/2: solicitud enviada a servidor con certificado incorrecto.", example: "SNI mismatch en HTTP/2 → 421", isCommon: false },
  { code: 422, name: "Unprocessable Content", description: "La solicitud está bien formada pero tiene errores semánticos.", category: "4xx", whenToUse: "Validación: JSON válido pero datos inválidos (email mal formado).", example: "POST {\"email\": \"no-es-email\"} → 422", isCommon: true },
  { code: 423, name: "Locked", description: "El recurso está bloqueado.", category: "4xx", whenToUse: "WebDAV: recurso bloqueado para edición.", example: "PUT en archivo bloqueado → 423", isCommon: false },
  { code: 424, name: "Failed Dependency", description: "La solicitud falló por depender de otra operación que falló.", category: "4xx", whenToUse: "WebDAV: fallo en cascada de operaciones.", example: "COPY que depende de LOCK fallido → 424", isCommon: false },
  { code: 425, name: "Too Early", description: "El servidor no procesará la solicitud porque puede ser repetida.", category: "4xx", whenToUse: "TLS Early Data (0-RTT) con riesgo de replay.", example: "POST con TLS 0-RTT → 425", isCommon: false },
  { code: 426, name: "Upgrade Required", description: "El cliente debe cambiar a un protocolo diferente.", category: "4xx", whenToUse: "Servidor requiere TLS o HTTP/2.", example: "HTTP/1.0 → Upgrade a HTTP/1.1 → 426", isCommon: false, relatedHeaders: ["Upgrade"] },
  { code: 428, name: "Precondition Required", description: "El servidor requiere que la solicitud incluya precondiciones.", category: "4xx", whenToUse: "API que exige If-Match para prevenir conflictos de edición.", example: "PUT sin If-Match → 428", isCommon: false },
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
  { code: 431, name: "Request Header Fields Too Large", description: "Los headers de la solicitud son demasiado grandes.", category: "4xx", whenToUse: "Cookies excesivas, headers personalizados enormes.", example: "Cookie de 8KB → 431", isCommon: false },
  { code: 451, name: "Unavailable For Legal Reasons", description: "El recurso no está disponible por motivos legales.", category: "4xx", whenToUse: "DMCA, GDPR, censura gubernamental.", example: "Contenido bloqueado por ley → 451", isCommon: false },

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
  { code: 501, name: "Not Implemented", description: "El servidor no reconoce el método de solicitud o no puede completarlo.", category: "5xx", whenToUse: "Método HTTP no implementado (PATCH en server legacy).", example: "PATCH en API sin soporte → 501", isCommon: false },
  { code: 502, name: "Bad Gateway", description: "El servidor actuando como proxy recibió una respuesta inválida.", category: "5xx", whenToUse: "Nginx no puede comunicar con el microservicio.", example: "Upstream server is down", isCommon: true },
  { code: 503, name: "Service Unavailable", description: "El servidor no puede manejar la solicitud (sobrecarga o mantenimiento).", category: "5xx", whenToUse: "Mantenimiento programado.", example: "Downtime por actualización", isCommon: true, relatedHeaders: ["Retry-After"] },
  { code: 504, name: "Gateway Timeout", description: "El servidor actuando como proxy no recibió respuesta a tiempo.", category: "5xx", whenToUse: "Microservicio tarda demasiado en responder.", example: "Query pesada que expira el proxy", isCommon: true },
  { code: 505, name: "HTTP Version Not Supported", description: "El servidor no soporta la versión HTTP usada.", category: "5xx", whenToUse: "Cliente usando HTTP/0.9 en servidor moderno.", example: "HTTP/0.9 → 505", isCommon: false },
  { code: 506, name: "Variant Also Negotiates", description: "Error de configuración: la variante elegida también negocia contenido.", category: "5xx", whenToUse: "Error de configuración de content negotiation.", example: "Negociación circular → 506", isCommon: false },
  { code: 507, name: "Insufficient Storage", description: "El servidor no tiene espacio suficiente para completar la solicitud.", category: "5xx", whenToUse: "Disco lleno en servidor WebDAV.", example: "Upload a disco lleno → 507", isCommon: false },
  { code: 508, name: "Loop Detected", description: "El servidor detectó un bucle infinito al procesar la solicitud.", category: "5xx", whenToUse: "Referencia circular en WebDAV.", example: "Symlink circular → 508", isCommon: false },
  { code: 510, name: "Not Extended", description: "Se necesitan extensiones adicionales para cumplir la solicitud.", category: "5xx", whenToUse: "Extensiones HTTP adicionales requeridas.", example: "Extensión HTTP no proporcionada → 510", isCommon: false },
  { code: 511, name: "Network Authentication Required", description: "Se requiere autenticación de red para acceder.", category: "5xx", whenToUse: "Portal cautivo de WiFi.", example: "WiFi de hotel → 511", isCommon: false },
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
