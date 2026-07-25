import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useRealtimeStream } from "./useRealtimeStream";
import * as rng from "@/lib/seeded-rng";

describe("useRealtimeStream", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Mock the RNG so we have deterministic behavior
    vi.spyOn(rng, "random").mockReturnValue(0.5);
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("starts in idle state with empty data", () => {
    const { result } = renderHook(() => useRealtimeStream());
    expect(result.current.status).toBe("idle");
    expect(result.current.events).toEqual([]);
    expect(result.current.delta).toEqual({ totalBalance: 0, totalYield: 0, apy: 0 });
    expect(result.current.latestEvent).toBeNull();
  });

  it("transitions to running and emits events when started", () => {
    const onEvent = vi.fn();
    const { result } = renderHook(() => useRealtimeStream(onEvent));

    act(() => {
      result.current.start();
    });

    expect(result.current.status).toBe("running");

    // Advance time past max interval (9000ms)
    act(() => {
      vi.advanceTimersByTime(10000);
    });

    expect(result.current.events.length).toBeGreaterThan(0);
    expect(result.current.latestEvent).not.toBeNull();
    expect(onEvent).toHaveBeenCalled();
  });

  it("stops emitting events after stop() is called", () => {
    const onEvent = vi.fn();
    const { result } = renderHook(() => useRealtimeStream(onEvent));

    act(() => {
      result.current.start();
    });

    act(() => {
      result.current.stop();
    });

    expect(result.current.status).toBe("stopped");
    const callCountBefore = onEvent.mock.calls.length;

    // Advance time significantly to ensure no more events are emitted
    act(() => {
      vi.advanceTimersByTime(50000);
    });

    expect(onEvent.mock.calls.length).toBe(callCountBefore);
  });

  it("resets state and stops emitting events after reset() is called", () => {
    const onEvent = vi.fn();
    const { result } = renderHook(() => useRealtimeStream(onEvent));

    act(() => {
      result.current.start();
    });

    // Advance time to get some events
    act(() => {
      vi.advanceTimersByTime(10000);
    });

    expect(result.current.events.length).toBeGreaterThan(0);

    act(() => {
      result.current.reset();
    });

    expect(result.current.status).toBe("idle");
    expect(result.current.events.length).toBe(0);
    expect(result.current.latestEvent).toBeNull();
    expect(result.current.delta).toEqual({ totalBalance: 0, totalYield: 0, apy: 0 });

    const callCountBefore = onEvent.mock.calls.length;

    // Advance time significantly to ensure no more events are emitted
    act(() => {
      vi.advanceTimersByTime(50000);
    });

    expect(onEvent.mock.calls.length).toBe(callCountBefore);
  });

  it("caps the event log at 50 entries", () => {
    const { result } = renderHook(() => useRealtimeStream());

    act(() => {
      result.current.start();
    });

    // Advance time enough to generate > 50 events
    // Max interval is 9000, so 60 events * 9000 = 540000
    act(() => {
      vi.advanceTimersByTime(600000);
    });

    expect(result.current.events.length).toBe(50);
  });
});
