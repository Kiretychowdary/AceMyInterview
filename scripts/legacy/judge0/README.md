# Legacy Judge0 Scripts (Archived)

These scripts were part of earlier ad-hoc / experimental Judge0 integration and are now deprecated.

Current production integration uses `src/services/judge0Client.js` with:
- Environment-based configuration (`VITE_JUDGE0_BASE_URL`, `VITE_JUDGE0_API_KEY` optional)
- Batched execution with metrics (avg time, max memory)
- Error classification (Compilation, Runtime, TLE, etc.)
- Basic throttling to protect the Judge0 instance

## Archived Artifacts
(Original files remain at repo root until final deletion is approved.)
- test-judge0-*.bat (batch test harnesses)
- executeCodeWithJudge0_clean.js (duplicate test utility)
- debug-judge0-response.js (manual response inspector)
- judge0-test.html / judge0-test harnesses

## Next Steps Before Deletion
1. Confirm no CI or external docs reference these filenames.
2. After confirmation, remove the originals and rely exclusively on service + automated tests.

## Migration Notes
Replace any import of legacy `judge0Api.js` with the higher-level client:
```js
import judge0Client from '@/services/judge0Client';
await judge0Client.runOnce({...});
```

If a future need for scripted load or regression testing arises, create structured scripts under `scripts/tests/judge0/` rather than resurrecting these legacy files.
