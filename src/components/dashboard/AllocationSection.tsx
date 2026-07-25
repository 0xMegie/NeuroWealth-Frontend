"use client";

import styles from "./portfolio-dashboard.module.css";
import type { AllocationItem, ChartTone } from "@/lib/portfolio";
import { AllocationChart } from "./AllocationChart";
import { EmptyState } from "@/components/ui/EmptyState";
import { DataBoundary } from "@/components/ui/DataBoundary";
import {
  formatCurrency,
  formatPercent,
  formatSignedPercent,
} from "@/lib/formatters";

const toneMap: Record<ChartTone, string> = {
  primary: "var(--chart-primary)",
  accent: "var(--chart-accent)",
  warning: "var(--chart-warning)",
  "neutral-strong": "var(--chart-neutral-strong)",
  "neutral-soft": "var(--chart-neutral-soft)",
};

function getValueTone(value: number): "positive" | "negative" | "neutral" {
  if (value > 0) return "positive";
  if (value < 0) return "negative";
  return "neutral";
}

function PieIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="24" viewBox="0 0 24 24" width="24">
      <path
        d="M11 3a9 9 0 1 0 9 9h-9V3Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <path
        d="M14.5 3.7A9 9 0 0 1 20.3 9.5H14.5V3.7Z"
        fill="currentColor"
        opacity="0.24"
      />
    </svg>
  );
}

interface AllocationSectionProps {
  loading: boolean;
  error: string | null;
  allocation: AllocationItem[];
  onRetry: () => void;
}

export function AllocationSection({ loading, error, allocation, onRetry }: AllocationSectionProps) {
  return (
    <article className={`${styles.card} ${styles.panel}`}>
      <header className={styles.panelHeader}>
        <div>
          <h2 className={styles.panelTitle}>Asset allocation</h2>
          <p className={styles.panelMeta}>
            Visible deployment mix across strategy buckets and reserve capital.
          </p>
        </div>
        {!loading && !error && allocation.length > 0 ? (
          <span className={styles.chip}>
            {allocation.length} allocation{allocation.length === 1 ? " line" : " lines"}
          </span>
        ) : null}
      </header>

      <DataBoundary
        loading={loading}
        error={error ? new Error(error) : null}
        onRetry={onRetry}
        label="allocation data"
        skeleton={
          <div className={styles.emptyState}>
            <span className={styles.skeletonValue} />
            <span className={`${styles.skeletonLine} ${styles.skeletonCopy}`} />
          </div>
        }
      >
        {allocation.length > 0 ? (
          <div className={styles.allocationLayout}>
            <AllocationChart
              data={allocation.map((item) => ({
                name: item.label,
                value: item.amount,
                tone: item.tone,
              }))}
              height={200}
              innerRadius={60}
              outerRadius={90}
            />
            <div className={styles.allocationList}>
              {allocation.map((item) => {
                const changeTone = getValueTone(item.change);
                const changeClassName =
                  changeTone === "positive"
                    ? styles.valuePositive
                    : changeTone === "negative"
                      ? styles.valueNegative
                      : styles.valueNeutral;

                return (
                  <div className={styles.allocationRow} key={item.id}>
                    <div className={styles.allocationIdentity}>
                      <span
                        className={styles.allocationDot}
                        style={{ background: toneMap[item.tone] }}
                      />
                      <div>
                        <p className={styles.allocationName}>{item.label}</p>
                        <p className={styles.allocationSymbol}>{item.symbol}</p>
                      </div>
                    </div>
                    <span className={styles.allocationShare}>{formatPercent(item.share)}</span>
                    <div className={styles.allocationValueWrap}>
                      <span className={styles.allocationAmount}>{formatCurrency(item.amount)}</span>
                      <span className={`${styles.allocationChange} ${changeClassName}`}>
                        {formatSignedPercent(item.change)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <EmptyState
            icon={<PieIcon />}
            heading="No allocation yet"
            body="Add a deposit to see deployed positions and reserve coverage."
            ctaLabel="Load sample data"
            onAction={onRetry}
          />
        )}
      </DataBoundary>
    </article>
  );
}
