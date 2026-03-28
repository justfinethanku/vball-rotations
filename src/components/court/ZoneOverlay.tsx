'use client';

import React from 'react';
import { COURT_SVG, COURT_WIDTH, COURT_DEPTH } from '@/lib/constants';

interface ZoneOverlayProps {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  label: string;
  isDimmed: boolean;
  isFocusedZone: boolean;
  isSubstituted?: boolean;
}

export default function ZoneOverlay(props: ZoneOverlayProps) {
  const { x, y, width, height, color, label, isFocusedZone, isSubstituted } = props;
  // Convert court coordinates to SVG coordinates
  const svgX = COURT_SVG.x + (x / COURT_WIDTH) * COURT_SVG.width;
  const svgY = COURT_SVG.y + (y / COURT_DEPTH) * COURT_SVG.height;
  const svgW = (width / COURT_WIDTH) * COURT_SVG.width;
  const svgH = (height / COURT_DEPTH) * COURT_SVG.height;

  // Only show zone overlay when it's the focused zone
  if (!isFocusedZone) {
    return null;
  }

  // Substituted zone: dashed border, dimmer fill, informational style
  if (isSubstituted) {
    return (
      <g style={{ transition: 'opacity 0.3s ease' }}>
        <rect
          x={svgX}
          y={svgY}
          width={svgW}
          height={svgH}
          rx={4}
          fill={color}
          fillOpacity={0.05}
          stroke={color}
          strokeWidth={1}
          strokeOpacity={0.3}
          strokeDasharray="4 3"
        />
        <text
          x={svgX + svgW / 2}
          y={svgY + svgH / 2}
          textAnchor="middle"
          dominantBaseline="central"
          fill={color}
          fontSize={8}
          fontWeight="500"
          opacity={0.5}
          fontStyle="italic"
          style={{ userSelect: 'none', pointerEvents: 'none' }}
        >
          {label}
        </text>
      </g>
    );
  }

  // Focused zone: subtle fill + solid stroke + label
  return (
    <g style={{ transition: 'opacity 0.3s ease' }}>
      <rect
        x={svgX}
        y={svgY}
        width={svgW}
        height={svgH}
        rx={4}
        fill={color}
        fillOpacity={0.12}
        stroke={color}
        strokeWidth={1.5}
        strokeOpacity={0.6}
      />
      <text
        x={svgX + svgW / 2}
        y={svgY + svgH / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fill={color}
        fontSize={9}
        fontWeight="600"
        opacity={0.8}
        style={{ userSelect: 'none', pointerEvents: 'none' }}
      >
        {label}
      </text>
    </g>
  );
}
