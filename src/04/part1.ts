import { NodeRuntime, NodeServices } from "@effect/platform-node"
import { Effect } from "effect"
import { FileSystem } from "effect/platform"
import { Graph } from "effect/collections"
import { Data } from "effect/data"

const program = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem
  const rows = (yield* fs.readFileString(`${import.meta.dirname}/input.txt`))
    .trim()
    .split("\n")

  const indexes = new Map<Paper, number>()
  const graph = Graph.undirected<Paper, number>((graph) => {
    let i = 0
    for (let y = 0; y < rows.length; y++) {
      const row = rows[y]!
      for (let x = 0; x < row.length; x++) {
        const char = row[x]!
        if (char === ".") continue
        const paper = Paper.make(x, y)
        const index = Graph.addNode(graph, paper)
        indexes.set(paper, index)
        for (const neighbor of paper.adjacent()) {
          const neighborIndex = indexes.get(neighbor)
          if (neighborIndex === undefined) continue
          Graph.addEdge(graph, index, neighborIndex, i++)
        }
      }
    }
  })

  let count = 0
  for (const [index] of Graph.nodes(graph)) {
    const neighbors = Graph.neighbors(graph, index)
    if (neighbors.length < 4) {
      count++
    }
  }

  console.log("Part 1:", count)

  let totalRemoved = 0
  Graph.mutate(graph, (graph) => {
    while (true) {
      let removed = 0
      for (const [index] of Graph.nodes(graph)) {
        const neighbors = Graph.neighbors(graph, index)
        if (neighbors.length >= 4) continue
        Graph.removeNode(graph, index)
        removed++
        totalRemoved++
      }
      if (removed === 0) break
    }
  })

  console.log("Part 2:", totalRemoved)
})

class Paper extends Data.Class<{
  x: number
  y: number
}> {
  static cache = new Map<string, Paper>()
  static make(x: number, y: number) {
    const key = `${x},${y}`
    let item = this.cache.get(key)
    if (!item) {
      item = new Paper({ x, y })
      this.cache.set(key, item)
    }
    return item
  }

  *adjacent(): Iterable<Paper> {
    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        if (x === 0 && y === 0) continue
        yield Paper.make(this.x + x, this.y + y)
      }
    }
  }
}

program.pipe(Effect.provide(NodeServices.layer), NodeRuntime.runMain)
