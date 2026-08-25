import Image from 'next/image'
import { OwnerTopBar } from '@/components/command-center/OwnerCommandCenter/OwnerTopBar'
import { LauncherTile } from './LauncherTile'
import { LAUNCHER_TILES } from './tiles'

interface AppLauncherProps {
  profileName: string
  slaRiskCount: number
}

// The launcher is the "which room do I enter" moment — deliberately without
// LeftSidebar (a list of the same 8 destinations beside a grid of the same
// 8 destinations is redundant noise, and Navigation DNA says nav should
// recede, not repeat itself). OwnerTopBar is reused as-is (dark variant):
// same search, notifications, and identity every other Owner OS page
// already has, just restyled to sit on this page's material.
//
// Background material — real, visible walnut wood grain, not a flat
// color gradient. public/textures/walnut-material.svg (new, procedural —
// see that file's own header comment for why the codebase's existing
// walnut-grain.png wasn't reusable here: it was inspected directly and its
// own internal contrast is too low, by design, to ever read as visible
// grain on a dark ground). Rendered via headless Chrome + visually
// reviewed before landing here (a flat-gradient version was tried first
// and correctly rejected for not reading as "wood" at a glance).
//   1. walnut-material.svg itself carries both the macro tonal gradient
//      (Dark Walnut #2A1C16 -> a wide Warm Walnut plateau peaking at
//      #78503A -> Dark Walnut, capped there rather than the lighter
//      public-site tan #8B6245) AND two directional grain layers
//      (feTurbulence, one darkening one warm-lightening, different seeds)
//      composited together, so it's one continuous material rather than a
//      gradient with texture floating weakly on top of it. Checked against
//      WCAG's actual relative-luminance formula: ivory text needs 85%
//      opacity (not 75%) to hold just over 5:1 against the #78503A peak —
//      that's why every secondary-text use below is /85, not /75.
//      Two tonal-exposure follow-ups after the first version read as
//      near-black: (a) every stop lifted roughly one exposure step, then
//      (b) the SVG's own canvas changed from 1600x900 (wide) to 1400x1400
//      (square) and the warm zone widened from a narrow peak to a
//      30–72% plateau — the first fix alone was still barely visible
//      because object-cover on this component's actual (tall) container
//      crops mostly along whichever axis carried most of the gradient's
//      variation, which on a wide canvas is nearly the whole thing. The
//      two grain filters are byte-for-byte unchanged from the very first
//      version throughout all of this — only the base gradient/canvas
//      moved.
//   2. A soft Midnight Navy vignette in the corners only, per the brief's
//      "Midnight Navy sebagai tonal shadow" — never a large color area.
//      Pulled back further out (transparent until 62% radius, capped at
//      0.22 alpha) in the same follow-up, since at its original 45%/0.3 it
//      was darkening most of the page, not just the corners, and was part
//      of why the background read as flat-black instead of walnut.
//
// walnut-material.svg is rendered as an <img> (via next/image, unoptimized
// — Next's image optimizer rejects/degrades SVG by default, and there's no
// responsive-srcset benefit for a fixed full-bleed background anyway), not
// a CSS background-image: confirmed by screenshot that Chrome rasterizes
// an SVG with feTurbulence filters at much lower effective quality as a
// CSS background than as an <img>/document — the grain nearly vanished the
// background-image way even though it's the exact same file.
export function AppLauncher({ profileName, slaRiskCount }: AppLauncherProps) {
  return (
    <div className="relative min-h-screen bg-[#221814]">
      <Image
        src="/textures/walnut-material.svg"
        alt=""
        fill
        unoptimized
        priority
        className="pointer-events-none object-cover"
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(130% 90% at 50% 10%, transparent 62%, rgba(11,22,40,0.22) 100%)' }}
      />

      <div className="relative">
        <OwnerTopBar profileName={profileName} variant="dark" />

        <main className="mx-auto max-w-[1180px] px-4 pb-24 pt-16 text-center sm:px-8 md:px-10">
          <div className="mb-16">
            <p className="text-label uppercase tracking-[0.12em] text-warm-gold">Local Tailor Operating System</p>
            <h1 className="font-serif text-heading-md font-normal tracking-[-0.01em] text-surface-low">
              Selamat datang, {profileName}.
            </h1>
            <p className="mx-auto mt-2 max-w-[60ch] text-body-md leading-relaxed text-surface-low/85">
              Pilih ruang kerja yang ingin dibuka. Setiap modul menyimpan pekerjaannya sendiri — tidak ada yang hilang
              saat Anda berpindah.
            </p>
          </div>

          <div className="grid grid-cols-1 justify-items-center gap-x-10 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
            {LAUNCHER_TILES.map((tile, i) => (
              <LauncherTile
                key={tile.name}
                tile={tile}
                index={i}
                indicator={tile.name === 'Command Center' && slaRiskCount > 0 ? String(slaRiskCount) : undefined}
              />
            ))}
          </div>

          <p className="mt-16 flex items-center justify-center gap-2 text-label text-surface-low/85">
            <span className="h-[5px] w-[5px] rounded-full bg-surface-low/30" />
            Master Data &amp; Commercial Center tetap tersedia dari sidebar setiap modul.
          </p>
        </main>
      </div>
    </div>
  )
}
