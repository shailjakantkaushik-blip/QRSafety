"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";

export default function OrderList({ orders, error }: { orders: any[]; error?: any }) {
  if (error) return <div className="text-red-600">Failed to load orders.</div>;
  if (!orders || orders.length === 0) return <Card className="p-6 mt-4">No products ordered yet.</Card>;

  // Store formatted dates in state to ensure client-only rendering
  const [formattedDates, setFormattedDates] = useState<string[]>([]);

  useEffect(() => {
    setFormattedDates(
      orders.map((order: any) =>
        order.created_at ? new Date(order.created_at).toLocaleString() : ""
      )
    );
  }, [orders]);

  return (
    <Card className="p-6 mt-4">
      <div className="font-semibold mb-2">Ordered Products</div>
      <div className="space-y-4">
        {orders.map((order: any, idx: number) => (
          <div key={order.id} className="border-b pb-2 last:border-b-0 last:pb-0">
            <div className="flex justify-between items-center">
              <div>
                <div className="font-medium">{order.product?.name || 'Product'}</div>
                <div className="text-xs text-muted-foreground">{order.product?.type}</div>
                <div className="text-xs text-muted-foreground">{order.product?.description}</div>
              </div>
              <div className="text-xs text-right">
                <div>Status: <b>{order.status}</b></div>
                <div>Ordered: {formattedDates[idx]}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
