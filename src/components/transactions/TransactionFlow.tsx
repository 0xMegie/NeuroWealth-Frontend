"use client";

import { startTransition, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "./transaction-flow.module.css";
import { formatCurrency } from "@/lib/formatters";
import {
  buildPreviewSnapshot,
  buildStatusChips,
  buildTransactionReceipt,
  getTransactionContext,
  parsePreviewState,
  parseTransactionKind,
  PendingTransaction,
  TransactionKind,
  TransactionPreviewState,
  TransactionQuote,
  TransactionReceipt,
  type RecoveryAction,
} from "@/lib/transactions";
import { useSandbox } from "@/contexts/SandboxContext";
import { TransactionErrorRecovery } from "./TransactionErrorRecovery";
import { TransactionFormStage } from "./stages/TransactionFormStage";
import { TransactionConfirmStage } from "./stages/TransactionConfirmStage";
import { TransactionPendingStage } from "./stages/TransactionPendingStage";
import { TransactionReceiptStage } from "./stages/TransactionReceiptStage";
import { useTransactionForm } from "./hooks/useTransactionForm";
import { useTransactionAPI } from "./hooks/useTransactionAPI";
import {
  currentStepIndex,
  getTheme,
} from "./utils/transaction-utils";
import { getToneClassName } from "./utils/transaction-style-utils";

type ThemeMode = "light" | "dark";

export function TransactionFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { getCurrentScenario, isSandboxMode } = useSandbox();
  const timeoutRef = useRef<number | null>(null);

  const [theme, setTheme] = useState<ThemeMode>(() => getTheme(searchParams));
  const [kind, setKind] = useState<TransactionKind>(() =>
    parseTransactionKind(searchParams.get("kind")),
  );
  const [preview, setPreview] = useState<TransactionPreviewState>(() =>
    parsePreviewState(searchParams.get("preview")),
  );
  const [stage, setStage] = useState<
    "form" | "confirm" | "pending" | "success" | "failure" | "error"
  >("form");
  const [quote, setQuote] = useState<TransactionQuote | null>(null);
  const [pending, setPending] = useState<PendingTransaction | null>(null);
  const [receipt, setReceipt] = useState<TransactionReceipt | null>(null);
  const [requestMessage, setRequestMessage] = useState<string | null>(null);
  const [lastFailedAction, setLastFailedAction] = useState<
    "review" | "confirm" | null
  >(null);

  const {
    formValues,
    fieldErrors,
    updateField,
    validate,
    reset: resetForm,
    setErrors,
    setValues,
  } = useTransactionForm(kind);

  const {
    isSubmitting,
    recovery,
    lastErrorReference,
    requestQuote,
    submitTransaction,
    clearRecovery,
    setSubmitting,
    cancelRequest,
    reset: resetApi,
  } = useTransactionAPI();

  const context = getTransactionContext(kind);
  const statusChips = buildStatusChips(kind, formValues);
  const scenario = getCurrentScenario("transactions");

  useEffect(() => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    cancelRequest();

    if (preview === "interactive") {
      setStage("form");
      resetForm();
      setQuote(null);
      setPending(null);
      setReceipt(null);
      setRequestMessage(null);
      resetApi();
      setLastFailedAction(null);
      return;
    }

    const snapshot = buildPreviewSnapshot(kind, preview);

    setStage(snapshot.stage);
    setValues(snapshot.form);
    setErrors(snapshot.fieldErrors);
    setQuote(snapshot.quote);
    setPending(snapshot.pending);
    setReceipt(snapshot.receipt);
    setRequestMessage(null);
    resetApi();
    setLastFailedAction(null);
  }, [
    kind,
    preview,
    cancelRequest,
    resetForm,
    resetApi,
    setValues,
    setErrors,
  ]);

  // Handle sandbox scenarios
  useEffect(() => {
    if (isSandboxMode && scenario !== "success") {
      if (scenario === "loading") {
        setSubmitting(true);
        setRequestMessage("Loading transaction data...");
        const timer = setTimeout(() => {
          setSubmitting(false);
          setRequestMessage(null);
        }, 3000);
        return () => clearTimeout(timer);
      } else if (scenario === "timeout") {
        setSubmitting(true);
        setRequestMessage("Request timed out. Please try again.");
        const timer = setTimeout(() => {
          setSubmitting(false);
          setRequestMessage(
            "Connection timeout. Please check your network and retry.",
          );
        }, 5000);
        return () => clearTimeout(timer);
      } else if (scenario === "partial-failure") {
        setRequestMessage(
          "Partial service degradation. Some features may be unavailable.",
        );
        setStage("form");
      } else if (scenario === "empty") {
        setStage("form");
        resetForm();
        setQuote(null);
        setPending(null);
        setReceipt(null);
        setRequestMessage("No transaction data available.");
      }
    }
  }, [scenario, isSandboxMode, kind, setSubmitting, resetForm]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      // Abort any in-flight request on unmount to prevent state updates on an
      // unmounted component and to avoid leaking the pending completion timer.
      cancelRequest();
    };
  }, [cancelRequest]);

  function syncRoute(
    nextTheme: ThemeMode,
    nextKind: TransactionKind,
    nextPreview: TransactionPreviewState,
  ) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("theme", nextTheme);
    params.set("kind", nextKind);

    if (nextPreview === "interactive") {
      params.delete("preview");
    } else {
      params.set("preview", nextPreview);
    }

    startTransition(() => {
      router.replace(`/dashboard/transactions?${params.toString()}`, {
        scroll: false,
      });
    });
  }

  function handleThemeChange(nextTheme: ThemeMode) {
    setTheme(nextTheme);
    syncRoute(nextTheme, kind, preview);
  }

  function handleKindChange(nextKind: TransactionKind) {
    setKind(nextKind);
    syncRoute(theme, nextKind, preview);
  }

  function handlePreviewChange(nextPreview: TransactionPreviewState) {
    setPreview(nextPreview);
    syncRoute(theme, kind, nextPreview);
  }

  function handleMaxAmount() {
    updateField("amount", context.availableAmount.toFixed(2));
  }

  async function submitReview() {
    if (preview !== "interactive") {
      return;
    }

    if (!validate()) {
      return;
    }

    setRequestMessage(null);
    clearRecovery();
    setLastFailedAction(null);

    const result = await requestQuote(kind, formValues, quote?.reference);

    if (result.status === "aborted") {
      return;
    }

    if (result.status === "success") {
      setErrors({});
      setQuote(result.quote);
      setStage("confirm");
      setLastFailedAction(null);
      return;
    }

    setLastFailedAction("review");
    setErrors(result.fieldErrors);
    setStage("error");
  }

  async function handleReview(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await submitReview();
  }

  async function handleConfirm() {
    if (preview !== "interactive") {
      return;
    }

    setRequestMessage(null);
    clearRecovery();
    setLastFailedAction(null);

    const result = await submitTransaction(kind, formValues, quote?.reference);

    if (result.status === "aborted") {
      return;
    }

    if (result.status === "success") {
      setPending(result.pending);
      setQuote(result.pending.quote);
      setStage("pending");
      setLastFailedAction(null);

      timeoutRef.current = window.setTimeout(() => {
        const nextReceipt = buildTransactionReceipt(
          result.pending,
          result.pending.nextStatus === "failure" ? "failure" : "success",
        );

        setReceipt(nextReceipt);
        setStage(nextReceipt.status);
        setSubmitting(false);
      }, result.pending.completionDelayMs);
      return;
    }

    setLastFailedAction("confirm");
    setErrors(result.fieldErrors);
    setStage("error");
  }

  function resetFlow() {
    handlePreviewChange("interactive");
  }

  /**
   * Handles recovery actions from the error recovery UI.
   * Maps user choices to product actions: retry (submitAgain), edit (backToForm), or support (open email).
   */
  function handleRecoveryAction(action: RecoveryAction) {
    switch (action) {
      case "retry": {
        // Clear error state and retry the failed operation with the saved values.
        clearRecovery();
        setRequestMessage("Retrying request...");
        if (lastFailedAction === "confirm" && quote) {
          void handleConfirm();
        } else {
          void submitReview();
        }
        break;
      }
      case "edit": {
        // Return to form so user can review and edit amount or wallet details
        setStage("form");
        clearRecovery();
        setSubmitting(false);
        setLastFailedAction(null);
        break;
      }
      case "support": {
        // Open email client to contact support with transaction reference
        const email = recovery?.supportEmail || "support@neurowealth.com";
        const subject = encodeURIComponent(
          `Transaction issue - Reference: ${lastErrorReference || "unknown"}`,
        );
        const body = encodeURIComponent(
          `Describe your issue here.\n\nTransaction Reference: ${lastErrorReference || "N/A"}\nTransaction Type: ${kind}\n`,
        );
        window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
        break;
      }
    }
  }

  return (
    <div className={styles.page}>
      <section className={styles.shell} data-theme={theme}>
        <div className={styles.content}>
          <div className={styles.topbar}>
            <div>
              <span className={styles.eyebrow}>
                <span className={styles.eyebrowDot} />
                Transaction flows
              </span>
              <h2 className={styles.heading}>Deposit and withdrawal flow</h2>
              <p className={styles.intro}>
                Validate amounts and wallet conditions, confirm fees and request
                references, then review pending, success, and failure states
                from one mobile-friendly surface.
              </p>
              {isSandboxMode && (
                <div className="mt-2">
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                    Sandbox: {scenario}
                  </span>
                </div>
              )}
            </div>

            <div className={styles.topControls}>
              <div className={styles.controlPanel}>
                <p className={styles.controlLabel}>Theme preview</p>
                <div className={styles.segmentRow}>
                  {(["light", "dark"] as const).map((option) => (
                    <button
                      className={[
                        styles.segmentButton,
                        theme === option ? styles.segmentButtonActive : "",
                      ].join(" ")}
                      key={option}
                      onClick={() => handleThemeChange(option)}
                      type="button"
                    >
                      {option === "light" ? "Light mode" : "Dark mode"}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.controlPanel}>
                <p className={styles.controlLabel}>Screenshot states</p>
                <div className={styles.segmentRow}>
                  {(
                    [
                      "interactive",
                      "validation",
                      "confirm",
                      "pending",
                      "success",
                      "failure",
                    ] as const
                  ).map((option) => (
                    <button
                      className={[
                        styles.segmentButton,
                        preview === option ? styles.segmentButtonActive : "",
                      ].join(" ")}
                      key={option}
                      onClick={() => handlePreviewChange(option)}
                      type="button"
                    >
                      {option === "interactive" ? "Live flow" : option}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className={styles.grid}>
            <section className={`${styles.card} ${styles.mainCard}`}>
              <div className={styles.kindTabs}>
                {(["deposit", "withdrawal"] as const).map((option) => (
                  <button
                    className={[
                      styles.kindButton,
                      kind === option ? styles.kindButtonActive : "",
                    ].join(" ")}
                    key={option}
                    onClick={() => handleKindChange(option)}
                    type="button"
                  >
                    {option === "deposit" ? "Deposit" : "Withdraw"}
                  </button>
                ))}
              </div>

              <div className={styles.sectionHeading}>
                <h2 className={styles.sectionTitle}>{context.title}</h2>
                <p className={styles.sectionCopy}>{context.intro}</p>
              </div>

              <div className={styles.statusRow}>
                {statusChips.map((chip) => (
                  <span
                    className={`${styles.statusChip} ${getToneClassName(chip.tone)}`}
                    key={chip.label}
                  >
                    {chip.label}
                  </span>
                ))}
              </div>

              <div className={styles.stepper}>
                {[
                  { label: "Step 1", value: "Enter details" },
                  { label: "Step 2", value: "Confirm" },
                  { label: "Step 3", value: "Track result" },
                ].map((step, index) => (
                  <div
                    className={[
                      styles.step,
                      currentStepIndex(stage) === index ? styles.stepActive : "",
                    ].join(" ")}
                    key={step.label}
                  >
                    <p className={styles.stepLabel}>{step.label}</p>
                    <p className={styles.stepValue}>{step.value}</p>
                  </div>
                ))}
              </div>

              {stage === "form" ? (
                <TransactionFormStage
                  kind={kind}
                  formValues={formValues}
                  fieldErrors={fieldErrors}
                  isSubmitting={isSubmitting}
                  requestMessage={requestMessage}
                  onFieldChange={updateField}
                  onMaxAmount={handleMaxAmount}
                  onSubmit={handleReview}
                />
              ) : null}

              {stage === "confirm" && quote ? (
                <TransactionConfirmStage
                  kind={kind}
                  quote={quote}
                  isSubmitting={isSubmitting}
                  onBack={() => setStage("form")}
                  onConfirm={handleConfirm}
                />
              ) : null}

              {stage === "pending" && pending ? (
                <TransactionPendingStage pending={pending} />
              ) : null}

              {stage === "error" && recovery ? (
                <TransactionErrorRecovery
                  recovery={recovery}
                  onActionSelect={handleRecoveryAction}
                  isLoading={isSubmitting}
                />
              ) : null}

              {(stage === "success" || stage === "failure") && receipt ? (
                <TransactionReceiptStage
                  kind={kind}
                  receipt={receipt}
                  onNewTransaction={resetFlow}
                  onSwitchFlow={() =>
                    handleKindChange(
                      kind === "deposit" ? "withdrawal" : "deposit",
                    )
                  }
                />
              ) : null}
            </section>

            <aside className={`${styles.card} ${styles.asideCard}`}>
              <div className={styles.asideSection}>
                <h3 className={styles.asideTitle}>Wallet conditions</h3>
                <div className={styles.asideList}>
                  <div className={styles.asideItem}>
                    <span className={styles.asideLabel}>Connected wallet</span>
                    <span className={styles.asideValue}>
                      {context.connectedWalletLabel}
                    </span>
                    <span
                      className={`${styles.asideValue} ${styles.asideValueMono}`}
                    >
                      {context.connectedWalletAddress}
                    </span>
                  </div>
                  <div className={styles.asideItem}>
                    <span className={styles.asideLabel}>Available balance</span>
                    <span
                      className={`${styles.asideValue} ${styles.asideValueMono}`}
                    >
                      {formatCurrency(context.availableAmount)}
                    </span>
                  </div>
                  <div className={styles.asideItem}>
                    <span className={styles.asideLabel}>Strategy</span>
                    <span className={styles.asideValue}>
                      {context.strategyLabel}
                    </span>
                  </div>
                </div>
              </div>

              <div className={styles.asideSection}>
                <h3 className={styles.asideTitle}>Validation rules</h3>
                <div className={styles.asideList}>
                  <div className={styles.asideItem}>
                    <span className={styles.asideLabel}>Minimum</span>
                    <span className={styles.asideValue}>
                      {formatCurrency(context.minAmount)}
                    </span>
                  </div>
                  <div className={styles.asideItem}>
                    <span className={styles.asideLabel}>Fees</span>
                    <span className={styles.asideValue}>
                      {formatCurrency(context.fee)}
                    </span>
                  </div>
                  <div className={styles.asideItem}>
                    <span className={styles.asideLabel}>Lifecycle</span>
                    <span className={styles.asideValue}>
                      Pending, success, and failure states included
                    </span>
                  </div>
                </div>
              </div>

              <div className={styles.asideSection}>
                <h3 className={styles.asideTitle}>Routes</h3>
                <div className={styles.linkRow}>
                  <Link
                    className={styles.inlineLink}
                    href={`/dashboard?theme=${theme}`}
                  >
                    Portfolio overview
                  </Link>
                  <Link
                    className={styles.inlineLink}
                    href={`/dashboard/transactions?theme=${theme}`}
                  >
                    Transaction flow
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
}
