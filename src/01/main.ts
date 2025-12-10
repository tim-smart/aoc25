import { NodeRuntime } from "@effect/platform-node"
import { Effect } from "effect"
import { Dial } from "./Dial.ts"
import { DayInput } from "../DayInput.ts"

const program = Effect.gen(function* () {
  const dayInput = yield* DayInput
  const dial = yield* Dial
  const input = yield* dayInput.lines(1)

  let part1 = 0
  let part2 = 0
  for (const line of input) {
    part2 += yield* dial.rotate(line)
    if (dial.position() === 0) {
      part1++
    }
  }

  yield* Effect.log(`Part 1: ${part1}`)
  yield* Effect.log(`Part 2: ${part2}`)
})

program.pipe(
  Effect.provide([Dial.layer, DayInput.layer(2025)]),
  NodeRuntime.runMain,
)
