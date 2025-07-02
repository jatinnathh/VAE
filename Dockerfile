# Base image with Python 3.11 and Node.js
FROM python:3.11.13-slim

# Set working directory
WORKDIR /app

# Install OS dependencies
RUN apt-get update && apt-get install -y \
  curl \
  git \
  nodejs \
  npm \
  libglib2.0-0 \
  libsm6 \
  libxext6 \
  libxrender-dev \
  ffmpeg \
  && apt-get clean

# ---------- Backend setup ----------
COPY backend/requirements.txt /app/backend/
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy backend and sd module
COPY backend /app/backend
COPY backend/sd /app/sd
COPY backend/data /app/data

# Make sure sd/ is importable
ENV PYTHONPATH="/app:${PYTHONPATH}"

# ---------- Frontend setup ----------
# ---------- Frontend setup ----------
COPY package*.json ./

# Install dependencies
RUN npm install

# Install TypeScript types for React Native
RUN npm install --save-dev @types/react-native

# Install new Expo CLI (recommended) and @expo/ngrok globally
RUN npm install -g expo @expo/ngrok

# Copy entire frontend project
COPY . .

# Expose ports for FastAPI + Expo
EXPOSE 8000      
EXPOSE 19000     
EXPOSE 19001     
EXPOSE 19002     

# ---------- Run FastAPI and Expo ----------
CMD bash -c "\
  uvicorn backend.main:app --host 0.0.0.0 --port 8000 & \
  expo start --tunnel --clear"