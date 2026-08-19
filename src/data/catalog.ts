// Catálogo real de Panamá LuxeStone.
//
// Fuentes:
//  - Nombres, descripciones, acabado/tono/veta/uso: catálogo web original
//    (catalogo_piedras_sinterizadas.html).
//  - Fotos: carpeta de fotos del proyecto (ya optimizadas en
//    public/images/products/).
//  - PRECIOS: hoja "Piedra_sinterizada_AUTOMATIZADO.xlsx" (hoja "Costos y
//    Precios"), que es el modelo de costos real del negocio (precio de
//    China + logística + margen). Esta hoja REEMPLAZA los precios por
//    categoría ($92/$95/$108) que traía el catálogo web viejo — los
//    precios de aquí son más precisos porque salen del costo real de cada
//    modelo, no de una categoría genérica.
//
// priceConfirmed: false => todavía no hay precio de venta real para ese
// modelo (no aparecía en ninguna de las dos fuentes) y se dejó un
// estimado. Revisar antes de publicar.
//
// descriptionConfirmed: false => la descripción de marketing (subtítulo,
// descripción, tono/veta/acabado) es un BORRADOR escrito a partir de la
// foto y/o del nombre del modelo — todavía no salió de ti. Revísala,
// corrígela o bórrala antes de publicar. En la ficha de producto del
// sitio, estos modelos deberían mostrar un aviso de "borrador sin
// confirmar" (falta agregar ese aviso visual — ver ROADMAP.md).
//
// Agregados el 2026-08-18 a partir de la hoja de costos (estaban en el
// costeo pero no en el catálogo web original):
//  - "burberry": SÍ tiene foto real (Burberry (Dried glue particles).jpg).
//    La descripción se escribió mirando la foto (fondo blanco con vetas
//    gruesas color cobre/óxido) — confirmar el nombre comercial real.
//  - "panda-white" y "travertine-beige": NO tienen foto todavía. Se
//    usó una imagen de relleno (con el texto "FOTO PENDIENTE" visible)
//    y una descripción genérica basada en cómo se conocen estos
//    patrones de piedra en la industria. Reemplazar en cuanto tengas
//    la foto real — y ojo: "Travertine Beige" podría ser el mismo
//    modelo que "Saturnia" (Travertino Moderno) con otro nombre;
//    confírmalo para no duplicar.

export type CatalogCollection = {
  slug: string;
  name: string;
  description: string;
  sortOrder: number;
};

export type CatalogProduct = {
  slug: string;
  name: string;
  subtitle: string;
  description: string;
  finish: string;
  toneBase: string;
  vein: string;
  usage: string;
  thicknessMm: number;
  pricePerM2: number;
  priceConfirmed: boolean;
  /** false = descripción borrador escrita por Claude, no confirmada por el negocio */
  descriptionConfirmed: boolean;
  collectionSlug: string;
  featured?: boolean;
  hasPlaceholderImage?: boolean;
  /**
   * true = hay stock local disponible ahora mismo (aparece en la pestaña
   * "Compra Inmediata"). No se marcó ningún modelo como true por defecto
   * porque no tenemos datos reales de inventario todavía — actívalo desde
   * el panel de administrador (/admin/productos) para los modelos que sí
   * tengan stock físico en Panamá.
   */
  immediateStock?: boolean;
};

// Medidas y espesores disponibles para TODOS los modelos (regla del
// proveedor, no varía por producto — 2026-08-19, indicado por Edgar):
//   - 320 × 160 cm: SOLO se consigue en 1.2 cm de espesor.
//   - 240 × 80 cm y 200 × 70 cm: se consiguen en 1.2 cm y en 1.5 cm.
// Esto se guarda como JSON en `Product.availableSizes` (ver
// prisma/schema.prisma) y `prisma/seed.ts` lo aplica a cada producto al
// sembrar/actualizar la base de datos. Si el proveedor cambia esta regla,
// actualiza solo aquí y vuelve a correr `npm run db:seed`.
export const STANDARD_AVAILABLE_SIZES: {
  widthCm: number;
  heightCm: number;
  thicknessesCm: number[];
}[] = [
  { widthCm: 320, heightCm: 160, thicknessesCm: [1.2] },
  { widthCm: 240, heightCm: 80, thicknessesCm: [1.2, 1.5] },
  { widthCm: 200, heightCm: 70, thicknessesCm: [1.2, 1.5] },
];

export const STANDARD_AVAILABLE_SIZES_JSON = JSON.stringify(STANDARD_AVAILABLE_SIZES);

export const collections: CatalogCollection[] = [
  {
    slug: "blancos-y-claros",
    name: "Tonos Blancos y Claros",
    description:
      "Mármoles y calacattas de gran formato en tonos blancos, marfil y beige. La colección más versátil, ideal para cocinas, baños y proyectos residenciales de alto volumen.",
    sortOrder: 1,
  },
  {
    slug: "tonos-oscuros",
    name: "Tonos Oscuros",
    description:
      "Grises antracita y negros con vetas dramáticas. Para cocinas y baños que buscan contraste y presencia.",
    sortOrder: 2,
  },
  {
    slug: "modelos-exoticos",
    name: "Modelos Exóticos",
    description:
      "Piezas de colección: madera sinterizada, ónice retroiluminado y acabados espejo. Para espacios signature de máximo impacto visual.",
    sortOrder: 3,
  },
];

export const products: CatalogProduct[] = [
  // ── Tonos Blancos y Claros ──
  {
    slug: "alice-gold",
    name: "Alice Gold",
    subtitle: "Mármol Blanco Veteado",
    description:
      "Fondo blanco puro con finas venas doradas y carameladas que cruzan diagonalmente. Elegancia clásica de inspiración italiana, ideal para encimeras y revestimientos de lujo.",
    finish: "Pulido / Matt",
    toneBase: "Blanco marfil",
    vein: "Dorada / Caramel",
    usage: "Interior / Exterior",
    thicknessMm: 12,
    pricePerM2: 90,
    priceConfirmed: true,
    descriptionConfirmed: true,
    collectionSlug: "blancos-y-claros",
    featured: true,
  },
  {
    slug: "carrara-gold",
    name: "Carrara Gold",
    subtitle: "Clásico Italiano",
    description:
      "Recreación moderna del icónico mármol de Carrara enriquecida con venas doradas y grises. Compleja y pictórica, cada placa cuenta una historia geológica única.",
    finish: "Pulido / Matt",
    toneBase: "Blanco / Gris frío",
    vein: "Dorado / Óxido",
    usage: "Interior / Exterior",
    thicknessMm: 12,
    pricePerM2: 90,
    priceConfirmed: true,
    descriptionConfirmed: true,
    collectionSlug: "blancos-y-claros",
  },
  {
    slug: "gadal-calacatta-gold",
    name: "Gadal Calacatta Gold",
    subtitle: "Calacatta Premium",
    description:
      "Versión de gran formato del Calacatta gold con venas doradas anchas y expresivas sobre fondo blanco cremoso. El referente absoluto del lujo en cocinas y baños premium.",
    finish: "Pulido / Matt",
    toneBase: "Blanco crema",
    vein: "Dorado intenso",
    usage: "Interior / Exterior",
    thicknessMm: 12,
    pricePerM2: 90,
    priceConfirmed: true,
    descriptionConfirmed: true,
    collectionSlug: "blancos-y-claros",
    featured: true,
  },
  {
    slug: "hetian-jade",
    name: "Hetian Jade",
    subtitle: "Jade Chino Translúcido",
    description:
      "Inspirada en el jade de Hetian, la piedra más venerada de China. Fondo blanco nacarado con nubosidades suaves y venas doradas etéreas.",
    finish: "Pulido",
    toneBase: "Blanco nacarado",
    vein: "Dorado etéreo",
    usage: "Interior premium",
    thicknessMm: 12,
    pricePerM2: 90,
    priceConfirmed: true,
    descriptionConfirmed: true,
    collectionSlug: "blancos-y-claros",
  },
  {
    slug: "ink-white",
    name: "Ink White",
    subtitle: "Blanco Satinado",
    description:
      "Blanco inmaculado con finas venas grises que se deslizan en paralelo con elegancia minimalista. Ideal para baños de lujo y cocinas de estética nórdica.",
    finish: "Pulido",
    toneBase: "Blanco puro",
    vein: "Gris plata sutil",
    usage: "Interior y Exterior",
    thicknessMm: 12,
    pricePerM2: 90,
    priceConfirmed: true,
    descriptionConfirmed: true,
    collectionSlug: "blancos-y-claros",
  },
  {
    slug: "louis-gold",
    name: "Louis Gold",
    subtitle: "Calacatta Dorado",
    description:
      "Fondo blanco con venas doradas anchas y fluidas de marcado carácter. Reminiscencia del lujo rococó francés reinterpretado en formato sinterizado.",
    finish: "Pulido / Matt",
    toneBase: "Blanco nácar",
    vein: "Dorado ámbar",
    usage: "Interior y Exterior",
    thicknessMm: 12,
    pricePerM2: 90,
    priceConfirmed: true,
    descriptionConfirmed: true,
    collectionSlug: "blancos-y-claros",
  },
  {
    slug: "new-snow-stone",
    name: "New Snow Stone",
    subtitle: "Blanco Nieve Polished",
    description:
      "Blanco níveo con venas grises de trazado fluido y orgánico. La pureza de la nieve recién caída capturada en una superficie sinterizada uniforme.",
    finish: "Pulido",
    toneBase: "Blanco nieve",
    vein: "Gris humo",
    usage: "Interior y Exterior",
    thicknessMm: 12,
    pricePerM2: 92,
    priceConfirmed: true,
    descriptionConfirmed: true,
    collectionSlug: "blancos-y-claros",
  },
  {
    slug: "premium-taj-mahal",
    name: "Premium Taj Mahal",
    subtitle: "Beige Premium",
    description:
      "Inspirada en la cuarcita brasileña Taj Mahal, en tonos arena cálidos con venas doradas. Calidez y sofisticación para suelos, paredes y encimeras.",
    finish: "Pulido",
    toneBase: "Beige arena cálido",
    vein: "Dorado / Caramel",
    usage: "Interior y Exterior",
    thicknessMm: 12,
    pricePerM2: 90,
    priceConfirmed: true,
    descriptionConfirmed: true,
    collectionSlug: "blancos-y-claros",
  },
  {
    slug: "roman-beige-cave-stone",
    name: "Roman Beige Cave Stone",
    subtitle: "Piedra Caliza Romana",
    description:
      "Piedra caliza de inspiración romana con bandas horizontales uniformes que evocan capas sedimentarias. Calidez mediterránea para arquitectura clásica o biofílica.",
    finish: "Pulido",
    toneBase: "Beige crema suave",
    vein: "Arena / Topo",
    usage: "Interior y Exterior",
    thicknessMm: 12,
    pricePerM2: 90,
    priceConfirmed: true,
    descriptionConfirmed: true,
    collectionSlug: "blancos-y-claros",
  },
  {
    slug: "royal-calacatta-white",
    name: "Royal Calacatta White",
    subtitle: "Calacatta Real",
    description:
      "Calacatta de gran formato con venas grises de trazo amplio y seguro. Movimiento continuo entre placas, ideal para revestimientos de libro abierto.",
    finish: "Pulido / Matt",
    toneBase: "Blanco luminoso",
    vein: "Gris plateado",
    usage: "Interior y Exterior",
    thicknessMm: 12,
    pricePerM2: 90,
    priceConfirmed: true,
    descriptionConfirmed: true,
    collectionSlug: "blancos-y-claros",
  },
  {
    slug: "saturnia",
    name: "Saturnia",
    subtitle: "Travertino Moderno",
    description:
      "Inspirada en el travertino de Saturnia con venas grises azuladas de carácter arquitectónico. Sofisticación atemporal entre tradición y modernidad.",
    finish: "Pulido / Matt",
    toneBase: "Blanco / Gris frío",
    vein: "Gris azulado",
    usage: "Interior y Exterior",
    thicknessMm: 12,
    pricePerM2: 90,
    priceConfirmed: true,
    descriptionConfirmed: true,
    collectionSlug: "blancos-y-claros",
  },
  {
    slug: "victoria-white",
    name: "Victoria White",
    subtitle: "Calacatta Victoria",
    description:
      "Blanco glacial con venas grises de trazo expresivo y nódulos de mayor densidad visual. Elegancia monumental para revestimientos continuos de gran formato.",
    finish: "Pulido / Matt",
    toneBase: "Blanco glacial",
    vein: "Gris expresivo",
    usage: "Interior y Exterior",
    thicknessMm: 12,
    pricePerM2: 90,
    priceConfirmed: true,
    descriptionConfirmed: true,
    collectionSlug: "blancos-y-claros",
  },

  // ── Tonos Oscuros ──
  {
    slug: "armani-dark-grey",
    name: "Armani Dark Grey",
    subtitle: "Piedra Oscura Premium",
    description:
      "Gris antracita profundo con finas venas blancas que crean un movimiento sutil y sofisticado. Inspirado en la estética Pietra di Cardoso.",
    finish: "Pulido / Matt",
    toneBase: "Gris antracita",
    vein: "Blanco sutil",
    usage: "Interior / Exterior",
    thicknessMm: 12,
    pricePerM2: 90,
    priceConfirmed: true,
    descriptionConfirmed: true,
    collectionSlug: "tonos-oscuros",
    featured: true,
  },
  {
    slug: "armani-light-grey",
    name: "Armani Light Grey",
    subtitle: "Piedra Gris Clara",
    description:
      "Gris medio luminoso con textura de piedra natural fósil y venas blancas bien definidas. Versatilidad máxima con paletas neutras o acentos de color.",
    finish: "Pulido / Matt",
    toneBase: "Gris perla",
    vein: "Blanco / Gris",
    usage: "Interior / Exterior",
    thicknessMm: 12,
    pricePerM2: 90,
    priceConfirmed: true,
    descriptionConfirmed: true,
    collectionSlug: "tonos-oscuros",
  },
  {
    slug: "carmen-black",
    name: "Carmen Black",
    subtitle: "Negro Absoluto Veteado",
    description:
      "Negro profundo con dramáticas venas blancas que recorren la superficie como relámpagos. Inspirado en el Marquina negro, máximo contraste.",
    finish: "Pulido / Matt",
    toneBase: "Negro intenso",
    vein: "Blanco dramático",
    usage: "Interior / Exterior",
    thicknessMm: 12,
    pricePerM2: 96,
    priceConfirmed: true,
    descriptionConfirmed: true,
    collectionSlug: "tonos-oscuros",
  },
  {
    slug: "dini-saint-castle-dark-grey",
    name: "Dini Saint Castle Dark Grey",
    subtitle: "Piedra Gris Oscuro",
    description:
      "Gris pizarra oscuro con rica trama de microvenas blancas que crean un efecto casi nebuloso. Evoca la solidez de la piedra de castillo medieval.",
    finish: "Pulido",
    toneBase: "Gris pizarra",
    vein: "Blanco nebuloso",
    usage: "Interior / Exterior",
    thicknessMm: 12,
    pricePerM2: 90,
    priceConfirmed: true,
    descriptionConfirmed: true,
    collectionSlug: "tonos-oscuros",
  },

  // ── Modelos Exóticos ──
  {
    slug: "egg-wood-grain",
    name: "Egg Wood Grain",
    subtitle: "Madera Sinterizada",
    description:
      "Imitación madera de nogal oscuro con veta longitudinal continua y tallado artístico en relieve. La calidez de la madera con la durabilidad de la piedra.",
    finish: "Tallado / Relieve",
    toneBase: "Marrón chocolate",
    vein: "Veta de madera",
    usage: "Interior",
    thicknessMm: 12,
    pricePerM2: 91,
    priceConfirmed: true,
    descriptionConfirmed: true,
    collectionSlug: "modelos-exoticos",
  },
  {
    slug: "golden-brocade-brown-sand",
    name: "Golden Brocade Brown Sand",
    subtitle: "Ónice Cálido",
    description:
      "Explosión cromática de ámbar, naranja y marrón tostado con bandas horizontales que evocan capas geológicas. Efecto ónice retroiluminado.",
    finish: "Pulido translúcido",
    toneBase: "Ámbar / Naranja",
    vein: "Bandas geológicas",
    usage: "Interior / Retroiluminado",
    thicknessMm: 12,
    pricePerM2: 102,
    priceConfirmed: true,
    descriptionConfirmed: true,
    collectionSlug: "modelos-exoticos",
  },
  {
    slug: "prada-green",
    name: "Prada Green",
    subtitle: "Piedra Verde Oscura",
    description:
      "Fondo negro volcánico surcado por dramáticas venas verde jade y blanco cristal. Una pieza de colección de extraordinaria personalidad.",
    finish: "Pulido",
    toneBase: "Negro / Verde oscuro",
    vein: "Verde jade / Blanco",
    usage: "Interior y Exterior",
    thicknessMm: 12,
    pricePerM2: 90,
    priceConfirmed: true,
    descriptionConfirmed: true,
    collectionSlug: "modelos-exoticos",
    featured: true,
  },
  {
    slug: "starry-blue",
    name: "Starry Blue",
    subtitle: "Azul Estelar Espejo",
    description:
      "Azul noche con ríos de dorado y blanco que crean un efecto galáctico único. Acabado espejo de alta reflectividad para espacios signature de máximo lujo.",
    finish: "Espejo / Glaze",
    toneBase: "Azul noche profundo",
    vein: "Dorado / Blanco",
    usage: "Interior premium",
    thicknessMm: 12,
    // Antes esto estaba estimado en $125 (no había precio real todavía).
    // La hoja de costos SÍ trae precio real para Starry Blue: $86/m²
    // (cuesta más traerlo de China, pero se vende un poco más barato
    // que el resto — revisa que ese margen te siga sirviendo).
    pricePerM2: 86,
    priceConfirmed: true,
    descriptionConfirmed: true,
    collectionSlug: "modelos-exoticos",
    featured: true,
  },

  // ── BORRADOR — agregados el 2026-08-18 desde la hoja de costos,
  // pendientes de que confirmes foto/nombre/descripción real (ver nota
  // al inicio del archivo y ROADMAP.md) ──
  {
    slug: "burberry",
    name: "Burberry",
    subtitle: "Breccia Blanca y Cobre [BORRADOR]",
    description:
      "[Descripción borrador, escrita a partir de la foto real del proyecto — confirmar nombre comercial y texto final] Fondo blanco marfil fracturado por vetas gruesas color cobre/óxido que recorren la superficie en ángulos irregulares, con vetas grises secundarias más finas entre las fracturas. Efecto de piedra quebrada y reconstruida (breccia) de gran formato, pensado como pieza central para islas o revestimientos signature.",
    finish: "Pulido [a confirmar]",
    toneBase: "Blanco marfil",
    vein: "Cobre / Óxido, con grises secundarios",
    usage: "Interior / Exterior [a confirmar]",
    thicknessMm: 12,
    pricePerM2: 121,
    priceConfirmed: true,
    descriptionConfirmed: false,
    collectionSlug: "modelos-exoticos",
  },
  {
    slug: "panda-white",
    name: "Panda White",
    subtitle: "Blanco y Negro Moteado [BORRADOR]",
    description:
      "[Descripción borrador — todavía no hay foto de este modelo. Se basó en cómo se conoce comercialmente 'Panda White' en la industria de la piedra: granito/piedra de fondo blanco o gris muy claro con manchas y vetas negras marcadas, de aspecto moteado.] Contraste fuerte de blanco y negro en un patrón irregular tipo 'piel de vaca', para cocinas y baños que buscan un efecto gráfico y contemporáneo.",
    finish: "Pulido [a confirmar]",
    toneBase: "Blanco / Gris muy claro",
    vein: "Negro marcado, patrón moteado",
    usage: "Interior y Exterior [a confirmar]",
    thicknessMm: 12,
    pricePerM2: 90,
    priceConfirmed: true,
    descriptionConfirmed: false,
    collectionSlug: "tonos-oscuros",
    hasPlaceholderImage: true,
  },
  {
    slug: "travertine-beige",
    name: "Travertine Beige",
    subtitle: "Travertino Beige Clásico [BORRADOR]",
    description:
      "[Descripción borrador — todavía no hay foto de este modelo. OJO: revisar si es el mismo modelo que 'Saturnia' (ya está en el catálogo como 'Travertino Moderno') antes de publicarlo como algo distinto, para no duplicar.] Tono beige cálido con la porosidad y el veteado horizontal característico del travertino clásico, en formato sinterizado de gran tamaño.",
    finish: "Pulido [a confirmar]",
    toneBase: "Beige cálido",
    vein: "Horizontal, porosidad de travertino",
    usage: "Interior y Exterior [a confirmar]",
    thicknessMm: 12,
    pricePerM2: 90,
    priceConfirmed: true,
    descriptionConfirmed: false,
    collectionSlug: "blancos-y-claros",
    hasPlaceholderImage: true,
  },
];

export const PLATE_WIDTH_M = 1.6;
export const PLATE_HEIGHT_M = 3.2;
export const PLATE_AREA_M2 = PLATE_WIDTH_M * PLATE_HEIGHT_M; // 5.12 m²
