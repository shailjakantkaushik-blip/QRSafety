import crypto from "crypto";

export function makePublicId() {
  return crypto.randomBytes(16).toString("hex"); // 32 chars
}
