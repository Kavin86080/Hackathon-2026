import React, { useState, useEffect } from 'react';
import { api } from '../services/api.ts';
import { FacultyAnalytics as AnalyticsType } from '../types/index.ts';

export const FacultyAnalytics: React.FC = () => {
  const [data, setData] = useState<AnalyticsType | null>(null);

  useEffect(() => {
    api.getFacultyAnalytics().then(setData).catch(console.error);
  }, []);

  return (
    <div className="flex flex-col w-full space-y-space-xl pb-16">
      {/* Header with Sample Analytics banner */}
      <div>
        <div className="inline-flex items-center gap-space-xs px-space-sm py-0.5 rounded bg-surface-container text-primary font-label-md text-label-md text-[11px] font-semibold mb-1">
          <span className="material-symbols-outlined text-[15px]">analytics</span>
          <span>Curricular Intelligence & Cohort Trends</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight font-bold text-[30px]">
            Cohort Analytics & Concept Gap Distribution
          </h1>
          <span className="px-3 py-1 rounded bg-amber-50 text-amber-800 border border-amber-300 font-label-md text-[12px] font-semibold flex items-center gap-1.5 self-start sm:self-center">
            <span className="material-symbols-outlined text-[16px]">info</span>
            Sample Analytics (Demonstration Cohort Data)
          </span>
        </div>
        <p className="font-body-md text-body-md text-secondary max-w-3xl text-[14px] mt-1">
          Aggregated rubric metrics across Stanford CS231n Fall 2024 cohort (84 students). Identify widespread conceptual bottlenecks to plan lecture review sessions.
        </p>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-space-md">
        <div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm border border-outline-variant/30">
          <span className="font-label-md text-secondary uppercase font-semibold text-[11px]">
            Processed Cohort
          </span>
          <div className="font-display-lg font-bold text-on-surface text-[32px] mt-1">84 / 84</div>
          <span className="font-code-eval text-tertiary font-semibold text-[11px]">100% Evaluations Complete</span>
        </div>

        <div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm border border-outline-variant/30">
          <span className="font-label-md text-secondary uppercase font-semibold text-[11px]">
            Mean Cohort Mark
          </span>
          <div className="font-display-lg font-bold text-primary text-[32px] mt-1">7.8 / 10.0</div>
          <span className="font-code-eval text-secondary text-[11px]">Median: 8.0 · StdDev: 1.1</span>
        </div>

        <div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm border border-outline-variant/30">
          <span className="font-label-md text-secondary uppercase font-semibold text-[11px]">
            Primary Concept Gap
          </span>
          <div className="font-headline-md font-bold text-error text-[18px] mt-1 truncate">
            Non-Linearity (ReLU)
          </div>
          <span className="font-code-eval text-error font-semibold text-[11px]">42% Students missed</span>
        </div>

        <div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm border border-outline-variant/30">
          <span className="font-label-md text-secondary uppercase font-semibold text-[11px]">
            Faculty Agreement
          </span>
          <div className="font-display-lg font-bold text-tertiary text-[32px] mt-1">94.2%</div>
          <span className="font-code-eval text-secondary text-[11px]">AI Recommendation Accepted</span>
        </div>
      </div>

      {/* Class-level Concept Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
        {/* Left Column: Most Common Missing Concepts */}
        <div className="lg:col-span-7 p-space-xl rounded-2xl bg-surface-container-lowest shadow-sm border border-outline-variant/30 space-y-space-md">
          <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
            <div>
              <h2 className="font-headline-md font-bold text-on-surface text-[18px]">
                Most Common Missing Concepts Across Cohort
              </h2>
              <p className="font-body-sm text-secondary text-[12px]">
                Frequency of rubric deduction infractions among 84 evaluated responses.
              </p>
            </div>
            <span className="px-2 py-0.5 rounded bg-surface-container text-secondary font-code-eval text-[11px]">
              Sample Analytics
            </span>
          </div>

          <div className="space-y-4 pt-1">
            {data?.commonMissingConcepts.map((item, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-[13px]">
                  <span className="font-semibold text-on-surface">{item.concept}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-code-eval text-secondary text-[11px]">{item.count} students</span>
                    <span className="font-code-eval font-bold text-error text-[12px]">{item.percentage}%</span>
                  </div>
                </div>
                <div className="w-full h-2.5 rounded-full bg-surface-container overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      item.percentage >= 40
                        ? 'bg-error'
                        : item.percentage >= 25
                        ? 'bg-amber-500'
                        : 'bg-primary'
                    }`}
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Score Distribution */}
        <div className="lg:col-span-5 p-space-xl rounded-2xl bg-surface-container-lowest shadow-sm border border-outline-variant/30 space-y-space-md">
          <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
            <div>
              <h2 className="font-headline-md font-bold text-on-surface text-[18px]">
                Mark Distribution
              </h2>
              <p className="font-body-sm text-secondary text-[12px]">
                Breakdown of students by final score band.
              </p>
            </div>
            <span className="px-2 py-0.5 rounded bg-surface-container text-secondary font-code-eval text-[11px]">
              N=84
            </span>
          </div>

          <div className="space-y-3 pt-2">
            {data?.cohortDistribution.map((band, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/20 flex items-center justify-between">
                <div>
                  <span className="font-rubric-metric font-semibold text-on-surface text-[14px]">
                    {band.range} Marks
                  </span>
                  <div className="text-[11px] text-secondary">
                    {band.range.startsWith('9') ? 'Exemplar & Honors' : band.range.startsWith('7') ? 'Proficient Band' : 'Needs Practice'}
                  </div>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="font-display-lg font-bold text-primary text-[24px]">{band.count}</span>
                  <span className="text-[11px] text-secondary">students ({Math.round((band.count / 84) * 100)}%)</span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-primary-fixed/20 border border-primary/20 text-on-surface text-[12px] leading-relaxed">
            <strong>Faculty Insight:</strong> Re-addressing ReLU non-linear activation collapse in next Monday's review lecture could improve mastery by an estimated +1.2 marks across 35 students.
          </div>
        </div>
      </div>
    </div>
  );
};
