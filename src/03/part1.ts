import { NodeRuntime, NodeServices } from "@effect/platform-node"
import { Effect } from "effect"
import { FileSystem } from "effect/platform"

const program = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem
  const sum = (yield* fs.readFileString(`${import.meta.dirname}/input.txt`))
    .trim()
    .split("\n")
    .map((bank) => {
      const digits = bank
        .split("")
        .map((s, i) => [Number(s), i] as const)
        .sort((a, b) => b[0] - a[0])
      const first = digits.find(([, i]) => i < bank.length - 1)!
      const second = digits.find(([, i]) => i > first[1])!
      return first[0] * 10 + second[0]
    })
    .reduce((a, b) => a + b, 0)

  console.log(sum)
})

program.pipe(Effect.provide(NodeServices.layer), NodeRuntime.runMain)
