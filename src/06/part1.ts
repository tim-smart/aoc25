import { Effect } from "effect"
import { DayInput } from "../DayInput.ts"
import { NodeRuntime } from "@effect/platform-node"

type Op = "+" | "*"

interface Operation {
  readonly op: Op
  readonly size: number
}

const reducers: Record<Op, (acc: number, val: number) => number> = {
  "+": (acc, val) => acc + val,
  "*": (acc, val) => acc * val,
}

const program = Effect.gen(function* () {
  const input = yield* DayInput
  const lines = yield* input.lines(6)
  const { grid, operations } = parseGrid(lines)

  let part1 = 0
  operations.forEach((op, i) => {
    const reducer = reducers[op.op]
    const numbers = grid.map((row) => Number(row[i]!.trim()))
    const answer = numbers.reduce(reducer)
    part1 += answer
  })

  console.log("Part 1:", part1)

  let part2 = 0
  operations.forEach((op, i) => {
    const reducer = reducers[op.op]
    const numbers = getNumbers(grid, op.size, i)
    const answer = numbers.reduce(reducer)
    part2 += answer
  })
  console.log("Part 2:", part2)
})

function parseGrid(lines: Array<string>): {
  readonly grid: Array<Array<string>>
  readonly operations: Array<Operation>
} {
  let opLine = lines.pop()!.padEnd(lines[0]!.length, " ")
  const operations: Array<Operation> = []
  const matches = Array.from(opLine.matchAll(/([+*])\s+/g))
  for (let i = 0; i < matches.length; i++) {
    const match = matches[i]!
    const isLast = i === matches.length - 1
    operations.push({
      op: match[1] as Op,
      size: isLast ? match[0]!.length : match[0]!.length - 1,
    })
  }

  const grid: Array<Array<string>> = []
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!
    let offset = 0
    const row: Array<string> = []
    for (let j = 0; j < operations.length; j++) {
      const op = operations[j]!
      const cell = line.slice(offset, offset + op.size)
      row.push(cell)
      offset += op.size + 1
    }
    grid.push(row)
  }

  return { grid, operations }
}

function getNumbers(
  grid: Array<Array<string>>,
  size: number,
  colIndex: number,
): Array<number> {
  const output: Array<number> = []
  const column = grid.map((row) => row[colIndex]!)

  for (let col = 0; col < size; col++) {
    let current = ""
    for (let j = 0; j < column.length; j++) {
      const char = column[j]![col]
      if (char === " ") continue
      current += char
    }
    output.push(Number(current))
  }

  return output
}

export const sample = DayInput.layerSample(`
123 328  51 64 
 45 64  387 23 
  6 98  215 314
*   +   *   +  
`)

program.pipe(
  // Effect.provide(sample),
  Effect.provide(DayInput.layer(2025)),
  NodeRuntime.runMain,
)
