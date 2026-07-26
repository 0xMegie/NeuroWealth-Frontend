import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { renderHook, act } from "@/test-utils/render-hook";
import { useSettingsForm } from "./useSettingsForm";

interface Draft {
  enabled: boolean;
}

function flush(ms = 0) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

describe("useSettingsForm", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("loads defaults when storage is empty, then clears pageLoading", async () => {
    const { result } = renderHook(() =>
      useSettingsForm<Draft>("test-key", { enabled: false }, { auditSection: "test" }),
    );

    assert.equal(result.current.pageLoading, true);

    await act(async () => {
      await flush(650);
    });

    assert.equal(result.current.pageLoading, false);
    assert.deepEqual(result.current.saved, { enabled: false });
  });

  it("hydrates saved/draft from localStorage", async () => {
    localStorage.setItem("test-key", JSON.stringify({ enabled: true }));

    const { result } = renderHook(() =>
      useSettingsForm<Draft>("test-key", { enabled: false }, { auditSection: "test" }),
    );

    await act(async () => {
      await flush(650);
    });

    assert.deepEqual(result.current.saved, { enabled: true });
    assert.deepEqual(result.current.draft, { enabled: true });
  });

  it("tracks isDirty and persists on handleSave", async () => {
    const { result } = renderHook(() =>
      useSettingsForm<Draft>("test-key", { enabled: false }, { auditSection: "test", saveDelayMs: 0 }),
    );

    await act(async () => {
      await flush(650);
    });

    act(() => {
      result.current.setDraft({ enabled: true });
    });
    assert.equal(result.current.isDirty, true);

    await act(async () => {
      await result.current.handleSave();
    });

    assert.equal(result.current.isDirty, false);
    assert.equal(result.current.status, "success");
    assert.deepEqual(JSON.parse(localStorage.getItem("test-key")!), { enabled: true });
  });

  it("handleCancel reverts draft to saved", async () => {
    const { result } = renderHook(() =>
      useSettingsForm<Draft>("test-key", { enabled: false }, { auditSection: "test" }),
    );

    await act(async () => {
      await flush(650);
    });

    act(() => {
      result.current.setDraft({ enabled: true });
      result.current.setEditing(true);
    });

    act(() => {
      result.current.handleCancel();
    });

    assert.deepEqual(result.current.draft, { enabled: false });
    assert.equal(result.current.editing, false);
  });

  it("aborts the save and sets error status when validate throws", async () => {
    const { result } = renderHook(() =>
      useSettingsForm<Draft>("test-key", { enabled: false }, {
        auditSection: "test",
        saveDelayMs: 0,
        validate: () => {
          throw new Error("blocked");
        },
      }),
    );

    await act(async () => {
      await flush(650);
    });

    act(() => {
      result.current.setDraft({ enabled: true });
    });

    await act(async () => {
      await result.current.handleSave();
    });

    assert.equal(result.current.status, "error");
    assert.equal(localStorage.getItem("test-key"), null);
  });
});
