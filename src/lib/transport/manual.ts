export function encodeSdp(type: "offer" | "answer", desc: RTCSessionDescriptionInit): string {
  const payload = JSON.stringify({ type: desc.type, sdp: desc.sdp });
  return btoa(payload).replace(/\+/g, "-").replace(/\//g, "_");
}

export function decodeSdp(encoded: string): RTCSessionDescriptionInit | null {
  try {
    const base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(base64);
    const obj = JSON.parse(json) as { type: RTCSdpType; sdp: string };
    if (!obj.sdp || !obj.type) return null;
    return { type: obj.type, sdp: obj.sdp };
  } catch {
    return null;
  }
}

export function encodeIceCandidate(candidate: RTCIceCandidateInit): string {
  const payload = JSON.stringify(candidate);
  return btoa(payload).replace(/\+/g, "-").replace(/\//g, "_");
}

export function decodeIceCandidate(encoded: string): RTCIceCandidateInit | null {
  try {
    const base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(base64);
    return JSON.parse(json) as RTCIceCandidateInit;
  } catch {
    return null;
  }
}
