#!/bin/bash

echo "Stopping Judge0 Docker services..."
docker-compose -f docker-compose-judge0.yml down
echo "Judge0 services stopped"