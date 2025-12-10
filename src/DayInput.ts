import { NodeServices } from "@effect/platform-node"
import {
  Config,
  ConfigProvider,
  Duration,
  Effect,
  flow,
  Layer,
  ServiceMap,
  String,
} from "effect"
import { Redacted } from "effect/data"
import { Schema } from "effect/schema"
import { Stream } from "effect/stream"
import {
  Cookies,
  FetchHttpClient,
  HttpClient,
  HttpClientRequest,
} from "effect/unstable/http"
import {
  KeyValueStore,
  Persistable,
  PersistedCache,
  Persistence,
} from "effect/unstable/persistence"

export class DayInput extends ServiceMap.Service<DayInput>()("DayInput", {
  make: Effect.fnUntraced(function* (year: number) {
    const sessionCookie = yield* Config.redacted("AOC_SESSION_COOKIE")
    const cookies = Cookies.empty.pipe(
      Cookies.setUnsafe("session", Redacted.value(sessionCookie)),
    )

    const httpClient = (yield* HttpClient.HttpClient).pipe(
      HttpClient.mapRequest(
        flow(
          HttpClientRequest.prependUrl(`https://adventofcode.com/${year}/day/`),
          HttpClientRequest.setHeader(
            "cookie",
            Cookies.toCookieHeader(cookies),
          ),
        ),
      ),
      HttpClient.filterStatusOk,
      HttpClient.retryTransient({ times: 3 }),
      HttpClient.transformResponse(Effect.orDie),
    )

    const cache = yield* PersistedCache.make({
      storeId: `aoc-${year}-input`,
      lookup: (key: DayInputKey) =>
        httpClient.get(`${key.day}/input`).pipe(
          Effect.flatMap((r) => r.text),
          Effect.map(String.trim),
          Effect.orDie,
        ),
      timeToLive: (exit) =>
        exit._tag === "Success" ? Duration.infinity : Duration.zero,
    })

    const raw = (day: number) =>
      cache.get(new DayInputKey({ day })).pipe(Effect.orDie)

    const lines = (day: number) =>
      raw(day).pipe(Effect.map((input) => input.split("\n")))

    const stream = (day: number) => Stream.fromArrayEffect(lines(day))

    return { raw, lines, stream } as const
  }),
}) {
  static layer = flow(
    Layer.effect(this, this.make),
    Layer.provide(FetchHttpClient.layer),
    Layer.provide(ConfigProvider.layerAdd(ConfigProvider.fromDotEnv())),
    Layer.provide(
      Persistence.layerKvs.pipe(
        Layer.provide(KeyValueStore.layerFileSystem("./data")),
      ),
    ),
    Layer.provide(NodeServices.layer),
  )

  static layerSample = (text: string) =>
    Layer.succeed(this, {
      raw: () => Effect.succeed(text.trim()),
      lines: () => Effect.succeed(text.trim().split("\n")),
      stream: () => Stream.fromArray(text.trim().split("\n")),
    })
}

class DayInputKey extends Persistable.Class<{
  payload: { day: number }
}>()("DayInputKey", {
  primaryKey: ({ day }) => `${day}`,
  success: Schema.String,
}) {}
