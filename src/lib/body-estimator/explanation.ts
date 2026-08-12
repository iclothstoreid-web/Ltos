import type { BodyProfileType, FitType } from './types'

// Explanation Generator (brief §"Explanation Generator") — one short,
// deterministic sentence, e.g.: "Berdasarkan tinggi, berat, dan usia yang
// Anda masukkan, Anda diperkirakan memiliki proporsi tubuh athletic dengan
// rekomendasi regular fit."
export function generateExplanation(bodyProfile: BodyProfileType, fit: FitType): string {
  return `Berdasarkan tinggi, berat, dan usia yang Anda masukkan, Anda diperkirakan memiliki proporsi tubuh ${bodyProfile} dengan rekomendasi ${fit} fit.`
}
