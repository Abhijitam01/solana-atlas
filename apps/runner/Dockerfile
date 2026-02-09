FROM ubuntu:22.04

# Install dependencies
RUN apt-get update && apt-get install -y \
    curl \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Install Solana CLI (for solana-test-validator)
RUN sh -c "$(curl -sSfL https://release.solana.com/stable/install)"
ENV PATH="/root/.local/share/solana/install/active_release/bin:${PATH}"

WORKDIR /app

# Copy workspace files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY turbo.json ./

# Copy package files
COPY packages/types/package.json ./packages/types/
COPY packages/solana/package.json ./packages/solana/
COPY apps/runner/package.json ./apps/runner/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source
COPY packages ./packages
COPY apps/runner ./apps/runner

# Build
RUN pnpm exec turbo build --filter=@solana-playground/runner

ENV NODE_ENV=production
ENV PORT=3002
ENV MAX_EXECUTION_TIME_MS=30000
ENV VALIDATOR_PORT=8899

EXPOSE 3002 8899

CMD ["node", "apps/runner/dist/apps/runner/src/index.js"]

