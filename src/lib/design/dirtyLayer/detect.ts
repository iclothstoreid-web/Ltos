import type { DnaState, DnaStateComponent } from '@/lib/design/dnaState/types'
import { LAYER_BY_CATEGORY, LAYER_DEPENDENCIES, isKnownCategory, type LayerId } from '@/lib/design/dependencyGraph/graph'

export interface DirtyLayerResult {
  // Layers whose own DNA selection actually changed between `prev` and `next`.
  changedLayers: LayerId[]
  // Layers that didn't change themselves but depend (per Dependency Graph)
  // on one that did — e.g. Material changing also dirties Color.
  cascadedLayers: LayerId[]
  // Union of changedLayers + cascadedLayers — the real "must not skip"
  // set for this render.
  dirtyLayers: LayerId[]
  // Every other layer present in `next` — per the locked business rule,
  // these must never trigger any re-render work of their own.
  unchangedLayers: LayerId[]
  photoChanged: boolean
}

function componentsByLayer(components: DnaStateComponent[]): Map<LayerId, string> {
  const map = new Map<LayerId, string>()
  components.forEach((component) => {
    if (!isKnownCategory(component.category)) return
    map.set(LAYER_BY_CATEGORY[component.category], component.itemId)
  })
  return map
}

// Widens a directly-changed layer set through LAYER_DEPENDENCIES: any layer
// that declares a dependency on a changed layer becomes dirty too, even
// though its own selection didn't change (Task 4). This is the only place
// the Dependency Graph enlarges the dirty set — everything else in `next`
// stays untouched.
function cascadeDependents(changed: Set<LayerId>, allLayers: LayerId[]): LayerId[] {
  return allLayers.filter((layer) => {
    if (changed.has(layer)) return false
    const deps = LAYER_DEPENDENCIES[layer] ?? []
    return deps.some((dep) => changed.has(dep))
  })
}

// Diffs one DNA State against the previous one and returns exactly which
// conceptual layers must be treated as dirty for this render (Task 3 + 7).
// `prev === null` means there is nothing to diff against (first render for
// this process) — every present layer is marked dirty, same as a cache miss.
export function detectDirtyLayers(prev: DnaState | null, next: DnaState): DirtyLayerResult {
  const nextByLayer = componentsByLayer(next.components)
  const allLayers = Array.from(nextByLayer.keys())

  if (!prev) {
    return {
      changedLayers: allLayers,
      cascadedLayers: [],
      dirtyLayers: allLayers,
      unchangedLayers: [],
      photoChanged: true,
    }
  }

  const prevByLayer = componentsByLayer(prev.components)
  const changedLayers = allLayers.filter((layer) => prevByLayer.get(layer) !== nextByLayer.get(layer))
  const changedSet = new Set(changedLayers)
  const cascadedLayers = cascadeDependents(changedSet, allLayers)
  const dirtySet = new Set([...changedLayers, ...cascadedLayers])

  return {
    changedLayers,
    cascadedLayers,
    dirtyLayers: allLayers.filter((layer) => dirtySet.has(layer)),
    unchangedLayers: allLayers.filter((layer) => !dirtySet.has(layer)),
    photoChanged: prev.customerPhotoUrl !== next.customerPhotoUrl,
  }
}
