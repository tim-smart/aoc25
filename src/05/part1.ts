import { NodeRuntime } from "@effect/platform-node"
import { Effect, Number } from "effect"
import { DayInput } from "../DayInput.ts"

const program = Effect.gen(function* () {
  const input = yield* DayInput

  const [inputFresh, inputAvailable] = (yield* input.raw(5))
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

export const sample = DayInput.layerSample(`
3-5
10-14
16-20
12-18

1
5
8
11
17
32
`)

program.pipe(Effect.provide(DayInput.layer(2025)), NodeRuntime.runMain)
