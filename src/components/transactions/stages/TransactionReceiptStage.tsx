/**
 * TransactionReceiptStage.tsx
 *
 * Receipt stage for transaction flow.
 * Displays success or failure results with transaction details.
 */

import { formatCurrency, formatTimestamp } from "@/lib/formatters";
import { TransactionKind, TransactionReceipt } from "@/lib/transactions";
import styles from "../transaction-flow.module.css";

interface TransactionReceiptStageProps {
  kind: TransactionKind;
  receipt: TransactionReceipt;
  onNewTransaction: () => void;
  onSwitchFlow: () => void;
}

export function TransactionReceiptStage({
  kind,
  receipt,
  onNewTransaction,
  onSwitchFlow,
}: TransactionReceiptStageProps) {
  return (
    <div
      className={`${styles.receiptCard} ${styles.form}`}
      role="status"
      aria-live="polite"
    >
      <div className={styles.receiptBanner}>
        <span
          className={`${styles.statusChip} ${
            receipt.status === "success"
              ? styles.statusSuccess
              : styles.statusError
          }`}
        >
          {receipt.status === "success" ? "Success" : "Failed"}
        </span>
        <h3 className={styles.receiptTitle}>{receipt.message}</h3>
        {receipt.failureReason ? (
          <p className={`${styles.fieldMessage} ${styles.errorMessage}`}>
            {receipt.failureReason}
          </p>
        ) : (
          <p className={`${styles.fieldMessage} ${styles.successMessage}`}>
            Receipt includes the amount, fees, and reference for follow-up.
          </p>
        )}
      </div>

      <div className={styles.referenceCard}>
        <p className={styles.referenceLabel}>Transaction reference</p>
        <p className={styles.referenceValue}>{receipt.reference}</p>
        <p className={styles.supportingCopy}>
          {receipt.explorerLabel ??
            "Retry after reviewing the validation state and updated quote."}
        </p>
      </div>

      <div className={styles.detailList}>
        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>Amount</span>
          <span className={`${styles.detailValue} ${styles.detailValueMono}`}>
            {formatCurrency(receipt.quote.amount)}
          </span>
        </div>
        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>Fees</span>
          <span className={`${styles.detailValue} ${styles.detailValueMono}`}>
            {formatCurrency(receipt.quote.fee)}
          </span>
        </div>
        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>
            {kind === "deposit" ? "Credited amount" : "Destination amount"}
          </span>
          <span className={`${styles.detailValue} ${styles.detailValueMono}`}>
            {formatCurrency(receipt.quote.netAmount)}
          </span>
        </div>
        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>Settled at</span>
          <span className={styles.detailValue}>
            {formatTimestamp(receipt.settledAt)}
          </span>
        </div>
      </div>

      <div className={styles.actionBar}>
        <div className={styles.actionMeta}>
          {receipt.status === "success"
            ? "Start a new transaction or switch flows."
            : "Retry after reviewing the updated validation details."}
        </div>
        <div className={styles.actionButtons}>
          <button
            className={`${styles.button} ${styles.buttonSecondary}`}
            onClick={onNewTransaction}
            type="button"
          >
            New transaction
          </button>
          <button
            className={`${styles.button} ${styles.buttonPrimary}`}
            onClick={onSwitchFlow}
            type="button"
          >
            Switch flow
          </button>
        </div>
      </div>
    </div>
  );
}
