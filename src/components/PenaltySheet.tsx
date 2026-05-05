"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { X, ChevronDown, ChevronUp } from "lucide-react";

interface PenaltyRow {
  id: string;
  amount: number;
  charged_at: string;
  goal_instances: { goals: { title: string } | null } | null;
}

interface MonthGroup {
  key: string;       // "2026-04"
  label: string;     // "2026年4月"
  rows: PenaltyRow[];
  total: number;
}

function toMonthKey(iso: string) {
  return iso.slice(0, 7);
}

function formatMonthLabel(key: string) {
  const [y, m] = key.split("-");
  return `${y}年${parseInt(m)}月`;
}

function formatDay(iso: string) {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function groupByMonth(penalties: PenaltyRow[]): MonthGroup[] {
  const map = new Map<string, PenaltyRow[]>();
  for (const p of penalties) {
    const key = toMonthKey(p.charged_at);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(p);
  }
  return Array.from(map.entries()).map(([key, rows]) => ({
    key,
    label: formatMonthLabel(key),
    rows,
    total: rows.reduce((s, r) => s + r.amount, 0),
  }));
}

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function PenaltySheet({ open, onClose }: Props) {
  const [penalties, setPenalties] = useState<PenaltyRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [showPast, setShowPast] = useState(false);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      setLoading(true);
      setShowPast(false);
    });
    fetch("/api/penalties")
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) setPenalties(d.penalties ?? []);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [open]);

  if (!open) return null;

  const currentMonthKey = new Date().toISOString().slice(0, 7);
  const groups = groupByMonth(penalties);
  const currentGroup = groups.find((g) => g.key === currentMonthKey);
  const pastGroups = groups.filter((g) => g.key !== currentMonthKey);

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        background: "rgba(0,0,0,0.45)",
        display: "flex", alignItems: "flex-end",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "white",
          borderRadius: "24px 24px 0 0",
          width: "100%",
          maxHeight: "80vh",
          display: "flex",
          flexDirection: "column",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ドラッグハンドル */}
        <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 4px" }}>
          <div style={{ width: "36px", height: "4px", background: "#E5E5E5", borderRadius: "2px" }} />
        </div>

        {/* ヘッダー */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "8px 20px 16px",
          borderBottom: "1px solid #F0F0F0",
        }}>
          <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#111111", margin: 0 }}>罰金履歴</h2>
          <button
            onClick={onClose}
            style={{
              width: "32px", height: "32px", borderRadius: "50%",
              background: "#F2F2F7", border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <X size={16} color="#888888" strokeWidth={2.5} />
          </button>
        </div>

        {/* コンテンツ */}
        <div style={{ overflowY: "auto", flex: 1, padding: "16px 20px 24px" }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "#BBBBBB", fontSize: "14px" }}>
              読み込み中…
            </div>
          ) : penalties.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <Image
                src="/stickman-assets/stickman-15.png"
                alt=""
                width={86}
                height={118}
                style={{ width: 86, height: 118, display: "block", objectFit: "contain", margin: "0 auto 12px" }}
              />
              <p style={{ fontSize: "15px", fontWeight: 700, color: "#111111", marginBottom: "6px" }}>罰金なし！</p>
              <p style={{ fontSize: "13px", color: "#AAAAAA" }}>すばらしい継続力です</p>
            </div>
          ) : (
            <>
              {/* 今月 */}
              <MonthSection group={currentGroup} fallbackLabel={formatMonthLabel(currentMonthKey)} />

              {/* 過去の履歴 */}
              {pastGroups.length > 0 && (
                <div style={{ marginTop: "8px" }}>
                  <button
                    onClick={() => setShowPast((v) => !v)}
                    style={{
                      width: "100%", padding: "12px 0",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: "5px",
                      background: "none", border: "none", cursor: "pointer",
                    }}
                  >
                    <span style={{ fontSize: "13px", color: "#AAAAAA", fontWeight: 600 }}>
                      過去の履歴を見る（{pastGroups.reduce((s, g) => s + g.rows.length, 0)}件）
                    </span>
                    {showPast
                      ? <ChevronUp size={14} color="#AAAAAA" />
                      : <ChevronDown size={14} color="#AAAAAA" />}
                  </button>

                  {showPast && pastGroups.map((g) => (
                    <MonthSection key={g.key} group={g} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function MonthSection({ group, fallbackLabel }: { group?: MonthGroup; fallbackLabel?: string }) {
  const label = group?.label ?? fallbackLabel ?? "";
  return (
    <div style={{ marginBottom: "16px" }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: "8px",
      }}>
        <p style={{ fontSize: "11px", fontWeight: 700, color: "#AAAAAA", letterSpacing: "0.08em" }}>{label}</p>
        {group && (
          <p style={{ fontSize: "13px", fontWeight: 800, color: "#EF4444" }}>
            合計 ¥{group.total.toLocaleString()}
          </p>
        )}
      </div>

      {!group || group.rows.length === 0 ? (
        <div style={{
          background: "#F9F9F9", borderRadius: "14px",
          padding: "16px", textAlign: "center",
        }}>
          <Image
            src="/stickman-assets/stickman-15.png"
            alt=""
            width={52}
            height={71}
            style={{ width: 52, height: 71, display: "block", objectFit: "contain", margin: "0 auto 8px" }}
          />
          <p style={{ fontSize: "13px", color: "#AAAAAA" }}>今月の罰金はありません</p>
        </div>
      ) : (
        <div style={{ background: "#F9F9F9", borderRadius: "14px", overflow: "hidden" }}>
          {group.rows.map((row, idx) => {
            const goalTitle = row.goal_instances?.goals?.title ?? "目標削除済み";
            return (
              <div key={row.id}>
                {idx > 0 && <div style={{ height: "1px", background: "#EFEFEF", marginLeft: "16px" }} />}
                <div style={{
                  display: "flex", alignItems: "center",
                  padding: "13px 16px", gap: "10px",
                }}>
                  <div style={{
                    width: "36px", height: "36px", borderRadius: "10px",
                    background: "#FFF0F0", flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "16px",
                  }}>💸</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontSize: "13px", fontWeight: 700, color: "#111111",
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>{goalTitle}</p>
                    <p style={{ fontSize: "11px", color: "#AAAAAA", marginTop: "2px" }}>
                      {formatDay(row.charged_at)}
                    </p>
                  </div>
                  <p style={{ fontSize: "15px", fontWeight: 800, color: "#EF4444", flexShrink: 0 }}>
                    ¥{row.amount.toLocaleString()}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
