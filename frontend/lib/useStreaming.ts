'use client';

import { useState, useCallback, useRef } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export type StreamStatus = 'idle' | 'streaming' | 'complete' | 'error';

export interface StreamResult {
  generationId: string;
  title: string;
  tokensUsed: number;
  durationMs: number;
  remainingGenerations: number | null;
}

interface UseStreamingReturn {
  streamedCode: string;
  status: StreamStatus;
  error: string | null;
  result: StreamResult | null;
  startStream: (prompt: string, codeType: string, token: string) => void;
  reset: () => void;
}

export function useStreaming(): UseStreamingReturn {
  const [streamedCode, setStreamedCode] = useState('');
  const [status, setStatus] = useState<StreamStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<StreamResult | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setStreamedCode('');
    setStatus('idle');
    setError(null);
    setResult(null);
  }, []);

  const startStream = useCallback(
    async (prompt: string, codeType: string, token: string) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setStreamedCode('');
      setStatus('streaming');
      setError(null);
      setResult(null);

      try {
        const res = await fetch(`${API_URL}/api/generate/stream`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ prompt, codeType }),
          signal: controller.signal,
        });

        if (!res.ok) {
          const data = await res.json();
          throw Object.assign(new Error(data.error || 'Generation failed'), {
            code: data.code,
            data,
          });
        }

        if (!res.body) throw new Error('No response body');

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));

                if (line.startsWith('event: token') || data.token !== undefined) {
                  setStreamedCode((prev) => prev + (data.token || ''));
                } else if (data.generationId) {
                  // complete event
                  setResult(data as StreamResult);
                  setStatus('complete');
                } else if (data.message && !data.token && !data.generationId) {
                  // error event or start event — ignore start
                  if (data.message !== 'Generating...') {
                    throw new Error(data.message);
                  }
                }
              } catch (parseErr) {
                // Skip malformed lines
              }
            } else if (line.startsWith('event: ')) {
              // Track event types for next data line
            }
          }
        }
      } catch (err: unknown) {
        if ((err as Error).name === 'AbortError') return;
        const message = err instanceof Error ? err.message : 'Stream failed';
        setError(message);
        setStatus('error');
      }
    },
    []
  );

  return { streamedCode, status, error, result, startStream, reset };
}
