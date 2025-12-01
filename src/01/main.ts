import { NodeRuntime, NodeServices } from "@effect/platform-node"
import { Effect, Layer, ServiceMap } from "effect"
import { Data } from "effect/data"
import { FileSystem } from "effect/platform"

type DialInstruction = Data.TaggedEnum<{
  Left: { steps: number }
  Right: { steps: number }
}>

const DialInstruction = Data.taggedEnum<DialInstruction>()

const regex = /^(L|R)(\d+)$/

function parseInstruction(
  instruction: string,
): Effect.Effect<DialInstruction, DialError> {
  const match = instruction.match(regex)
  if (!match)
    return Effect.fail(new DialError({ reason: "InvalidInstruction" }))

  const direction = match[1]
  const steps = Number(match[2])
  return Effect.succeed(
    direction === "L"
      ? DialInstruction.Left({ steps })
      : DialInstruction.Right({ steps }),
  )
}

class DialError extends Data.TaggedError("DialError")<{
  reason: "InvalidInstruction"
}> {}

class Dial extends ServiceMap.Service<Dial>()("01/Dial", {
  make: Effect.gen(function* () {
    // max position is 99, min is 0
    // on overflow, it wraps around
    let position = 50

    const isZero = () => position === 0

    const rotate = Effect.fnUntraced(function* (s: string) {
      const instruction = yield* parseInstruction(s)
      switch (instruction._tag) {
        case "Left":
          position = (position - instruction.steps + 100) % 100
          break
        case "Right":
          position = (position + instruction.steps) % 100
          break
      }
      return position
    })

    return {
      rotate,
      isZero,
      position() {
        return position
      },
    } as const
  }),
}) {
  static layer = Layer.effect(this, this.make)
}

const program = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem
  const dial = yield* Dial
  const input = (yield* fs.readFileString(`${import.meta.dirname}/input.txt`))
    .trim()
    .split("\n")

  let password = 0
  for (const line of input) {
    yield* dial.rotate(line)
    if (dial.isZero()) {
      password += 1
    }
  }

  yield* Effect.log(`The dial password is: ${password}`)
})

program.pipe(
  Effect.provide([Dial.layer, NodeServices.layer]),
  NodeRuntime.runMain,
)
