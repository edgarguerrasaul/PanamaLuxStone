/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Formatos modernos = fotos más livianas y más rápidas de cargar.
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      // Si luego usas Cloudinary para las fotos de producto, se habilita aquí.
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
  eslint: {
    // No detiene el build (npm run build) por temas de estilo de código.
    // Sigue avisando en el editor y con `npm run lint`, pero no te
    // bloquea para publicar el sitio.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Igual que con ESLint: no bloquea el build por errores menores de
    // tipos mientras el proyecto está en construcción.
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
