import { Effect, Layer, ServiceMap } from "effect"
import * as DialInstruction from "./DialInstruction.ts"

export class Dial extends ServiceMap.Service<Dial>()("01/Dial", {
  make: Effect.gen(function* () {
    // max position is 99, min is 0
    // on overflow, it wraps around
    let position = 50

    const rotate = Effect.fnUntraced(function* (s: string) {
      const instruction = yield* DialInstruction.parse(s)
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
      position() {
        return position
      },
    } as const
  }),
}) {
  static layer = Layer.effect(this, this.make)
}
