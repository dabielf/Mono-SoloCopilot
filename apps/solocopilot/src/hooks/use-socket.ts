import { useEffect, useRef, useState } from "react";

export const useGwSocket = (email: string) => {
    const [response, setResponse] = useState<string | null>(null);
    const wsRef = useRef<WebSocket | null>(null);
    useEffect(() => {
        if (!email) return;
        const ws = new WebSocket(`${process.env.NEXT_PUBLIC_API_URL}/ws/${email}`);
        wsRef.current = ws;
        ws.onmessage = (event) => {
            setResponse(event.data);
        };
        console.log("WebSocket connected");
        return () => {
            ws.close();
        };
    }, [email]);

    const onMessage = (callback: (message: string) => void) => {
        if (!wsRef.current) return;
        wsRef.current.onmessage = (event) => {
            callback(event.data);
        };
    };

    const sendMessage = (message: string) => {
        if (!wsRef.current) return;
        wsRef.current.send(message);
    };

    const clearResponse = () => {
        setResponse(null);
    };

    return { response, sendMessage, clearResponse, onMessage };
}