#!/bin/bash

echo "Starting Judge0 Docker services..."
docker-compose -f docker-compose-judge0.yml up -d
echo ""
echo "Judge0 is now running locally!"
echo "API available at: http://localhost:2358"
echo ""
echo "To test the API, you can use:"
echo "curl -X GET http://localhost:2358/languages"
echo ""
echo "To stop Judge0 services, run ./stop-judge0.sh"