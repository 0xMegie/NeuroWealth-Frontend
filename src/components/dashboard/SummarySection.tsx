"use client";

import styles from "./portfolio-dashboard.module.css";
import type { ChartTone } from "@/lib/portfolio";

interface MetricCardProps {
  label: string;
  value: string;
  helper: string;
  tone: "default" | "positive" | "negative" | "neutral";
  mono?: boolean;
}

function MetricCard({ label, value, helper, tone, mono = false }: MetricCardProps) {
  const toneClassName =
    tone === "positive"
      ? styles.valuePositive
      : tone === "negative"
        ? styles.valueNegative
        : tone === "neutral"
          ? styles.valueNeutral
          : styles.valueDefault;

  return (
    <article className={`${styles.card} ${styles.metricCard}`}>
      <p className={styles.metricLabel}>{label}</p>
      <p className={[styles.metricValue, toneClassName, mono ? styles.metricValueMono : ""].join(" ")}>
        {value}
      </p>
      <p className={styles.helperText}>{helper}</p>
    </article>
  );
}

function SummarySkeleton() {
  return (
    <>
      {Array.from({ length: 4 }).map((_, index) => (
        <article
          className={`${styles.card} ${styles.metricCard} ${styles.skeletonCard}`}
          key={index}
        >
          <span className={styles.skeletonLine} />
          <span className={styles.skeletonValue} />
          <span className={`${styles.skeletonLine} ${styles.skeletonCopy}`} />
        </article>
      ))}
    </>
  );
}

export interface SummaryCard {
  label: string;
  value: string;
  helper: string;
  tone: "default" | "positive" | "negative" | "neutral";
  mono?: boolean;
}

interface SummarySectionProps {
  loading: boolean;
  cards: SummaryCard[];
}

export function SummarySection({ loading, cards }: SummarySectionProps) {
  return (
    <div className={styles.summaryGrid}>
      {loading ? (
        <SummarySkeleton />
      ) : (
        cards.map((card) => <MetricCard {...card} key={card.label} />)
      )}
    </div>
  );
}

export type { ChartTone };
