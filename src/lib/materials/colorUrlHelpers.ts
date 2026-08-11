// Sprint W3-4 §12 — Color selection lives entirely in the URL
// (?color=<dna_colors.slug>), same "server-rendered links, not client
// state" approach W3-2's filter system already established. Selecting a
// swatch is a real navigation to a real, shareable, refresh-safe URL.

export function buildColorHref(basePath: string, colorSlug: string, currentColorSlug: string | null): string {
  // Clicking the already-selected swatch deselects it.
  if (currentColorSlug === colorSlug) return basePath
  return `${basePath}?color=${encodeURIComponent(colorSlug)}`
}

// §7 — Design Studio CTA. `color` is only ever appended when a color is
// actually selected; otherwise the fabric alone is sent ("Jika belum
// memilih warna: kirim hanya fabric").
export function buildDesignStudioHref(materialSlug: string, colorSlug: string | null): string {
  const params = new URLSearchParams({ fabric: materialSlug })
  if (colorSlug) params.set('color', colorSlug)
  return `/design-studio?${params.toString()}`
}
