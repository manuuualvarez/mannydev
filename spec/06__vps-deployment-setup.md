# Spec: VPS Deployment Setup - Plan Completo

**Estado:** EN_PROGRESO
**Fecha:** 2026-02-06
**Agente:** architect
**Prioridad:** ALTA

---

## Resumen Ejecutivo

Configurar el VPS de Hostinger (Ubuntu 24.04, KVM 2) para hospedar múltiples proyectos Docker aislados, usando **Traefik** como reverse proxy central (ya existe para n8n), con SSL automático via Let's Encrypt, sin interferir con el n8n existente.

**Proyectos a hospedar:**
1. **manuelalvarez.cloud** (PRIORIDAD) - NestJS backend + Next.js frontend + PostgreSQL
2. **Demo Cliente 1** - pnpm monorepo (1 NestJS + 2 Next.js)
3. **Demo Cliente 2** - 1 NestJS + 1 Next.js landing

---

## Diagnóstico del Estado Actual

### VPS Info

| Campo          | Valor                          |
|----------------|--------------------------------|
| ID             | 1245135                        |
| Plan           | KVM 2 (2 CPUs, 8GB RAM, 100GB)|
| IP             | 72.62.170.218                  |
| IPv6           | 2a02:4780:2d:b5a1::1           |
| OS             | Ubuntu 24.04 with n8n          |
| Estado         | Running                        |
| Firewall       | Ninguno configurado            |
| Hostname       | srv1245135.hstgr.cloud         |

### Containers Actuales

| Container        | Imagen   | Puerto      | Estado  |
|------------------|----------|-------------|---------|
| n8n-traefik-1    | traefik  | 0.0.0.0:80, 0.0.0.0:443 | Up 4 weeks |
| n8n-n8n-1        | n8n      | 127.0.0.1:5678 | Up 4 weeks |

### DNS Actual (manuelalvarez.cloud)

| Registro | Tipo  | Valor                    | Problema |
|----------|-------|--------------------------|----------|
| @        | A     | 84.32.84.32              | **IP INCORRECTA** - debe ser 72.62.170.218 |
| www      | CNAME | manuelalvarez.cloud.     | OK |
| api      | -     | NO EXISTE                | **Falta crear** |

### Arquitectura Actual (n8n)

```
Internet
  │
  ▼
┌─────────────────────────────────┐
│  VPS 72.62.170.218              │
│                                  │
│  ┌────────────────────────┐     │
│  │  Docker Project: n8n    │     │
│  │                         │     │
│  │  Traefik (:80, :443)   │     │
│  │    │                    │     │
│  │    └─► n8n (:5678)     │     │
│  │    (n8n.srv1245135...)  │     │
│  └────────────────────────┘     │
│                                  │
│  Sin red compartida              │
│  Sin firewall                    │
└─────────────────────────────────┘
```

### Inventario de Archivos Afectados

| Archivo | Problema | Accion Requerida |
|---------|----------|------------------|
| docker-compose.prod.yml | Usa nginx, incompatible con Traefik | Reemplazar nginx con labels de Traefik |
| nginx/nginx.conf | Ya no necesario | Eliminar o mantener como referencia |
| nginx/conf.d/manuelalvarez.conf | Ya no necesario | Eliminar o mantener como referencia |
| DNS manuelalvarez.cloud | IP incorrecta, falta api subdomain | Actualizar via API Hostinger |
| VPS /docker/n8n/docker-compose.yml | Traefik sin red compartida | Agregar red external traefik-public |

---

## Arquitectura Objetivo

```
Internet
  │
  ▼
┌──────────────────────────────────────────────────────────────┐
│  VPS 72.62.170.218                                            │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  Docker Network: traefik-public (external)               │ │
│  │                                                          │ │
│  │  ┌──────────────┐                                        │ │
│  │  │   Traefik     │  (managed by n8n project)             │ │
│  │  │   :80, :443   │  Auto-SSL via Let's Encrypt           │ │
│  │  │   Docker sock │  Auto-discovers labeled containers    │ │
│  │  └──────┬───────┘                                        │ │
│  │         │                                                 │ │
│  │    ┌────┼────────┬──────────────┬──────────────┐         │ │
│  │    ▼    ▼        ▼              ▼              ▼         │ │
│  │  n8n  frontend  backend     demo1-fe       demo2-fe     │ │
│  │ :5678  :3000     :4000      :3001          :3002        │ │
│  │                                                          │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
│  Redes internas (aisladas por proyecto):                      │
│  ├── n8n-internal (n8n solamente)                             │
│  ├── manuelalvarez-internal (backend + postgres)              │
│  ├── demo1-internal (backend + postgres)                      │
│  └── demo2-internal (backend + postgres)                      │
│                                                               │
│  Volumes (aislados por proyecto):                             │
│  ├── n8n_data, traefik_data                                  │
│  ├── manuelalvarez_postgres_data                              │
│  ├── demo1_postgres_data                                      │
│  └── demo2_postgres_data                                      │
└──────────────────────────────────────────────────────────────┘
```

### Routing (Traefik Labels)

| Domain | Router | Service | Puerto Interno |
|--------|--------|---------|----------------|
| manuelalvarez.cloud | manuelalvarez-frontend | frontend | 3000 |
| api.manuelalvarez.cloud | manuelalvarez-backend | backend | 4000 |
| n8n.manuelalvarez.cloud (o n8n.srv...) | n8n | n8n | 5678 |
| demo1.srv1245135.hstgr.cloud | demo1-frontend | demo1-fe | 3001 |
| demo1-api.srv1245135.hstgr.cloud | demo1-backend | demo1-be | 4001 |
| demo2.srv1245135.hstgr.cloud | demo2-frontend | demo2-fe | 3002 |
| demo2-api.srv1245135.hstgr.cloud | demo2-backend | demo2-be | 4002 |

---

## Plan de Implementacion

### Fase 0: DNS (Pre-requisito)

**Acciones via API Hostinger:**

1. Actualizar A record de `@` a `72.62.170.218`
2. Crear A record para `api` apuntando a `72.62.170.218`
3. (Opcional) Crear A record para `n8n` apuntando a `72.62.170.218`

**Nota:** La propagacion DNS puede tomar 5 minutos a 48 horas.

### Fase 1: Preparar VPS (SSH)

**1.1 Crear red compartida de Traefik**

```bash
ssh root@72.62.170.218

# Crear la red externa que compartiran TODOS los proyectos
docker network create traefik-public
```

**1.2 Actualizar n8n docker-compose para usar red compartida**

El archivo esta en `/docker/n8n/docker-compose.yml`. Cambios necesarios:

```yaml
services:
  traefik:
    image: "traefik"
    restart: always
    command:
      - "--api.insecure=true"
      - "--providers.docker=true"
      - "--providers.docker.exposedbydefault=false"
      - "--providers.docker.network=traefik-public"   # <-- NUEVO: solo descubrir en esta red
      - "--entrypoints.web.address=:80"
      - "--entrypoints.web.http.redirections.entryPoint.to=websecure"
      - "--entrypoints.web.http.redirections.entryPoint.scheme=https"
      - "--entrypoints.websecure.address=:443"
      - "--certificatesresolvers.mytlschallenge.acme.tlschallenge=true"
      - "--certificatesresolvers.mytlschallenge.acme.email=${SSL_EMAIL}"
      - "--certificatesresolvers.mytlschallenge.acme.storage=/letsencrypt/acme.json"
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - traefik_data:/letsencrypt
      - /var/run/docker.sock:/var/run/docker.sock:ro
    networks:
      - traefik-public     # <-- NUEVO: conectar a red compartida
      - default            # <-- mantener conexion con n8n

  n8n:
    image: docker.n8n.io/n8nio/n8n
    restart: always
    ports:
      - "127.0.0.1:5678:5678"
    labels:
      - traefik.enable=true
      - traefik.http.routers.n8n.rule=Host(`${SUBDOMAIN}.${DOMAIN_NAME}`)
      - traefik.http.routers.n8n.tls=true
      - traefik.http.routers.n8n.entrypoints=web,websecure
      - traefik.http.routers.n8n.tls.certresolver=mytlschallenge
      - traefik.http.middlewares.n8n.headers.SSLRedirect=true
      - traefik.http.middlewares.n8n.headers.STSSeconds=315360000
      - traefik.http.middlewares.n8n.headers.browserXSSFilter=true
      - traefik.http.middlewares.n8n.headers.contentTypeNosniff=true
      - traefik.http.middlewares.n8n.headers.forceSTSHeader=true
      - traefik.http.middlewares.n8n.headers.SSLHost=${DOMAIN_NAME}
      - traefik.http.middlewares.n8n.headers.STSIncludeSubdomains=true
      - traefik.http.middlewares.n8n.headers.STSPreload=true
      - traefik.http.routers.n8n.middlewares=n8n@docker
    environment:
      - N8N_ENFORCE_SETTINGS_FILE_PERMISSIONS=true
      - N8N_HOST=${SUBDOMAIN}.${DOMAIN_NAME}
      - N8N_PORT=5678
      - N8N_PROTOCOL=https
      - N8N_RUNNERS_ENABLED=true
      - NODE_ENV=production
      - WEBHOOK_URL=https://${SUBDOMAIN}.${DOMAIN_NAME}/
      - GENERIC_TIMEZONE=${GENERIC_TIMEZONE}
      - N8N_PROXY_HOPS=1
    volumes:
      - n8n_data:/home/node/.n8n
      - /local-files:/files
    networks:
      - traefik-public     # <-- NUEVO: para que Traefik lo descubra
      - default

networks:
  traefik-public:
    external: true         # <-- Red creada manualmente

volumes:
  traefik_data:
    external: true
  n8n_data:
    external: true
```

**1.3 Reiniciar n8n (con cuidado)**

```bash
cd /docker/n8n
docker compose down
docker compose up -d

# Verificar que n8n sigue funcionando
docker compose ps
curl -I https://n8n.srv1245135.hstgr.cloud
```

### Fase 2: Deploy manuelalvarez.cloud

**2.1 Preparar archivos en el VPS**

```bash
# Crear directorio para el proyecto
mkdir -p /docker/manuelalvarez
cd /docker/manuelalvarez

# Clonar repositorio (o subir archivos)
git clone <repo-url> .
# O usar scp/rsync desde tu Mac

# Crear archivo .env
cat > .env << 'EOF'
DB_USER=manuelalvarez
DB_PASSWORD=<strong_password_here>
DB_NAME=manuelalvarez_prod
CLERK_SECRET_KEY=<clerk_secret>
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=<clerk_publishable>
NEXT_PUBLIC_API_URL=https://api.manuelalvarez.cloud/graphql
EOF
```

**2.2 Deploy con docker compose**

```bash
cd /docker/manuelalvarez
docker compose -f docker-compose.prod.yml --project-name manuelalvarez-prod up -d --build

# Verificar
docker compose -f docker-compose.prod.yml --project-name manuelalvarez-prod ps

# Ejecutar migraciones de Prisma
docker exec manuelalvarez-prod-backend npx prisma db push
docker exec manuelalvarez-prod-backend npx prisma db seed
```

**2.3 Verificar**

```bash
# Verificar routing
curl -I https://manuelalvarez.cloud
curl -I https://api.manuelalvarez.cloud/graphql

# Verificar logs
docker logs manuelalvarez-prod-backend --tail 50
docker logs manuelalvarez-prod-frontend --tail 50
```

### Fase 3: Deploy Demos (Futuro)

Para cada proyecto demo, crear un `docker-compose.demo.yml` con:
- Nombres de contenedores unicos (prefijo del proyecto)
- Volumes unicos (prefijo del proyecto)
- Red interna unica
- Conexion a `traefik-public`
- Labels de Traefik con subdominios del hostname del VPS

Ver skill `vps-deployment` para la guia completa.

---

## Reglas de Aislamiento Multi-Proyecto

### Puertos

| Regla | Detalle |
|-------|---------|
| NO exponer puertos al host | Traefik rutea internamente via Docker networks |
| PostgreSQL NUNCA en host | Solo accesible dentro de la red interna del proyecto |
| Si necesitas debug | Usar `127.0.0.1:PUERTO` (solo localhost) |

### Volumes

| Regla | Detalle |
|-------|---------|
| Prefijo por proyecto | `manuelalvarez_postgres_data`, `demo1_postgres_data` |
| NUNCA compartir volumes de datos entre proyectos | Cada BD es independiente |
| Traefik data es compartido | `traefik_data` (solo SSL certs) |

### Networks

| Red | Tipo | Proposito |
|-----|------|-----------|
| traefik-public | external | Conecta Traefik con todos los servicios web |
| {proyecto}-internal | bridge (interna) | Conecta backend con su PostgreSQL |

### Container Names

| Regla | Ejemplo |
|-------|---------|
| Siempre usar --project-name | `--project-name manuelalvarez-prod` |
| Prefijo descriptivo | `manuelalvarez-prod-backend`, `demo1-backend` |

---

## Dependencias entre Fases

```
Fase 0 (DNS) ─────────────────────────► Fase 2 (Deploy app)
                                              │
Fase 1 (VPS Traefik setup) ──────────────────┘
                                              │
                                              ▼
                                        Fase 3 (Demos)
```

- Fase 0 y Fase 1 pueden ejecutarse en paralelo
- Fase 2 depende de que Fase 0 (DNS propagado) y Fase 1 (Traefik listo) esten completas
- Fase 3 depende de Fase 1 pero NO de Fase 0 (usa subdominios del hostname)

---

## Criterios de Aceptacion

- [x] DNS de manuelalvarez.cloud apunta a 72.62.170.218
- [x] DNS de api.manuelalvarez.cloud apunta a 72.62.170.218
- [ ] n8n sigue funcionando despues de actualizar Traefik
- [ ] Red traefik-public creada y funcional
- [ ] https://manuelalvarez.cloud muestra la web
- [ ] https://api.manuelalvarez.cloud/graphql responde
- [ ] SSL automatico funciona para ambos dominios
- [ ] PostgreSQL NO accesible desde internet
- [ ] Volumes aislados por proyecto
- [ ] Skill de VPS deployment creada y documentada

---

## Riesgos y Mitigaciones

| Riesgo | Probabilidad | Mitigacion |
|--------|-------------|------------|
| n8n se rompe al cambiar Traefik | MEDIA | Hacer snapshot del VPS antes. Probar con docker compose config primero |
| DNS no propaga rapido | BAJA | Usar subdominios de srv1245135.hstgr.cloud mientras tanto |
| VPS sin RAM para todos los proyectos | MEDIA | Monitorear con `docker stats`. 8GB deberia alcanzar para 3-4 proyectos |
| Puerto 80/443 conflicto | NULA | Solo Traefik usa estos puertos, el resto es interno |
| Volumes se pisan entre proyectos | BAJA | Nomenclatura estricta con prefijos |

---

## Recursos del VPS

**Estimacion de uso de RAM por proyecto:**

| Servicio | RAM Estimada |
|----------|-------------|
| Traefik | ~50MB |
| n8n | ~200MB |
| PostgreSQL (cada uno) | ~100-200MB |
| NestJS backend (cada uno) | ~150-300MB |
| Next.js frontend (cada uno) | ~150-300MB |

**Total estimado (todos los proyectos):** ~2.5-4GB de 8GB disponibles. Hay margen.
