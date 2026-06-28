import type { TransportHandle, RtcConfig } from "@/types/transport";
import { RTC_CONFIG } from "@/config/constants";

export function createPeerConnection(config?: RtcConfig): RTCPeerConnection {
  return new RTCPeerConnection(config ?? { iceServers: RTC_CONFIG.iceServers ?? [] });
}

export function createDataChannel(
  pc: RTCPeerConnection,
  label: string = "ep2p-control",
  options: RTCDataChannelInit = { ordered: true }
): RTCDataChannel {
  return pc.createDataChannel(label, options);
}

export function setupOnDataChannel(
  pc: RTCPeerConnection,
  handler: (channel: RTCDataChannel) => void
) {
  pc.ondatachannel = (event) => {
    handler(event.channel);
  };
}

export async function createOffer(
  pc: RTCPeerConnection
): Promise<RTCSessionDescriptionInit> {
  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);
  return offer;
}

export async function createAnswer(
  pc: RTCPeerConnection
): Promise<RTCSessionDescriptionInit> {
  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);
  return answer;
}

export async function setRemoteDescription(
  pc: RTCPeerConnection,
  desc: RTCSessionDescriptionInit
): Promise<void> {
  await pc.setRemoteDescription(new RTCSessionDescription(desc));
}

export async function addIceCandidate(
  pc: RTCPeerConnection,
  candidate: RTCIceCandidateInit
): Promise<void> {
  await pc.addIceCandidate(new RTCIceCandidate(candidate));
}

export function toTransportHandle(
  pc: RTCPeerConnection,
  dc: RTCDataChannel
): TransportHandle {
  return {
    pc,
    dataChannel: dc,
    close: () => {
      dc.close();
      pc.close();
    },
  };
}
