import { useEffect, useRef } from "react";

type CallBackType = () => void;

export function useTimer(callback: CallBackType, sleepTime: number) {
  const callbackRef = useRef<CallBackType | null>(null);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (callbackRef.current) {
      const sleeper = setInterval(callbackRef.current, sleepTime);
      return () => clearInterval(sleeper);
    }
  }, [callback, sleepTime]);
}
