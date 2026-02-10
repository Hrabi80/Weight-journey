import type {
  DashboardSession,
  DashboardSessionRepository,
  LogWellnessInput,
} from "@/src/application/ports/dashboard-session.repository";
import type { Profile, WeightEntry } from "@/lib/types";
import type { WellnessEntry } from "@/src/domaine/entities/wellness-entry.entity";

type ApiMeResponse = {
  profile?: {
    email: string;
    age: number;
    height: number;
    initialWeight?: number;
    initial_weight?: number;
  } | null;
  entries?: WeightEntry[];
  wellnessEntries?: WellnessEntry[];
};

type ApiWeightResponse = { entry: WeightEntry };
type ApiWellnessResponse = { entry: WellnessEntry };

export class BackendDashboardSessionRepository implements DashboardSessionRepository {
  public async load(): Promise<DashboardSession | null> {
    const response = await fetch("/api/me", { cache: "no-store" });

    if (response.status === 401) {
      return null;
    }

    if (!response.ok) {
      const message = await this.read_error_message(
        response,
        "Could not load dashboard data."
      );
      throw new Error(message);
    }

    const payload = (await response.json()) as ApiMeResponse;
    const profile = this.map_profile(payload.profile);

    if (!profile) {
      return null;
    }

    return {
      profile,
      entries: payload.entries ?? [],
      wellnessEntries: payload.wellnessEntries ?? [],
    };
  }

  public async log_weight(weight: number, date: string): Promise<WeightEntry> {
    const response = await fetch("/api/weight", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ weight, date }),
    });

    if (!response.ok) {
      const message = await this.read_error_message(
        response,
        "Could not save weight."
      );
      throw new Error(message);
    }

    const payload = (await response.json()) as ApiWeightResponse;
    return payload.entry;
  }

  public async log_wellness(input: LogWellnessInput): Promise<WellnessEntry> {
    const response = await fetch("/api/wellness", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      const message = await this.read_error_message(
        response,
        "Could not log wellness metric."
      );
      throw new Error(message);
    }

    const payload = (await response.json()) as ApiWellnessResponse;
    return payload.entry;
  }

  private map_profile(
    payload: ApiMeResponse["profile"]
  ): Profile | null {
    if (!payload) {
      return null;
    }

    const initial_weight =
      typeof payload.initialWeight === "number"
        ? payload.initialWeight
        : payload.initial_weight;

    if (
      typeof payload.email !== "string" ||
      typeof payload.age !== "number" ||
      typeof payload.height !== "number" ||
      typeof initial_weight !== "number"
    ) {
      return null;
    }

    return {
      email: payload.email,
      age: payload.age,
      height: payload.height,
      initialWeight: initial_weight,
    };
  }

  private async read_error_message(
    response: Response,
    fallback: string
  ): Promise<string> {
    const payload = await response.json().catch(() => null);

    if (
      payload &&
      typeof payload === "object" &&
      "error" in payload &&
      typeof payload.error === "string"
    ) {
      return payload.error;
    }

    return fallback;
  }
}
