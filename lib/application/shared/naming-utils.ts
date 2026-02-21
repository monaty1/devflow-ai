/**
 * Shared naming convention utilities.
 * Used by dto-matic and potentially other tools.
 */

export function toCamelCase(str: string): string {
  return str
    .replace(/[-_\s]+(.)?/g, (_: string, c: string | undefined) => (c ? c.toUpperCase() : ""))
    .replace(/^[A-Z]/, (c: string) => c.toLowerCase());
}

export function toPascalCase(str: string): string {
  const camel = toCamelCase(str);
  return camel.charAt(0).toUpperCase() + camel.slice(1);
}

export function toSnakeCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, "$1_$2")
    .replace(/[-\s]+/g, "_")
    .toLowerCase();
}

export function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/[_\s]+/g, "-")
    .toLowerCase();
}
