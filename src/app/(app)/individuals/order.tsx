"use client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useRef } from "react";

import { supabaseBrowser } from '@/lib/supabase/client';

async function getProductIdByType(productType: string) {
  const supabase = supabaseBrowser();
  const { data, error } = await supabase
    .from('products')
    .select('id, type')
    .eq('type', productType)
    .single();
  console.log('getProductIdByType:', { productType, data, error });
  if (error || !data) return null;
  return data.id;
}


const PRODUCTS = [
  { id: "wristband", label: "Wrist Band" },
  { id: "chesttag", label: "Chest Tag" },
  { id: "belthook", label: "Belt Hook" },
];

export default function OrderPage({ individualId }: { individualId: string }) {
  console.log('OrderPage received individualId:', individualId);
  const [selected, setSelected] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    setSuccess(false);
    const formData = new FormData(e.currentTarget);
    // Convert FormData to object and ensure individual_id is set
    const data: any = {};
    formData.forEach((value, key) => {
      data[key] = value;
    });
    data.individual_id = individualId;
    if (!data.individual_id) {
      alert('Error: individual_id is missing!');
      setPending(false);
      return;
    }
    // Fetch product_id by productType
    const productType = data.productType;
    const product_id = await getProductIdByType(productType);
    if (!product_id) {
      setError('Could not find product for selected type.');
      setPending(false);
      return;
    }
    data.product_id = product_id;
    delete data.productType;
    console.log('Submitting order data:', data);
    // Submit order via API route
    const res = await fetch('/api/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(r => r.json());
    setPending(false);
    if (res.ok && res.order) {
      setOrderId(res.order.id);
      setSuccess(true);
      formRef.current?.reset();
      setSelected(null);
    } else {
      setError(res.message || "Order failed. Try again.");
    }
    // Demo: Simulate payment completion
    async function handlePaymentComplete() {
      if (!orderId) return;
      const res = await fetch('/api/update-order-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, newStatus: 'payment_completed_and_ordered' }),
      }).then(r => r.json());
      if (res.ok) {
        alert('Payment completed and order status updated!');
      } else {
        alert('Failed to update order status: ' + (res.message || 'Unknown error'));
      }
    }
  }

  return (
    <main className="max-w-lg mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">Order QR Product</h1>
      <form ref={formRef} onSubmit={handleSubmit}>
        {/* individual_id is added programmatically */}
        <Card className="p-6 mb-6">
          <div className="font-semibold mb-2">Select Product Type</div>
          <div className="grid gap-4">
            {PRODUCTS.map((p) => (
              <label key={p.id} className={`flex items-center gap-3 p-3 border rounded cursor-pointer transition ${selected === p.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}> 
                <input
                  type="radio"
                  name="productType"
                  value={p.id}
                  checked={selected === p.id}
                  onChange={() => setSelected(p.id)}
                  className="accent-blue-500"
                  required
                />
                <span className="font-medium">{p.label}</span>
              </label>
            ))}
          </div>
        </Card>
        <Card className="p-6 mb-6">
          <div className="font-semibold mb-2">Billing Information</div>
          <div className="grid gap-4">
            <input className="border rounded px-3 py-2" name="name" placeholder="Full Name" required />
            <input className="border rounded px-3 py-2" name="email" type="email" placeholder="Email" required />
            <input className="border rounded px-3 py-2" name="address" placeholder="Shipping Address" required />
            <input className="border rounded px-3 py-2" name="city" placeholder="City" required />
            <input className="border rounded px-3 py-2" name="zip" placeholder="ZIP / Postal Code" required />
            <input className="border rounded px-3 py-2" name="country" placeholder="Country" required />
          </div>
        </Card>
        <Button className="w-full" type="submit" disabled={!selected || pending || success}>
          {pending ? "Ordering..." : success ? "Order Placed!" : "Place Order"}
        </Button>
        {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
        {success && (
          <>
            <div className="text-green-600 text-sm mt-2">Order placed successfully! Proceed to payment.</div>
            {orderId && (
              <button
                type="button"
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={handlePaymentComplete}
              >
                Simulate Payment Completion
              </button>
            )}
          </>
        )}
      </form>
    </main>
  );
}
