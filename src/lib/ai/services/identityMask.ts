import sharp from "sharp";
import { getOpenAIClient } from "../client";

// Identity Protection Mask (Render Investigation, 2026-08-06) — closes the
// gap the audit found in the prose-only identity pipeline: every existing
// safeguard (Identity Preservation, Reference Binding, Final Constraints) is
// a TEXT instruction the model can still choose not to fully honor during a
// multi-image edit. OpenAI's images.edit has a real structural mechanism
// for this instead: a `mask` parameter whose fully-transparent pixels are
// the ONLY region the model may repaint — and per OpenAI's own docs, when
// multiple images are attached, the mask applies to the FIRST one, which
// in this pipeline is always the Customer Photo (aiAssetComposer/
// composer.ts's `urls = [customerPhotoUrl, ...]`). This module builds that
// mask: opaque (protected) over a generous head/hair/ear/neck region,
// transparent (editable) everywhere else, so the face is protected at the
// pixel level, not just by instruction.
//
// Fail-open by design at every stage: any detection/fetch/encode failure
// returns null, and the caller (route.ts) proceeds exactly as it did
// before this module existed — a render must never fail, block, or
// degrade because mask generation had a bad day.
//
// Known scope limit (V1): if the Customer Photo carries a non-default EXIF
// orientation tag (common for gallery-uploaded photos taken sideways on a
// phone; the in-kiosk camera capture path — PhotoUploader.tsx's
// captureFrame(), a <canvas> export — never produces one), this module
// skips masking for that render rather than risk misaligning the mask
// against however the model resolves that orientation internally. Camera
// captures (the primary path for this business) are unaffected.

export interface HeadRegionBox {
  /** Normalized [0,1] bounding box of the FACE only (not hair/ears/neck — padded separately, see buildProtectionMask). */
  x: number;
  y: number;
  width: number;
  height: number;
}

const IDENTITY_MASK_DETECTION_MODEL = "gpt-4o-mini";

// DISABLED BY DEFAULT (2026-08-06) — live-tested against the real
// production pipeline (scripts/finalRenderTest.ts, 2 real gpt-image-1
// calls) and found broken: the returned image was cropped to a distorted
// oval matching this module's mask ellipse shape, with everything outside
// it discarded (transparent/black) rather than preserved as the original
// photo — a full-body "head to toe, feet visible" render came back with
// legs and feet gone entirely. The face itself, where visible, did look
// like a strong match to the customer, so face-region detection isn't the
// broken part; something about how this mask interacts with gpt-image-1's
// internal canvas sizing (the source photo here was 4000x6000 — far above
// gpt-image-1's ~1024-1536px working resolution — and/or this pipeline's
// additional 4 reference images) is not behaving per the documented
// single-image mask contract. Needs isolated debugging (mask against a
// pre-downscaled image; mask with zero additional reference images; a
// plain full-rectangle mask to rule out the ellipse geometry itself)
// before re-enabling. Flip via IDENTITY_MASK_ENABLED=true once fixed and
// re-verified — the fail-open behavior below is unaffected either way.
const IDENTITY_MASK_ENABLED = process.env.IDENTITY_MASK_ENABLED === "true";

const DETECTION_PROMPT = [
  "Find the main person's face in this photo.",
  'Respond with ONLY a JSON object, no other text: {"personVisible": boolean, "face": {"x": number, "y": number, "width": number, "height": number}}.',
  "The face box must use normalized 0-1 coordinates (fraction of image width/height), tightly bounding just the face itself — forehead to chin, ear to ear. Do not include hair or shoulders in the box.",
  'If no clear human face is visible, respond {"personVisible": false}.',
].join(" ");

function isFiniteInRange01(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 1;
}

async function detectFaceBox(customerPhotoUrl: string): Promise<HeadRegionBox | null> {
  try {
    const client = getOpenAIClient();
    const response = await client.chat.completions.create({
      model: IDENTITY_MASK_DETECTION_MODEL,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: DETECTION_PROMPT },
            { type: "image_url", image_url: { url: customerPhotoUrl } },
          ],
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 200,
    });

    const raw = response.choices[0]?.message?.content;
    if (!raw) return null;

    const parsed = JSON.parse(raw) as { personVisible?: boolean; face?: Partial<HeadRegionBox> };
    if (!parsed.personVisible || !parsed.face) return null;

    const { x, y, width, height } = parsed.face;
    if (![x, y, width, height].every(isFiniteInRange01)) return null;
    if (width! <= 0 || height! <= 0 || x! + width! > 1.01 || y! + height! > 1.01) return null;

    return { x: x!, y: y!, width: width!, height: height! };
  } catch (error) {
    console.error("[identityMask] face detection failed, proceeding without mask:", error instanceof Error ? error.message : error);
    return null;
  }
}

// Pads the tight face box into a generous ellipse covering hair/ears/neck,
// then rasterizes it as the protected (opaque) region of an otherwise
// fully transparent PNG — OpenAI's documented mask contract: "areas with
// 100% transparency correspond to the areas GPT Image is allowed to
// edit." Deliberately generous (errs toward protecting slightly too much
// rather than risking a sliver of real face left editable) — the cost of
// over-protecting is a render that stays closer to the original photo in
// the neck/hairline area, not a failure.
async function buildProtectionMask(imageBuffer: Buffer, face: HeadRegionBox): Promise<Buffer> {
  const metadata = await sharp(imageBuffer).metadata();
  const width = metadata.width;
  const height = metadata.height;
  if (!width || !height) throw new Error("Could not read customer photo dimensions.");

  const padTop = face.height * 0.9; // hair
  const padSide = face.width * 0.55; // ears
  const padBottom = face.height * 0.65; // chin -> upper neck

  const boxTop = Math.max(0, face.y - padTop);
  const boxBottom = Math.min(1, face.y + face.height + padBottom);
  const boxLeft = Math.max(0, face.x - padSide);
  const boxRight = Math.min(1, face.x + face.width + padSide);

  const cx = ((boxLeft + boxRight) / 2) * width;
  const cy = ((boxTop + boxBottom) / 2) * height;
  const rx = ((boxRight - boxLeft) / 2) * width;
  const ry = ((boxBottom - boxTop) / 2) * height;

  const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg"><ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="white"/></svg>`;

  return sharp(Buffer.from(svg)).png().toBuffer();
}

// Orchestrates detection + mask build; the ONE function route.ts calls.
// Returns null (never throws) whenever masking isn't safely possible for
// this photo — a disabled flag, no clear face, or a non-default EXIF
// orientation (see module doc comment) all fall back identically to
// "render exactly as it did before this feature existed."
export async function generateIdentityProtectionMask(customerPhotoUrl: string): Promise<File | null> {
  if (!IDENTITY_MASK_ENABLED) return null;

  try {
    const response = await fetch(customerPhotoUrl);
    if (!response.ok) return null;
    const imageBuffer = Buffer.from(await response.arrayBuffer());

    const metadata = await sharp(imageBuffer).metadata();
    if (metadata.orientation && metadata.orientation !== 1) {
      console.warn("[identityMask] customer photo has a non-default EXIF orientation — skipping mask this render (see module doc comment).");
      return null;
    }

    const faceBox = await detectFaceBox(customerPhotoUrl);
    if (!faceBox) return null;

    const maskBuffer = await buildProtectionMask(imageBuffer, faceBox);
    // Node's Buffer type doesn't satisfy DOM's BlobPart (ArrayBufferLike
    // includes SharedArrayBuffer, which BlobPart rejects) — a plain
    // Uint8Array copy of the same bytes does.
    return new File([new Uint8Array(maskBuffer)], "identity-protection-mask.png", { type: "image/png" });
  } catch (error) {
    console.error("[identityMask] mask generation failed, proceeding without mask:", error instanceof Error ? error.message : error);
    return null;
  }
}
