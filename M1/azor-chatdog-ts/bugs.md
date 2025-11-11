# Critical Bugs Fixed

This document details the critical bugs that were identified and fixed in the azor-chatdog-ts codebase.

## Bug #2: WAL File Corruption Not Reset

**Severity:** Critical ⚠️
**Location:** `src/files/wal.ts:44`
**Status:** ✅ Fixed

### Description
When the Write-Ahead Log (WAL) file became corrupted (invalid JSON), the code attempted to reset it but only set the in-memory `data` variable to an empty array without actually modifying the file on disk. This caused the corrupted file to persist.

### Root Cause
```typescript
// Before fix:
if (error instanceof SyntaxError) {
  data = [];
  return [false, `WAL file corrupted, resetting: ${WAL_FILE}`];
}
```
The code returned early with an error message claiming to reset the file, but never actually wrote to the file system.

### Impact
- Corrupted WAL file remained on disk
- Subsequent WAL operations would fail repeatedly
- Users experienced persistent failures requiring manual file deletion

### Fix Implemented
```typescript
// After fix:
if (error instanceof SyntaxError) {
  // Actually reset the corrupted file
  data = [];
  writeFileSync(WAL_FILE, JSON.stringify(data, null, 4), 'utf-8');
  // Continue with empty data instead of failing
}
```

### Testing Recommendations
1. Manually corrupt the WAL file (add invalid JSON)
2. Send a message to trigger WAL append
3. Verify the file is automatically reset to valid JSON
4. Confirm subsequent messages log correctly

---

## Bug #3: Silent WAL Error Handling

**Severity:** High ⚠️
**Location:** `src/session/chatSession.ts:144-147`
**Status:** ✅ Fixed

### Description
When WAL logging failed during message sending, the error was silently ignored without any user notification. The code had an empty if block with a comment about "silent logging" but no actual logging implementation.

### Root Cause
```typescript
// Before fix:
if (!success && error) {
  // We don't want to fail the entire message sending because of WAL issues
  // Just log the error silently
}
```
Empty if block - error information was completely discarded.

### Impact
- Users unaware when WAL logging fails
- Debugging WAL issues difficult due to lack of feedback
- Silent data loss in analytics/logging pipeline

### Fix Implemented
```typescript
// After fix:
if (!success && error) {
  // We don't want to fail the entire message sending because of WAL issues
  // Just log the error as a warning
  printWarning(`WAL logging failed: ${error}`);
}
```

### Testing Recommendations
1. Make WAL file read-only (chmod 444)
2. Send a message
3. Verify warning is displayed to user
4. Restore file permissions

---

## Bug #4: Signal Handler Error Handling

**Severity:** Critical ⚠️
**Location:** `src/chat.ts:25-34`
**Status:** ✅ Fixed

### Description
Async signal handlers (SIGINT and SIGTERM) called `cleanupAndSave()` without error handling. If cleanup operations threw an error, it would result in unhandled promise rejections.

### Root Cause
```typescript
// Before fix:
process.on('SIGINT', async () => {
  printInfo('\nPrzerwano przez użytkownika (Ctrl+C)...');
  await manager.cleanupAndSave();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await manager.cleanupAndSave();
  process.exit(0);
});
```
No try-catch blocks around async operations in signal handlers.

### Impact
- Unhandled promise rejections on shutdown
- Process might crash ungracefully
- Error messages not visible to users
- Node.js warnings about unhandled rejections

### Fix Implemented
```typescript
// After fix:
process.on('SIGINT', async () => {
  printInfo('\nPrzerwano przez użytkownika (Ctrl+C)...');
  try {
    await manager.cleanupAndSave();
  } catch (error) {
    printError(`Error during cleanup: ${error}`);
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  try {
    await manager.cleanupAndSave();
  } catch (error) {
    printError(`Error during cleanup: ${error}`);
  }
  process.exit(0);
});
```

### Testing Recommendations
1. Start the application
2. Press Ctrl+C to trigger SIGINT
3. Verify graceful shutdown even if save operations fail
4. Test with file system errors (full disk, permissions)

---

## Bug #7: Session Switch Error Handling

**Severity:** Critical ⚠️
**Location:** `src/session/sessionManager.ts:76`
**Status:** ✅ Fixed

### Description
When switching sessions, the current session's `saveToFile()` result was ignored. If the save operation failed, users were not notified and potential data loss could occur silently.

### Root Cause
```typescript
// Before fix:
if (this._currentSession) {
  saveAttempted = true;
  previousSessionId = this._currentSession.getSessionId();
  await this._currentSession.saveToFile(); // Result ignored!
}
```
The `[success, error]` tuple returned by `saveToFile()` was not captured or checked.

### Impact
- Silent data loss if save fails before switching
- Users unaware their work wasn't saved
- Corrupted or incomplete session files
- No opportunity to retry or recover

### Fix Implemented
```typescript
// After fix:
if (this._currentSession) {
  saveAttempted = true;
  previousSessionId = this._currentSession.getSessionId();
  const [success, error] = await this._currentSession.saveToFile();
  if (!success && error) {
    printError(`Warning: Failed to save current session before switching: ${error}`);
  }
}
```

### Testing Recommendations
1. Start a session with some conversation history
2. Make the log directory read-only
3. Attempt to switch to another session
4. Verify warning message is displayed
5. Restore permissions and verify recovery

---

## Additional Issues Investigated

### False Positive: Engine Name Mismatch (Bug #1)
**Status:** ❌ False Positive

The reported mismatch between `ENGINE_MAPPING` using `'LLAMA_CPP'` and validation schema expecting `'LLAMA'` was investigated. The `LlamaConfigSchema` in `src/llm/llamaValidation.ts` is orphaned code that is never imported or used anywhere in the codebase. No action required.

### To Investigate: LLaMA Model Memory Leak (Bug #5)
**Status:** ⚠️ Needs Investigation

When switching sessions, LlamaClient instances may accumulate without cleanup. Investigation needed to determine if:
1. node-llama-cpp requires explicit disposal of models
2. Native resources are properly garbage collected
3. A cleanup method should be added to LlamaClient

### Code Smell: Type Safety Bypass (Bug #6)
**Status:** ⚠️ Low Priority

Line `src/files/sessionFiles.ts:71` uses `as any` cast to bypass TypeScript checking:
```typescript
history: jsonHistory as any
```
While not critical, this should be properly typed to prevent potential runtime errors.

---

## Summary

| Bug # | Title | Severity | Status |
|-------|-------|----------|--------|
| #2 | WAL File Corruption Not Reset | Critical | ✅ Fixed |
| #3 | Silent WAL Error Handling | High | ✅ Fixed |
| #4 | Signal Handler Error Handling | Critical | ✅ Fixed |
| #7 | Session Switch Error Handling | Critical | ✅ Fixed |
| #1 | Engine Name Mismatch | N/A | ❌ False Positive |
| #5 | LLaMA Model Memory Leak | Medium | ⚠️ Needs Investigation |
| #6 | Type Safety Bypass | Low | ⚠️ Future Improvement |

**Total Critical Bugs Fixed:** 4
**Files Modified:** 4
