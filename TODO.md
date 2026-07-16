# TODO - Backend & Admin Portal Update

## Phase 1 (High Priority): Real-time image synchronization (#1)
- [ ] Verify current Firestore writes for `app_state/mahdev_image_state_v1` (find where it is updated/seeded).
- [ ] Update admin theme/logo save flow so image URLs are written into `app_state/mahdev_image_state_v1.website.*`.
- [ ] Ensure all website banner/logo reads come exclusively from `useRealtimeImageState()` (real-time listener).
- [ ] Keep cache-busting working: verify `?v=<updatedAtEpoch>` is applied to every website image URL derived from Firestore.
- [ ] Ensure old images are not served after replacement (validate delete/replace flow + URL versioning).

## Phase 2 (High Priority): Fix admin upload reliability + UX (#2)
- [ ] Update `/api/upload` to enforce upload limits (file size, mime types) and return structured errors.
- [ ] Add server-side timeout for upload route and confirm temp file cleanup always runs.
- [ ] Replace AdminImageUploader upload logic in `src/components/AdminView.tsx`:
  - [ ] Switch from `fetch()` to `XMLHttpRequest` to report upload progress.
  - [ ] Add progress bar + success message.
  - [ ] Add retry button for transient failures.
  - [ ] Add clearer user-friendly error messages (mapped from server error codes).
  - [ ] Add image preview before upload (already partially present; ensure it’s consistent for theme banners).
- [ ] Optionally ensure correct `folder` is sent per upload context.

## Phase 3: Admin portal UI redesign + dashboard (#3, #4)
- [ ] Refactor `AdminView.tsx` into smaller components (dashboard, content tabs, forms, dialogs).
- [ ] Apply a consistent MD3-inspired UI system (cards, spacing, typography, icons, skeletons).
- [ ] Replace `alert()` and `confirm()` with proper dialogs.
- [ ] Create real dashboard KPIs/data sources (replace any simulated values).
- [ ] Add Activity Timeline + Firebase connection/storage usage widgets.

## Phase 4: Content management + image management (#5, #6)
- [ ] Implement schema-driven content sections so admin can edit without code changes.
- [ ] Implement comprehensive image management:
  - [ ] Drag-and-drop multiple uploads
  - [ ] Crop + compress (client-side) and optimize (server-side fallback)
  - [ ] Replace + delete + sorting
  - [ ] Folder organization

## Phase 5: Firebase improvements, performance, error handling (#7, #8, #9)
- [ ] Replace insecure Firestore rules (`allow if true`) with least-privilege rules.
- [ ] Ensure real-time listeners are used where required.
- [ ] Optimize Firestore access patterns (avoid full-doc hydration for images).
- [ ] Improve performance: lazy load images, reduce unnecessary re-renders, optimize queries.

## Phase 6: Verification (#10)
- [ ] Verify image replacement appears instantly on another device without rebuild.
- [ ] Verify cache is not stale after replacement (hard refresh + normal navigation).
- [ ] Verify uploads succeed repeatedly across multiple network conditions.
- [ ] Verify no console/Firebase warnings.
- [ ] Verify all CRUD operations work.

