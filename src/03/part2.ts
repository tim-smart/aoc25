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
      return findLargestDigits(digits, 12)
    })
    .reduce((a, b) => a + b, 0)

  console.log(sum)
})

function findLargestDigits(
  digits: Array<readonly [number, number]>,
  n: number,
) {
  let lowestIndex = -1
  let highestIndex = digits.length - (n - 1)
  let found = ""
  for (let i = 0; i < n; i++) {
    const next = digits.find(
      ([, index]) => index > lowestIndex && index < highestIndex,
    )!
    found += next[0]
    lowestIndex = next[1]
    highestIndex++
  }
  return Number(found)
}

program.pipe(Effect.provide(DayInput.layer(2025)), NodeRuntime.runMain)
