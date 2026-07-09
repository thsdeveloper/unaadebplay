import type { NextConfig } from 'next';

const config: NextConfig = {
  transpilePackages: ['@repo/api-client', '@repo/validation', '@repo/db-types', '@repo/types'],
};

export default config;
