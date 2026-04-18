import { NextResponse } from "next/server";
import { getDbUserForRequest } from "@/lib/db-user";
import { deleteGoalForUser, getGoalForUser, updateGoalForUser } from "@/lib/goals";

type RouteContext = { params: Promise<{ goalId: string }> };

export async function GET(_req: Request, ctx: RouteContext) {
  const { goalId } = await ctx.params;
  const db = await getDbUserForRequest();
  if (!db.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: db.status });
  }

  const goal = await getGoalForUser(db.user.id, goalId);
  if (!goal) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(goal);
}

export async function PATCH(req: Request, ctx: RouteContext) {
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

  const title = (body as { title?: unknown }).title;
  const description = (body as { description?: unknown }).description;

  if (title !== undefined && typeof title !== "string") {
    return NextResponse.json({ error: "title must be a string" }, { status: 400 });
  }

  if (description !== undefined && description !== null && typeof description !== "string") {
    return NextResponse.json({ error: "description must be a string or null" }, { status: 400 });
  }

  const updated = await updateGoalForUser(db.user.id, goalId, {
    ...(title !== undefined ? { title } : {}),
    ...(description !== undefined ? { description } : {}),
  });

  if (!updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, ctx: RouteContext) {
  const { goalId } = await ctx.params;
  const db = await getDbUserForRequest();
  if (!db.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: db.status });
  }

  const deleted = await deleteGoalForUser(db.user.id, goalId);
  if (!deleted) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return new NextResponse(null, { status: 204 });
}
