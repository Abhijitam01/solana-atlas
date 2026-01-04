# Deployment Guide - DigitalOcean

This guide covers deploying the Solana Developer Playground to DigitalOcean.

## Architecture Overview

- **Web App**: Next.js frontend (DigitalOcean App Platform)
- **API Service**: Express backend (DigitalOcean App Platform)
- **Runner Service**: Isolated execution service (DigitalOcean Droplet)

## Prerequisites

- DigitalOcean account
- GitHub repository with this code
- Gemini API key

## Step 1: Deploy Runner Service (Droplet)

The runner service needs a persistent process for `solana-test-validator`, so it requires a Droplet.

### Create Droplet

1. Go to DigitalOcean → Create → Droplets
2. Choose:
   - **Image**: Ubuntu 22.04
   - **Plan**: Basic, 4GB RAM / 2 vCPU (minimum)
   - **Region**: Choose closest to your users
   - **Authentication**: SSH keys (recommended)

### Setup Droplet

```bash
# SSH into droplet
ssh root@your-droplet-ip

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
apt-get update
apt-get install -y docker-compose

# Clone repository (or use git clone)
# ... clone your repo ...

# Build and run
cd solana-playground
docker build -f apps/runner/Dockerfile -t solana-runner .
docker run -d \
  -p 3002:3002 \
  -p 8899:8899 \
  -e MAX_EXECUTION_TIME_MS=30000 \
  -e VALIDATOR_PORT=8899 \
  --name solana-runner \
  --restart unless-stopped \
  solana-runner
```

### Get Runner URL

Note your Droplet's IP address. The runner will be accessible at `http://your-droplet-ip:3002`.

For production, set up a domain and reverse proxy (nginx) or use DigitalOcean Load Balancer.

## Step 2: Deploy API Service (App Platform)

1. Go to DigitalOcean → Create → App
2. Connect your GitHub repository
3. Configure:
   - **Type**: Web Service
   - **Source Directory**: `/apps/api`
   - **Build Command**: `cd ../.. && pnpm install && pnpm build --filter=@solana-playground/api`
   - **Run Command**: `cd ../.. && pnpm start --filter=@solana-playground/api`
   - **Port**: 3001

4. **Environment Variables**:
   ```
   GEMINI_API_KEY=your_gemini_api_key
   RUNNER_URL=http://your-droplet-ip:3002
   CORS_ORIGIN=https://your-web-app-url.com
   PORT=3001
   ```

5. Deploy

## Step 3: Deploy Web App (App Platform)

1. Go to DigitalOcean → Create → App
2. Connect your GitHub repository
3. Configure:
   - **Type**: Web Service
   - **Source Directory**: `/apps/web`
   - **Build Command**: `cd ../.. && pnpm install && pnpm build --filter=@solana-playground/web`
   - **Run Command**: `cd ../.. && pnpm start --filter=@solana-playground/web`
   - **Port**: 3000

4. **Environment Variables**:
   ```
   NEXT_PUBLIC_API_URL=https://your-api-url.com
   ```

5. Deploy

## Step 4: Configure Networking

### Update CORS

After deploying the web app, update the API's `CORS_ORIGIN` environment variable to match your web app URL.

### Update Runner URL

If you set up a domain for the runner, update the API's `RUNNER_URL` environment variable.

## Step 5: Firewall Configuration

On your Droplet, configure the firewall to allow:
- Port 3002 (Runner API)
- Port 8899 (Solana test validator)
- SSH (port 22)

```bash
ufw allow 22
ufw allow 3002
ufw allow 8899
ufw enable
```

## Monitoring

### Health Checks

All services expose `/health` endpoints:
- Web: `https://your-web-url.com/health`
- API: `https://your-api-url.com/health`
- Runner: `http://your-runner-ip:3002/health`

### Logs

- **App Platform**: View logs in DigitalOcean dashboard
- **Droplet**: `docker logs solana-runner`

## Troubleshooting

### Runner Service Not Starting

- Check Docker logs: `docker logs solana-runner`
- Verify Solana CLI is installed in container
- Check port availability: `netstat -tulpn | grep 3002`

### API Can't Reach Runner

- Verify runner is running: `curl http://your-droplet-ip:3002/health`
- Check firewall rules
- Verify `RUNNER_URL` environment variable

### Build Failures

- Ensure all workspace dependencies are installed
- Check that `pnpm-workspace.yaml` is correct
- Verify Node.js version (20+)

## Cost Estimation

- **Droplet (Runner)**: ~$24/month (4GB RAM)
- **App Platform (Web + API)**: ~$12-24/month (Basic plan)
- **Total**: ~$36-48/month

## Security Notes

- Never commit API keys to repository
- Use DigitalOcean's managed databases if you add persistence
- Set up SSL/TLS for all services
- Consider using DigitalOcean Spaces for static assets
- Implement rate limiting on API endpoints

