---
name: vps-deployment
description: Guides deploying Docker apps to the Hostinger VPS ($VPS_HOST). Handles Traefik routing, SSL, port/volume isolation, multi-project management, and safe operations that protect n8n. Use when deploying, updating, or managing apps on the VPS.
---

# VPS Deployment Guide - Hostinger

Guide for deploying and managing Docker applications on the Hostinger VPS for manuelalvarez.cloud.

## VPS Quick Reference

| Campo          | Valor                          |
|----------------|--------------------------------|
| IP             | $VPS_HOST                  |
| SSH            | `ssh root@$VPS_HOST`       |
| OS             | Ubuntu 24.04                   |
| Plan           | KVM 2 (2 CPUs, 8GB RAM, 100GB)|
| Hostname       | $VPS_HOSTNAME         |
| Reverse Proxy  | Traefik (ports 80, 443)        |
| SSL            | Let's Encrypt (auto via Traefik TLS challenge) |

## Architecture Overview

```
Internet ──► Traefik (:80/:443) ──► Docker containers (via labels)
                  │
    ┌─────────────┼──────────────────────────┐
    │             │                           │
    ▼             ▼                           ▼
  n8n         manuelalvarez              demo projects
  :5678       frontend:3000              various ports
              backend:4000
              postgres:5432
```

**Key concept:** Traefik auto-discovers Docker containers with specific labels. No nginx config needed. SSL certificates are provisioned automatically.

## Critical Safety Rules

### NEVER do these:

```bash
# NEVER stop all containers - this kills n8n
docker stop $(docker ps -aq)

# NEVER prune everything - this deletes n8n volumes
docker system prune -a

# NEVER use docker compose without --project-name
docker compose up -d  # BAD - might conflict

# NEVER expose PostgreSQL to the internet
ports:
  - "5432:5432"  # BAD - accessible from internet

# NEVER touch the n8n project without a VPS snapshot first
```

### ALWAYS do these:

```bash
# ALWAYS list containers before any destructive operation
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# ALWAYS use --project-name
docker compose -f docker-compose.prod.yml --project-name myproject-prod up -d

# ALWAYS create a VPS snapshot before major changes
# (Use Hostinger panel or API)

# ALWAYS use 127.0.0.1 if you must expose a debug port
ports:
  - "127.0.0.1:5433:5432"  # Only accessible from VPS itself
```

## How to Deploy a New Project

### Step 1: Prepare Your docker-compose.prod.yml

Every project needs this structure:

```yaml
services:
  postgres:
    image: postgres:16-alpine
    container_name: ${PROJECT_NAME}-postgres
    restart: always
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}
    volumes:
      - ${PROJECT_NAME}_postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - internal  # Only backend can reach postgres

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: ${PROJECT_NAME}-backend
    restart: always
    environment:
      DATABASE_URL: postgresql://${DB_USER}:${DB_PASSWORD}@postgres:5432/${DB_NAME}
      NODE_ENV: production
    depends_on:
      postgres:
        condition: service_healthy
    labels:
      - traefik.enable=true
      - traefik.http.routers.${PROJECT_NAME}-backend.rule=Host(`${API_DOMAIN}`)
      - traefik.http.routers.${PROJECT_NAME}-backend.tls=true
      - traefik.http.routers.${PROJECT_NAME}-backend.entrypoints=websecure
      - traefik.http.routers.${PROJECT_NAME}-backend.tls.certresolver=mytlschallenge
      - traefik.http.services.${PROJECT_NAME}-backend.loadbalancer.server.port=4000
    networks:
      - traefik-public  # So Traefik can route to it
      - internal        # So it can reach postgres

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      args:
        NEXT_PUBLIC_API_URL: https://${API_DOMAIN}/graphql
    container_name: ${PROJECT_NAME}-frontend
    restart: always
    environment:
      NODE_ENV: production
    depends_on:
      - backend
    labels:
      - traefik.enable=true
      - traefik.http.routers.${PROJECT_NAME}-frontend.rule=Host(`${FRONTEND_DOMAIN}`)
      - traefik.http.routers.${PROJECT_NAME}-frontend.tls=true
      - traefik.http.routers.${PROJECT_NAME}-frontend.entrypoints=websecure
      - traefik.http.routers.${PROJECT_NAME}-frontend.tls.certresolver=mytlschallenge
      - traefik.http.services.${PROJECT_NAME}-frontend.loadbalancer.server.port=3000
    networks:
      - traefik-public  # So Traefik can route to it

networks:
  traefik-public:
    external: true        # Created once on the VPS: docker network create traefik-public
  internal:
    name: ${PROJECT_NAME}-internal
    driver: bridge

volumes:
  ${PROJECT_NAME}_postgres_data:
```

### Step 2: Create .env on VPS

```bash
ssh root@$VPS_HOST
mkdir -p /docker/your-project
cd /docker/your-project

cat > .env << 'EOF'
PROJECT_NAME=your-project
FRONTEND_DOMAIN=your-domain.com
API_DOMAIN=api.your-domain.com
DB_USER=your_user
DB_PASSWORD=your_strong_password
DB_NAME=your_db
# Add project-specific env vars below
EOF
```

### Step 3: Upload Code to VPS

**Option A: Git clone (recommended)**
```bash
cd /docker/your-project
git clone <repo-url> .
```

### Step 4: Deploy

```bash
cd /docker/your-project

# Build and start
docker compose -f docker-compose.prod.yml \
  --project-name your-project-prod \
  up -d --build

# Verify containers are running
docker compose -f docker-compose.prod.yml \
  --project-name your-project-prod ps

# Run database migrations
docker exec your-project-backend npx prisma db push

# Check logs
docker logs your-project-backend --tail 50
docker logs your-project-frontend --tail 50
```

### Step 5: Verify

```bash
# Check HTTPS works
curl -I https://your-domain.com
curl -I https://api.your-domain.com

# Check Traefik discovered the services
docker logs n8n-traefik-1 --tail 20 | grep "your-project"
```

## Domain Strategies

### For Your Main Project (manuelalvarez.cloud)

Requires DNS A records pointing to $VPS_HOST:
- `@` (root) -> $VPS_HOST
- `api` -> $VPS_HOST
- `www` -> CNAME to manuelalvarez.cloud

### For Demo Projects (Free, No DNS Needed)

Use subdomains of the VPS hostname:
- `demo1.$VPS_HOSTNAME`
- `demo1-api.$VPS_HOSTNAME`

These work automatically because `*.$VPS_HOSTNAME` resolves to the VPS IP. Traefik will generate SSL certs for them via TLS challenge.

### For Client Demos with Custom Domains

If a client wants `demo.clientdomain.com`:
1. Client creates A record pointing to $VPS_HOST
2. You add Traefik labels with `Host(demo.clientdomain.com)`
3. Traefik auto-generates SSL

## Managing Existing Deployments

### Update a deployment

```bash
cd /docker/your-project

# Pull latest code
git pull origin main

# Rebuild and restart (zero-downtime if you have health checks)
docker compose -f docker-compose.prod.yml \
  --project-name your-project-prod \
  up -d --build

# Run migrations if schema changed
docker exec your-project-backend npx prisma db push
```

### View logs

```bash
# All services
docker compose -f docker-compose.prod.yml \
  --project-name your-project-prod logs -f

# Specific service
docker logs your-project-backend -f --tail 100
```

### Stop a project (without deleting data)

```bash
docker compose -f docker-compose.prod.yml \
  --project-name your-project-prod down
# Volumes are preserved - data is safe
```

### Remove a project completely

```bash
# Stop and remove containers + networks
docker compose -f docker-compose.prod.yml \
  --project-name your-project-prod down

# Remove volumes (DESTROYS DATA)
docker volume rm your-project_postgres_data

# Remove project directory
rm -rf /docker/your-project
```

### Monitor resources

```bash
# Live resource usage
docker stats --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}"

# Disk usage
docker system df

# Check all running projects
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

## Port Allocation Registry

To avoid conflicts, track port usage:

| Port | Service | Project | Exposed To |
|------|---------|---------|------------|
| 80   | Traefik | n8n     | Internet (HTTP->HTTPS redirect) |
| 443  | Traefik | n8n     | Internet (HTTPS) |
| 5678 | n8n     | n8n     | 127.0.0.1 only |
| 3000 | Frontend| manuelalvarez | Internal (Traefik routes) |
| 4000 | Backend | manuelalvarez | Internal (Traefik routes) |
| 5432 | PostgreSQL | manuelalvarez | Internal only |

**For demo projects:** Services don't expose ports to the host. Traefik routes to them via Docker internal network. Only add host ports for debugging with `127.0.0.1` binding.

## Volume Naming Convention

```
{project-name}_{service}_data

Examples:
- manuelalvarez_postgres_data
- demo1_postgres_data
- demo2_postgres_data
```

## Troubleshooting

### "502 Bad Gateway"
- Container hasn't started yet. Check: `docker logs {container-name}`
- Wrong port in Traefik label. Verify `loadbalancer.server.port` matches EXPOSE in Dockerfile

### "404 Not Found"
- Traefik doesn't see the container. Check:
  - Container has `traefik.enable=true` label
  - Container is on `traefik-public` network
  - Host rule matches the domain you're visiting

### SSL certificate not working
- Domain doesn't point to VPS IP. Check: `dig +short your-domain.com`
- TLS challenge failed. Check: `docker logs n8n-traefik-1 | grep "acme"`
- Wait a few minutes - Let's Encrypt has rate limits

### Container keeps restarting
- Check logs: `docker logs {container-name} --tail 100`
- Common causes: missing env vars, database not ready, port conflict

### n8n stopped working
- Check if Traefik is running: `docker ps | grep traefik`
- Check n8n logs: `docker logs n8n-n8n-1 --tail 50`
- If Traefik crashed, restart the n8n project:
  ```bash
  cd /docker/n8n
  docker compose up -d
  ```

## Hostinger API Tools

Use the Hostinger MCP tools for remote management:

| Tool | Use Case |
|------|----------|
| `VPS_getProjectListV1` | List all Docker projects on VPS |
| `VPS_getProjectContentsV1` | Read docker-compose.yml of a project |
| `VPS_getProjectLogsV1` | Read logs remotely |
| `VPS_getProjectContainersV1` | Container details with stats |
| `VPS_restartProjectV1` | Restart a project remotely |
| `VPS_stopProjectV1` | Stop a project |
| `VPS_startProjectV1` | Start a project |
| `VPS_createSnapshotV1` | Create VPS backup before changes |
| `DNS_getDNSRecordsV1` | Check current DNS |
| `DNS_updateDNSRecordsV1` | Update DNS records |

## Quick Commands Cheat Sheet

```bash
# SSH into VPS
ssh root@$VPS_HOST

# See all running containers
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# See all projects
docker compose ls

# Monitor resources
docker stats

# See disk usage
df -h && docker system df

# Check if a domain resolves to VPS
dig +short manuelalvarez.cloud

# Test HTTPS endpoint
curl -I https://manuelalvarez.cloud

# Emergency: restart Traefik (careful!)
cd /docker/n8n && docker compose restart traefik
```

---

## Conceptos Fundamentales (Guia Educativa)

Esta seccion explica cada concepto clave para que puedas entender y modificar la infraestructura con confianza.

### DNS - El Sistema de Nombres de Dominio

**Que es:** DNS es como la agenda telefonica de internet. Cuando escribes `manuelalvarez.cloud` en el navegador, tu computadora pregunta "que IP tiene este nombre?" y el DNS responde "$VPS_HOST".

**Tipos de registros DNS que usamos:**

| Tipo | Que hace | Ejemplo |
|------|----------|---------|
| **A** | Conecta un nombre a una IP (IPv4) | `manuelalvarez.cloud` -> `$VPS_HOST` |
| **AAAA** | Conecta un nombre a una IP (IPv6) | Similar pero para IPv6 |
| **CNAME** | Un alias que apunta a otro nombre | `www` -> `manuelalvarez.cloud` |
| **CAA** | Define quien puede emitir certificados SSL | `letsencrypt.org` (ya configurado) |

**Nuestros registros actuales:**

```
manuelalvarez.cloud       A     $VPS_HOST   (tu VPS)
api.manuelalvarez.cloud   A     $VPS_HOST   (tu VPS)
n8n.manuelalvarez.cloud   A     $VPS_HOST   (tu VPS)
www.manuelalvarez.cloud   CNAME manuelalvarez.cloud (alias)
```

**Que significa esto:** Cuando alguien visita `manuelalvarez.cloud`, `api.manuelalvarez.cloud`, o `n8n.manuelalvarez.cloud`, TODOS llegan al mismo servidor ($VPS_HOST). Traefik (el reverse proxy dentro del servidor) decide a que aplicacion enviar cada peticion basandose en el nombre del dominio.

**TTL (Time To Live):** El numero en segundos que los servidores DNS cachean la respuesta. Pusimos 300 (5 minutos), lo que significa que si cambias un registro, tardara maximo 5 minutos en propagarse. Valores mas altos (14400 = 4 horas) significan menos consultas DNS pero cambios mas lentos.

**Cuidado al modificar DNS:**
- Cambiar el A record de `@` mueve TODO tu sitio a otra IP
- Si pones una IP incorrecta, tu sitio queda inaccesible hasta que corrijas
- `overwrite: true` en la API REEMPLAZA registros existentes del mismo tipo/nombre
- `overwrite: false` AGREGA sin borrar los existentes (puede crear duplicados)
- Los registros CAA definen quien puede crear certificados SSL - NO los toques a menos que sepas lo que haces

### Traefik - El Reverse Proxy

**Que es un reverse proxy:** Es un servidor que recibe TODAS las peticiones de internet (puertos 80 y 443) y las distribuye a las aplicaciones correctas. Sin el, tendrias que exponer cada app en un puerto diferente (manuelalvarez.cloud:3000, manuelalvarez.cloud:4000, etc.).

**Como funciona Traefik en tu VPS:**

```
Internet
  |
  | Usuario visita "manuelalvarez.cloud"
  v
Traefik recibe la peticion en puerto 443
  |
  | Mira el header "Host: manuelalvarez.cloud"
  | Busca que container tiene label con ese Host
  |
  v
Encuentra: manuelalvarez-prod-frontend
  |
  | Reenvia la peticion al container via red Docker interna
  v
Next.js responde en puerto 3000 (dentro de Docker)
  |
  | Traefik devuelve la respuesta al usuario
  v
Usuario ve la pagina web
```

**Labels de Traefik (las etiquetas en docker-compose):**

```yaml
labels:
  # Activar descubrimiento por Traefik
  - traefik.enable=true

  # REGLA DE ROUTING: cuando el dominio sea "api.manuelalvarez.cloud"
  - traefik.http.routers.mi-backend.rule=Host(`api.manuelalvarez.cloud`)

  # Activar TLS (HTTPS)
  - traefik.http.routers.mi-backend.tls=true

  # Usar solo el entrypoint HTTPS (puerto 443)
  - traefik.http.routers.mi-backend.entrypoints=websecure

  # Usar Let's Encrypt para generar certificado SSL automaticamente
  - traefik.http.routers.mi-backend.tls.certresolver=mytlschallenge

  # Decirle a Traefik que este container escucha en puerto 4000
  - traefik.http.services.mi-backend.loadbalancer.server.port=4000
```

**Los nombres importan:** `mi-backend` en las labels es un identificador unico. Si dos servicios usan el mismo nombre, hay conflicto. Usa siempre el patron `{proyecto}-{servicio}` (ej: `manuelalvarez-backend`, `demo1-frontend`).

### Docker Networks - Redes Internas

**Que son:** Las redes Docker son como "cables virtuales" que conectan containers entre si. Un container solo puede hablar con otro si estan en la misma red.

**Nuestras redes:**

```
traefik-public (external)
├── Traefik (reverse proxy)
├── n8n
├── manuelalvarez-frontend
├── manuelalvarez-backend     <-- en AMBAS redes
├── demo1-frontend
└── demo1-backend             <-- en AMBAS redes

manuelalvarez-internal (bridge)
├── manuelalvarez-backend     <-- en AMBAS redes
└── manuelalvarez-postgres    <-- SOLO en red interna (inaccesible desde internet)

demo1-internal (bridge)
├── demo1-backend
└── demo1-postgres
```

**Por que el backend esta en dos redes:**
1. `traefik-public`: para que Traefik pueda enviarle peticiones desde internet
2. `internal`: para que pueda conectarse a PostgreSQL

**Por que PostgreSQL solo esta en la red interna:**
- No necesita recibir peticiones de internet
- Solo el backend de su propio proyecto puede hablarle
- Esto es SEGURIDAD: nadie desde internet puede conectarse a tu base de datos

**`external: true` en docker-compose:**
```yaml
networks:
  traefik-public:
    external: true  # Esta red ya existe, NO la crees
```
Significa que la red fue creada manualmente con `docker network create traefik-public` y Docker Compose no debe intentar crearla ni borrarla.

### Docker Volumes - Persistencia de Datos

**Que son:** Por defecto, cuando un container se destruye, se pierde todo su contenido. Los volumes son "discos virtuales" que persisten los datos incluso si el container se elimina.

**Ejemplo:** Tu PostgreSQL guarda la base de datos en `/var/lib/postgresql/data` dentro del container. Sin un volume, si reinicias el container, pierdes toda la data. Con un volume nombrado (`manuelalvarez_postgres_data`), los datos se guardan en el disco del VPS y se "montan" cada vez que el container arranca.

**Regla de oro:** NUNCA compartas volumes entre proyectos. Cada proyecto tiene sus propios volumes con prefijo unico.

```bash
# Ver todos los volumes
docker volume ls

# Inspeccionar un volume (ver donde esta en disco)
docker volume inspect manuelalvarez_postgres_data

# PELIGRO: borrar un volume destruye los datos permanentemente
docker volume rm manuelalvarez_postgres_data
```

### SSL/TLS - Certificados HTTPS

**Que es:** SSL/TLS es el candadito verde en el navegador. Encripta la comunicacion entre el usuario y tu servidor para que nadie pueda espiar los datos.

**Como funciona en tu VPS:**
1. Traefik detecta un nuevo dominio en las labels de un container
2. Traefik contacta a Let's Encrypt (servicio gratuito de certificados)
3. Let's Encrypt verifica que el dominio apunta a tu VPS (TLS challenge)
4. Let's Encrypt emite un certificado SSL valido por 90 dias
5. Traefik lo renueva automaticamente antes de que expire

**Requisitos para que funcione:**
- El dominio debe apuntar a la IP de tu VPS (registro A correcto)
- El puerto 443 debe estar accesible desde internet
- Los registros CAA deben permitir `letsencrypt.org` (ya lo tienen)

**No necesitas hacer nada manual.** Traefik maneja todo automaticamente.

### Docker Compose --project-name

**Que es:** Docker Compose agrupa containers en "proyectos". El `--project-name` define el prefijo de todos los recursos (containers, networks, volumes).

```bash
# Sin --project-name: usa el nombre de la carpeta
cd /docker/manuelalvarez
docker compose up -d  # proyecto se llama "manuelalvarez"

# Con --project-name: tu controlas el nombre
docker compose -f docker-compose.prod.yml --project-name manuelalvarez-prod up -d
# Containers: manuelalvarez-prod-backend, manuelalvarez-prod-frontend, etc.
```

**Por que importa:** Si dos proyectos usan el mismo nombre, Docker Compose puede confundirse y destruir containers del otro proyecto. Siempre usa nombres unicos y descriptivos.

### Ports - Mapeo de Puertos

**Concepto clave:** Dentro de Docker, cada container tiene su propia "mini-computadora" con sus propios puertos. Para que el mundo exterior acceda, debes "mapear" un puerto del VPS a un puerto del container.

```yaml
ports:
  - "80:80"        # Puerto 80 del VPS -> Puerto 80 del container
  - "127.0.0.1:5678:5678"  # Solo desde el VPS -> Puerto 5678 del container
```

**En nuestro setup, NO mapeamos puertos para los servicios web** porque Traefik se encarga de rutear el trafico internamente via la red Docker. Solo Traefik expone los puertos 80 y 443 al mundo.

**Cuando si mapear puertos:**
- Debugging: `"127.0.0.1:5433:5432"` para acceder a PostgreSQL desde el VPS
- Servicios especiales como n8n que necesitan acceso local

### Como Fluye una Peticion Completa

```
1. Usuario escribe "manuelalvarez.cloud" en el navegador
   |
2. Navegador pregunta al DNS: "que IP tiene manuelalvarez.cloud?"
   DNS responde: "$VPS_HOST"
   |
3. Navegador conecta a $VPS_HOST:443 (HTTPS)
   |
4. Traefik recibe la conexion en puerto 443
   Mira el header Host: manuelalvarez.cloud
   |
5. Traefik busca un router con regla Host(`manuelalvarez.cloud`)
   Encuentra: manuelalvarez-frontend
   |
6. Traefik presenta el certificado SSL al navegador
   (generado automaticamente por Let's Encrypt)
   |
7. Traefik reenvia la peticion al container manuelalvarez-prod-frontend
   via la red Docker "traefik-public", al puerto 3000
   |
8. Next.js procesa la peticion y responde
   |
9. Si Next.js necesita datos del backend:
   Next.js hace fetch a "https://api.manuelalvarez.cloud/graphql"
   Esto vuelve a pasar por Traefik (paso 4-8) pero llega al backend:4000
   |
10. Backend consulta PostgreSQL via red interna "manuelalvarez-internal"
    |
11. Respuesta viaja de vuelta: PostgreSQL -> Backend -> Traefik -> Usuario
```
