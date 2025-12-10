import { NodeRuntime } from "@effect/platform-node"
import { Effect } from "effect"
import { Dial } from "./Dial.ts"
import { Stream } from "effect/stream"
import { DayInput } from "../DayInput.ts"

const program = Effect.gen(function* () {
  const input = yield* DayInput
  const dial = yield* Dial

  const password = yield* input.stream(1).pipe(
    Stream.mapEffect((line) => dial.rotate(line)),
    Stream.runSum,
  )

  yield* Effect.log(`The dial password is: ${password}`)
})

program.pipe(
  Effect.provide([Dial.layer, DayInput.layer(2025)]),
  NodeRuntime.runMain,
)
