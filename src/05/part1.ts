import { NodeRuntime, NodeServices } from "@effect/platform-node"
import { Effect, Number } from "effect"
import { FileSystem } from "effect/platform"

const program = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem
  const [inputFresh, inputAvailable] = (yield* fs.readFileString(
    `${import.meta.dirname}/input.txt`,
  ))
    .trim()
    .split("\n\n")

  const freshRanges = inputFresh!.split("\n").map((line) => {
    const [min, max] = line.split("-").map((s) => Number.parse(s))
    return { minimum: min!, maximum: max! } as const
  })

  const availableAndFresh = inputAvailable!.split("\n").flatMap((line) => {
    const id = Number.parse(line)!
    const isFresh = freshRanges.some((opts) => Number.between(id, opts))
    return isFresh ? [id] : []
  })

  console.log(`Part 1: ${availableAndFresh.length}`)
})

program.pipe(Effect.provide(NodeServices.layer), NodeRuntime.runMain)
