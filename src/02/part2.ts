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

program.pipe(Effect.provide(NodeServices.layer), NodeRuntime.runMain)
