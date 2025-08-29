#!/bin/bash

set -e  # Exit immediately if a command exits with a non-zero status.

# Function to check if a command exists
check_command() {
    if ! command -v "$1" >/dev/null ; then
        echo "$2 is not installed. Please install $2 and try again."
        exit 1
    fi
}

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating a sample .env file..."
    cp .env.example .env
else
    echo ".env file already exists."
fi

# Check for required dependencies
check_command "node" "Node.js"
check_command "npm" "npm"
check_command "docker" "Docker"

# Install build-essential on Linux systems
if [ "$(uname)" = "Linux" ]; then
    if ! dpkg -l | grep -q build-essential; then
        echo "Installing build-essential..."
        sudo apt-get update && sudo apt-get install -y build-essential
    fi
fi

# Check if Docker daemon is running
if ! docker ps >/dev/null 2>&1; then
    echo "Docker daemon is not running. Please start Docker and try again."
    exit 1
fi

# Check for Prisma installation
if ! command -v npx &>/dev/null; then
    echo "npx is not installed. Please install npm and try again."
    exit 1
fi

if ! npx --yes prisma -v &>/dev/null; then
    echo "Prisma is not installed. Installing Prisma..."
    npm install -y prisma @prisma/client
fi

# Helper function to build Docker images
build_docker_image() {
    local language=$1
    echo "Building Docker image for $language..."
    docker build -t "code-executor-$language:latest" \
        -f "src/lib/docker/dockerfiles/Dockerfile.$language" \
        src/lib/docker/dockerfiles/ >/dev/null 2>&1 || {
            echo "Failed to build $language Docker image"
            exit 1
        }
}

# Build Docker images
echo "Building Docker images..."
build_docker_image "python"
build_docker_image "javascript"
build_docker_image "java"
build_docker_image "cpp"
build_docker_image "go"
build_docker_image "swift"
build_docker_image "rust"
build_docker_image "ruby"

# Reset the database if RESET_DB is set to true
if [ "$RESET_DB" = "true" ]; then
    echo "Resetting the database..."
    npx prisma migrate reset --force
fi

# Install npm dependencies
echo "Installing required npm packages..."
npm install

# Run Prisma migrations
echo "Running Prisma migrations..."
npx prisma migrate dev


echo "Make sure to update the .env file with the correct docker endpoint."
docker context ls

# Create admin user
echo "Creating an admin user..."
node ./scripts/createAdmin.js

# Seed the database
echo "Seeding the database..."
node ./scripts/seed.js
