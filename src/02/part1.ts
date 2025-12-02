import { NodeRuntime, NodeServices } from "@effect/platform-node"
import { Effect } from "effect"
import { Filter } from "effect/data"
import { FileSystem } from "effect/platform"
import { Stream } from "effect/stream"

const program = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem
  const ranges = (yield* fs.readFileString(`${import.meta.dirname}/input.txt`))
    .trim()
    .split(",")
    .map((range) => {
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

program.pipe(Effect.provide(NodeServices.layer), NodeRuntime.runMain)
