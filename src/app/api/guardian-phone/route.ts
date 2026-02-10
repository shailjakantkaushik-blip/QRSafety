import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { upsertGuardianPhone } from "@/lib/guardian";

export async function POST(req: NextRequest) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { phone } = await req.json();
  const { error } = await upsertGuardianPhone({ userId: user.id, phone });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
