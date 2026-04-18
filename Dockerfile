# --- STAGE 1: FRONTEND BUILD ---
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# --- STAGE 2: BACKEND SETUP ---
FROM node:18-alpine
WORKDIR /app
COPY backend/package*.json ./backend/
RUN cd backend && npm install --production

# Copy built frontend from Stage 1 into backend's public folder
COPY --from=frontend-builder /app/frontend/dist ./backend/public

# Copy backend source
COPY backend/src ./backend/src

# Set working directory to backend for execution
WORKDIR /app/backend
ENV PORT=8080
EXPOSE 8080

CMD [ "node", "src/server.js" ]
