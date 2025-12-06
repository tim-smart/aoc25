import { NodeRuntime, NodeServices } from "@effect/platform-node"
import { Effect, Number } from "effect"
import { FileSystem } from "effect/platform"

type Range = {
  minimum: number
  maximum: number
}

const program = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem
  const input = (yield* fs.readFileString(`${import.meta.dirname}/input.txt`))
    .trim()
    .split("\n\n")[0]!

  const ranges = new Set<Range>()

  for (const line of input.split("\n")) {
    let matched = false
    const parsed = line.split("-").map((s) => Number.parse(s))
    let range: Range = { minimum: parsed[0]!, maximum: parsed[1]! }

    for (const other of ranges) {
      const match =
        Number.between(range.minimum, other) ||
        Number.between(range.maximum, other) ||
        Number.between(other.minimum, range) ||
        Number.between(other.maximum, range)
      if (!match) continue

      if (!matched) {
        matched = true
        other.minimum = Number.min(other.minimum, range.minimum)
        other.maximum = Number.max(other.maximum, range.maximum)
        range = other
      } else {
        range.minimum = Number.min(other.minimum, range.minimum)
        range.maximum = Number.max(other.maximum, range.maximum)
        ranges.delete(other)
      }
    }

    if (!matched) {
      ranges.add(range)
    }
  }

  let total = 0
  ranges.forEach((range) => {
    total += range.maximum - range.minimum + 1
  })

  console.log(`Part 2: ${total}`)
})

program.pipe(Effect.provide(NodeServices.layer), NodeRuntime.runMain)
