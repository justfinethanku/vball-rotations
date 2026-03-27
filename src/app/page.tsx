'use client';

import { useState, useCallback } from 'react';
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
import { ROLE_COLORS } from '@/lib/constants';
import { Team } from '@/lib/types';

export default function Home() {
  const [setupOpen, setSetupOpen] = useState(false);

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

      {/* Court View */}
      <div className="flex-1 flex flex-col items-center justify-center px-2 py-3 min-h-0">
        <div className="w-full max-w-[450px] relative">
          {/* Rotation label */}
          <div className="text-center mb-2">
            <span className="text-sm text-gray-400">
              Rotation {currentRotation} &middot;{' '}
              <span className="capitalize">{currentPhase}</span>
            </span>
          </div>

          <Court>
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
          </Court>

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

        {/* Position Info (when a role is focused) */}
        {focusedRole && (
          <div className="w-full max-w-[450px] mt-2">
            <PositionInfo
              role={focusedRole}
              rotation={currentRotation}
              phase={currentPhase}
              system={system}
            />
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="border-t border-white/10 bg-gray-900/80 backdrop-blur-sm pb-[env(safe-area-inset-bottom)] sticky bottom-0 z-30">
        <div className="max-w-[500px] mx-auto px-3 py-2 space-y-2">
          {/* Position Filter */}
          <PositionFilter
            focusedRole={focusedRole}
            onToggle={toggleFocusedRole}
            system={system}
          />

          {/* Rotation Selector */}
          <div className="flex justify-center">
            <RotationSelector
              current={currentRotation}
              onChange={setCurrentRotation}
            />
          </div>

          {/* Phase Toggle */}
          <div className="flex justify-center">
            <PhaseToggle current={currentPhase} onChange={setCurrentPhase} />
          </div>

          {/* Playback Controls */}
          <PlaybackControls
            isPlaying={isPlaying}
            speed={speed}
            onTogglePlay={togglePlay}
            onStepForward={stepForward}
            onStepBackward={stepBackward}
            onSpeedChange={setSpeed}
          />
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
