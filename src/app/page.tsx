'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useTeam } from '@/hooks/useTeam';
import { useRotation } from '@/hooks/useRotation';
import { useAnimation } from '@/hooks/useAnimation';
import { useUrlState } from '@/hooks/useUrlState';
import Court from '@/components/court/Court';
import PlayerToken from '@/components/court/PlayerToken';
import MovementArrow from '@/components/court/MovementArrow';
import ZoneOverlay from '@/components/court/ZoneOverlay';
import RotationSelector from '@/components/controls/RotationSelector';
import PhaseToggle from '@/components/controls/PhaseToggle';
import PlaybackControls from '@/components/controls/PlaybackControls';
import PositionFilter from '@/components/controls/PositionFilter';
import { SetupDrawer } from '@/components/setup/SetupDrawer';
import { CompareView } from '@/components/compare/CompareView';
import { ShareButton } from '@/components/sharing/ShareButton';
import Welcome from '@/components/onboarding/Welcome';
import { PositionInfo } from '@/components/info/PositionInfo';
import { ProgressTimeline } from '@/components/controls/ProgressTimeline';
import { ROLE_COLORS } from '@/lib/constants';
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

    let startX = 0;
    let startY = 0;

    const onTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    };

    const onTouchEnd = (e: TouchEvent) => {
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const dx = endX - startX;
      const dy = endY - startY;

      // Only horizontal swipes (ignore vertical)
      if (Math.abs(dx) < minDistance || Math.abs(dy) > Math.abs(dx)) return;

      if (dx < 0) {
        onSwipeLeft();
      } else {
        onSwipeRight();
      }
    };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, [ref, onSwipeLeft, onSwipeRight, minDistance]);
}

// ─── Phase short labels for compact mobile ─────────────────────
const phaseShort: Record<Phase, string> = {
  serve: 'Srv',
  receive: 'Rcv',
  transition: 'Trans',
};

// ─── Main page ─────────────────────────────────────────────────
export default function Home() {
  const [setupOpen, setSetupOpen] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const courtRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && !localStorage.getItem('vball-onboarding-seen')) {
      setShowWelcome(true);
    }
  }, []);

  const {
    system,
    players,
    teamName,
    setTeamName,
    updatePlayer,
    switchSystem,
    getTeam,
    setPlayers,
    useLibero,
    setUseLibero,
  } = useTeam();

  const {
    currentRotation,
    currentPhase,
    focusedRole,
    focusedPlayerId,
    positions,
    zones,
    previousPositions,
    setCurrentRotation,
    setCurrentPhase,
    stepForward,
    stepBackward,
    toggleFocusedRole,
    toggleFocusedPlayer,
  } = useRotation(players, system, useLibero);

  const { isPlaying, speed, setSpeed, togglePlay } = useAnimation(stepForward);

  const handleLoadTeam = useCallback(
    (team: Team) => {
      switchSystem(team.system);
      setPlayers(team.players);
      setTeamName(team.name);
      setUseLibero(team.useLibero ?? true);
    },
    [switchSystem, setPlayers, setTeamName, setUseLibero]
  );

  const { shareUrl } = useUrlState(getTeam, handleLoadTeam);

  // ─── Swipe gestures on court ─────────────────────────────────
  useSwipe(courtRef, stepForward, stepBackward);

  // ─── Keyboard navigation ─────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture keys when typing in inputs
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          stepBackward();
          break;
        case 'ArrowRight':
          e.preventDefault();
          stepForward();
          break;
        case ' ':
          e.preventDefault();
          togglePlay();
          break;
        case 'Escape':
          if (setupOpen) {
            setSetupOpen(false);
          } else if (focusedPlayerId !== null || focusedRole !== null) {
            if (focusedRole) toggleFocusedRole(focusedRole); // clears both
          }
          break;
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
          setCurrentRotation(parseInt(e.key) as RotationNumber);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [stepForward, stepBackward, togglePlay, focusedRole, focusedPlayerId, toggleFocusedRole, setCurrentRotation, setupOpen, setSetupOpen]);

  // ─── Timeline jump handler ───────────────────────────────────
  const handleTimelineJump = useCallback(
    (rotation: RotationNumber, phase: Phase) => {
      setCurrentRotation(rotation);
      setCurrentPhase(phase);
    },
    [setCurrentRotation, setCurrentPhase]
  );

  // ─── Shared court rendering ──────────────────────────────────
  const courtContent = (
    <>
      {/* Zone overlays (rendered first, behind players) */}
      {zones.map((zone) => {
          // When a specific player is focused, only show that player's zone
          const isZoneFocused = focusedPlayerId
            ? zone.playerId === focusedPlayerId
            : focusedRole !== null && zone.role === focusedRole;
          const isDimmed = focusedPlayerId
            ? zone.playerId !== focusedPlayerId
            : focusedRole !== null && zone.role !== focusedRole;
          return (
            <ZoneOverlay
              key={`zone-${zone.playerId}`}
              x={zone.x}
              y={zone.y}
              width={zone.width}
              height={zone.height}
              color={ROLE_COLORS[zone.role]}
              label={zone.label}
              isDimmed={isDimmed}
              isFocusedZone={isZoneFocused}
            />
          );
        })}

      {/* Movement arrows */}
      {previousPositions &&
        positions.map((pos) => {
          const prevPos = previousPositions.find(
            (p) => p.playerId === pos.playerId
          );
          if (!prevPos) return null;
          const dx = Math.abs(pos.position.x - prevPos.position.x);
          const dy = Math.abs(pos.position.y - prevPos.position.y);
          if (dx < 0.3 && dy < 0.3) return null;
          const isDimmed = focusedPlayerId
            ? pos.playerId !== focusedPlayerId
            : focusedRole !== null && pos.role !== focusedRole;
          return (
            <MovementArrow
              key={`arrow-${pos.playerId}`}
              from={prevPos.position}
              to={pos.position}
              color={ROLE_COLORS[pos.role]}
              isDimmed={isDimmed}
            />
          );
        })}

      {/* Player tokens */}
      {positions.map((pos) => {
        const player = players.find((p) => p.id === pos.playerId);
        if (!player) return null;
        // When a specific player is focused, only THAT player gets "YOU"
        const isFocused = focusedPlayerId
          ? pos.playerId === focusedPlayerId
          : focusedRole === pos.role;
        const isDimmed = focusedPlayerId
          ? pos.playerId !== focusedPlayerId
          : focusedRole !== null && pos.role !== focusedRole;
        return (
          <PlayerToken
            key={pos.playerId}
            playerId={pos.playerId}
            name={player.name}
            number={player.number}
            role={pos.role}
            position={pos.position}
            isFocused={isFocused}
            isDimmed={isDimmed}
            onClick={() => toggleFocusedPlayer(pos.playerId, pos.role)}
          />
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
            VBall<span className="text-indigo-400 hidden sm:inline"> Rotations</span>
          </span>
        </div>

        <div className="absolute left-1/2 -translate-x-1/2 flex bg-white/8 rounded-full p-0.5">
          {(['5-1', '6-2'] as const).map(s => (
            <button
              key={s}
              onClick={() => switchSystem(s)}
              className={`px-3 py-0.5 rounded-full text-xs font-bold btn-press transition-all ${
                system === s ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/30' : 'text-gray-400 hover:text-white'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1">
          <ShareButton onShare={shareUrl} teamName={teamName} system={system} />
          <button onClick={() => setCompareOpen(true)} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 btn-press transition-all" aria-label="Compare">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="8" height="18" rx="1"/><rect x="14" y="3" width="8" height="18" rx="1"/></svg>
          </button>
          <button onClick={() => setSetupOpen(true)} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 btn-press transition-all" aria-label="Setup">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          </button>
        </div>
      </header>

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">

        {/* ── Court Area ── */}
        <div className="flex-1 relative overflow-hidden flex items-center justify-center" ref={courtRef}>
          {/* Floating state banner (mobile) */}
          <div className="md:hidden absolute top-2 left-1/2 -translate-x-1/2 z-20">
            <div className="glass rounded-full px-4 py-1 border border-white/10 shadow-lg shadow-black/20 flex items-center gap-2">
              <span className="text-xs font-bold text-indigo-400">R{currentRotation}</span>
              <span className="w-px h-3 bg-white/20" />
              <span className="text-xs font-medium text-white/90 capitalize">{currentPhase}</span>
            </div>
          </div>

          {/* Court SVG — fills the space */}
          <div className="w-full h-full flex items-center justify-center p-2 md:p-4">
            <div className="w-full max-w-[640px]">
              <Court>{courtContent}</Court>
            </div>
          </div>

          {/* Floating controls (mobile only) — gradient fade over court bottom */}
          <div className="md:hidden absolute bottom-0 inset-x-0 z-20 fade-up pt-16 pb-safe">
            <div className="px-3 space-y-1.5">
              {/* Position filter pills */}
              <div className="flex gap-1.5 justify-center">
                <PositionFilter focusedRole={focusedRole} onToggle={toggleFocusedRole} system={system} />
              </div>

              {/* Control row: nav + rotation + phase dots + play */}
              <div className="flex items-center justify-center gap-1.5">
                <button onClick={stepBackward} className="p-1.5 rounded-full text-white/60 hover:text-white hover:bg-white/10 btn-press" aria-label="Back">
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>

                <div className="flex bg-white/10 rounded-full p-0.5">
                  {([1,2,3,4,5,6] as RotationNumber[]).map(r => (
                    <button key={r} onClick={() => setCurrentRotation(r)}
                      className={`w-7 h-7 rounded-full text-xs font-bold btn-press transition-all ${
                        currentRotation === r ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/30' : 'text-gray-400'
                      }`}>{r}</button>
                  ))}
                </div>

                <button onClick={stepForward} className="p-1.5 rounded-full text-white/60 hover:text-white hover:bg-white/10 btn-press" aria-label="Forward">
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M7.5 5L12.5 10L7.5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>

                <div className="w-px h-4 bg-white/10" />

                {/* Phase dots */}
                <div className="flex items-center gap-1">
                  {(['serve','receive','transition'] as Phase[]).map(p => (
                    <button key={p} onClick={() => setCurrentPhase(p)}
                      className={`btn-press transition-all ${
                        currentPhase === p ? 'w-6 h-2 rounded-full bg-indigo-400' : 'w-2 h-2 rounded-full bg-white/25 hover:bg-white/40'
                      }`}
                      title={p}
                      aria-label={p}
                    />
                  ))}
                </div>

                <div className="w-px h-4 bg-white/10" />

                <button onClick={togglePlay}
                  className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center btn-press shadow-lg shadow-indigo-500/30 hover:bg-indigo-400 transition-all"
                  aria-label={isPlaying ? 'Pause' : 'Play'}>
                  {isPlaying ? (
                    <svg width="12" height="12" viewBox="0 0 22 22" fill="none"><rect x="5" y="4" width="4" height="14" rx="1" fill="currentColor"/><rect x="13" y="4" width="4" height="14" rx="1" fill="currentColor"/></svg>
                  ) : (
                    <svg width="12" height="12" viewBox="0 0 22 22" fill="none"><path d="M7 4L17 11L7 18V4Z" fill="currentColor"/></svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Position Info overlay (mobile, when focused) */}
          {focusedRole && (
            <div className="md:hidden absolute top-12 left-2 right-2 z-20">
              <PositionInfo role={focusedRole} rotation={currentRotation} phase={currentPhase} system={system} />
            </div>
          )}
        </div>

        {/* ── Side Panel (desktop only) ── */}
        <div className="hidden md:flex md:flex-col md:w-[300px] md:shrink-0 border-l border-white/5 glass overflow-y-auto">
          <div className="p-4 space-y-4">
            {/* State card */}
            <div className="rounded-xl bg-gradient-to-br from-indigo-500/15 to-purple-500/10 border border-indigo-500/15 p-4 text-center">
              <div className="text-3xl font-black text-white tracking-tight">R{currentRotation}</div>
              <div className="text-sm font-medium text-indigo-300 capitalize mt-0.5">{currentPhase}</div>
            </div>

            {/* Position filter */}
            <div>
              <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-1.5">Position</div>
              <PositionFilter focusedRole={focusedRole} onToggle={toggleFocusedRole} system={system} />
            </div>

            {/* Rotation selector */}
            <div>
              <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-1.5">Rotation</div>
              <RotationSelector current={currentRotation} onChange={setCurrentRotation} />
            </div>

            {/* Phase toggle */}
            <div>
              <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-1.5">Phase</div>
              <PhaseToggle current={currentPhase} onChange={setCurrentPhase} />
            </div>

            {/* Playback */}
            <PlaybackControls isPlaying={isPlaying} speed={speed} onTogglePlay={togglePlay} onStepForward={stepForward} onStepBackward={stepBackward} onSpeedChange={setSpeed} />

            {/* Progress */}
            <ProgressTimeline currentRotation={currentRotation} currentPhase={currentPhase} onJump={handleTimelineJump} />

            {/* Position info */}
            {focusedRole && (
              <PositionInfo role={focusedRole} rotation={currentRotation} phase={currentPhase} system={system} />
            )}
          </div>
        </div>
      </div>

      {/* Modals/Drawers (unchanged) */}
      <CompareView isOpen={compareOpen} onClose={() => setCompareOpen(false)} players={players} system={system} useLibero={useLibero} />
      <SetupDrawer isOpen={setupOpen} onClose={() => setSetupOpen(false)} players={players} teamName={teamName} system={system} useLibero={useLibero} onUpdatePlayer={updatePlayer} onTeamNameChange={setTeamName} onSystemChange={switchSystem} onUseLiberoChange={setUseLibero} />
      {showWelcome && <Welcome onComplete={() => { setShowWelcome(false); localStorage.setItem('vball-onboarding-seen', '1'); }} />}
    </main>
  );
}
