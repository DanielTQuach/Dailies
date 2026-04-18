import { NextResponse } from "next/server";
import { getDbUserForRequest } from "@/lib/db-user";
import { createGoal, listGoalsForUser } from "@/lib/goals";

export async function GET() {
  const db = await getDbUserForRequest();
  if (!db.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: db.status });
  }

  const goals = await listGoalsForUser(db.user.id);
  return NextResponse.json(goals);
}

export async function POST(req: Request) {
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

  if (typeof title !== "string" || title.trim().length === 0) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }

  if (description !== undefined && description !== null && typeof description !== "string") {
    return NextResponse.json({ error: "description must be a string" }, { status: 400 });
  }

  const goal = await createGoal(db.user.id, {
    title,
    description: typeof description === "string" ? description : undefined,
  });

  return NextResponse.json(goal, { status: 201 });
}
