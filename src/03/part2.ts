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

program.pipe(Effect.provide(NodeServices.layer), NodeRuntime.runMain)
