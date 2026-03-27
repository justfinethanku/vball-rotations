'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { COURT_SVG, COURT_WIDTH, COURT_DEPTH } from '@/lib/constants';

interface ZoneOverlayProps {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  label: string;
  isDimmed: boolean;
}

export default function ZoneOverlay({
  x,
  y,
  width,
  height,
  color,
  label,
  isDimmed,
}: ZoneOverlayProps) {
  // Convert court coordinates to SVG coordinates
  const svgX = COURT_SVG.x + (x / COURT_WIDTH) * COURT_SVG.width;
  const svgY = COURT_SVG.y + (y / COURT_DEPTH) * COURT_SVG.height;
  const svgW = (width / COURT_WIDTH) * COURT_SVG.width;
  const svgH = (height / COURT_DEPTH) * COURT_SVG.height;

  const fillOpacity = isDimmed ? 0.03 : 0.08;
  const strokeOpacity = isDimmed ? 0.08 : 0.3;

  return (
    <motion.g
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Zone rectangle */}
      <rect
        x={svgX}
        y={svgY}
        width={svgW}
        height={svgH}
        rx={4}
        fill={color}
        fillOpacity={fillOpacity}
        stroke={color}
        strokeWidth={1}
        strokeOpacity={strokeOpacity}
      />

      {/* Zone label */}
      <text
        x={svgX + svgW / 2}
        y={svgY + svgH / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fill={color}
        fontSize={9}
        fontWeight="600"
        opacity={isDimmed ? 0.2 : 0.8}
        style={{ userSelect: 'none', pointerEvents: 'none' }}
      >
        {label}
      </text>
    </motion.g>
  );
}
