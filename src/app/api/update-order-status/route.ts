import { NextRequest, NextResponse } from "next/server";
import { updateOrderStatus } from "@/app/(app)/individuals/order-actions";

export async function POST(req: NextRequest) {
  const { orderId, newStatus } = await req.json();
  const result = await updateOrderStatus(orderId, newStatus);
  return NextResponse.json(result);
}
