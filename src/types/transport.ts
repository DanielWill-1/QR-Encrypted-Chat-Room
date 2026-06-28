export interface RtcConfig {
  iceServers: RTCIceServer[];
}

export interface TransportHandle {
  pc: RTCPeerConnection;
  dataChannel: RTCDataChannel;
  close: () => void;
}

export type SignalingMessage =
  | { type: "offer"; room: string; from: string; payload: RTCSessionDescriptionInit }
  | { type: "answer"; room: string; from: string; payload: RTCSessionDescriptionInit }
  | { type: "ice-candidate"; room: string; from: string; payload: RTCIceCandidateInit }
  | { type: "join"; room: string }
  | { type: "leave"; room: string };
