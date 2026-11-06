'use client';

import { Modal } from '@/components/Modal';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface GlossaryProps {
  isOpen: boolean;
  onClose: () => void;
}

const TERMS = [
  { term: 'Rotation', definition: 'One of 6 positions in the serve order. Teams rotate clockwise each time they win serve back from the opponent.' },
  { term: 'Phase', definition: 'Each rotation has 3 phases: Serve (starting positions), Receive (where players pass from), and Transition (where players move to attack/defend).' },
  { term: 'Setter (S)', definition: 'The playmaker who delivers the ball to hitters. In a 5-1, one setter plays all rotations. In a 6-2, two setters alternate.' },
  { term: 'Outside Hitter (OH)', definition: 'Primary attacker from the left side (zone 4). Also a key passer in serve receive.' },
  { term: 'Middle Blocker (MB)', definition: 'Quick attacker at the net who runs fast-tempo sets. Also the primary blocker on defense.' },
  { term: 'Opposite (OPP)', definition: 'Right-side attacker (zone 2) who plays opposite the setter in the rotation. In a 6-2, this role doesn\'t exist.' },
  { term: 'Libero (L)', definition: 'Defensive specialist who wears a different jersey. Cannot attack above the net or set from in front of the attack line. Substitutes freely for back-row players.' },
  { term: 'Front Row', definition: 'The 3 players closest to the net (zones 2, 3, 4). Only front-row players can attack above the net at the net.' },
  { term: 'Back Row', definition: 'The 3 players farthest from the net (zones 1, 5, 6). Can only attack from behind the 3-meter line.' },
  { term: 'Overlap', definition: 'An illegal positioning fault. Adjacent players in the serve order must maintain correct left-right and front-back relationships until the serve is contacted.' },
  { term: '5-1 System', definition: 'Offensive system with 1 setter and 5 hitters. The setter sets from all rotations, penetrating from the back row when needed. Has several variants that change how players position in transition.' },
  { term: '5-1 Standard', definition: 'The traditional 5-1 offense. The setter penetrates to the right side (zone 2/3) and runs a balanced attack with outside, middle, and right-side options.' },
  { term: '5-1 Spread', definition: 'Outsides push wider toward the antennas and middles run faster tempo. Creates more space between attackers, stretching the opposing block and opening up seams.' },
  { term: '5-1 Slide-Heavy', definition: 'The middle blocker runs slide attacks behind the setter instead of quick sets in front. Effective against teams that commit-block the middle.' },
  { term: '5-1 Reverse', definition: 'The setter penetrates to the left side (zone 4) instead of the traditional right side. Flips the offense — the outside hitter attacks from the right and the opposite from the left.' },
  { term: '6-2 System', definition: 'Offensive system with 2 setters. The back-row setter always sets, giving 3 front-row attackers in every rotation.' },
  { term: 'Penetration', definition: 'When the setter moves from their back-row position to the net to run the offense after the serve is contacted.' },
  { term: 'Zone', definition: 'Court positions numbered 1-6. Zone 1 is back-right, going counter-clockwise: 2 (front-right), 3 (front-center), 4 (front-left), 5 (back-left), 6 (back-center).' },
  { term: 'Attack Line', definition: 'The 3-meter line. Back-row players must jump from behind this line to attack above the net.' },
];

export function Glossary({ isOpen, onClose }: GlossaryProps) {
  const [search, setSearch] = useState('');

  const filtered = search
    ? TERMS.filter(t =>
        t.term.toLowerCase().includes(search.toLowerCase()) ||
        t.definition.toLowerCase().includes(search.toLowerCase())
      )
    : TERMS;

  return (
    <Modal isOpen={isOpen} onClose={onClose} label="Volleyball Glossary">
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div className="fixed inset-0 z-40 bg-black/60"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} />
          <motion.div
            className="fixed inset-0 z-50 flex flex-col bg-gray-900 md:inset-4 md:rounded-2xl md:m-auto md:max-w-lg md:max-h-[80vh]"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <h2 className="text-lg font-bold text-white">Volleyball Glossary</h2>
              <button onClick={onClose}
                className="focus-ring p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Close glossary">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="px-5 py-3">
              <input aria-label="Search glossary terms" type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search terms..."
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-indigo-500 transition-colors" />
            </div>
            <div className="flex-1 overflow-y-auto px-5 pb-6">
              {/* Court legend */}
              {!search && (
                <div className="rounded-lg bg-white/5 p-3 mb-4">
                  <h3 className="text-sm font-semibold text-indigo-300 mb-2">Court Legend</h3>
                  <div className="flex items-center gap-4 text-xs text-gray-300">
                    <span className="flex items-center gap-1.5">
                      <span className="inline-block w-3 h-3 rounded-full border-2 border-gray-400" />
                      Front row
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="inline-block w-3 h-3 rounded-full border-2 border-dashed border-gray-400" />
                      Back row
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="inline-block w-3 h-3 border-2 border-gray-400" style={{ borderRadius: 3 }} />
                      Libero
                    </span>
                  </div>
                </div>
              )}
              <div className="space-y-3">
                {filtered.map(({ term, definition }) => (
                  <div key={term} className="rounded-lg bg-white/5 p-3">
                    <h3 className="text-sm font-semibold text-indigo-300">{term}</h3>
                    <p className="mt-1 text-xs text-gray-300 leading-relaxed">{definition}</p>
                  </div>
                ))}
                {filtered.length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-4">No matching terms</p>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
    </Modal>
  );
}
