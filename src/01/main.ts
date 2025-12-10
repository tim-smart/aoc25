import { NodeRuntime } from "@effect/platform-node"
import { Effect } from "effect"
import { Dial } from "./Dial.ts"
import { DayInput } from "../DayInput.ts"

const program = Effect.gen(function* () {
  const dayInput = yield* DayInput
  const dial = yield* Dial
  const input = yield* dayInput.lines(1)

  let password = 0
  for (const line of input) {
    password += yield* dial.rotate(line)
  }

  yield* Effect.log(`The dial password is: ${password}`)
})

program.pipe(
  Effect.provide([Dial.layer, DayInput.layer(2025)]),
  NodeRuntime.runMain,
)
