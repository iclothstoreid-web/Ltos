// DNA State — the render pipeline's Single Source of Truth (Incremental
// Render Engine V1 lock). Every other stage (Dependency Graph, Dirty Layer
// Detection, Render Cache, and the existing DNA Resolver -> Recipe Composer
// -> Prompt Builder chain) is a pure function OF this shape; nothing
// upstream ever reads a previously rendered image back in as input.
//
// This mirrors exactly what /api/design/render already receives as its
// request body (customerPhotoUrl + componentSelections) — DNA State is not
// a new client concept, just the existing request payload given a name and
// a hash so the pipeline can reason about "did anything actually change."
export interface DnaStateComponent {
  // Kept as `string`, not `MasterDataCategory` — DNA State must stay valid
  // even for a component whose category the request got wrong or that
  // hasn't been resolved against design_master_options yet. Only the
  // Dependency Graph (dependencyGraph/graph.ts) needs a *known* category,
  // and it degrades gracefully for one it doesn't recognize.
  category: string
  itemId: string
}

export interface DnaState {
  customerPhotoUrl: string
  components: DnaStateComponent[]
}
