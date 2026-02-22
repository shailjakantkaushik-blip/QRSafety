"use client";
import { useCart } from "./cart-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, clearCart } = useCart();
  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">Your Cart</h1>
      {items.length === 0 ? (
        <div className="text-muted-foreground">Your cart is empty.</div>
      ) : (
        <>
          <div className="space-y-4">
            {items.map((item) => (
              <Card key={item.productId} className="p-4 flex items-center justify-between">
                <div>
                  <div className="font-medium">{item.name}</div>
                  <div className="text-xs text-muted-foreground">{item.type}</div>
                  <div className="text-xs">${item.price} x </div>
                  <input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) => updateQuantity(item.productId, Number(e.target.value))}
                    className="w-16 border rounded px-2 py-1 ml-2"
                  />
                </div>
                <Button variant="destructive" onClick={() => removeFromCart(item.productId)}>
                  Remove
                </Button>
              </Card>
            ))}
          </div>
          <div className="mt-6 flex justify-between items-center">
            <div className="font-bold text-lg">Total: ${total.toFixed(2)}</div>
            <Button asChild>
              <Link href="/checkout">Proceed to Checkout</Link>
            </Button>
          </div>
          <div className="mt-4 text-right">
            <Button variant="outline" onClick={clearCart}>Clear Cart</Button>
          </div>
        </>
      )}
    </div>
  );
}
