import 'server-only';

/** Error whose message is safe to show to users; `status` is the HTTP status the API should return. */
export class AiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

/** Provider-neutral request. `schema` is standard JSON Schema; providers translate it as needed. */
export interface AiRequest {
  prompt: string;
  image?: { mimeType: string; base64: string };
  schema: Record<string, unknown>;
  /** Compact description of the expected JSON, used in the prompt for models that ignore `schema` enforcement. */
  outputHint?: string;
}
