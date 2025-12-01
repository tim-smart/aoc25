import { Effect } from "effect"
import { Data } from "effect/data"
import { DialError } from "./DialError.ts"

export type DialInstruction = Data.TaggedEnum<{
  Left: { steps: number }
  Right: { steps: number }
}>

export const DialInstruction = Data.taggedEnum<DialInstruction>()

const regex = /^(L|R)(\d+)$/

export function parse(
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
