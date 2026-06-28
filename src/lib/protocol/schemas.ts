import { z } from "zod";
import { PROTOCOL_ID } from "@/config/constants";

export const inviteSchema = z.object({
  pid: z.literal(PROTOCOL_ID),
  v: z.number().min(1),
  sid: z.string().min(16).max(64),
  createdAt: z.number(),
  expiresAt: z.number(),
  role: z.literal("host"),
  pub: z.string(),
  fp: z.string(),
  sigMode: z.enum(["manual", "optional-server", "none"]),
  sig: z
    .object({
      url: z.string().optional(),
      room: z.string().optional(),
    })
    .optional(),
  features: z.array(z.string()),
}).strict();

export type InvitePayload = z.infer<typeof inviteSchema>;

export const textSchema = z.object({
  id: z.string(),
  type: z.literal("TEXT"),
  v: z.number(),
  ts: z.number(),
  payload: z.object({
    body: z.string().min(1),
    encoding: z.literal("utf-8"),
  }),
});

export const typingSchema = z.object({
  id: z.string(),
  type: z.literal("TYPING"),
  v: z.number(),
  ts: z.number(),
  payload: z.object({
    active: z.boolean(),
    ttlMs: z.number(),
  }),
});

export const ackSchema = z.object({
  id: z.string(),
  type: z.literal("ACK"),
  v: z.number(),
  ts: z.number(),
  payload: z.object({
    packetId: z.string(),
    status: z.enum(["received", "failed"]),
  }),
});

export const pingSchema = z.object({
  id: z.string(),
  type: z.literal("PING"),
  v: z.number(),
  ts: z.number(),
  payload: z.object({
    nonce: z.string(),
    sentAt: z.number(),
  }),
});

export const pongSchema = pingSchema.extend({
  type: z.literal("PONG"),
});

export const joinSchema = z.object({
  id: z.string(),
  type: z.literal("JOIN"),
  v: z.number(),
  ts: z.number(),
  payload: z.object({
    sid: z.string(),
    joinerPub: z.string(),
    joinerNonce: z.string(),
    features: z.array(z.string()),
  }),
});

export const welcomeSchema = z.object({
  id: z.string(),
  type: z.literal("WELCOME"),
  v: z.number(),
  ts: z.number(),
  payload: z.object({
    hostNonce: z.string(),
    transcriptHash: z.string(),
  }),
});

export const leaveSchema = z.object({
  id: z.string(),
  type: z.literal("LEAVE"),
  v: z.number(),
  ts: z.number(),
  payload: z.object({
    reason: z.string(),
  }),
});

export const destroySchema = z.object({
  id: z.string(),
  type: z.literal("DESTROY_SESSION"),
  v: z.number(),
  ts: z.number(),
  payload: z.object({
    reason: z.string(),
    deleteImmediately: z.boolean(),
  }),
});

export const imageMetaSchema = z.object({
  id: z.string(),
  type: z.literal("IMAGE"),
  v: z.number(),
  ts: z.number(),
  payload: z.object({
    transferId: z.string(),
    name: z.string(),
    mime: z.string(),
    size: z.number(),
    sha256: z.string(),
    chunkSize: z.number(),
    chunkCount: z.number(),
    width: z.number().optional(),
    height: z.number().optional(),
  }),
});

export const fileMetaSchema = z.object({
  id: z.string(),
  type: z.literal("FILE"),
  v: z.number(),
  ts: z.number(),
  payload: z.object({
    transferId: z.string(),
    name: z.string(),
    mime: z.string(),
    size: z.number(),
    sha256: z.string(),
    chunkSize: z.number(),
    chunkCount: z.number(),
  }),
});

export const fileChunkSchema = z.object({
  id: z.string(),
  type: z.literal("FILE_CHUNK"),
  v: z.number(),
  ts: z.number(),
  payload: z.object({
    transferId: z.string(),
    index: z.number(),
    bytes: z.string(),
  }),
});
