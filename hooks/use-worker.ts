import { useState, useEffect, useRef, useCallback } from "react";

type WorkerStatus = "idle" | "running" | "success" | "error";

interface WorkerOptions<T, R> {
  fn: (data: T) => R;
  onSuccess?: (result: R) => void;
  onError?: (error: Error) => void;
}

/**
 * A hook to run heavy computations in a Web Worker without blocking the UI.
 * It serializes the function and runs it in a blob worker.
 */
export function useWorker<T, R>(options: WorkerOptions<T, R>) {
  const [status, setStatus] = useState<WorkerStatus>("idle");
  const [result, setResult] = useState<R | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const optionsRef = useRef(options);

  useEffect(() => {
    optionsRef.current = options;
  });

  useEffect(() => {
    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  const run = useCallback((data: T) => {
    setStatus("running");
    setError(null);

    if (workerRef.current) {
      workerRef.current.terminate();
    }

    const { fn } = optionsRef.current;

    // Create a blob worker from the function code
    const code = `
      self.onmessage = function(e) {
        try {
          const fn = ${fn.toString()};
          const result = fn(e.data);
          self.postMessage({ type: 'success', result });
        } catch (err) {
          self.postMessage({ type: 'error', error: err.message });
        }
      };
    `;

    const blob = new Blob([code], { type: "application/javascript" });
    workerRef.current = new Worker(URL.createObjectURL(blob));

    workerRef.current.onmessage = (e) => {
      if (e.data.type === "success") {
        setResult(e.data.result);
        setStatus("success");
        optionsRef.current.onSuccess?.(e.data.result);
      } else {
        const err = new Error(e.data.error);
        setError(err);
        setStatus("error");
        optionsRef.current.onError?.(err);
      }
      workerRef.current?.terminate();
      workerRef.current = null;
    };

    workerRef.current.onerror = (e) => {
      const err = new Error(e.message);
      setError(err);
      setStatus("error");
      optionsRef.current.onError?.(err);
      workerRef.current?.terminate();
      workerRef.current = null;
    };

    workerRef.current.postMessage(data);
  }, []);

  return { run, status, result, error };
}
