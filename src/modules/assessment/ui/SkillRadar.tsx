'use client';

import { useState } from 'react';

interface SkillDimensionData {
  dimension: string;
  label: string;
  mastery: number; // 0-1
  confidence: number; // 0-1
}

interface Props {
  dimensions: SkillDimensionData[];
  showConfidence?: boolean;
  height?: number;
}

export default function SkillRadar({ dimensions, showConfidence = true, height = 300 }: Props) {
  const [view, setView] = useState<'bar' | 'radar'>('bar');
  const [hoveredDimension, setHoveredDimension] = useState<string | null>(null);

  if (!dimensions || dimensions.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 border border-gray-200 text-center">
        <p className="text-gray-500">No skill data available</p>
      </div>
    );
  }

  const getSkillLevelColor = (mastery: number) => {
    if (mastery >= 0.7) return { bg: 'bg-green-500', text: 'text-green-700', label: 'Strong' };
    if (mastery >= 0.4) return { bg: 'bg-yellow-500', text: 'text-yellow-700', label: 'Developing' };
    return { bg: 'bg-red-500', text: 'text-red-700', label: 'Beginner' };
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.7) return 'High confidence';
    if (confidence >= 0.4) return 'Medium confidence';
    return 'Low confidence';
  };

  const renderBarChart = () => (
    <div className="space-y-4">
      {dimensions.map((dim) => {
        const level = getSkillLevelColor(dim.mastery);
        const isHovered = hoveredDimension === dim.dimension;

        return (
          <div
            key={dim.dimension}
            className={`transition-all duration-200 ${isHovered ? 'scale-[1.02]' : ''}`}
            onMouseEnter={() => setHoveredDimension(dim.dimension)}
            onMouseLeave={() => setHoveredDimension(null)}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">{dim.label}</span>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${level.bg} text-white`}>
                  {level.label}
                </span>
                <span className="text-sm font-bold text-gray-900">{Math.round(dim.mastery * 100)}%</span>
              </div>
            </div>
            <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`absolute inset-y-0 left-0 ${level.bg} rounded-full transition-all duration-500`}
                style={{ width: `${dim.mastery * 100}%` }}
              />
              {showConfidence && (
                <div
                  className="absolute inset-y-0 bg-gray-400 opacity-30 rounded-r-full transition-all duration-500"
                  style={{
                    left: `${dim.mastery * 100}%`,
                    width: `${Math.max(0, (dim.confidence - dim.mastery) * 100)}%`,
                  }}
                />
              )}
            </div>
            {showConfidence && isHovered && (
              <div className="text-xs text-gray-500 mt-1">
                {getConfidenceLabel(dim.confidence)} ({Math.round(dim.confidence * 100)}%)
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  const renderRadarChart = () => {
    const size = Math.min(height, 300);
    const center = size / 2;
    const radius = (size / 2) * 0.8;
    const angleStep = (2 * Math.PI) / dimensions.length;

    // Calculate points for mastery polygon
    const masteryPoints = dimensions.map((dim, i) => {
      const angle = i * angleStep - Math.PI / 2;
      const r = radius * dim.mastery;
      return {
        x: center + r * Math.cos(angle),
        y: center + r * Math.sin(angle),
      };
    });

    // Calculate points for confidence polygon (if showing)
    const confidencePoints = showConfidence
      ? dimensions.map((dim, i) => {
          const angle = i * angleStep - Math.PI / 2;
          const r = radius * dim.confidence;
          return {
            x: center + r * Math.cos(angle),
            y: center + r * Math.sin(angle),
          };
        })
      : [];

    // Grid circles
    const gridLevels = [0.2, 0.4, 0.6, 0.8, 1.0];

    return (
      <div className="flex justify-center">
        <svg width={size} height={size} className="overflow-visible">
          {/* Grid circles */}
          {gridLevels.map((level) => (
            <circle
              key={level}
              cx={center}
              cy={center}
              r={radius * level}
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="1"
            />
          ))}

          {/* Axis lines */}
          {dimensions.map((dim, i) => {
            const angle = i * angleStep - Math.PI / 2;
            const x = center + radius * Math.cos(angle);
            const y = center + radius * Math.sin(angle);
            return (
              <line
                key={dim.dimension}
                x1={center}
                y1={center}
                x2={x}
                y2={y}
                stroke="#e5e7eb"
                strokeWidth="1"
              />
            );
          })}

          {/* Confidence polygon (background) */}
          {showConfidence && confidencePoints.length > 0 && (
            <polygon
              points={confidencePoints.map((p) => `${p.x},${p.y}`).join(' ')}
              fill="rgba(99, 102, 241, 0.1)"
              stroke="rgba(99, 102, 241, 0.3)"
              strokeWidth="1"
            />
          )}

          {/* Mastery polygon */}
          <polygon
            points={masteryPoints.map((p) => `${p.x},${p.y}`).join(' ')}
            fill="rgba(99, 102, 241, 0.3)"
            stroke="#6366f1"
            strokeWidth="2"
          />

          {/* Data points */}
          {masteryPoints.map((point, i) => (
            <circle
              key={i}
              cx={point.x}
              cy={point.y}
              r="5"
              fill="#6366f1"
              className="cursor-pointer"
              onMouseEnter={() => setHoveredDimension(dimensions[i].dimension)}
              onMouseLeave={() => setHoveredDimension(null)}
            />
          ))}

          {/* Labels */}
          {dimensions.map((dim, i) => {
            const angle = i * angleStep - Math.PI / 2;
            const labelRadius = radius + 30;
            const x = center + labelRadius * Math.cos(angle);
            const y = center + labelRadius * Math.sin(angle);
            const isHovered = hoveredDimension === dim.dimension;

            return (
              <text
                key={dim.dimension}
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="middle"
                className={`text-xs ${isHovered ? 'font-bold fill-indigo-600' : 'fill-gray-600'}`}
                onMouseEnter={() => setHoveredDimension(dim.dimension)}
                onMouseLeave={() => setHoveredDimension(null)}
              >
                {dim.label.split(' ')[0]}
              </text>
            );
          })}

          {/* Grid labels */}
          {gridLevels.map((level) => (
            <text
              key={`label-${level}`}
              x={center + 5}
              y={center - radius * level + 3}
              className="text-xs fill-gray-400"
            >
              {Math.round(level * 100)}%
            </text>
          ))}
        </svg>
      </div>
    );
  };

  // Tooltip for hovered dimension
  const hoveredData = dimensions.find((d) => d.dimension === hoveredDimension);

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Skill Profile</h3>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setView('bar')}
            className={`px-3 py-1 text-sm rounded-md transition ${
              view === 'bar' ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Bar
          </button>
          <button
            onClick={() => setView('radar')}
            className={`px-3 py-1 text-sm rounded-md transition ${
              view === 'radar' ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Radar
          </button>
        </div>
      </div>

      {hoveredData && view === 'radar' && (
        <div className="mb-4 p-3 bg-indigo-50 rounded-lg border border-indigo-100">
          <div className="flex items-center justify-between">
            <span className="font-medium text-indigo-900">{hoveredData.label}</span>
            <span className="text-indigo-700 font-bold">{Math.round(hoveredData.mastery * 100)}%</span>
          </div>
          {showConfidence && (
            <div className="text-sm text-indigo-600 mt-1">
              {getConfidenceLabel(hoveredData.confidence)}
            </div>
          )}
        </div>
      )}

      <div style={{ minHeight: view === 'radar' ? height : 'auto' }}>
        {view === 'bar' ? renderBarChart() : renderRadarChart()}
      </div>

      {showConfidence && view === 'bar' && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-indigo-500 rounded"></div>
              <span>Mastery</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-gray-400 opacity-30 rounded"></div>
              <span>Confidence range</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
