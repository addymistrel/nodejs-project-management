import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('Docker & Nginx Orchestration Configuration', () => {
  const rootDir = path.resolve(__dirname, '..');
  const clientDir = path.resolve(rootDir, 'client');

  describe('Client Nginx Configuration (client/nginx.conf)', () => {
    const nginxConfPath = path.join(clientDir, 'nginx.conf');

    it('should exist', () => {
      expect(fs.existsSync(nginxConfPath)).toBe(true);
    });

    it('should configure port 80, SPA fallback, and proxy rules', () => {
      const content = fs.readFileSync(nginxConfPath, 'utf8');

      expect(content).toContain('listen 80;');
      expect(content).toContain('root /usr/share/nginx/html;');
      expect(content).toContain('try_files $uri $uri/ /index.html;');
      expect(content).toMatch(/client_max_body_size\s+50M;/);
      expect(content).toContain('location /api/');
      expect(content).toContain('proxy_pass http://api:3000/api/;');
      expect(content).toContain('proxy_http_version 1.1;');
      expect(content).toContain('location /health');
      expect(content).toContain('proxy_pass http://api:3000/api/v1/health;');
      expect(content).toContain('gzip on;');
    });
  });

  describe('Client Dockerfile (client/Dockerfile)', () => {
    const dockerfilePath = path.join(clientDir, 'Dockerfile');

    it('should exist', () => {
      expect(fs.existsSync(dockerfilePath)).toBe(true);
    });

    it('should implement multi-stage build with node:20-alpine and nginx:alpine', () => {
      const content = fs.readFileSync(dockerfilePath, 'utf8');

      expect(content).toContain('FROM node:20-alpine AS builder');
      expect(content).toContain('npm ci');
      expect(content).toContain('npm run build');
      expect(content).toContain('FROM nginx:alpine AS runner');
      expect(content).toContain('COPY --from=builder /app/dist /usr/share/nginx/html');
      expect(content).toContain('COPY nginx.conf /etc/nginx/conf.d/default.conf');
      expect(content).toContain('EXPOSE 80');
      expect(content).toContain('HEALTHCHECK');
      expect(content).toContain('CMD ["nginx", "-g", "daemon off;"]');
    });
  });

  describe('Client Dockerfile Dev (client/Dockerfile.dev)', () => {
    const devDockerfilePath = path.join(clientDir, 'Dockerfile.dev');

    it('should exist', () => {
      expect(fs.existsSync(devDockerfilePath)).toBe(true);
    });

    it('should configure node:20-alpine with port 5173 exposed', () => {
      const content = fs.readFileSync(devDockerfilePath, 'utf8');

      expect(content).toContain('FROM node:20-alpine');
      expect(content).toContain('EXPOSE 5173');
      expect(content).toContain('CMD ["npm", "run", "dev"');
    });
  });

  describe('Client .dockerignore (client/.dockerignore)', () => {
    const dockerignorePath = path.join(clientDir, '.dockerignore');

    it('should exist and ignore node_modules and dist', () => {
      expect(fs.existsSync(dockerignorePath)).toBe(true);
      const content = fs.readFileSync(dockerignorePath, 'utf8');

      expect(content).toContain('node_modules');
      expect(content).toContain('dist');
    });
  });

  describe('Docker Compose Production (docker-compose.yml)', () => {
    const composePath = path.join(rootDir, 'docker-compose.yml');

    it('should exist', () => {
      expect(fs.existsSync(composePath)).toBe(true);
    });

    it('should configure api and client services on appnet network', () => {
      const content = fs.readFileSync(composePath, 'utf8');

      // Services
      expect(content).toContain('api:');
      expect(content).toContain('client:');

      // Client depends on healthy API
      expect(content).toContain('depends_on:');
      expect(content).toContain('service_healthy');

      // Port mapping for client (defaults to 80:80, customizable via CLIENT_PORT)
      expect(content).toMatch(/(?:CLIENT_PORT:-80\}|80):80/);

      // Volume for uploads
      expect(content).toContain('uploads_data:/app/uploads');
      expect(content).toContain('uploads_data:');

      // Network
      expect(content).toContain('appnet:');

      // Database should NOT be a container (hosted Supabase)
      expect(content).not.toMatch(/postgres:\s*\n\s*image:/i);
      expect(content).not.toMatch(/mongodb:\s*\n\s*image:/i);
    });
  });

  describe('Docker Compose Development (docker-compose.dev.yml)', () => {
    const composeDevPath = path.join(rootDir, 'docker-compose.dev.yml');

    it('should exist', () => {
      expect(fs.existsSync(composeDevPath)).toBe(true);
    });

    it('should configure development services with volume mounts and dev ports', () => {
      const content = fs.readFileSync(composeDevPath, 'utf8');

      expect(content).toContain('api:');
      expect(content).toContain('client:');
      expect(content).toContain('Dockerfile.dev');
      expect(content).toMatch(/["']3000:3000["']/);
      expect(content).toMatch(/["']5173:5173["']/);
      expect(content).toContain('appnet:');
      expect(content).toContain('uploads_data:');
    });
  });
});
