import { db } from "@/lib/db";
import CheckoutForm from "@/components/CheckoutForm";

export default async function CheckoutPage() {
  const zones = await db.freightZone.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } });
  return (
    <CheckoutForm
      freightZones={zones.map((z) => ({ id: z.id, name: z.name, costPerSlab: z.costPerSlab }))}
    />
  );
}
