# Technical Debt

## Orphaned Vercel Blob cleanup

Priority: medium; schedule after Mission 06 closeout unless storage growth or
privacy risk increases.

Failed or abandoned application submissions can leave uploaded objects in
Vercel Blob after the related Payload media or application operation fails or is
rolled back. The immediate impact is unused storage and a growing set of objects
that are not reachable through application records; private-by-default media
controls limit public exposure, but the objects still require lifecycle
management.

The probable cause is that Blob upload and PostgreSQL/Payload record creation do
not share a transaction, and failure paths do not consistently delete the
already-uploaded object. A future engineering task should add compensating
cleanup on failed submissions plus a conservative scheduled reconciliation job
that identifies unreferenced objects, observes a safety-age window, records an
audit trail, and supports dry-run review before deletion. Do not delete objects
solely because a single record lookup fails.
