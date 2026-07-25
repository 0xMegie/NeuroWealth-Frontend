/**
 * TransactionConfirmStage.tsx
 *
 * Confirmation stage for transaction flow.
 * Displays quote details and fees before submission.
 */

import { formatCurrency } from "@/lib/formatters";
import { TransactionKind, TransactionQuote } from "@/lib/transactions";
import styles from "../transaction-flow.module.css";

interface TransactionConfirmStageProps {
  kind: TransactionKind;
  quote: TransactionQuote;
  isSubmitting: boolean;
  onBack: () => void;
  onConfirm: () => void;
}

export function TransactionConfirmStage({
  kind,
  quote,
  isSubmitting,
  onBack,
  onConfirm,
}: TransactionConfirmStageProps) {
  const confirmLabel =
    kind === "deposit" ? "Confirm deposit" : "Confirm withdrawal";

  return (
    <div className={styles.form}>
      <div className={styles.summaryCard}>
        <p className={styles.heroAmount}>{formatCurrency(quote.amount)}</p>
        <p className={styles.heroSubtext}>
          {kind === "deposit" ? "Deposit amount" : "Withdrawal amount"}
        </p>
      </div>

      <div className={styles.detailList}>
        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>Amount</span>
          <span className={`${styles.detailValue} ${styles.detailValueMono}`}>
            {formatCurrency(quote.amount)}
          </span>
        </div>
        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>Fees</span>
          <span className={`${styles.detailValue} ${styles.detailValueMono}`}>
            {formatCurrency(quote.fee)}
          </span>
        </div>
        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>
            {kind === "deposit" ? "Total debit" : "Net destination amount"}
          </span>
          <span className={`${styles.detailValue} ${styles.detailValueMono}`}>
            {formatCurrency(
              kind === "deposit" ? quote.totalDebit : quote.netAmount,
            )}
          </span>
        </div>
        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>Strategy</span>
          <span className={styles.detailValue}>{quote.strategyLabel}</span>
        </div>
      </div>

      <div className={styles.referenceCard}>
        <p className={styles.referenceLabel}>Transaction reference</p>
        <p className={styles.referenceValue}>{quote.reference}</p>
        <p className={styles.supportingCopy}>
          Share this reference with support if you need help tracing the
          request.
        </p>
      </div>

      <div className={styles.actionBar}>
        <div className={styles.actionMeta}>
          Confirm after reviewing amount, fees, and reference.
        </div>
        <div className={styles.actionButtons}>
          <button
            className={`${styles.button} ${styles.buttonSecondary}`}
            onClick={onBack}
            type="button"
          >
            Back
          </button>
          <button
            className={`${styles.button} ${styles.buttonPrimary}`}
            onClick={onConfirm}
            disabled={isSubmitting}
            type="button"
            data-qa="transaction-submit-button"
          >
            {isSubmitting ? "Submitting..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
