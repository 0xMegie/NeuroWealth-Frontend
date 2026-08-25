"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "./transaction-flow.module.css";
import { formatCurrency } from "@/lib/formatters";
import { buildStatusChips } from "@/lib/transactions";
import { useSandbox } from "@/contexts/SandboxContext";
import { SandboxBadge } from "@/components/ui/SandboxBadge";
import { TransactionErrorRecovery } from "./TransactionErrorRecovery";
import { TransactionFormStage } from "./stages/TransactionFormStage";
import { TransactionConfirmStage } from "./stages/TransactionConfirmStage";
import { TransactionPendingStage } from "./stages/TransactionPendingStage";
import { TransactionReceiptStage } from "./stages/TransactionReceiptStage";
import { useTransactionFlow } from "./hooks/useTransactionFlow";
import { currentStepIndex } from "./utils/transaction-utils";
import { getToneClassName } from "./utils/transaction-style-utils";

export function TransactionFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { getCurrentScenario, isSandboxMode } = useSandbox();
  const scenario = getCurrentScenario("transactions");

  const {
    theme,
    kind,
    preview,
    stage,
    quote,
    pending,
    receipt,
    requestMessage,
    context,
    formValues,
    fieldErrors,
    isSubmitting,
    recovery,
    updateField,
    handleThemeChange,
    handleKindChange,
    handlePreviewChange,
    handleMaxAmount,
    handleReview,
    handleConfirm,
    handleRecoveryAction,
    resetFlow,
    setStage,
  } = useTransactionFlow({ searchParams, router, isSandboxMode, scenario });

  const statusChips = buildStatusChips(kind, formValues);

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
                  <SandboxBadge scenario={scenario} />
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
