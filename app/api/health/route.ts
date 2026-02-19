import { NextResponse } from "next/server";

/**
 * Health check endpoint for monitoring and post-deploy verification.
 * Returns 200 OK with version and timestamp.
 */
export function GET() {
  return NextResponse.json({
    status: "ok",
    version: process.env["NEXT_PUBLIC_APP_VERSION"] ?? "0.1.0",
    timestamp: new Date().toISOString(),
  });
}
