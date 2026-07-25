"use client";

import React, { useState, useMemo } from "react";
import FilterChips, { FilterOption } from "./FilterChips";
import Pagination from "./Pagination";
import { formatNumber } from "@/lib/formatters";

interface Strategy {
  id: string;
  name: string;
  riskLevel: "low" | "medium" | "high";
  category: "growth" | "income" | "balanced" | "defensive";
  returnRate: number;
  participants: number;
  status: "active" | "paused" | "archived";
}

const MOCK_STRATEGIES: Strategy[] = [
  {
    id: "s1",
    name: "Tech Growth",
    riskLevel: "high",
    category: "growth",
    returnRate: 12.5,
    participants: 342,
    status: "active",
  },
  {
    id: "s2",
    name: "Dividend Income",
    riskLevel: "low",
    category: "income",
    returnRate: 4.2,
    participants: 1205,
    status: "active",
  },
  {
    id: "s3",
    name: "Balanced Portfolio",
    riskLevel: "medium",
    category: "balanced",
    returnRate: 7.1,
    participants: 856,
    status: "active",
  },
  {
    id: "s4",
    name: "Market Defense",
    riskLevel: "low",
    category: "defensive",
    returnRate: 2.8,
    participants: 423,
    status: "paused",
  },
  {
    id: "s5",
    name: "Emerging Markets",
    riskLevel: "high",
    category: "growth",
    returnRate: 15.3,
    participants: 289,
    status: "active",
  },
  {
    id: "s6",
    name: "Blue Chip Value",
    riskLevel: "medium",
    category: "balanced",
    returnRate: 6.8,
    participants: 567,
    status: "active",
  },
  {
    id: "s7",
    name: "Fixed Income Plus",
    riskLevel: "low",
    category: "income",
    returnRate: 3.9,
    participants: 712,
    status: "active",
  },
  {
    id: "s8",
    name: "Crypto Alpha",
    riskLevel: "high",
    category: "growth",
    returnRate: 28.2,
    participants: 145,
    status: "archived",
  },
  {
    id: "s9",
    name: "ESG Leaders",
    riskLevel: "medium",
    category: "balanced",
    returnRate: 8.5,
    participants: 634,
    status: "active",
  },
  {
    id: "s10",
    name: "Sector Rotation",
    riskLevel: "medium",
    category: "growth",
    returnRate: 10.1,
    participants: 498,
    status: "active",
  },
];

const RISK_COLORS: Record<
  string,
  { bg: string; color: string; badge: string }
> = {
  low: { bg: "rgba(34,197,94,0.12)", color: "#22c55e", badge: "#16a34a" },
  medium: { bg: "rgba(245,158,11,0.12)", color: "#f59e0b", badge: "#d97706" },
  high: { bg: "rgba(239,68,68,0.12)", color: "#ef4444", badge: "#dc2626" },
};

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  active: { bg: "rgba(59,130,246,0.12)", color: "#3b82f6" },
  paused: { bg: "rgba(156,163,175,0.12)", color: "#9ca3af" },
  archived: { bg: "rgba(107,114,128,0.12)", color: "#6b7280" },
};

export default function StrategyList() {
  const [page, setPage] = useState(1);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const itemsPerPage = 6;

  // Build filter options with counts
  const filterOptions: FilterOption[] = useMemo(() => {
    const riskCounts = { low: 0, medium: 0, high: 0 };
    const categoryCounts = { growth: 0, income: 0, balanced: 0, defensive: 0 };
    const statusCounts = { active: 0, paused: 0, archived: 0 };

    MOCK_STRATEGIES.forEach((s) => {
      riskCounts[s.riskLevel]++;
      categoryCounts[s.category]++;
      statusCounts[s.status]++;
    });

    return [
      {
        id: "risk-low",
        label: "Low Risk",
        group: "risk",
        count: riskCounts.low,
      },
      {
        id: "risk-medium",
        label: "Medium Risk",
        group: "risk",
        count: riskCounts.medium,
      },
      {
        id: "risk-high",
        label: "High Risk",
        group: "risk",
        count: riskCounts.high,
      },
      {
        id: "cat-growth",
        label: "Growth",
        group: "category",
        count: categoryCounts.growth,
      },
      {
        id: "cat-income",
        label: "Income",
        group: "category",
        count: categoryCounts.income,
      },
      {
        id: "cat-balanced",
        label: "Balanced",
        group: "category",
        count: categoryCounts.balanced,
      },
      {
        id: "cat-defensive",
        label: "Defensive",
        group: "category",
        count: categoryCounts.defensive,
      },
      {
        id: "status-active",
        label: "Active",
        group: "status",
        count: statusCounts.active,
      },
      {
        id: "status-paused",
        label: "Paused",
        group: "status",
        count: statusCounts.paused,
      },
      {
        id: "status-archived",
        label: "Archived",
        group: "status",
        count: statusCounts.archived,
      },
    ];
  }, []);

  // Filter strategies based on selected chips
  const filtered = useMemo(() => {
    if (selectedFilters.length === 0) return MOCK_STRATEGIES;

    const riskFilters = selectedFilters
      .filter((f) => f.startsWith("risk-"))
      .map((f) => f.replace("risk-", ""));
    const categoryFilters = selectedFilters
      .filter((f) => f.startsWith("cat-"))
      .map((f) => f.replace("cat-", ""));
    const statusFilters = selectedFilters
      .filter((f) => f.startsWith("status-"))
      .map((f) => f.replace("status-", ""));

    return MOCK_STRATEGIES.filter((s) => {
      if (riskFilters.length > 0 && !riskFilters.includes(s.riskLevel))
        return false;
      if (categoryFilters.length > 0 && !categoryFilters.includes(s.category))
        return false;
      if (statusFilters.length > 0 && !statusFilters.includes(s.status))
        return false;
      return true;
    });
  }, [selectedFilters]);

  const totalItems = filtered.length;
  const start = (page - 1) * itemsPerPage;
  const items = filtered.slice(start, start + itemsPerPage);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2
          style={{ fontSize: 16, fontWeight: 500, color: "#f9fafb", margin: 0 }}
        >
          Investment Strategies
        </h2>
        <span style={{ fontSize: 12, color: "#6b7280" }}>
          {totalItems} results
        </span>
      </div>

      {/* Filters */}
      <FilterChips
        options={filterOptions}
        selected={selectedFilters}
        onChange={setSelectedFilters}
      />

      {/* Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: 12,
        }}
      >
        {items.map((strategy) => (
          <div
            key={strategy.id}
            style={{
              border: "0.5px solid #374151",
              borderRadius: 10,
              padding: 14,
              background: "#111827",
              display: "flex",
              flexDirection: "column",
              gap: 10,
              transition: "border-color 0.12s",
              cursor: "pointer",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.borderColor = "#6366f1")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.borderColor = "#374151")
            }
          >
            {/* Title + Status */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "start",
                gap: 8,
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3
                  style={{
                    margin: 0,
                    fontSize: 14,
                    fontWeight: 500,
                    color: "#f9fafb",
                  }}
                >
                  {strategy.name}
                </h3>
              </div>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 500,
                  textTransform: "uppercase",
                  borderRadius: 4,
                  padding: "2px 6px",
                  background: STATUS_COLORS[strategy.status].bg,
                  color: STATUS_COLORS[strategy.status].color,
                  whiteSpace: "nowrap",
                }}
              >
                {strategy.status}
              </span>
            </div>

            {/* Meta */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 500,
                  borderRadius: 4,
                  padding: "2px 7px",
                  background: RISK_COLORS[strategy.riskLevel].bg,
                  color: RISK_COLORS[strategy.riskLevel].color,
                }}
              >
                {strategy.riskLevel.charAt(0).toUpperCase() +
                  strategy.riskLevel.slice(1)}{" "}
                Risk
              </span>
              <span
                style={{
                  fontSize: 11,
                  color: "#9ca3af",
                  background: "#1f2937",
                  borderRadius: 4,
                  padding: "2px 7px",
                }}
              >
                {strategy.category}
              </span>
            </div>

            {/* Stats */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                borderTop: "0.5px solid #1f2937",
                paddingTop: 10,
              }}
            >
              <div>
                <p
                  style={{
                    margin: 0,
                    fontSize: 10,
                    color: "#6b7280",
                    fontWeight: 500,
                  }}
                >
                  RETURN
                </p>
                <p
                  style={{
                    margin: "2px 0 0",
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#10b981",
                  }}
                >
                  {strategy.returnRate.toFixed(1)}%
                </p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p
                  style={{
                    margin: 0,
                    fontSize: 10,
                    color: "#6b7280",
                    fontWeight: 500,
                  }}
                >
                  PARTICIPANTS
                </p>
                <p
                  style={{
                    margin: "2px 0 0",
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#a5b4fc",
                  }}
                >
                  {formatNumber(strategy.participants)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {items.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "48px 20px",
            color: "#6b7280",
            fontSize: 13,
          }}
        >
          No strategies match the selected filters.
        </div>
      )}

      {/* Pagination */}
      <Pagination
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        currentPage={page}
        onPageChange={setPage}
        showJump={totalItems > 20}
      />
    </div>
  );
}
