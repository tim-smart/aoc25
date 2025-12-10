import { NodeRuntime } from "@effect/platform-node"
import { Effect } from "effect"
import { Filter } from "effect/data"
import { Stream } from "effect/stream"
import { DayInput } from "../DayInput.ts"

const program = Effect.gen(function* () {
  const input = yield* DayInput
  const ranges = (yield* input.raw(2)).split(",").map((range) => {
    const [start, end] = range.split("-").map(Number)
    return [start!, end!] as const
  })
  const rangesWithEvenDigits = ranges.flatMap(([start, end]) => {
    const startDigits = start.toString().length
    const endDigits = end.toString().length
    const diff = endDigits - startDigits
    if (diff === 0) {
      return startDigits % 2 === 0 ? ([[start, end]] as const) : []
    } else if (startDigits % 2 === 0) {
      return [[start, Number("9".repeat(startDigits))]] as const
    } else if (endDigits % 2 === 0) {
      return [[Number("1" + "0".repeat(endDigits - 1)), end]] as const
    }
    return []
  })

  const sum = yield* Stream.fromArray(rangesWithEvenDigits).pipe(
    Stream.flatMap(([start, end]) => Stream.range(start, end)),
    Stream.filter((n) => {
      const str = n.toString()
      const firstHalf = str.slice(0, str.length / 2)
      const secondHalf = str.slice(str.length / 2)
      return firstHalf === secondHalf ? n : Filter.failVoid
    }),
    Stream.runSum,
  )

  yield* Effect.log(`The sum is: ${sum}`)
})

export const sample = DayInput.layerSample(
  `11-22,95-115,998-1012,1188511880-1188511890,222220-222224,1698522-1698528,446443-446449,38593856-38593862,565653-565659,824824821-824824827,2121212118-2121212124`,
)

program.pipe(Effect.provide(DayInput.layer(2025)), NodeRuntime.runMain)
