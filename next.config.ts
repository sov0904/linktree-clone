import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // MAX_AVATAR_BYTES en src/app/actions/profile.ts permite hasta 2MB.
      // El límite por defecto de Server Actions es 1MB, así que subimos a
      // 3MB para dejar margen a los bytes extra de multipart/form-data
      // (boundaries, headers de cada parte) sobre el archivo de 2MB.
      bodySizeLimit: "3mb",
    },
  },
};

export default nextConfig;
