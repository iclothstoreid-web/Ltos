import type { MeasurementFields } from '@/components/workspace/measurement/types'

// Source of truth for addressable body parts across the Measurement
// Workspace. `coords` are percentages of the MeasurementPanel box (front
// view, object-contain), not pixels — that's what lets the overlay track
// the mannequin at any viewport size without a resize observer.
//
// Calibrated against the real public/mannequin/mannequin.png asset (not
// estimated): the panel is aspect-[3/4] but the source PNG is a square
// 1024x1024 canvas, so a plain object-contain fit (mannequin rendered at
// its natural size, no zoom) letterboxes it to ~12.5% empty margin top and
// bottom. These percentages were derived by pixel-classifying the PNG
// (mannequin's blue-tinted body vs. the neutral checkerboard background)
// to find each landmark's actual pixel position, then mapping image-space
// % through that letterbox into panel-space % (panelYPct = 12.5 +
// imgYPct * 0.75; panelXPct = imgXPct unchanged, since image width maps
// 1:1 to panel width). If MeasurementMannequin.tsx ever re-introduces a
// zoom/crop on the image, these must be recalibrated to match.
export type BodyPartId =
  | 'head'
  | 'neck'
  | 'leftShoulder'
  | 'rightShoulder'
  | 'chest'
  | 'waist'
  | 'hip'
  | 'leftHip'
  | 'rightHip'
  | 'leftArm'
  | 'rightArm'
  | 'leftElbow'
  | 'rightElbow'
  | 'leftWrist'
  | 'rightWrist'
  | 'leftThigh'
  | 'rightThigh'
  | 'leftKnee'
  | 'rightKnee'
  | 'leftCalf'
  | 'rightCalf'

export interface BodyMapCoords {
  // Center point, as a percentage of the panel box (0-100).
  xPct: number
  yPct: number
  // Glow radius, as a percentage of the panel box width.
  rPct: number
}

export interface BodyMapEntry {
  id: BodyPartId
  label: string
  coords: BodyMapCoords
}

export const BODY_MAP: Record<BodyPartId, BodyMapEntry> = {
  head: { id: 'head', label: 'Head', coords: { xPct: 50, yPct: 19.8, rPct: 4.3 } },
  neck: { id: 'neck', label: 'Neck', coords: { xPct: 50, yPct: 22.9, rPct: 3 } },
  leftShoulder: { id: 'leftShoulder', label: 'Left Shoulder', coords: { xPct: 38.4, yPct: 28.4, rPct: 5.8 } },
  rightShoulder: { id: 'rightShoulder', label: 'Right Shoulder', coords: { xPct: 61.6, yPct: 28.4, rPct: 5.8 } },
  chest: { id: 'chest', label: 'Chest', coords: { xPct: 50, yPct: 35.4, rPct: 7.9 } },
  waist: { id: 'waist', label: 'Waist', coords: { xPct: 50, yPct: 39.7, rPct: 6.8 } },
  // Raised further above the thigh line (yPct 52.1) than the first pass —
  // against the real mannequin.png the earlier yPct 46.5 still read as
  // reaching toward the groin. Kept centered for use as the 'length'
  // field's hip waypoint.
  hip: { id: 'hip', label: 'Hip', coords: { xPct: 50, yPct: 43, rPct: 4 } },
  // Lateral hip points for the 'Pinggul' measurement field, so its glow
  // reads as the hip bones rather than a single central dot bleeding down
  // toward the groin.
  leftHip: { id: 'leftHip', label: 'Left Hip', coords: { xPct: 41, yPct: 43.5, rPct: 3.8 } },
  rightHip: { id: 'rightHip', label: 'Right Hip', coords: { xPct: 59, yPct: 43.5, rPct: 3.8 } },
  // Raised from yPct 40 (which, against the real mannequin.png, sat right
  // at the elbow) to roughly a third of the way down the upper arm segment
  // (shoulder yPct 28.4 -> elbow yPct 40).
  leftArm: { id: 'leftArm', label: 'Left Arm', coords: { xPct: 38.4, yPct: 32.3, rPct: 3 } },
  rightArm: { id: 'rightArm', label: 'Right Arm', coords: { xPct: 61.6, yPct: 32.3, rPct: 3 } },
  // Dedicated elbow joint, distinct from the leftArm/rightArm (bicep) node
  // above so 'Siku' no longer highlights the same spot as 'Lengan Atas'.
  // yPct 40 matches where the bicep node used to sit — that's where the
  // elbow joint actually is on the real mannequin.png.
  leftElbow: { id: 'leftElbow', label: 'Left Elbow', coords: { xPct: 38.4, yPct: 40, rPct: 2.5 } },
  rightElbow: { id: 'rightElbow', label: 'Right Elbow', coords: { xPct: 61.6, yPct: 40, rPct: 2.5 } },
  leftWrist: { id: 'leftWrist', label: 'Left Wrist', coords: { xPct: 36.7, yPct: 51.6, rPct: 3 } },
  rightWrist: { id: 'rightWrist', label: 'Right Wrist', coords: { xPct: 63.3, yPct: 51.6, rPct: 3 } },
  leftThigh: { id: 'leftThigh', label: 'Left Thigh', coords: { xPct: 45.6, yPct: 56, rPct: 3.9 } },
  rightThigh: { id: 'rightThigh', label: 'Right Thigh', coords: { xPct: 54.4, yPct: 56, rPct: 3.9 } },
  leftKnee: { id: 'leftKnee', label: 'Left Knee', coords: { xPct: 45.6, yPct: 65.6, rPct: 3 } },
  rightKnee: { id: 'rightKnee', label: 'Right Knee', coords: { xPct: 54.4, yPct: 65.6, rPct: 3 } },
  leftCalf: { id: 'leftCalf', label: 'Left Calf', coords: { xPct: 45.6, yPct: 69, rPct: 3 } },
  rightCalf: { id: 'rightCalf', label: 'Right Calf', coords: { xPct: 54.4, yPct: 69, rPct: 3 } },
}

// Which body part(s) a given measurement field relates to — drives the
// highlight overlay when a measurement input gains focus.
export const MEASUREMENT_BODY_MAP: Record<keyof MeasurementFields, BodyPartId[]> = {
  neck: ['neck'],
  shoulder: ['leftShoulder', 'rightShoulder'],
  chest: ['chest'],
  waist: ['waist'],
  // Perut bawah + pinggul kiri/kanan — deliberately excludes the thigh and
  // crotch nodes below it (see the hip/leftHip/rightHip coords above).
  hip: ['hip', 'leftHip', 'rightHip'],
  armhole: ['leftShoulder', 'rightShoulder', 'chest'],
  sleeve: ['leftArm', 'rightArm'],
  biceps: ['leftArm', 'rightArm'],
  elbow: ['leftElbow', 'rightElbow'],
  wrist: ['leftWrist', 'rightWrist'],
  length: ['hip', 'leftThigh', 'rightThigh', 'leftCalf', 'rightCalf'],
  // Garment hem sits at the bottom of the leg — nearest limb segment.
  hemWidth: ['leftCalf', 'rightCalf'],
}
