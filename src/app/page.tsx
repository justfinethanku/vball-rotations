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
import { ShareButton } from '@/components/sharing/ShareButton';
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
  const courtRef = useRef<HTMLDivElement>(null);

  const {
    system,
    players,
    teamName,
    setTeamName,
    updatePlayer,
    switchSystem,
    getTeam,
    setPlayers,
  } = useTeam();

  const {
    currentRotation,
    currentPhase,
    focusedRole,
    showZones,
    positions,
    zones,
    previousPositions,
    setCurrentRotation,
    setCurrentPhase,
    setShowZones,
    stepForward,
    stepBackward,
    toggleFocusedRole,
  } = useRotation(players, system);

  const { isPlaying, speed, setSpeed, togglePlay } = useAnimation(stepForward);

  const handleLoadTeam = useCallback(
    (team: Team) => {
      switchSystem(team.system);
      setPlayers(team.players);
      setTeamName(team.name);
    },
    [switchSystem, setPlayers, setTeamName]
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
          } else if (focusedRole !== null) {
            toggleFocusedRole(focusedRole); // clears it
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
  }, [stepForward, stepBackward, togglePlay, focusedRole, toggleFocusedRole, setCurrentRotation, setupOpen, setSetupOpen]);

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
      {showZones &&
        zones.map((zone) => {
          const isDimmed =
            focusedRole !== null && zone.role !== focusedRole;
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
              isFocusedZone={focusedRole !== null && zone.role === focusedRole}
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
          const isDimmed =
            focusedRole !== null && pos.role !== focusedRole;
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
        const isFocused = focusedRole === pos.role;
        const isDimmed =
          focusedRole !== null && pos.role !== focusedRole;
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
            onClick={() => toggleFocusedRole(pos.role)}
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
          <h1 className="text-lg font-bold tracking-tight">
            <span className="text-indigo-400">VBall</span> Rotations
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

          <ShareButton onShare={shareUrl} />

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
        <div className="flex-1 flex flex-col items-center md:items-end px-2 py-3 md:px-0 md:py-0 min-h-0">
          <div ref={courtRef} className="w-full max-w-[450px] md:max-w-[550px] relative">
            {/* Rotation label */}
            <div className="text-center mb-2">
              <span className="text-sm text-gray-400">
                Rotation {currentRotation} &middot;{' '}
                <span className="capitalize">{currentPhase}</span>
              </span>
            </div>

            <Court>{courtContent}</Court>

            {/* Zone toggle */}
            <div className="flex justify-center mt-1">
              <button
                onClick={() => setShowZones(!showZones)}
                className={`text-xs px-3 py-1 rounded-full transition-colors ${
                  showZones
                    ? 'bg-white/15 text-white'
                    : 'bg-white/5 text-gray-500'
                }`}
              >
                {showZones ? 'Hide Zones' : 'Show Zones'}
              </button>
            </div>
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
        <div className="hidden md:flex md:flex-col md:w-[320px] md:flex-shrink-0 md:gap-4 md:py-2">
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
        <div className="max-w-[500px] mx-auto px-3 py-2 space-y-2">
          {/* Row 1: Position Filter */}
          <PositionFilter
            focusedRole={focusedRole}
            onToggle={toggleFocusedRole}
            system={system}
          />

          {/* Row 2: Compact controls - step back, phase toggle, step forward, play, speed */}
          <div className="flex items-center justify-center gap-1.5">
            {/* Step backward */}
            <button
              onClick={stepBackward}
              className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-white hover:bg-white/10 transition-colors"
              aria-label="Step backward"
            >
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {/* Phase toggle (compact) */}
            <div className="flex bg-white/10 rounded-lg p-0.5">
              {(['serve', 'receive', 'transition'] as Phase[]).map((phase) => (
                <button
                  key={phase}
                  onClick={() => setCurrentPhase(phase)}
                  className={`px-2 py-1.5 text-xs font-medium rounded-md transition-colors min-h-[44px] ${
                    currentPhase === phase
                      ? 'bg-indigo-500 text-white'
                      : 'text-gray-300 hover:bg-white/10'
                  }`}
                >
                  {phaseShort[phase]}
                </button>
              ))}
            </div>

            {/* Step forward */}
            <button
              onClick={stepForward}
              className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-white hover:bg-white/10 transition-colors"
              aria-label="Step forward"
            >
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                <path d="M7.5 5L12.5 10L7.5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {/* Divider */}
            <div className="w-px h-6 bg-white/15 mx-0.5" />

            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full bg-indigo-500 text-white hover:bg-indigo-600 transition-colors"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <svg width="18" height="18" viewBox="0 0 22 22" fill="none">
                  <rect x="5" y="4" width="4" height="14" rx="1" fill="currentColor" />
                  <rect x="13" y="4" width="4" height="14" rx="1" fill="currentColor" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 22 22" fill="none">
                  <path d="M6 4L18 11L6 18V4Z" fill="currentColor" />
                </svg>
              )}
            </button>

            {/* Speed cycle button */}
            <button
              onClick={() => {
                const speeds: ('slow' | 'medium' | 'fast')[] = ['slow', 'medium', 'fast'];
                const labels: Record<string, string> = { slow: '0.5x', medium: '1x', fast: '2x' };
                const idx = speeds.indexOf(speed);
                setSpeed(speeds[(idx + 1) % speeds.length]);
              }}
              className="px-2 py-1.5 min-w-[44px] min-h-[44px] flex items-center justify-center text-xs font-medium rounded-lg bg-white/10 text-gray-300 hover:bg-white/20 transition-colors"
              aria-label="Cycle speed"
            >
              {{ slow: '0.5x', medium: '1x', fast: '2x' }[speed]}
            </button>
          </div>

          {/* Rotation selector (compact, below controls) */}
          <div className="flex justify-center">
            <RotationSelector
              current={currentRotation}
              onChange={setCurrentRotation}
            />
          </div>
        </div>
      </div>

      {/* Setup Drawer */}
      <SetupDrawer
        isOpen={setupOpen}
        onClose={() => setSetupOpen(false)}
        players={players}
        teamName={teamName}
        system={system}
        onUpdatePlayer={updatePlayer}
        onTeamNameChange={setTeamName}
        onSystemChange={switchSystem}
      />
    </main>
  );
}
