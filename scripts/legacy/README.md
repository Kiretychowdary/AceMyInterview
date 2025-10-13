# Legacy Files Archive

This folder contains archived files that have been replaced by newer implementations.

## Judge0 Legacy Files (`judge0/`)

These files have been archived as they're replaced by the unified Judge0 client:

### Replaced Files:
- `executeCodeWithJudge0_clean.js` → Replaced by `src/services/judge0Client.js`
- `debug-judge0-response.js` → Built into judge0Client error handling
- `temp_languages.json` → Languages are now fetched dynamically
- `compiler-test.html` → Use the main CompilerPage component
- `judge0-test.html` → Use health check scripts instead
- `test-*.js` files → Use `scripts/health/check-judge0.js` for testing
- `test-*.bat` files → Use organized setup and health scripts

### Modern Usage:
- Use `src/services/judge0Client.js` for all Judge0 interactions
- Use `scripts/health/check-judge0.js` for health checks
- Use `scripts/setup/start-judge0.bat` to start services

## Migration Notes:
- All functionality has been preserved in the new implementations
- The new judge0Client provides better error handling and metrics
- Health checks are now automated and more comprehensive
- Setup scripts are organized and more reliable

## Safe to Delete:
These archived files can be safely deleted after confirming the new implementations work correctly.