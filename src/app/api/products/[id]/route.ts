import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    // Try to extract id from params, fallback to URL if needed
    let id = params?.id;
    if (!id) {
      // Try to extract from URL
      const urlParts = req.nextUrl.pathname.split("/");
      id = urlParts[urlParts.length - 1];
    }
    console.log("[PUT /api/products/:id] params:", params);
    console.log("[PUT /api/products/:id] extracted id:", id);
    console.log("[PUT /api/products/:id] body:", body);

    // Input validation
    if (!id || typeof id !== "string" || !/^[0-9a-fA-F-]{36}$/.test(id)) {
      return NextResponse.json({ error: "Invalid or missing product id (UUID)", received: id }, { status: 400 });
    }
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Missing or invalid request body" }, { status: 400 });
    }
    // Example: require name and price fields (customize as needed)
    if (!body.name || typeof body.name !== "string") {
      return NextResponse.json({ error: "Missing or invalid product name" }, { status: 400 });
    }
    if (body.price === undefined || isNaN(Number(body.price))) {
      return NextResponse.json({ error: "Missing or invalid product price" }, { status: 400 });
    }

    const supabase = await supabaseServer();
    const { data, error } = await supabase.from("products").update(body).eq("id", id).select();
    if (error) {
      console.error("[PUT /api/products/:id] error:", error);
      // Distinguish between validation and server errors
      if (error.code === "23505" || error.code === "23503" || error.code === "22P02") {
        // Example: unique violation, foreign key violation, invalid input syntax
        return NextResponse.json({ error: error.message, code: error.code }, { status: 400 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!data || !data[0]) {
      return NextResponse.json({ error: "Product not found or not updated" }, { status: 404 });
    }
    console.log("[PUT /api/products/:id] updated data:", data);
    return NextResponse.json(data[0]);
  } catch (error: any) {
    console.error("[PUT /api/products/:id] unhandled error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await supabaseServer();
  const { error } = await supabase.from("products").delete().eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
