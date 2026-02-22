"use client";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import ProductCrud from "@/components/admin/product-crud";

export default function ProductCrudTabs() {
  return (
    <Tabs defaultValue="products" className="flex flex-row gap-2 md:gap-4">
      <TabsList className="flex flex-col min-w-[140px] md:min-w-[160px]">
        <TabsTrigger value="products">Products</TabsTrigger>
      </TabsList>
      <TabsContent value="products" className="flex-1">
        <ProductCrud />
      </TabsContent>
    </Tabs>
  );
}