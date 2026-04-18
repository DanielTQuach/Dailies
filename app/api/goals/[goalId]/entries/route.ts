import { NextResponse } from "next/server";
import { getDbUserForRequest } from "@/lib/db-user";
import { createProgressEntryForUser, listProgressForGoal } from "@/lib/progress";

type RouteContext = { params: Promise<{ goalId: string }> };

export async function GET(_req: Request, ctx: RouteContext) {
  const { goalId } = await ctx.params;
  const db = await getDbUserForRequest();
  if (!db.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: db.status });
  }

  const entries = await listProgressForGoal(db.user.id, goalId);
  if (entries === null) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(entries);
}

export async function POST(req: Request, ctx: RouteContext) {
  const { goalId } = await ctx.params;
  const db = await getDbUserForRequest();
  if (!db.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: db.status });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Expected JSON object" }, { status: 400 });
  }

  const amountRaw = (body as { amount?: unknown }).amount;
  const note = (body as { note?: unknown }).note;

  const amount =
    amountRaw === undefined
      ? undefined
      : typeof amountRaw === "number"
        ? amountRaw
        : typeof amountRaw === "string"
          ? Number(amountRaw)
          : NaN;

  if (amountRaw !== undefined && !Number.isFinite(amount)) {
    return NextResponse.json({ error: "amount must be a number" }, { status: 400 });
  }

  if (note !== undefined && note !== null && typeof note !== "string") {
    return NextResponse.json({ error: "note must be a string or null" }, { status: 400 });
  }

  try {
    const entry = await createProgressEntryForUser(db.user.id, goalId, {
      amount,
      note: note === undefined ? undefined : (note as string | null),
    });
    if (!entry) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(entry, { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Invalid request";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
