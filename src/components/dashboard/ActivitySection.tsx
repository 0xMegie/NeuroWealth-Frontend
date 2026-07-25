"use client";

import styles from "./portfolio-dashboard.module.css";
import type { ActivityItem } from "@/lib/portfolio";
import { EmptyState } from "@/components/ui/EmptyState";
import { DataBoundary } from "@/components/ui/DataBoundary";
import { formatSignedCurrency, formatTimestamp } from "@/lib/formatters";

const activityLabels: Record<ActivityItem["kind"], string> = {
  deposit: "Deposit",
  yield: "Yield",
  rebalance: "Rebalance",
  withdrawal: "Withdrawal",
};

function getValueTone(value: number): "positive" | "negative" | "neutral" {
  if (value > 0) return "positive";
  if (value < 0) return "negative";
  return "neutral";
}

function renderActivityIcon(kind: ActivityItem["kind"]) {
  switch (kind) {
    case "deposit":
      return <ArrowDownIcon />;
    case "withdrawal":
      return <ArrowUpIcon />;
    case "rebalance":
      return <ShuffleIcon />;
    default:
      return <SparkIcon />;
  }
}

function ActivityIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="24" viewBox="0 0 24 24" width="24">
      <path d="M5 19.25h14" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
      <path
        d="M7 15.75 10.2 12l2.8 2.4 4-5.15"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <circle cx="7" cy="15.75" fill="currentColor" opacity="0.24" r="1.4" />
      <circle cx="10.2" cy="12" fill="currentColor" opacity="0.24" r="1.4" />
      <circle cx="13" cy="14.4" fill="currentColor" opacity="0.24" r="1.4" />
      <circle cx="17" cy="9.25" fill="currentColor" opacity="0.24" r="1.4" />
    </svg>
  );
}

function ArrowDownIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="20" viewBox="0 0 24 24" width="20">
      <path d="M12 5v14" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
      <path
        d="m6.5 13.5 5.5 5.5 5.5-5.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function ArrowUpIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="20" viewBox="0 0 24 24" width="20">
      <path d="M12 19V5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
      <path
        d="M17.5 10.5 12 5 6.5 10.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function ShuffleIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="20" viewBox="0 0 24 24" width="20">
      <path d="M16 4h4v4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      <path
        d="M4 18h3.2c1.3 0 2.5-.6 3.3-1.6L20 4"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <path d="M16 20h4v-4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      <path
        d="M4 6h3.2c1.3 0 2.5.6 3.3 1.6L12 9"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <path
        d="m14 15 1.5 1.8c.8 1 2 1.6 3.3 1.6H20"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="20" viewBox="0 0 24 24" width="20">
      <path
        d="m12 3 1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

interface ActivitySectionProps {
  loading: boolean;
  error: string | null;
  activity: ActivityItem[];
  onRetry: () => void;
}

export function ActivitySection({ loading, error, activity, onRetry }: ActivitySectionProps) {
  return (
    <article className={`${styles.card} ${styles.panel}`}>
      <header className={styles.panelHeader}>
        <div>
          <h2 className={styles.panelTitle}>Recent activity</h2>
          <p className={styles.panelMeta}>
            Latest deposits, yield events, rebalances, and scheduled cash flows.
          </p>
        </div>
        {!loading && !error && activity.length > 0 ? (
          <span className={styles.chip}>
            {activity.length} event{activity.length === 1 ? "" : "s"}
          </span>
        ) : null}
      </header>

      <DataBoundary
        loading={loading}
        error={error ? new Error(error) : null}
        onRetry={onRetry}
        label="activity data"
        skeleton={
          <div className={styles.emptyState}>
            <span className={styles.skeletonValue} />
            <span className={`${styles.skeletonLine} ${styles.skeletonCopy}`} />
          </div>
        }
      >
        {activity.length > 0 ? (
          <div className={styles.activityList}>
            {activity.map((item) => {
              const statusClassName =
                item.status === "pending"
                  ? styles.statusPending
                  : item.status === "scheduled"
                    ? styles.statusScheduled
                    : styles.statusCompleted;

              const amountTone = getValueTone(item.amount ?? 0);
              const amountClassName =
                amountTone === "positive"
                  ? styles.valuePositive
                  : amountTone === "negative"
                    ? styles.valueNegative
                    : styles.valueNeutral;

              return (
                <div className={styles.activityItem} key={item.id}>
                  <div className={styles.activityIcon}>{renderActivityIcon(item.kind)}</div>
                  <div className={styles.activityBody}>
                    <div className={styles.activityTitleRow}>
                      <p className={styles.activityTitle}>{item.title}</p>
                      <span className={`${styles.statusBadge} ${statusClassName}`}>
                        {item.status}
                      </span>
                    </div>
                    <p className={styles.activityDetail}>{item.detail}</p>
                    <div className={styles.activityMeta}>
                      <span>{activityLabels[item.kind]}</span>
                      <span>{formatTimestamp(item.occurredAt)}</span>
                    </div>
                  </div>
                  <div className={`${styles.activityAmount} ${amountClassName}`}>
                    {item.amount == null ? "No amount" : formatSignedCurrency(item.amount)}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={<ActivityIcon />}
            heading="No recent activity yet"
            body="Deposits and rebalances will appear here as soon as they happen."
            ctaLabel="Load sample data"
            onAction={onRetry}
          />
        )}
      </DataBoundary>
    </article>
  );
}
