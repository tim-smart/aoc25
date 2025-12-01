import { NodeRuntime, NodeServices } from "@effect/platform-node"
import { Effect } from "effect"
import { FileSystem } from "effect/platform"
import { Dial } from "./Dial.ts"

const program = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem
  const dial = yield* Dial
  const input = (yield* fs.readFileString(`${import.meta.dirname}/input.txt`))
    .trim()
    .split("\n")

  let password = 0
  for (const line of input) {
    const pos = yield* dial.rotate(line)
    if (pos === 0) {
      password += 1
    }
  }

  yield* Effect.log(`The dial password is: ${password}`)
})

program.pipe(
  Effect.provide([Dial.layer, NodeServices.layer]),
  NodeRuntime.runMain,
)
