// Parámetros de logística y costos, tomados de la hoja "Supuestos" de
// Piedra_sinterizada_AUTOMATIZADO.xlsx. Por ahora esto es solo DATO —
// todavía no se usa en el checkout ni en el cotizador. Sirve de base
// para cuando se construya el cálculo de acarreo por región (ver
// ROADMAP.md, Fase 2: "Motor de precios y acarreo regional").
//
// Si cambias estos números en tu Excel, actualízalos aquí también (o
// pídele a Claude que los vuelva a leer del archivo).

export const PLATE_AREA_M2 = 5.12; // 3200mm × 1600mm

export const LOGISTICS_COST_PER_M2 = {
  fleteMarino: 3.52,
  impuestosExportacionChina: 0.15,
  impuestosLocalesPanama: 0.07,
  mulaDesdeElPuerto: 0.4,
  alquilerYServicios: 1.1,
  descargaEnBodega: 0.5,
  totalLogisticaPorM2: 5.74, // suma de todo lo anterior (sin contar el costo de China ni el acarreo final)
};

// Costo de entrega de UNA placa (no por m²) según destino. "PTY" es
// dentro de Ciudad de Panamá; el resto son cargos adicionales por
// distancia — coinciden con las provincias que aparecen en
// Guerra_Prospectos_Panama_2026.xlsx como zonas de oportunidad.
export const ACARREO_POR_PLACA_USD = {
  ciudadDePanama: 50,
  penonome: 150,
  santiago: 250,
  chiriqui: 450,
};

export type DestinoAcarreo = keyof typeof ACARREO_POR_PLACA_USD;

export function calcularAcarreoPorM2(destino: DestinoAcarreo): number {
  return ACARREO_POR_PLACA_USD[destino] / PLATE_AREA_M2;
}

// Zonas de entrega para sembrar el modelo FreightZone (tabla editable
// desde /admin/acarreo). El "name" es lo que ve el cliente en el
// selector de zona del cotizador y el checkout.
export const FREIGHT_ZONES: { name: string; costPerSlab: number; sortOrder: number }[] = [
  { name: "Ciudad de Panamá", costPerSlab: ACARREO_POR_PLACA_USD.ciudadDePanama, sortOrder: 1 },
  { name: "Penonomé", costPerSlab: ACARREO_POR_PLACA_USD.penonome, sortOrder: 2 },
  { name: "Santiago", costPerSlab: ACARREO_POR_PLACA_USD.santiago, sortOrder: 3 },
  { name: "Chiriquí", costPerSlab: ACARREO_POR_PLACA_USD.chiriqui, sortOrder: 4 },
];
