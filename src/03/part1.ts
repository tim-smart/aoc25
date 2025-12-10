import { NodeRuntime } from "@effect/platform-node"
import { Effect } from "effect"
import { DayInput } from "../DayInput.ts"

const program = Effect.gen(function* () {
  const input = yield* DayInput
  const sum = (yield* input.lines(3))
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

program.pipe(Effect.provide(DayInput.layer(2025)), NodeRuntime.runMain)
