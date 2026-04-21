import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["stripe", "resend"],
};

export default nextConfig;
