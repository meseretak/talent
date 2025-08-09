FROM node:20-alpine

WORKDIR /usr/src/node-app

# Install OS dependencies
RUN apk update && apk add --no-cache openssl wget git python3 make g++ curl

# Install sonar-scanner and its dependencies
RUN apk add --no-cache wget unzip openjdk11 && \
    wget https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/sonar-scanner-cli-4.8.0.2856-linux.zip && \
    unzip sonar-scanner-cli-4.8.0.2856-linux.zip && \
    mv sonar-scanner-4.8.0.2856-linux /opt/sonar-scanner && \
    ln -s /opt/sonar-scanner/bin/sonar-scanner /usr/local/bin/sonar-scanner && \
    rm sonar-scanner-cli-4.8.0.2856-linux.zip

# Copy only dependency files first
COPY package.json yarn.lock ./

# Install dependencies with dev dependencies included
RUN yarn install

# Copy everything else (including Prisma schema & app code)
COPY . .

# Set NODE_ENV to development during build
ENV NODE_ENV=development

# Generate Prisma Client
RUN npx prisma generate --schema=./prisma/schema

# Run the build (includes copying ABAC policies)
RUN yarn build

# Verify ABAC policies are copied
RUN ls -la /usr/src/node-app/build/src/abac/policies

# Switch NODE_ENV back to production for running the app
ENV NODE_ENV=development
# make this production

# Ensure permissions
RUN adduser -D nodeuser
RUN chown -R nodeuser:nodeuser /usr/src/node-app

# Create a secure non-root user
USER nodeuser

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:4000/api/health || exit 1

# Start the app
CMD ["yarn", "start"]
