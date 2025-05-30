"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";

export default function RemotePcStream() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const pcRef = useRef<RTCPeerConnection | null>(null);
    const iceBufferRef = useRef<RTCIceCandidateInit[]>([]);
    const wsRef = useRef<WebSocket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [connectionState, setConnectionState] = useState<string>("new");

    const userId = "viewer";
    const channelName = "test";

    useEffect(() => {
        if (!isConnected) return;

        const log = (...args: any[]) => console.log("[VIEWER]", ...args);

        const ws = new WebSocket("ws://localhost:8090");
        wsRef.current = ws;

        let pc: RTCPeerConnection;

        ws.onopen = () => {
            log("WebSocket connected, joining channel...");
            ws.send(JSON.stringify({ type: "join", body: { channelName, userId } }));
        };

        ws.onmessage = async (msg) => {
            const { type, body } = JSON.parse(msg.data);
            log("Received message:", type);

            if (type === "joined") {
                log("Joined channel, creating peer connection...");
                
                // Create RTCPeerConnection with proper configuration
                pc = new RTCPeerConnection({
                    iceServers: [
                        { urls: "stun:stun.l.google.com:19302" },
                        { urls: "stun:stun1.l.google.com:19302" }
                    ]
                });
                pcRef.current = pc;

                // Handle ICE candidates
                pc.onicecandidate = (event) => {
                    if (event.candidate) {
                        log("Sending ICE candidate:", event.candidate);
                        ws.send(
                            JSON.stringify({
                                type: "send_ice_candidate",
                                body: { channelName, userId, candidate: event.candidate },
                            })
                        );
                    } else {
                        log("ICE gathering complete");
                    }
                };

                // Handle incoming media tracks
                pc.ontrack = (event) => {
                    log("Received remote track:", event.track.kind);
                    const stream = event.streams[0];
                    if (stream) {
                        setRemoteStream(stream);
                        log("Remote stream set");
                    }
                };

                // Monitor connection state
                pc.onconnectionstatechange = () => {
                    log("Connection state changed:", pc.connectionState);
                    setConnectionState(pc.connectionState);
                };

                pc.oniceconnectionstatechange = () => {
                    log("ICE connection state:", pc.iceConnectionState);
                };

                // Create and send offer
                try {
                    const offer = await pc.createOffer({
                        offerToReceiveAudio: true,
                        offerToReceiveVideo: true
                    });
                    await pc.setLocalDescription(offer);
                    
                    ws.send(
                        JSON.stringify({
                            type: "send_offer",
                            body: { channelName, userId, sdp: offer },
                        })
                    );
                    log("Offer created and sent");
                } catch (err) {
                    log("Error creating offer:", err);
                }
            }

            if (type === "answer_sdp_recieved") {
                if (!pc) {
                    log("Error: No peer connection available");
                    return;
                }

                try {
                    const answer = new RTCSessionDescription(body);
                    await pc.setRemoteDescription(answer);
                    log("Answer set as remote description");

                    // Process buffered ICE candidates
                    for (const candidate of iceBufferRef.current) {
                        try {
                            await pc.addIceCandidate(new RTCIceCandidate(candidate));
                            log("Added buffered ICE candidate");
                        } catch (err) {
                            log("Error adding buffered ICE candidate:", err);
                        }
                    }
                    iceBufferRef.current = [];
                } catch (err) {
                    log("Error setting remote description:", err);
                }
            }

            if (type === "ice_candidate_recieved") {
                if (!pc) {
                    log("Error: No peer connection for ICE candidate");
                    return;
                }

                const candidate = new RTCIceCandidate(body);
                
                if (pc.remoteDescription && pc.remoteDescription.type) {
                    try {
                        await pc.addIceCandidate(candidate);
                        log("ICE candidate added successfully");
                    } catch (err) {
                        log("Error adding ICE candidate:", err);
                    }
                } else {
                    log("Buffering ICE candidate (no remote description yet)");
                    iceBufferRef.current.push(body);
                }
            }
        };

        ws.onerror = (err) => {
            log("WebSocket error:", err);
        };

        ws.onclose = (event) => {
            log("WebSocket closed:", event.code, event.reason);
        };

        return () => {
            log("Cleaning up connections...");
            if (pcRef.current) {
                pcRef.current.close();
                pcRef.current = null;
            }
            if (wsRef.current) {
                wsRef.current.close();
                wsRef.current = null;
            }
            setRemoteStream(null);
            setConnectionState("closed");
            iceBufferRef.current = [];
        };
    }, [isConnected]);

    // Set video source when remote stream is available
    useEffect(() => {
        if (remoteStream && videoRef.current) {
            videoRef.current.srcObject = remoteStream;
            console.log("[VIEWER] Video element srcObject set");
        } else if (videoRef.current && !remoteStream) {
            videoRef.current.srcObject = null;
        }
    }, [remoteStream]);

    const handleConnect = () => {
        if (isConnected) {
            // Disconnect
            if (pcRef.current) {
                pcRef.current.close();
            }
            if (wsRef.current) {
                wsRef.current.close();
            }
            setRemoteStream(null);
            setConnectionState("closed");
        }
        setIsConnected(!isConnected);
    };

    return (
        <div className="w-full space-y-3 mt-4">
            <div className="flex gap-2">
                <Badge className={isConnected ? "bg-green-200 text-green-700" : "bg-red-200 text-red-600"}>
                    {isConnected ? "Connected" : "Disconnected"}
                </Badge>
                <Badge className="bg-blue-200 text-blue-700">
                    WebRTC: {connectionState}
                </Badge>
                <Badge className={remoteStream ? "bg-green-200 text-green-700" : "bg-gray-200 text-gray-600"}>
                    Stream: {remoteStream ? "Active" : "None"}
                </Badge>
            </div>
            
            <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted={false}
                controls
                className="w-full border rounded-md bg-black"
                style={{ minHeight: "300px" }}
            />
            
            <div className="flex justify-center gap-3 mt-3">
                <Button 
                    onClick={handleConnect} 
                    className={isConnected ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}
                >
                    {isConnected ? "Disconnect" : "Connect to Stream"}
                </Button>
                <Button disabled className="bg-gray-400">
                    Take Over PC
                </Button>
            </div>
        </div>
    );
}