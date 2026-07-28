/**
 * TransactionPendingStage.tsx
 *
 * Pending stage for transaction flow.
 * Shows loading state while transaction is processing.
 */

import { formatCurrency } from "@/lib/formatters";
import { PendingTransaction } from "@/lib/transactions";
import styles from "../transaction-flow.module.css";

interface TransactionPendingStageProps {
  pending: PendingTransaction;
}

export function TransactionPendingStage({
  pending,
}: TransactionPendingStageProps) {
  return (
    <div
      className={`${styles.pendingCard} ${styles.form}`}
      role="status"
      aria-live="polite"
    >
      <div className={styles.pendingLayout}>
        <div
          className={styles.pendingSpinner}
          role="progressbar"
          aria-label="Processing transaction"
        />
        <div className={styles.sectionHeading}>
          <h3 className={styles.sectionTitle}>{pending.statusLabel}</h3>
          <p className={styles.sectionCopy}>{pending.message}</p>
        </div>
      </div>

      <div className={styles.referenceCard}>
        <p className={styles.referenceLabel}>Transaction reference</p>
        <p className={styles.referenceValue}>{pending.reference}</p>
        <p className={styles.supportingCopy}>
          Keep this reference visible while the transaction is moving through
          the network.
        </p>
      </div>

      <div className={styles.detailList}>
        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>Requested amount</span>
          <span className={`${styles.detailValue} ${styles.detailValueMono}`}>
            {formatCurrency(pending.quote.amount)}
          </span>
        </div>
        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>Fees</span>
          <span className={`${styles.detailValue} ${styles.detailValueMono}`}>
            {formatCurrency(pending.quote.fee)}
          </span>
        </div>
        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>Settlement target</span>
          <span className={styles.detailValue}>
            {pending.quote.estimatedSettlement}
          </span>
        </div>
      </div>
    </div>
  );
}
