import { NodeRuntime, NodeServices } from "@effect/platform-node"
import { Effect } from "effect"
import { FileSystem } from "effect/platform"
import { Dial } from "./Dial.ts"
import { Stream } from "effect/stream"
import { Filter } from "effect/data"

const program = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem
  const dial = yield* Dial

  const password = yield* fs.stream(`${import.meta.dirname}/input.txt`).pipe(
    Stream.decodeText(),
    Stream.splitLines,
    Stream.mapEffect((line) => dial.rotate(line)),
    Stream.filter(Filter.fromPredicate((pos) => pos === 0)),
    Stream.runCount,
  )

  yield* Effect.log(`The dial password is: ${password}`)
})

program.pipe(
  Effect.provide([Dial.layer, NodeServices.layer]),
  NodeRuntime.runMain,
)
