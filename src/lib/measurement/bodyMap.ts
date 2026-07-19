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
  | 'leftArm'
  | 'rightArm'
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
  hip: { id: 'hip', label: 'Hip', coords: { xPct: 50, yPct: 50.4, rPct: 8.5 } },
  leftArm: { id: 'leftArm', label: 'Left Arm', coords: { xPct: 38.4, yPct: 40, rPct: 3 } },
  rightArm: { id: 'rightArm', label: 'Right Arm', coords: { xPct: 61.6, yPct: 40, rPct: 3 } },
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
  hip: ['hip'],
  armhole: ['leftShoulder', 'rightShoulder', 'chest'],
  sleeve: ['leftArm', 'rightArm'],
  biceps: ['leftArm', 'rightArm'],
  // No dedicated elbow node in the body map yet — nearest limb segment.
  elbow: ['leftArm', 'rightArm'],
  wrist: ['leftWrist', 'rightWrist'],
  length: ['hip', 'leftThigh', 'rightThigh', 'leftCalf', 'rightCalf'],
  // Garment hem sits at the bottom of the leg — nearest limb segment.
  hemWidth: ['leftCalf', 'rightCalf'],
}
