# Layout module instructions

Scoped guidance for `layout/`. The global `../AGENTS.md` still applies.

## Start here
Read the docs in `layout/docs/` before non-trivial work.
- `LayoutOverview.md` for frame tree, frame construction, reflow, and fragmentation.

## Review
- Read `layout/docs/LayoutCodeReviewerChecklist.md` as guidance when reviewing
  layout changes.

## Testing
- When adding reftests / crashtests for standardized CSS properties, prefer
  putting them under relevant directories under
  `testing/web-platform/tests/css/` rather than the in-tree `layout/reftests/`
  or the per-subdirectory `layout/*/crashtests/` directories.

## Debugging
- Layout debugger can dump useful layout internal information for an url. Run
  `./mach run --layoutdebug [filename]`. Read `layout/docs/LayoutDebugger.md`
  for usage.
