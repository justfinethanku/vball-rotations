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
  isFocusedZone: boolean;
}

export default function ZoneOverlay({
  x,
  y,
  width,
  height,
  color,
  label,
  isDimmed,
  isFocusedZone,
}: ZoneOverlayProps) {
  // Convert court coordinates to SVG coordinates
  const svgX = COURT_SVG.x + (x / COURT_WIDTH) * COURT_SVG.width;
  const svgY = COURT_SVG.y + (y / COURT_DEPTH) * COURT_SVG.height;
  const svgW = (width / COURT_WIDTH) * COURT_SVG.width;
  const svgH = (height / COURT_DEPTH) * COURT_SVG.height;

  // When another zone is focused, hide completely
  if (isDimmed) {
    return (
      <motion.g
        initial={{ opacity: 0 }}
        animate={{ opacity: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      />
    );
  }

  // Focused zone: subtle fill + solid stroke + label
  if (isFocusedZone) {
    return (
      <motion.g
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
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
      </motion.g>
    );
  }

  // Default (no player focused): dashed outline only
  return (
    <motion.g
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <rect
        x={svgX}
        y={svgY}
        width={svgW}
        height={svgH}
        rx={4}
        fill="none"
        stroke={color}
        strokeWidth={1}
        strokeOpacity={0.3}
        strokeDasharray="4 3"
      />
    </motion.g>
  );
}
