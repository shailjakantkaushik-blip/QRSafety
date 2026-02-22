import { NextRequest, NextResponse } from "next/server";
import { createOrder } from "@/app/(app)/individuals/order-actions";

export async function POST(req: NextRequest) {
  const data = await req.json();
  console.log('API /api/create-order received data:', data);
  const result = await createOrder(data);
  return NextResponse.json(result);
}
