// HTTP Status Code Finder Application Logic

import type {
  HttpStatusCategory,
  HttpStatusCode,
  SearchResult,
  CategoryInfo,
} from "@/types/http-status-finder";

// ---------------------------------------------------------------------------
// Locale type (mirrors locale-store but no React import needed)
// ---------------------------------------------------------------------------
type Locale = "en" | "es";

// ---------------------------------------------------------------------------
// Per-status-code localizable strings: description, whenToUse, example
// ---------------------------------------------------------------------------
interface StatusStrings {
  description: string;
  whenToUse: string;
  example: string;
}

const STATUS_STRINGS: Record<Locale, Record<number, StatusStrings>> = {
  en: {
    // 1xx Informational
    100: { description: "The server received the headers and the client may continue sending the body.", whenToUse: "Large requests with Expect: 100-continue.", example: "POST with large file" },
    101: { description: "The server accepts switching protocols as requested.", whenToUse: "When upgrading from HTTP to WebSocket.", example: "Upgrade: websocket" },
    102: { description: "The server received the request and is processing it, but no response is available yet.", whenToUse: "Long WebDAV operations.", example: "WebDAV COPY/MOVE" },
    103: { description: "Allows the client to preload resources while the server prepares the response.", whenToUse: "Sending early Link headers for preload.", example: "Link: </style.css>; rel=preload" },

    // 2xx Success
    200: { description: "The request was successful.", whenToUse: "Standard response for successful GET, POST, PUT.", example: "GET /api/users -> 200" },
    201: { description: "The request was successful and a new resource was created.", whenToUse: "After creating a resource with POST.", example: "POST /api/users -> 201" },
    202: { description: "The request was accepted for processing but not yet completed.", whenToUse: "Asynchronous operations (queues, jobs, emails).", example: "POST /api/reports/generate -> 202" },
    203: { description: "The response was modified by an intermediate proxy.", whenToUse: "Proxy that transforms the origin response.", example: "CDN with modified headers" },
    204: { description: "Successful request but no content to return.", whenToUse: "Successful DELETE or PUT that does not return the object.", example: "DELETE /api/users/1 -> 204" },
    205: { description: "The server processed the request and asks the client to reset the view.", whenToUse: "After submitting a form, reset fields.", example: "POST /form -> 205 (clear form)" },
    206: { description: "The server sends only a portion of the resource (requested range).", whenToUse: "Partial download, video/audio streaming.", example: "Range: bytes=0-1023 -> 206" },
    207: { description: "XML response with multiple status codes for batch operations.", whenToUse: "WebDAV operations on multiple resources.", example: "PROPFIND multi-resource -> 207" },
    208: { description: "The members of a DAV binding have already been enumerated.", whenToUse: "Avoid duplicates in WebDAV responses.", example: "WebDAV with bindings -> 208" },
    226: { description: "The server fulfilled the GET request and the response is a delta representation.", whenToUse: "Delta encoding with Instance Manipulations.", example: "GET with A-IM: feed -> 226" },

    // 3xx Redirection
    300: { description: "There are multiple options for the requested resource.", whenToUse: "Resource available in multiple formats (JSON, XML, PDF).", example: "GET /report -> 300 (JSON or PDF)" },
    301: { description: "The resource has been permanently moved to a new URI.", whenToUse: "Permanent URL migration.", example: "http -> https redirect" },
    302: { description: "The resource is temporarily located at another URI.", whenToUse: "Temporary redirect.", example: "Successful login -> /dashboard" },
    303: { description: "The response to the request can be found at another URI (always GET).", whenToUse: "After POST, redirect to confirmation page with GET.", example: "POST /order -> 303 -> GET /order/123" },
    304: { description: "The resource has not changed since the last request.", whenToUse: "Resource caching (ETag/If-Modified-Since).", example: "Static files (CSS/JS)" },
    307: { description: "Temporary redirect preserving the original HTTP method.", whenToUse: "Redirect a POST to another URL without changing to GET.", example: "Microservices proxy" },
    308: { description: "Permanent redirect preserving the original HTTP method.", whenToUse: "Permanent URL change for a write endpoint.", example: "API Versioning migration" },

    // 4xx Client Error
    400: { description: "The server cannot process the request due to a client error.", whenToUse: "Invalid input, malformed JSON, missing parameters.", example: "POST with invalid body -> 400" },
    401: { description: "Authentication is required to access the resource.", whenToUse: "Expired token, missing credentials.", example: "GET /api/me without token -> 401" },
    402: { description: "Reserved for future use. Indicates that payment is required.", whenToUse: "Payment APIs, expired subscriptions, depleted credits.", example: "API with exhausted free plan -> 402" },
    403: { description: "The client does not have permission for the requested resource.", whenToUse: "Authenticated user without Admin role.", example: "Regular user trying to delete DB" },
    404: { description: "The requested resource does not exist on the server.", whenToUse: "Incorrect URL, deleted resource.", example: "GET /api/users/999 -> 404" },
    405: { description: "The HTTP method is not allowed for this resource.", whenToUse: "POST on a URL that only accepts GET.", example: "POST /robots.txt" },
    406: { description: "The server cannot produce a response matching the client's Accept headers.", whenToUse: "Client asks for XML but server only produces JSON.", example: "Accept: application/xml -> 406" },
    407: { description: "Authentication with the proxy is required.", whenToUse: "Corporate proxy that requires credentials.", example: "Enterprise proxy without auth -> 407" },
    408: { description: "The server timed out waiting for the client's request.", whenToUse: "Client sends data too slowly, idle connection.", example: "Slow upload that expires -> 408" },
    409: { description: "The request could not be completed due to a conflict on the server.", whenToUse: "Creating a user that already exists by email.", example: "Duplicate unique key in DB" },
    410: { description: "The resource existed but is no longer permanently available.", whenToUse: "Intentionally deleted resources (expired offers).", example: "Job posting already closed" },
    411: { description: "The server rejects the request because the Content-Length header is missing.", whenToUse: "APIs that need to know the body size before processing.", example: "PUT without Content-Length -> 411" },
    412: { description: "The header preconditions were not met.", whenToUse: "If-Match with outdated ETag (optimistic locking).", example: "PUT with incorrect If-Match -> 412" },
    413: { description: "The request body exceeds the server's limit.", whenToUse: "File upload larger than the maximum allowed.", example: "Upload 100MB on server with 10MB limit -> 413" },
    414: { description: "The request URI is too long for the server.", whenToUse: "Extremely long query strings.", example: "GET /search?q=... (10K chars) -> 414" },
    415: { description: "The request media type is not supported.", whenToUse: "Sending XML when the API only accepts JSON.", example: "Content-Type: text/xml -> 415" },
    416: { description: "The requested range cannot be satisfied.", whenToUse: "Requesting bytes beyond the file size.", example: "Range: bytes=9999-10000 on 100-byte file -> 416" },
    417: { description: "The server cannot meet the requirements of the Expect header.", whenToUse: "Server does not support Expect: 100-continue.", example: "Expect: 100-continue rejected -> 417" },
    418: { description: "The server is a teapot and cannot brew coffee (RFC 2324).", whenToUse: "Easter egg, humorous health checks.", example: "GET /coffee -> 418" },
    421: { description: "The request was directed at a server that cannot produce a response.", whenToUse: "HTTP/2: request sent to server with incorrect certificate.", example: "SNI mismatch in HTTP/2 -> 421" },
    422: { description: "The request is well-formed but has semantic errors.", whenToUse: "Validation: valid JSON but invalid data (malformed email).", example: "POST {\"email\": \"not-an-email\"} -> 422" },
    423: { description: "The resource is locked.", whenToUse: "WebDAV: resource locked for editing.", example: "PUT on locked file -> 423" },
    424: { description: "The request failed because it depended on another operation that failed.", whenToUse: "WebDAV: cascading operation failure.", example: "COPY depending on failed LOCK -> 424" },
    425: { description: "The server will not process the request because it may be replayed.", whenToUse: "TLS Early Data (0-RTT) with replay risk.", example: "POST with TLS 0-RTT -> 425" },
    426: { description: "The client must switch to a different protocol.", whenToUse: "Server requires TLS or HTTP/2.", example: "HTTP/1.0 -> Upgrade to HTTP/1.1 -> 426" },
    428: { description: "The server requires the request to include preconditions.", whenToUse: "API that requires If-Match to prevent edit conflicts.", example: "PUT without If-Match -> 428" },
    429: { description: "The client has sent too many requests in a given period.", whenToUse: "Rate limiting, API throttling.", example: "100 req/min exceeded -> 429" },
    431: { description: "The request header fields are too large.", whenToUse: "Excessive cookies, huge custom headers.", example: "8KB cookie -> 431" },
    451: { description: "The resource is unavailable for legal reasons.", whenToUse: "DMCA, GDPR, government censorship.", example: "Content blocked by law -> 451" },

    // 5xx Server Error
    500: { description: "Generic server error.", whenToUse: "Unhandled error, unexpected exception.", example: "NullPointerException -> 500" },
    501: { description: "The server does not recognize the request method or cannot fulfill it.", whenToUse: "HTTP method not implemented (PATCH on legacy server).", example: "PATCH on API without support -> 501" },
    502: { description: "The server acting as a proxy received an invalid response.", whenToUse: "Nginx cannot communicate with the microservice.", example: "Upstream server is down" },
    503: { description: "The server cannot handle the request (overload or maintenance).", whenToUse: "Scheduled maintenance.", example: "Downtime for update" },
    504: { description: "The server acting as a proxy did not receive a timely response.", whenToUse: "Microservice takes too long to respond.", example: "Heavy query that times out the proxy" },
    505: { description: "The server does not support the HTTP version used.", whenToUse: "Client using HTTP/0.9 on a modern server.", example: "HTTP/0.9 -> 505" },
    506: { description: "Configuration error: the chosen variant also negotiates content.", whenToUse: "Content negotiation configuration error.", example: "Circular negotiation -> 506" },
    507: { description: "The server does not have enough storage to complete the request.", whenToUse: "Full disk on WebDAV server.", example: "Upload to full disk -> 507" },
    508: { description: "The server detected an infinite loop while processing the request.", whenToUse: "Circular reference in WebDAV.", example: "Circular symlink -> 508" },
    510: { description: "Additional extensions are needed to fulfill the request.", whenToUse: "Additional HTTP extensions required.", example: "HTTP extension not provided -> 510" },
    511: { description: "Network authentication is required to gain access.", whenToUse: "Captive WiFi portal.", example: "Hotel WiFi -> 511" },
  },
  es: {
    // 1xx Informational
    100: { description: "El servidor recibio los headers y el cliente puede continuar enviando el body.", whenToUse: "En solicitudes grandes con Expect: 100-continue.", example: "POST con archivo grande" },
    101: { description: "El servidor acepta cambiar de protocolo segun lo solicitado.", whenToUse: "Al hacer upgrade de HTTP a WebSocket.", example: "Upgrade: websocket" },
    102: { description: "El servidor recibio la solicitud y la esta procesando, pero no hay respuesta aun.", whenToUse: "Operaciones WebDAV largas.", example: "WebDAV COPY/MOVE" },
    103: { description: "Permite al cliente precargar recursos mientras el servidor prepara la respuesta.", whenToUse: "Enviar Link headers anticipados para preload.", example: "Link: </style.css>; rel=preload" },

    // 2xx Success
    200: { description: "La solicitud fue exitosa.", whenToUse: "Respuesta estandar para GET, POST, PUT exitosos.", example: "GET /api/users -> 200" },
    201: { description: "La solicitud fue exitosa y se creo un nuevo recurso.", whenToUse: "Despues de crear un recurso con POST.", example: "POST /api/users -> 201" },
    202: { description: "La solicitud fue aceptada para procesamiento, pero no completada aun.", whenToUse: "Operaciones asincronas (colas, jobs, emails).", example: "POST /api/reports/generate -> 202" },
    203: { description: "La respuesta fue modificada por un proxy intermedio.", whenToUse: "Proxy que transforma la respuesta del origen.", example: "CDN con headers modificados" },
    204: { description: "Peticion exitosa pero no hay contenido que devolver.", whenToUse: "DELETE exitoso o PUT que no devuelve el objeto.", example: "DELETE /api/users/1 -> 204" },
    205: { description: "El servidor proceso la solicitud y pide al cliente resetear la vista.", whenToUse: "Despues de enviar un formulario, resetear campos.", example: "POST /form -> 205 (limpiar formulario)" },
    206: { description: "El servidor envia solo una parte del recurso (rango solicitado).", whenToUse: "Descarga parcial, streaming de video/audio.", example: "Range: bytes=0-1023 -> 206" },
    207: { description: "Respuesta XML con multiples codigos de estado para operaciones batch.", whenToUse: "WebDAV operaciones sobre multiples recursos.", example: "PROPFIND multi-recurso -> 207" },
    208: { description: "Los miembros de un binding DAV ya fueron enumerados previamente.", whenToUse: "Evitar duplicados en respuestas WebDAV.", example: "WebDAV con bindings -> 208" },
    226: { description: "El servidor cumplio la solicitud GET y la respuesta es una representacion delta.", whenToUse: "Delta encoding con Instance Manipulations.", example: "GET con A-IM: feed -> 226" },

    // 3xx Redirection
    300: { description: "Hay multiples opciones para el recurso solicitado.", whenToUse: "Recurso disponible en varios formatos (JSON, XML, PDF).", example: "GET /report -> 300 (JSON o PDF)" },
    301: { description: "El recurso se ha movido permanentemente a una nueva URI.", whenToUse: "Migracion definitiva de URLs.", example: "http -> https redirect" },
    302: { description: "El recurso se encuentra temporalmente en otra URI.", whenToUse: "Redireccion temporal.", example: "Login exitoso -> /dashboard" },
    303: { description: "La respuesta al request se encuentra en otra URI (siempre GET).", whenToUse: "Despues de POST, redirigir a pagina de confirmacion con GET.", example: "POST /order -> 303 -> GET /order/123" },
    304: { description: "El recurso no ha cambiado desde la ultima solicitud.", whenToUse: "Cacheado de recursos (ETag/If-Modified-Since).", example: "Archivos estaticos (CSS/JS)" },
    307: { description: "Redireccion temporal manteniendo el metodo HTTP original.", whenToUse: "Redirigir un POST a otra URL sin cambiar a GET.", example: "Proxy de microservicios" },
    308: { description: "Redireccion permanente manteniendo el metodo HTTP original.", whenToUse: "Cambio de URL definitivo para un endpoint de escritura.", example: "API Versioning migration" },

    // 4xx Client Error
    400: { description: "El servidor no puede procesar la solicitud por error del cliente.", whenToUse: "Input invalido, JSON malformado, parametros faltantes.", example: "POST con body invalido -> 400" },
    401: { description: "Se requiere autenticacion para acceder al recurso.", whenToUse: "Token expirado, sin credenciales.", example: "GET /api/me sin token -> 401" },
    402: { description: "Reservado para uso futuro. Indica que se requiere pago.", whenToUse: "APIs de pago, suscripciones expiradas, creditos agotados.", example: "API con plan gratuito agotado -> 402" },
    403: { description: "El cliente no tiene permisos para el recurso solicitado.", whenToUse: "Usuario autenticado pero sin rol de Admin.", example: "Usuario normal intentando borrar DB" },
    404: { description: "El recurso solicitado no existe en el servidor.", whenToUse: "URL incorrecta, recurso eliminado.", example: "GET /api/users/999 -> 404" },
    405: { description: "El metodo HTTP no esta permitido para este recurso.", whenToUse: "POST en una URL que solo acepta GET.", example: "POST /robots.txt" },
    406: { description: "El servidor no puede generar una respuesta compatible con los headers Accept del cliente.", whenToUse: "Cliente pide XML pero servidor solo genera JSON.", example: "Accept: application/xml -> 406" },
    407: { description: "Se requiere autenticacion ante el proxy.", whenToUse: "Proxy corporativo que requiere credenciales.", example: "Proxy empresarial sin auth -> 407" },
    408: { description: "El servidor agoto el tiempo esperando la solicitud del cliente.", whenToUse: "Cliente envia datos muy lento, conexion idle.", example: "Upload lento que expira -> 408" },
    409: { description: "La solicitud no se pudo completar por un conflicto en el servidor.", whenToUse: "Crear un usuario que ya existe por email.", example: "Duplicate unique key in DB" },
    410: { description: "El recurso existia pero ya no esta disponible permanentemente.", whenToUse: "Recursos eliminados a proposito (ofertas expiradas).", example: "Oferta de trabajo ya cerrada" },
    411: { description: "El servidor rechaza la solicitud porque falta el header Content-Length.", whenToUse: "APIs que requieren saber el tamano del body antes de procesarlo.", example: "PUT sin Content-Length -> 411" },
    412: { description: "Las precondiciones del header no se cumplieron.", whenToUse: "If-Match con ETag desactualizado (optimistic locking).", example: "PUT con If-Match incorrecto -> 412" },
    413: { description: "El cuerpo de la solicitud excede el limite del servidor.", whenToUse: "Upload de archivo mayor al maximo permitido.", example: "Upload 100MB en servidor con limite 10MB -> 413" },
    414: { description: "La URI de la solicitud es demasiado larga para el servidor.", whenToUse: "Query strings extremadamente largos.", example: "GET /search?q=... (10K chars) -> 414" },
    415: { description: "El tipo de medio de la solicitud no es soportado.", whenToUse: "Enviar XML cuando la API solo acepta JSON.", example: "Content-Type: text/xml -> 415" },
    416: { description: "El rango solicitado no puede ser satisfecho.", whenToUse: "Solicitar bytes mas alla del tamano del archivo.", example: "Range: bytes=9999-10000 en archivo de 100 bytes -> 416" },
    417: { description: "El servidor no puede cumplir los requisitos del header Expect.", whenToUse: "Servidor no soporta Expect: 100-continue.", example: "Expect: 100-continue rechazado -> 417" },
    418: { description: "El servidor es una tetera y no puede preparar cafe (RFC 2324).", whenToUse: "Easter egg, health checks con humor.", example: "GET /coffee -> 418" },
    421: { description: "La solicitud fue dirigida a un servidor que no puede producir una respuesta.", whenToUse: "HTTP/2: solicitud enviada a servidor con certificado incorrecto.", example: "SNI mismatch en HTTP/2 -> 421" },
    422: { description: "La solicitud esta bien formada pero tiene errores semanticos.", whenToUse: "Validacion: JSON valido pero datos invalidos (email mal formado).", example: "POST {\"email\": \"no-es-email\"} -> 422" },
    423: { description: "El recurso esta bloqueado.", whenToUse: "WebDAV: recurso bloqueado para edicion.", example: "PUT en archivo bloqueado -> 423" },
    424: { description: "La solicitud fallo por depender de otra operacion que fallo.", whenToUse: "WebDAV: fallo en cascada de operaciones.", example: "COPY que depende de LOCK fallido -> 424" },
    425: { description: "El servidor no procesara la solicitud porque puede ser repetida.", whenToUse: "TLS Early Data (0-RTT) con riesgo de replay.", example: "POST con TLS 0-RTT -> 425" },
    426: { description: "El cliente debe cambiar a un protocolo diferente.", whenToUse: "Servidor requiere TLS o HTTP/2.", example: "HTTP/1.0 -> Upgrade a HTTP/1.1 -> 426" },
    428: { description: "El servidor requiere que la solicitud incluya precondiciones.", whenToUse: "API que exige If-Match para prevenir conflictos de edicion.", example: "PUT sin If-Match -> 428" },
    429: { description: "El cliente ha enviado demasiadas solicitudes en un periodo.", whenToUse: "Rate limiting, throttling de API.", example: "100 req/min excedido -> 429" },
    431: { description: "Los headers de la solicitud son demasiado grandes.", whenToUse: "Cookies excesivas, headers personalizados enormes.", example: "Cookie de 8KB -> 431" },
    451: { description: "El recurso no esta disponible por motivos legales.", whenToUse: "DMCA, GDPR, censura gubernamental.", example: "Contenido bloqueado por ley -> 451" },

    // 5xx Server Error
    500: { description: "Error generico del servidor.", whenToUse: "Error no manejado, excepcion inesperada.", example: "NullPointerException -> 500" },
    501: { description: "El servidor no reconoce el metodo de solicitud o no puede completarlo.", whenToUse: "Metodo HTTP no implementado (PATCH en server legacy).", example: "PATCH en API sin soporte -> 501" },
    502: { description: "El servidor actuando como proxy recibio una respuesta invalida.", whenToUse: "Nginx no puede comunicar con el microservicio.", example: "Upstream server is down" },
    503: { description: "El servidor no puede manejar la solicitud (sobrecarga o mantenimiento).", whenToUse: "Mantenimiento programado.", example: "Downtime por actualizacion" },
    504: { description: "El servidor actuando como proxy no recibio respuesta a tiempo.", whenToUse: "Microservicio tarda demasiado en responder.", example: "Query pesada que expira el proxy" },
    505: { description: "El servidor no soporta la version HTTP usada.", whenToUse: "Cliente usando HTTP/0.9 en servidor moderno.", example: "HTTP/0.9 -> 505" },
    506: { description: "Error de configuracion: la variante elegida tambien negocia contenido.", whenToUse: "Error de configuracion de content negotiation.", example: "Negociacion circular -> 506" },
    507: { description: "El servidor no tiene espacio suficiente para completar la solicitud.", whenToUse: "Disco lleno en servidor WebDAV.", example: "Upload a disco lleno -> 507" },
    508: { description: "El servidor detecto un bucle infinito al procesar la solicitud.", whenToUse: "Referencia circular en WebDAV.", example: "Symlink circular -> 508" },
    510: { description: "Se necesitan extensiones adicionales para cumplir la solicitud.", whenToUse: "Extensiones HTTP adicionales requeridas.", example: "Extension HTTP no proporcionada -> 510" },
    511: { description: "Se requiere autenticacion de red para acceder.", whenToUse: "Portal cautivo de WiFi.", example: "WiFi de hotel -> 511" },
  },
} as const;

// ---------------------------------------------------------------------------
// Per-category localizable strings
// ---------------------------------------------------------------------------
interface CategoryStrings {
  description: string;
}

const CATEGORY_STRINGS: Record<Locale, Record<HttpStatusCategory, CategoryStrings>> = {
  en: {
    "1xx": { description: "Informational responses" },
    "2xx": { description: "Successful responses" },
    "3xx": { description: "Redirections" },
    "4xx": { description: "Client errors" },
    "5xx": { description: "Server errors" },
  },
  es: {
    "1xx": { description: "Respuestas informativas" },
    "2xx": { description: "Respuestas exitosas" },
    "3xx": { description: "Redirecciones" },
    "4xx": { description: "Errores del cliente" },
    "5xx": { description: "Errores del servidor" },
  },
} as const;

// ---------------------------------------------------------------------------
// Base status code data (locale-independent fields)
// ---------------------------------------------------------------------------
interface StatusCodeBase {
  code: number;
  name: string;
  category: HttpStatusCategory;
  isCommon: boolean;
  relatedHeaders?: string[];
  rfcLink?: string;
  snippets?: Record<string, string>;
}

const STATUS_CODES_BASE: StatusCodeBase[] = [
  // 1xx Informational
  { code: 100, name: "Continue", category: "1xx", isCommon: false },
  { code: 101, name: "Switching Protocols", category: "1xx", isCommon: false },
  { code: 102, name: "Processing", category: "1xx", isCommon: false },
  { code: 103, name: "Early Hints", category: "1xx", isCommon: false },

  // 2xx Success
  {
    code: 200, name: "OK", category: "2xx", isCommon: true,
    relatedHeaders: ["Content-Type", "ETag"],
    rfcLink: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/200",
    snippets: {
      express: "res.status(200).json(data);",
      fastapi: "return data",
      spring: "return ResponseEntity.ok(data);",
      go: "w.WriteHeader(http.StatusOK)\njson.NewEncoder(w).Encode(data)",
    },
  },
  {
    code: 201, name: "Created", category: "2xx", isCommon: true,
    relatedHeaders: ["Location"],
    rfcLink: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/201",
    snippets: {
      express: "res.status(201).location(`/users/${id}`).json(user);",
      fastapi: "return JSONResponse(status_code=201, content=user)",
      spring: "return ResponseEntity.status(HttpStatus.CREATED).body(user);",
      go: "w.Header().Set(\"Location\", \"/users/1\")\nw.WriteHeader(http.StatusCreated)",
    },
  },
  { code: 202, name: "Accepted", category: "2xx", isCommon: true },
  { code: 203, name: "Non-Authoritative Information", category: "2xx", isCommon: false },
  { code: 204, name: "No Content", category: "2xx", isCommon: true },
  { code: 205, name: "Reset Content", category: "2xx", isCommon: false },
  { code: 206, name: "Partial Content", category: "2xx", isCommon: true, relatedHeaders: ["Content-Range", "Range"] },
  { code: 207, name: "Multi-Status", category: "2xx", isCommon: false },
  { code: 208, name: "Already Reported", category: "2xx", isCommon: false },
  { code: 226, name: "IM Used", category: "2xx", isCommon: false },

  // 3xx Redirection
  { code: 300, name: "Multiple Choices", category: "3xx", isCommon: false },
  { code: 301, name: "Moved Permanently", category: "3xx", isCommon: true, relatedHeaders: ["Location"] },
  { code: 302, name: "Found", category: "3xx", isCommon: true, relatedHeaders: ["Location"] },
  { code: 303, name: "See Other", category: "3xx", isCommon: true, relatedHeaders: ["Location"] },
  { code: 304, name: "Not Modified", category: "3xx", isCommon: true },
  { code: 307, name: "Temporary Redirect", category: "3xx", isCommon: false },
  { code: 308, name: "Permanent Redirect", category: "3xx", isCommon: false },

  // 4xx Client Error
  {
    code: 400, name: "Bad Request", category: "4xx", isCommon: true,
    rfcLink: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/400",
    snippets: {
      express: "res.status(400).send('Bad Request');",
      fastapi: "raise HTTPException(status_code=400, detail='Invalid input')",
      spring: "throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 'Invalid data');",
    },
  },
  {
    code: 401, name: "Unauthorized", category: "4xx", isCommon: true,
    relatedHeaders: ["WWW-Authenticate"],
    rfcLink: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/401",
  },
  { code: 402, name: "Payment Required", category: "4xx", isCommon: false },
  { code: 403, name: "Forbidden", category: "4xx", isCommon: true },
  {
    code: 404, name: "Not Found", category: "4xx", isCommon: true,
    rfcLink: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/404",
  },
  { code: 405, name: "Method Not Allowed", category: "4xx", isCommon: false, relatedHeaders: ["Allow"] },
  { code: 406, name: "Not Acceptable", category: "4xx", isCommon: false, relatedHeaders: ["Accept"] },
  { code: 407, name: "Proxy Authentication Required", category: "4xx", isCommon: false, relatedHeaders: ["Proxy-Authenticate"] },
  { code: 408, name: "Request Timeout", category: "4xx", isCommon: true },
  { code: 409, name: "Conflict", category: "4xx", isCommon: true },
  { code: 410, name: "Gone", category: "4xx", isCommon: false },
  { code: 411, name: "Length Required", category: "4xx", isCommon: false, relatedHeaders: ["Content-Length"] },
  { code: 412, name: "Precondition Failed", category: "4xx", isCommon: false, relatedHeaders: ["If-Match", "If-Unmodified-Since"] },
  { code: 413, name: "Content Too Large", category: "4xx", isCommon: true },
  { code: 414, name: "URI Too Long", category: "4xx", isCommon: false },
  { code: 415, name: "Unsupported Media Type", category: "4xx", isCommon: true, relatedHeaders: ["Content-Type"] },
  { code: 416, name: "Range Not Satisfiable", category: "4xx", isCommon: false, relatedHeaders: ["Content-Range"] },
  { code: 417, name: "Expectation Failed", category: "4xx", isCommon: false },
  { code: 418, name: "I'm a Teapot", category: "4xx", isCommon: false },
  { code: 421, name: "Misdirected Request", category: "4xx", isCommon: false },
  { code: 422, name: "Unprocessable Content", category: "4xx", isCommon: true },
  { code: 423, name: "Locked", category: "4xx", isCommon: false },
  { code: 424, name: "Failed Dependency", category: "4xx", isCommon: false },
  { code: 425, name: "Too Early", category: "4xx", isCommon: false },
  { code: 426, name: "Upgrade Required", category: "4xx", isCommon: false, relatedHeaders: ["Upgrade"] },
  { code: 428, name: "Precondition Required", category: "4xx", isCommon: false },
  {
    code: 429, name: "Too Many Requests", category: "4xx", isCommon: true,
    relatedHeaders: ["Retry-After"],
    rfcLink: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/429",
  },
  { code: 431, name: "Request Header Fields Too Large", category: "4xx", isCommon: false },
  { code: 451, name: "Unavailable For Legal Reasons", category: "4xx", isCommon: false },

  // 5xx Server Error
  {
    code: 500, name: "Internal Server Error", category: "5xx", isCommon: true,
    rfcLink: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/500",
    snippets: {
      express: "res.status(500).json({ error: 'Internal Server Error' });",
      spring: "return ResponseEntity.internalServerError().build();",
    },
  },
  { code: 501, name: "Not Implemented", category: "5xx", isCommon: false },
  { code: 502, name: "Bad Gateway", category: "5xx", isCommon: true },
  { code: 503, name: "Service Unavailable", category: "5xx", isCommon: true, relatedHeaders: ["Retry-After"] },
  { code: 504, name: "Gateway Timeout", category: "5xx", isCommon: true },
  { code: 505, name: "HTTP Version Not Supported", category: "5xx", isCommon: false },
  { code: 506, name: "Variant Also Negotiates", category: "5xx", isCommon: false },
  { code: 507, name: "Insufficient Storage", category: "5xx", isCommon: false },
  { code: 508, name: "Loop Detected", category: "5xx", isCommon: false },
  { code: 510, name: "Not Extended", category: "5xx", isCommon: false },
  { code: 511, name: "Network Authentication Required", category: "5xx", isCommon: false },
];

// ---------------------------------------------------------------------------
// Build locale-aware HttpStatusCode[] from base + strings
// ---------------------------------------------------------------------------
function buildStatusCodes(locale: Locale): HttpStatusCode[] {
  const strings = STATUS_STRINGS[locale];
  return STATUS_CODES_BASE.map((base) => {
    const localized = strings[base.code];
    // Fallback to English if a code is somehow missing in the locale map
    const fallback = STATUS_STRINGS["en"][base.code];
    const s = localized ?? fallback;
    return {
      ...base,
      description: s?.description ?? "",
      whenToUse: s?.whenToUse ?? "",
      example: s?.example ?? "",
    };
  });
}

// Cache built arrays so repeated calls don't rebuild
const statusCodesCache: Partial<Record<Locale, HttpStatusCode[]>> = {};

/** Get the full list of HTTP status codes in the given locale. Defaults to English. */
export function getStatusCodes(locale: Locale = "en"): HttpStatusCode[] {
  const cached = statusCodesCache[locale];
  if (cached) return cached;
  const codes = buildStatusCodes(locale);
  statusCodesCache[locale] = codes;
  return codes;
}

/**
 * Legacy static export for backward-compatibility.
 * New callers should prefer `getStatusCodes(locale)`.
 */
export const HTTP_STATUS_CODES: HttpStatusCode[] = getStatusCodes("en");

// ---------------------------------------------------------------------------
// Category info (locale-aware)
// ---------------------------------------------------------------------------
const CATEGORY_INFO_BASE: Record<HttpStatusCategory, Omit<CategoryInfo, "description">> = {
  "1xx": { category: "1xx", label: "Informational", color: "blue" },
  "2xx": { category: "2xx", label: "Success", color: "green" },
  "3xx": { category: "3xx", label: "Redirection", color: "yellow" },
  "4xx": { category: "4xx", label: "Client Error", color: "orange" },
  "5xx": { category: "5xx", label: "Server Error", color: "red" },
};

// ---------------------------------------------------------------------------
// Exported functions
// ---------------------------------------------------------------------------

/**
 * Search by exact code number
 */
export function searchByCode(code: number, locale: Locale = "en"): HttpStatusCode | null {
  return getStatusCodes(locale).find((s) => s.code === code) ?? null;
}

/**
 * Search by keyword in name, description and whenToUse
 */
export function searchByKeyword(query: string, locale: Locale = "en"): HttpStatusCode[] {
  if (!query.trim()) return [];

  const lower = query.toLowerCase();
  const codes = getStatusCodes(locale);

  // Search across both locales so users can find results regardless of input language
  const enCodes = getStatusCodes("en");
  const esCodes = getStatusCodes("es");

  const matchingIndices = new Set<number>();

  for (let i = 0; i < codes.length; i++) {
    const en = enCodes[i];
    const es = esCodes[i];
    const current = codes[i];
    if (
      current?.name.toLowerCase().includes(lower) ||
      current?.description.toLowerCase().includes(lower) ||
      current?.whenToUse.toLowerCase().includes(lower) ||
      en?.description.toLowerCase().includes(lower) ||
      en?.whenToUse.toLowerCase().includes(lower) ||
      es?.description.toLowerCase().includes(lower) ||
      es?.whenToUse.toLowerCase().includes(lower)
    ) {
      matchingIndices.add(i);
    }
  }

  return [...matchingIndices].map((i) => codes[i]!);
}

/**
 * Get all codes in a category
 */
export function getByCategory(category: HttpStatusCategory, locale: Locale = "en"): HttpStatusCode[] {
  return getStatusCodes(locale).filter((s) => s.category === category);
}

/**
 * Get common status codes
 */
export function getCommonCodes(locale: Locale = "en"): HttpStatusCode[] {
  return getStatusCodes(locale).filter((s) => s.isCommon);
}

/**
 * Check if a code is a known HTTP status code
 */
export function isValidStatusCode(code: number): boolean {
  return STATUS_CODES_BASE.some((s) => s.code === code);
}

/**
 * Get category info
 */
export function getCategoryInfo(category: HttpStatusCategory, locale: Locale = "en"): CategoryInfo {
  const base = CATEGORY_INFO_BASE[category];
  const strings = CATEGORY_STRINGS[locale][category];
  return {
    ...base,
    description: strings.description,
  };
}

/**
 * Process a search query (number or keyword)
 */
export function processSearch(query: string, category?: HttpStatusCategory, locale: Locale = "en"): SearchResult {
  let codes: HttpStatusCode[] = [];

  const trimmed = query.trim();

  if (!trimmed && !category) {
    codes = getCommonCodes(locale);
  } else if (!trimmed && category) {
    codes = getByCategory(category, locale);
  } else {
    // Try numeric search first
    const num = parseInt(trimmed, 10);
    if (!isNaN(num) && trimmed === num.toString()) {
      // Exact code search
      const exact = searchByCode(num, locale);
      if (exact) {
        codes = [exact];
      } else {
        // Partial numeric match (e.g., "40" matches 400, 401, etc.)
        codes = getStatusCodes(locale).filter((s) =>
          s.code.toString().startsWith(trimmed)
        );
      }
    } else {
      // Keyword search
      codes = searchByKeyword(trimmed, locale);
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
