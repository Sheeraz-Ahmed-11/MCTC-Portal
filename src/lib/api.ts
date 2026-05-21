import { NextResponse } from "next/server";
import type { ZodError } from "zod";

export function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export function notFound(message = "Not found") {
  return NextResponse.json({ error: message }, { status: 404 });
}

export function badRequest(error: unknown) {
  if (isZodError(error)) {
    return NextResponse.json(
      { error: "Validation failed", details: error.flatten() },
      { status: 400 },
    );
  }
  return NextResponse.json({ error: String(error) }, { status: 400 });
}

export function serverError() {
  return NextResponse.json({ error: "Server error" }, { status: 500 });
}

function isZodError(error: unknown): error is ZodError {
  return (
    typeof error === "object" &&
    error !== null &&
    "issues" in error &&
    Array.isArray((error as ZodError).issues)
  );
}
