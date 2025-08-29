#!/bin/bash

if ! docker ps >/dev/null 2>&1; then
    echo "Docker daemon is not running. Please start Docker and try again."
    exit 1
fi

npm run dev