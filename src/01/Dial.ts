import { Effect, flow, Layer, ServiceMap } from "effect"
import * as DialInstruction from "./DialInstruction.ts"

export class Dial extends ServiceMap.Service<Dial>()("01/Dial", {
  make: Effect.fn(function* (initialPosition: number) {
    // max position is 99, min is 0
    // on overflow, it wraps around
    let position = initialPosition

    // returns number of times the dial goes pass 0
    const rotate = Effect.fnUntraced(function* (s: string) {
      const instruction = yield* DialInstruction.parse(s)
      if (instruction.steps === 0) {
        return 0
      }

      switch (instruction._tag) {
        case "Left": {
          const invertedPos = (100 - position) % 100
          const next = invertedPos + instruction.steps
          const passes = Math.floor(next / 100)
          position = (100 - (next % 100)) % 100
          return passes
        }
        case "Right": {
          const next = position + instruction.steps
          position = next % 100
          return Math.floor(next / 100)
        }
      }
    })

    return {
      rotate,
      position() {
        return position
      },
    } as const
  }),
}) {
  static layer = Layer.effect(this, this.make(50))
  static layerWith = flow(
    Layer.effect(this, this.make),
    Layer.provide(Layer.empty),
  )
}
