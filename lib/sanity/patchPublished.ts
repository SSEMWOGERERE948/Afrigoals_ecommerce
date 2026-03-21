// lib/sanity/patchPublished.ts
import { serverClient } from "@/sanity/lib/serverClient";

/**
 * Patch a Sanity document correctly regardless of whether it exists as a
 * draft, a published document, or both.
 *
 * THE PROBLEM THIS SOLVES:
 * - serverClient.create() always creates a DRAFT ("drafts.abc123")
 * - serverClient.patch("abc123") patches the PUBLISHED doc — which doesn't
 *   exist yet for new orders, so the patch silently does nothing
 * - Admin UI (useDocumentProjection) reads the draft, so it never sees the change
 * - Customer-facing sanityFetch reads the published doc, also never sees it
 *
 * THE FIX:
 * - Check which versions actually exist in Sanity
 * - Patch whichever ones exist (draft and/or published)
 * - If only a draft exists (new unpublished order), patch the draft
 * - If both exist (admin opened it in Studio), patch both atomically
 * - If only published exists (order was published via Studio), patch published
 */
export async function patchPublished(
  documentId: string,
  fields: Record<string, unknown>
): Promise<void> {
  const publishedId = documentId.replace(/^drafts\./, "");
  const draftId = `drafts.${publishedId}`;

  // Fetch both versions in parallel
  const [published, draft] = await Promise.all([
    serverClient.getDocument(publishedId),
    serverClient.getDocument(draftId),
  ]);

  const tx = serverClient.transaction();
  let hasOp = false;

  if (published) {
    tx.patch(publishedId, (p) => p.set(fields));
    hasOp = true;
  }

  if (draft) {
    tx.patch(draftId, (p) => p.set(fields));
    hasOp = true;
  }

  if (!hasOp) {
    // Neither version exists — this shouldn't happen but log it clearly
    console.error(
      `patchPublished: document not found as either "${publishedId}" or "${draftId}"`
    );
    return;
  }

  await tx.commit();
  console.log(
    `patchPublished: patched ${published ? "published" : ""}${published && draft ? " + " : ""}${draft ? "draft" : ""} for ${publishedId}`
  );
}