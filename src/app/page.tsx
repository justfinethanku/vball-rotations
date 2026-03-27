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
    <main className="min-h-dvh flex flex-col">
      {/* Top Bar */}
      <header className="flex items-center justify-between px-3 py-2 border-b border-white/10 bg-gray-900/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <h1 className="text-base font-bold tracking-tight whitespace-nowrap">
            <span className="text-indigo-400">VB</span>all
            <span className="hidden sm:inline"> Rotations</span>
          </h1>
          <span className="text-xs text-gray-500 hidden sm:inline">
            {system.toUpperCase()} System
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* System Toggle */}
          <div className="flex bg-white/10 rounded-lg p-0.5 text-xs">
            <button
              onClick={() => switchSystem('5-1')}
              className={`px-2 py-1 rounded-md font-medium transition-colors ${
                system === '5-1'
                  ? 'bg-indigo-500 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              5-1
            </button>
            <button
              onClick={() => switchSystem('6-2')}
              className={`px-2 py-1 rounded-md font-medium transition-colors ${
                system === '6-2'
                  ? 'bg-indigo-500 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              6-2
            </button>
          </div>

          <ShareButton onShare={shareUrl} teamName={teamName} system={system} />

          <button
            onClick={() => setCompareOpen(true)}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            aria-label="Compare rotations"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="8" height="18" rx="1" />
              <rect x="14" y="3" width="8" height="18" rx="1" />
            </svg>
          </button>

          <button
            onClick={() => setSetupOpen(true)}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            aria-label="Setup team"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:flex-row md:gap-6 md:px-6 md:py-4 md:max-w-[960px] md:mx-auto md:w-full">
        {/* Court Column */}
        <div className="flex-1 flex flex-col items-center md:items-end px-2 py-1 md:px-0 md:py-0">
          <div ref={courtRef} className="w-full max-w-[450px] md:max-w-[550px] relative">
            <Court>{courtContent}</Court>
          </div>

          {/* Position Info (mobile, when a role is focused) */}
          {focusedRole && (
            <div className="w-full max-w-[450px] mt-2 md:hidden">
              <PositionInfo
                role={focusedRole}
                rotation={currentRotation}
                phase={currentPhase}
                system={system}
              />
            </div>
          )}
        </div>

        {/* Side Panel (desktop only) */}
        <div className="hidden md:flex md:flex-col md:w-[280px] md:flex-shrink-0 md:gap-4 md:py-2">
          <PositionFilter
            focusedRole={focusedRole}
            onToggle={toggleFocusedRole}
            system={system}
          />

          <div className="flex justify-center">
            <RotationSelector
              current={currentRotation}
              onChange={setCurrentRotation}
            />
          </div>

          <div className="flex justify-center">
            <PhaseToggle current={currentPhase} onChange={setCurrentPhase} />
          </div>

          <PlaybackControls
            isPlaying={isPlaying}
            speed={speed}
            onTogglePlay={togglePlay}
            onStepForward={stepForward}
            onStepBackward={stepBackward}
            onSpeedChange={setSpeed}
          />

          <ProgressTimeline
            currentRotation={currentRotation}
            currentPhase={currentPhase}
            onJump={handleTimelineJump}
          />

          {focusedRole && (
            <PositionInfo
              role={focusedRole}
              rotation={currentRotation}
              phase={currentPhase}
              system={system}
            />
          )}
        </div>
      </div>

      {/* Bottom Controls (mobile only) */}
      <div className="md:hidden border-t border-white/10 bg-gray-900/80 backdrop-blur-sm pb-[env(safe-area-inset-bottom)] sticky bottom-0 z-30">
        <div className="max-w-[500px] mx-auto px-2 py-1.5 space-y-1.5">
          {/* Row 1: Position Filter */}
          <PositionFilter
            focusedRole={focusedRole}
            onToggle={toggleFocusedRole}
            system={system}
          />

          {/* Row 2: Nav + Rotations + Phase + Play */}
          <div className="flex items-center justify-center gap-1">
            {/* Step backward */}
            <button
              onClick={stepBackward}
              className="p-1.5 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg text-white hover:bg-white/10 transition-colors"
              aria-label="Step backward"
            >
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {/* Compact rotation selector (just numbers) */}
            <div className="flex bg-white/10 rounded-lg p-0.5">
              {([1, 2, 3, 4, 5, 6] as RotationNumber[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setCurrentRotation(r)}
                  className={`w-[28px] h-[28px] text-xs font-medium rounded-md transition-colors ${
                    currentRotation === r
                      ? 'bg-indigo-500 text-white'
                      : 'text-gray-400 hover:bg-white/10'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            {/* Step forward */}
            <button
              onClick={stepForward}
              className="p-1.5 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg text-white hover:bg-white/10 transition-colors"
              aria-label="Step forward"
            >
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                <path d="M7.5 5L12.5 10L7.5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {/* Divider */}
            <div className="w-px h-5 bg-white/15" />

            {/* Phase toggle (compact) */}
            <div className="flex bg-white/10 rounded-lg p-0.5">
              {(['serve', 'receive', 'transition'] as Phase[]).map((phase) => (
                <button
                  key={phase}
                  onClick={() => setCurrentPhase(phase)}
                  className={`px-1.5 py-1 text-[10px] font-medium rounded-md transition-colors min-h-[28px] ${
                    currentPhase === phase
                      ? 'bg-indigo-500 text-white'
                      : 'text-gray-400 hover:bg-white/10'
                  }`}
                >
                  {phaseShort[phase]}
                </button>
              ))}
            </div>

            {/* Divider */}
            <div className="w-px h-5 bg-white/15" />

            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              className="p-1.5 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-full bg-indigo-500 text-white hover:bg-indigo-600 transition-colors"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <svg width="14" height="14" viewBox="0 0 22 22" fill="none">
                  <rect x="5" y="4" width="4" height="14" rx="1" fill="currentColor" />
                  <rect x="13" y="4" width="4" height="14" rx="1" fill="currentColor" />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 22 22" fill="none">
                  <path d="M6 4L18 11L6 18V4Z" fill="currentColor" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Compare View */}
      <CompareView
        isOpen={compareOpen}
        onClose={() => setCompareOpen(false)}
        players={players}
        system={system}
        useLibero={useLibero}
      />

      {/* Setup Drawer */}
      <SetupDrawer
        isOpen={setupOpen}
        onClose={() => setSetupOpen(false)}
        players={players}
        teamName={teamName}
        system={system}
        useLibero={useLibero}
        onUpdatePlayer={updatePlayer}
        onTeamNameChange={setTeamName}
        onSystemChange={switchSystem}
        onUseLiberoChange={setUseLibero}
      />

      {/* Onboarding overlay for first-time users */}
      {showWelcome && (
        <Welcome
          onComplete={() => {
            setShowWelcome(false);
            localStorage.setItem('vball-onboarding-seen', '1');
          }}
        />
      )}
    </main>
  );
}
