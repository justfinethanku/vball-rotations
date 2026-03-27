'use client';

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useTeam } from '@/hooks/useTeam';
import { useRotation } from '@/hooks/useRotation';
import { useAnimation } from '@/hooks/useAnimation';
import { useUrlState } from '@/hooks/useUrlState';
import { usePreferences } from '@/hooks/usePreferences';
import Court from '@/components/court/Court';
import PlayerToken from '@/components/court/PlayerToken';
import MovementArrow from '@/components/court/MovementArrow';
import ZoneOverlay from '@/components/court/ZoneOverlay';
import GhostTrail from '@/components/court/GhostTrail';
import RotationCarousel from '@/components/controls/RotationCarousel';
import PhaseStepper from '@/components/controls/PhaseStepper';
import PlaybackControls from '@/components/controls/PlaybackControls';
import PositionFilter from '@/components/controls/PositionFilter';
import { SetupDrawer } from '@/components/setup/SetupDrawer';
import { CompareView } from '@/components/compare/CompareView';
import { ShareButton } from '@/components/sharing/ShareButton';
import Welcome from '@/components/onboarding/Welcome';
import { PlayerInfoSheet } from '@/components/info/PlayerInfoSheet';
import { HelpPopover } from '@/components/help/HelpPopover';
import { Glossary } from '@/components/help/Glossary';
import { ROLE_COLORS, DEFAULT_PLAYERS, DEFAULT_PLAYERS_62 } from '@/lib/constants';
import { Team, RotationNumber, Phase } from '@/lib/types';

// ─── Swipe hook ────────────────────────────────────────────────
function useSwipe(
  ref: React.RefObject<HTMLElement | null>,
  onSwipeLeft: () => void,
  onSwipeRight: () => void,
  minDistance = 50
) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let startX = 0, startY = 0;
    const onTouchStart = (e: TouchEvent) => { startX = e.touches[0].clientX; startY = e.touches[0].clientY; };
    const onTouchEnd = (e: TouchEvent) => {
      const dx = e.changedTouches[0].clientX - startX;
      const dy = e.changedTouches[0].clientY - startY;
      if (Math.abs(dx) < minDistance || Math.abs(dy) > Math.abs(dx)) return;
      if (dx < 0) onSwipeLeft(); else onSwipeRight();
    };
    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => { el.removeEventListener('touchstart', onTouchStart); el.removeEventListener('touchend', onTouchEnd); };
  }, [ref, onSwipeLeft, onSwipeRight, minDistance]);
}

// ─── Phase descriptions ─────────────────────────────────────────
const PHASE_DESCRIPTIONS: Record<Phase, string> = {
  serve: 'Serve: Players in starting positions for the serve',
  receive: 'Receive: Formation for passing the opponent\'s serve',
  transition: 'Transition: Players shift to attack/defense positions',
};

// ─── Main page ─────────────────────────────────────────────────
export default function Home() {
  const [setupOpen, setSetupOpen] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);
  const [glossaryOpen, setGlossaryOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [phaseDescKey, setPhaseDescKey] = useState(0);
  const courtRef = useRef<HTMLDivElement>(null);

  const prefs = usePreferences();

  useEffect(() => {
    if (!prefs.onboardingSeen) setShowWelcome(true);
  }, [prefs.onboardingSeen]);

  const {
    system, players, teamName, setTeamName, updatePlayer, switchSystem,
    getTeam, setPlayers, useLibero, setUseLibero, variant, setVariant,
  } = useTeam();

  const {
    currentRotation, currentPhase, focusedRole, focusedPlayerId,
    positions, zones, previousPositions, movedPlayers, nextPhasePositions,
    setCurrentRotation, setCurrentPhase, stepForward, stepBackward,
    toggleFocusedRole, toggleFocusedPlayer,
  } = useRotation(players, system, useLibero, variant);

  const { isPlaying, speed, setSpeed, togglePlay } = useAnimation(stepForward);

  // Track phase changes for description animation
  const prevPhaseRef = useRef(currentPhase);
  useEffect(() => {
    if (prevPhaseRef.current !== currentPhase) {
      prevPhaseRef.current = currentPhase;
      setPhaseDescKey(k => k + 1);
    }
  }, [currentPhase]);

  const handleLoadTeam = useCallback((team: Team) => {
    switchSystem(team.system);
    setPlayers(team.players);
    setTeamName(team.name);
    setUseLibero(team.useLibero ?? true);
  }, [switchSystem, setPlayers, setTeamName, setUseLibero]);

  const { shareUrl } = useUrlState(getTeam, handleLoadTeam);

  useSwipe(courtRef, stepForward, stepBackward);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) return;
      switch (e.key) {
        case 'ArrowLeft': e.preventDefault(); stepBackward(); break;
        case 'ArrowRight': e.preventDefault(); stepForward(); break;
        case ' ': e.preventDefault(); togglePlay(); break;
        case 'Escape':
          if (setupOpen) setSetupOpen(false);
          else if (glossaryOpen) setGlossaryOpen(false);
          else if (focusedRole) toggleFocusedRole(focusedRole);
          break;
        case '1': case '2': case '3': case '4': case '5': case '6':
          setCurrentRotation(parseInt(e.key) as RotationNumber); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [stepForward, stepBackward, togglePlay, focusedRole, toggleFocusedRole, setCurrentRotation, setupOpen, glossaryOpen]);

  const handleResetPlayers = useCallback(() => {
    setPlayers([...(system === '6-2' ? DEFAULT_PLAYERS_62 : DEFAULT_PLAYERS)]);
  }, [system, setPlayers]);

  const handleReplayOnboarding = useCallback(() => {
    setSetupOpen(false);
    setShowWelcome(true);
  }, []);

  // Focused player data for info sheet
  const focusedPosition = focusedPlayerId ? positions.find(p => p.playerId === focusedPlayerId) ?? null : null;
  const focusedNextPosition = focusedPlayerId && nextPhasePositions
    ? nextPhasePositions.find(p => p.playerId === focusedPlayerId) ?? null : null;
  const focusedPlayer = focusedPlayerId ? players.find(p => p.id === focusedPlayerId) ?? null : null;

  // Ghost trails
  const ghostTrails = useMemo(() => {
    if (!previousPositions || prefs.reduceMotion) return [];
    return positions
      .map(pos => {
        const prev = previousPositions.find(p => p.playerId === pos.playerId);
        if (!prev) return null;
        const dx = Math.abs(pos.position.x - prev.position.x);
        const dy = Math.abs(pos.position.y - prev.position.y);
        if (dx < 0.3 && dy < 0.3) return null;
        return { from: prev.position, to: pos.position, role: pos.role, id: pos.playerId };
      })
      .filter(Boolean) as { from: { x: number; y: number }; to: { x: number; y: number }; role: typeof positions[0]['role']; id: string }[];
  }, [positions, previousPositions, prefs.reduceMotion]);

  // Court content
  const courtContent = (
    <>
      {/* Zone overlays */}
      {zones.map(zone => {
        const isZoneFocused = focusedPlayerId
          ? zone.playerId === focusedPlayerId
          : focusedRole !== null && zone.role === focusedRole;
        const isDimmed = focusedPlayerId
          ? zone.playerId !== focusedPlayerId
          : focusedRole !== null && zone.role !== focusedRole;
        return (
          <ZoneOverlay key={`zone-${zone.playerId}`}
            x={zone.x} y={zone.y} width={zone.width} height={zone.height}
            color={ROLE_COLORS[zone.role]} label={zone.label}
            isDimmed={isDimmed} isFocusedZone={isZoneFocused} />
        );
      })}

      {/* Ghost trails */}
      {ghostTrails.map(trail => (
        <GhostTrail key={`ghost-${trail.id}-${phaseDescKey}`}
          from={trail.from} to={trail.to} role={trail.role}
          reduceMotion={prefs.reduceMotion} />
      ))}

      {/* Movement arrows */}
      {previousPositions && positions.map(pos => {
        const prevPos = previousPositions.find(p => p.playerId === pos.playerId);
        if (!prevPos) return null;
        const dx = Math.abs(pos.position.x - prevPos.position.x);
        const dy = Math.abs(pos.position.y - prevPos.position.y);
        if (dx < 0.3 && dy < 0.3) return null;
        const isDimmed = focusedPlayerId
          ? pos.playerId !== focusedPlayerId
          : focusedRole !== null && pos.role !== focusedRole;
        return (
          <MovementArrow key={`arrow-${pos.playerId}`}
            from={prevPos.position} to={pos.position}
            color={ROLE_COLORS[pos.role]} isDimmed={isDimmed} />
        );
      })}

      {/* Player tokens */}
      {positions.map(pos => {
        const player = players.find(p => p.id === pos.playerId);
        if (!player) return null;
        const isFocused = focusedPlayerId
          ? pos.playerId === focusedPlayerId
          : focusedRole === pos.role;
        const isDimmed = focusedPlayerId
          ? pos.playerId !== focusedPlayerId
          : focusedRole !== null && pos.role !== focusedRole;
        return (
          <PlayerToken key={pos.playerId}
            playerId={pos.playerId} name={player.name} number={player.number}
            role={pos.role} position={pos.position}
            isFocused={isFocused} isDimmed={isDimmed}
            displayMode={prefs.tokenDisplayMode}
            onClick={() => toggleFocusedPlayer(pos.playerId, pos.role)} />
        );
      })}
    </>
  );

  return (
    <main className="h-dvh flex flex-col overflow-hidden bg-gray-950">
      {/* ── Header ── */}
      <header className="glass border-b border-white/5 px-3 py-1.5 flex items-center justify-between z-30 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <span className="text-[10px] font-black text-white">V</span>
          </div>
          <span className="text-sm font-semibold tracking-tight text-white">
            VBall<span className="text-indigo-300 hidden sm:inline"> Rotations</span>
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button onClick={prefs.cycleTokenDisplayMode}
            className="focus-ring p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 btn-press transition-all"
            aria-label={`Display: ${prefs.tokenDisplayMode}`} title={`Showing: ${prefs.tokenDisplayMode}`}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>
            </svg>
          </button>
          <button onClick={() => setGlossaryOpen(true)}
            className="focus-ring p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 btn-press transition-all"
            aria-label="Glossary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            </svg>
          </button>
          <ShareButton onShare={shareUrl} teamName={teamName} system={system} />
          <button onClick={() => setCompareOpen(true)}
            className="focus-ring p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 btn-press transition-all"
            aria-label="Compare">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="8" height="18" rx="1"/><rect x="14" y="3" width="8" height="18" rx="1"/></svg>
          </button>
          <button onClick={() => setSetupOpen(true)}
            className="focus-ring p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 btn-press transition-all"
            aria-label="Settings">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
          </button>
        </div>
      </header>

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">

        {/* ── Court Area ── */}
        <div className="flex-1 relative overflow-hidden flex items-center justify-center" ref={courtRef}>
          {/* State pill */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
            <div className="glass rounded-full px-4 py-1.5 border border-white/10 shadow-lg shadow-black/20 flex items-center gap-2">
              <span className="text-xs font-bold text-indigo-300">R{currentRotation}</span>
              <span className="w-px h-3 bg-white/20" />
              <span className="text-xs font-medium text-white/90 capitalize">{currentPhase}</span>
              <span className="w-px h-3 bg-white/20" />
              <span className="text-[10px] text-gray-400">{system}</span>
              {variant !== 'standard' && (
                <>
                  <span className="w-px h-3 bg-white/20" />
                  <span className="text-[10px] text-indigo-400 capitalize">{variant}</span>
                </>
              )}
            </div>
          </div>

          {/* Phase description */}
          {prefs.learnMode ? (
            <div className="absolute top-12 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
              <div className="glass rounded-lg px-3 py-1 border border-white/10 text-xs text-gray-300">
                {PHASE_DESCRIPTIONS[currentPhase]}
              </div>
            </div>
          ) : (
            <div key={phaseDescKey} className="absolute top-12 left-1/2 -translate-x-1/2 z-20 pointer-events-none phase-description">
              <div className="glass rounded-lg px-3 py-1 border border-white/10 text-xs text-gray-300">
                {PHASE_DESCRIPTIONS[currentPhase]}
              </div>
            </div>
          )}

          {/* Court SVG */}
          <div className="w-full h-full flex items-center justify-center px-1 md:p-4"
            style={prefs.courtFlipped ? { transform: 'scaleY(-1)' } : undefined}>
            <div className="w-full max-w-[900px]">
              <Court>{courtContent}</Court>
            </div>
          </div>

          {/* ── Mobile floating controls ── */}
          <div className="md:hidden absolute bottom-0 inset-x-0 z-20 fade-up pt-16 pb-safe pointer-events-none">
            <div className="px-4 space-y-2.5 pointer-events-auto">
              <div className="flex items-center justify-center gap-2">
                <button onClick={stepBackward}
                  className="focus-ring w-11 h-11 rounded-full text-white/70 hover:text-white hover:bg-white/10 btn-press flex items-center justify-center"
                  aria-label="Previous">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
                <RotationCarousel current={currentRotation} onChange={setCurrentRotation} system={system} compact />
                <button onClick={stepForward}
                  className="focus-ring w-11 h-11 rounded-full text-white/70 hover:text-white hover:bg-white/10 btn-press flex items-center justify-center"
                  aria-label="Next">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M7.5 5L12.5 10L7.5 15" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              </div>
              <div className="flex items-center justify-center gap-3">
                <PhaseStepper current={currentPhase} onChange={setCurrentPhase} movedCount={movedPlayers} compact />
                <button onClick={togglePlay}
                  className="focus-ring w-11 h-11 rounded-full bg-indigo-500 text-white flex items-center justify-center btn-press shadow-lg shadow-indigo-500/40 hover:bg-indigo-400 transition-all"
                  aria-label={isPlaying ? 'Pause' : 'Play'}>
                  {isPlaying ? (
                    <svg width="16" height="16" viewBox="0 0 22 22" fill="none"><rect x="5" y="4" width="4" height="14" rx="1" fill="currentColor"/><rect x="13" y="4" width="4" height="14" rx="1" fill="currentColor"/></svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 22 22" fill="none"><path d="M7 4L17 11L7 18V4Z" fill="currentColor"/></svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Player Info — mobile */}
          {focusedRole && (
            <div className="md:hidden absolute bottom-40 left-2 right-2 z-20">
              <PlayerInfoSheet
                player={focusedPlayer} role={focusedRole}
                rotation={currentRotation} phase={currentPhase} system={system}
                position={focusedPosition} nextPhasePosition={focusedNextPosition}
                onClose={() => toggleFocusedRole(focusedRole)} />
            </div>
          )}
        </div>

        {/* ── Side Panel (desktop) ── */}
        <div className="hidden md:flex md:flex-col md:w-[300px] md:shrink-0 border-l border-white/5 glass overflow-y-auto">
          <div className="p-4 space-y-4">
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="text-xs uppercase tracking-wider text-gray-500 font-medium">Position</span>
                <HelpPopover id="help-positions" title="What are positions?"
                  content="Each player has a role: Setter runs the offense, Outside Hitters attack from the left, Middle Blockers are quick attackers and primary blockers, Opposite attacks from the right, and the Libero is a defensive specialist."
                  dismissed={prefs.dismissedHelp.includes('help-positions')}
                  onDismiss={prefs.dismissHelp} />
              </div>
              <PositionFilter focusedRole={focusedRole} onToggle={toggleFocusedRole} system={system} />
            </div>

            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="text-xs uppercase tracking-wider text-gray-500 font-medium">Rotation</span>
                <HelpPopover id="help-rotations" title="What are rotations?"
                  content="There are 6 rotations in volleyball. Teams rotate clockwise each time they win serve back. Each rotation determines the serving order and which players are in the front vs back row."
                  dismissed={prefs.dismissedHelp.includes('help-rotations')}
                  onDismiss={prefs.dismissHelp} />
              </div>
              <RotationCarousel current={currentRotation} onChange={setCurrentRotation} system={system} />
            </div>

            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="text-xs uppercase tracking-wider text-gray-500 font-medium">Phase</span>
                <HelpPopover id="help-phases" title="What are phases?"
                  content="Each rotation has 3 phases. Serve: where players stand for the serve. Receive: formation for passing. Transition: where players move to attack or defend after the ball is in play."
                  dismissed={prefs.dismissedHelp.includes('help-phases')}
                  onDismiss={prefs.dismissHelp} />
              </div>
              <PhaseStepper current={currentPhase} onChange={setCurrentPhase} movedCount={movedPlayers} />
            </div>

            <PlaybackControls isPlaying={isPlaying} speed={speed}
              onTogglePlay={togglePlay} onStepForward={stepForward} onStepBackward={stepBackward}
              onSpeedChange={setSpeed} />

            {focusedRole && (
              <PlayerInfoSheet
                player={focusedPlayer} role={focusedRole}
                rotation={currentRotation} phase={currentPhase} system={system}
                position={focusedPosition} nextPhasePosition={focusedNextPosition}
                onClose={() => toggleFocusedRole(focusedRole)} />
            )}
          </div>
        </div>
      </div>

      {/* ── Modals ── */}
      <CompareView isOpen={compareOpen} onClose={() => setCompareOpen(false)} players={players} system={system} useLibero={useLibero} />
      <SetupDrawer isOpen={setupOpen} onClose={() => setSetupOpen(false)}
        players={players} teamName={teamName} system={system} useLibero={useLibero}
        variant={variant} tokenDisplayMode={prefs.tokenDisplayMode}
        reduceMotion={prefs.reduceMotion} learnMode={prefs.learnMode} courtFlipped={prefs.courtFlipped}
        onUpdatePlayer={updatePlayer} onTeamNameChange={setTeamName}
        onSystemChange={switchSystem} onUseLiberoChange={setUseLibero}
        onVariantChange={setVariant} onTokenDisplayModeChange={prefs.setTokenDisplayMode}
        onReduceMotionToggle={prefs.toggleReduceMotion} onLearnModeToggle={prefs.toggleLearnMode}
        onCourtFlipToggle={prefs.toggleCourtFlipped}
        onResetPlayers={handleResetPlayers} onReplayOnboarding={handleReplayOnboarding} />
      <Glossary isOpen={glossaryOpen} onClose={() => setGlossaryOpen(false)} />
      {showWelcome && (
        <Welcome onComplete={() => { setShowWelcome(false); prefs.markOnboardingSeen(); }} />
      )}
    </main>
  );
}
