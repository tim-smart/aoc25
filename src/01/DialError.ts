import { Data } from "effect/data"

export class DialError extends Data.TaggedError("DialError")<{
  reason: "InvalidInstruction"
}> {}
