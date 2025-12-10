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

  const sum = yield* Stream.fromArray(ranges).pipe(
    Stream.flatMap(([start, end]) => Stream.range(start, end)),
    Stream.filter(repeatFilter),
    Stream.runSum,
  )

  yield* Effect.log(`The sum is: ${sum}`)
})

const repeatFilter = Filter.make((n: number) => {
  const s = n.toString()
  const mid = Math.floor(s.length / 2)
  for (let i = 1; i <= mid; i++) {
    if (s.length % i !== 0) continue
    const repeatCount = s.length / i
    const slice = s.slice(0, i)
    const next = s.slice(i, i + slice.length)
    if (slice !== next) {
      continue
    } else if (repeatCount === 2 || slice.repeat(repeatCount) === s) {
      return n
    }
  }
  return Filter.failVoid
})

program.pipe(Effect.provide(DayInput.layer(2025)), NodeRuntime.runMain)
