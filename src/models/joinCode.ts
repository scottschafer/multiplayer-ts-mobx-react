import { MakeOptional } from "../utils/changeProperties";

export class JoinCode {
  readonly key: string;
  readonly code: string;
  readonly roomKey: string;
  readonly owner: string;

  constructor(src?: MakeOptional<JoinCode>) {
    if (src) {
      Object.assign(this, src);
    }
  }
}