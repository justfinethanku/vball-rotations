import type { PlayerRole, RotationNumber, Phase, RotationSystem } from '@/lib/types';

export interface PositionTip {
  responsibility: string;
  tip: string;
}

type TipKey = `${RotationSystem}-${RotationNumber}-${Phase}-${PlayerRole}`;

const positionTips: Partial<Record<TipKey, PositionTip>> = {
  // ── 5-1 Rotation 1 ─────────────────────────────────────────────────
  // Setter is back row (right-back), must penetrate to front-right to set.
  '5-1-1-serve-setter': {
    responsibility: 'Serve then penetrate to the net to set.',
    tip: 'After your serve, sprint to the right-front area so you arrive before the pass. Stay low through the transition.',
  },
  '5-1-1-receive-setter': {
    responsibility: 'Penetrate from right-back to the net to set.',
    tip: 'Start behind the right-front player and release to the net as soon as the server contacts the ball.',
  },
  '5-1-1-transition-setter': {
    responsibility: 'Set every ball from the front-right area.',
    tip: 'After your team digs, get to your target spot near the right antenna quickly and square your shoulders to zone 4.',
  },

  '5-1-1-serve-outside': {
    responsibility: 'Move to your defensive position in left-front after the serve.',
    tip: 'Prepare to block the opponent\'s right-side attack. Close the block to the middle if needed.',
  },
  '5-1-1-receive-outside': {
    responsibility: 'Primary passer in serve receive; attack from zone 4.',
    tip: 'Stay balanced on the balls of your feet and call the ball early. After the pass, open up for a zone 4 approach.',
  },
  '5-1-1-transition-outside': {
    responsibility: 'Attack zone 4 or cover the hitter.',
    tip: 'Get outside the court for a full approach. Aim cross-court if the block is lined up on you.',
  },

  '5-1-1-serve-middle': {
    responsibility: 'Move to your blocking base at the net after the serve.',
    tip: 'Get to the middle of the net fast and read the opponent\'s setter for a quick block move.',
  },
  '5-1-1-receive-middle': {
    responsibility: 'Run the quick attack from the middle.',
    tip: 'Do not pass in serve receive. Focus on your approach timing -- be in the air as the setter touches the ball.',
  },
  '5-1-1-transition-middle': {
    responsibility: 'Quick attack or slide; block the middle.',
    tip: 'Stay loaded and ready for a fast set. If you just blocked, land and immediately check if a quick set is available.',
  },

  '5-1-1-serve-opposite': {
    responsibility: 'Move to left-back for defensive coverage.',
    tip: 'Dig tips and roll shots behind the block. Stay deep enough to read the attacker\'s arm swing.',
  },
  '5-1-1-receive-opposite': {
    responsibility: 'Attack from zone 2 (right side).',
    tip: 'Stay out of primary serve receive. After the pass, approach from outside the right antenna for a strong swing.',
  },
  '5-1-1-transition-opposite': {
    responsibility: 'Attack zone 2 or hit pipe from back row.',
    tip: 'Be ready as the release valve if the outside and middle are covered. Call for the ball loudly.',
  },

  '5-1-1-serve-libero': {
    responsibility: 'Move to back-row defensive position.',
    tip: 'Read the opponent\'s attack and position yourself in zone 5 or 6 based on the block setup.',
  },
  '5-1-1-receive-libero': {
    responsibility: 'Primary passer in serve receive.',
    tip: 'Take as much court as you can and communicate your area clearly with the outside hitters.',
  },
  '5-1-1-transition-libero': {
    responsibility: 'Dig and cover in the back row.',
    tip: 'Read the attacker\'s shoulder and hips to anticipate direction. Stay behind the block shadow.',
  },

  // ── 5-1 Rotation 2 ─────────────────────────────────────────────────
  // Setter is back row (center-back), penetrating to set.
  '5-1-2-serve-setter': {
    responsibility: 'Play center-back defense, then penetrate to set on transition.',
    tip: 'Cheat toward the right sideline so your path to the net is short when the dig goes up.',
  },
  '5-1-2-receive-setter': {
    responsibility: 'Penetrate from center-back to the net.',
    tip: 'Hide behind the middle blocker at the net. Release to your setting target the moment the serve is contacted.',
  },
  '5-1-2-transition-setter': {
    responsibility: 'Set from the front-right area.',
    tip: 'Keep your platform consistent whether setting forward to zone 4 or back to zone 2.',
  },

  '5-1-2-serve-outside': {
    responsibility: 'Block from left-front and transition to attack.',
    tip: 'Start at the net for blocking. After a block attempt, open up to zone 4 for your approach.',
  },
  '5-1-2-receive-outside': {
    responsibility: 'Pass in serve receive, then attack zone 4.',
    tip: 'Take your passing position early and pass to the target area near zone 2-3 for the penetrating setter.',
  },
  '5-1-2-transition-outside': {
    responsibility: 'Attack zone 4 in transition.',
    tip: 'Get wide before your approach so you can hit the full angle cross-court.',
  },

  '5-1-2-serve-middle': {
    responsibility: 'Block in the front-middle, read and react.',
    tip: 'Stay disciplined at your base. Don\'t commit on the first move -- read the set before jumping.',
  },
  '5-1-2-receive-middle': {
    responsibility: 'Run the quick attack.',
    tip: 'Time your three-step approach to arrive just before the setter touches the ball.',
  },
  '5-1-2-transition-middle': {
    responsibility: 'Quick attack or slide behind the setter.',
    tip: 'Be available for a fast set right after your block lands. Keep your hands high during transition.',
  },

  '5-1-2-serve-opposite': {
    responsibility: 'Block from right-front, then attack zone 2.',
    tip: 'Close the block to the middle and be ready for a quick transition to your right-side attack approach.',
  },
  '5-1-2-receive-opposite': {
    responsibility: 'Attack zone 2 from the front row.',
    tip: 'Stay near the right antenna and let the passers handle receive. Be ready for a high set or a shoot.',
  },
  '5-1-2-transition-opposite': {
    responsibility: 'Attack zone 2 in transition offense.',
    tip: 'After blocking, back off the net quickly and prepare for a right-side set.',
  },

  '5-1-2-serve-libero': {
    responsibility: 'Back-row defense in zone 5 or 6.',
    tip: 'Position yourself based on your block. If the block takes the line, cover cross-court.',
  },
  '5-1-2-receive-libero': {
    responsibility: 'Primary passer in serve receive.',
    tip: 'Own the middle of the court and call off teammates when the ball is in your range.',
  },
  '5-1-2-transition-libero': {
    responsibility: 'Dig and pursue in the back row.',
    tip: 'Stay low and ready. After the dig, cover the hitter in case of a blocked ball.',
  },

  // ── 5-1 Rotation 3 ─────────────────────────────────────────────────
  // Setter is back-left, penetrating the longest distance.
  '5-1-3-serve-setter': {
    responsibility: 'Play left-back defense, penetrate on transition.',
    tip: 'This is your longest penetration path. Start cheating toward the center as early as possible.',
  },
  '5-1-3-receive-setter': {
    responsibility: 'Penetrate from left-back all the way to right-front.',
    tip: 'Release early and run hard. If the pass is off the net, stop and set from wherever you are rather than chasing.',
  },
  '5-1-3-transition-setter': {
    responsibility: 'Set from the front-right target area.',
    tip: 'On a tight dig, prioritize giving a hittable ball to zone 4 rather than forcing a back set.',
  },

  '5-1-3-serve-outside': {
    responsibility: 'Blocking and front-row defense from left-front.',
    tip: 'You are the primary left-side blocker. Take away the cross-court angle and let your defense play the line.',
  },
  '5-1-3-receive-outside': {
    responsibility: 'Pass and attack from zone 4.',
    tip: 'After passing, immediately transition off the net for a full approach to zone 4.',
  },
  '5-1-3-transition-outside': {
    responsibility: 'Zone 4 attack in transition.',
    tip: 'Communicate with the setter. If you passed the ball, call out what set you want.',
  },

  '5-1-3-serve-middle': {
    responsibility: 'Front-middle blocking base.',
    tip: 'Focus on reading the first-tempo attacker on the other side. Stay patient before committing.',
  },
  '5-1-3-receive-middle': {
    responsibility: 'Quick attack from the middle.',
    tip: 'Start your approach early since the setter has a long way to run. Adjust your timing to the setter\'s arrival.',
  },
  '5-1-3-transition-middle': {
    responsibility: 'Quick or slide attack; middle block.',
    tip: 'If the setter is late arriving, hold your approach slightly to stay in sync.',
  },

  '5-1-3-serve-opposite': {
    responsibility: 'Right-front blocking and defense.',
    tip: 'Block the opponent\'s outside hitter and be ready to transition to a zone 2 attack.',
  },
  '5-1-3-receive-opposite': {
    responsibility: 'Attack zone 2 from the front row.',
    tip: 'Stand near the right antenna during receive. You are a key option if the pass pulls the setter off the net.',
  },
  '5-1-3-transition-opposite': {
    responsibility: 'Right-side attack in transition.',
    tip: 'Call for the ball and be aggressive. The block is often less organized on the right side.',
  },

  '5-1-3-serve-libero': {
    responsibility: 'Back-row defense, zone 5 or 6.',
    tip: 'Communicate with the setter who is also in the back row near you. Stay out of each other\'s way.',
  },
  '5-1-3-receive-libero': {
    responsibility: 'Primary passer, take the largest share of the court.',
    tip: 'Anchor the serve-receive formation. Pass to the target near zone 2-3 to help the setter who is running far.',
  },
  '5-1-3-transition-libero': {
    responsibility: 'Pursue every dig and cover hitters.',
    tip: 'After the dig, immediately look to cover your hitter in case the ball gets blocked back.',
  },

  // ── 5-1 Rotation 4 ─────────────────────────────────────────────────
  // Setter is now front row (right-front). They set from the front and can attack.
  '5-1-4-serve-setter': {
    responsibility: 'Block from right-front; set or dump on transition.',
    tip: 'You are front row now. Use the threat of a dump or setter attack to keep the opponent\'s block honest.',
  },
  '5-1-4-receive-setter': {
    responsibility: 'Set from the front row at the net.',
    tip: 'Start at the net near the right antenna. You have a short path to your setting position -- use that to read the pass.',
  },
  '5-1-4-transition-setter': {
    responsibility: 'Set or attack (dump) from the front row.',
    tip: 'On a tight pass, look for a quick dump over the net on the second contact. Keep the other team guessing.',
  },

  '5-1-4-serve-outside': {
    responsibility: 'Back-row defense in zone 5.',
    tip: 'Play behind the block. Be ready to dig hard-driven balls and chase tips.',
  },
  '5-1-4-receive-outside': {
    responsibility: 'Pass in serve receive from the back row.',
    tip: 'You are back row, so focus entirely on a great pass. No attack responsibility on this play.',
  },
  '5-1-4-transition-outside': {
    responsibility: 'Back-row attack (pipe) or defensive coverage.',
    tip: 'If the setter needs a back-row option, be ready for a pipe set from zone 6. Attack from behind the 3-meter line.',
  },

  '5-1-4-serve-middle': {
    responsibility: 'Back-row defense or replaced by libero.',
    tip: 'If the libero is subbing in for you, get off the court quickly. If staying, play zone 6 defense.',
  },
  '5-1-4-receive-middle': {
    responsibility: 'Back row -- replaced by libero or play defense.',
    tip: 'Typically the libero replaces you here. If you are in, stay out of serve receive and cover zone 6.',
  },
  '5-1-4-transition-middle': {
    responsibility: 'Back-row defense; no front-row attack.',
    tip: 'Focus on digging and covering. You cannot attack above the net from the back row.',
  },

  '5-1-4-serve-opposite': {
    responsibility: 'Front-row blocking from left-front or middle-front.',
    tip: 'Adjust your blocking position based on the opponent\'s attack tendencies.',
  },
  '5-1-4-receive-opposite': {
    responsibility: 'Attack from zone 4 or zone 2 (front row).',
    tip: 'With the setter front-row right, you may swing from the left side. Be versatile in your approach.',
  },
  '5-1-4-transition-opposite': {
    responsibility: 'Front-row attack from zone 2 or zone 4.',
    tip: 'You are a primary attacker. Call your set and swing aggressively.',
  },

  '5-1-4-serve-libero': {
    responsibility: 'Back-row defense in zone 5 or 6.',
    tip: 'With fewer front-row attackers to cover, focus on reading the hitter and positioning behind the block.',
  },
  '5-1-4-receive-libero': {
    responsibility: 'Primary passer in serve receive.',
    tip: 'You and the outside hitters share the court. Take charge and direct traffic.',
  },
  '5-1-4-transition-libero': {
    responsibility: 'Dig and cover from the back row.',
    tip: 'Stay balanced and ready. Anticipate tips over the block especially when the opponent faces a strong block.',
  },

  // ── 5-1 Rotation 5 ─────────────────────────────────────────────────
  // Setter is front-center. Can dump and block.
  '5-1-5-serve-setter': {
    responsibility: 'Block from the middle and set on transition.',
    tip: 'You are in the middle of the net. Block first, then transition to your setting spot near zone 2-3.',
  },
  '5-1-5-receive-setter': {
    responsibility: 'Set from the front row near center-right.',
    tip: 'Start at the net and slide right to your setting target. A second-ball attack is very effective from here.',
  },
  '5-1-5-transition-setter': {
    responsibility: 'Set or dump from center-front.',
    tip: 'Use the dump attack when the blockers are spread out. Otherwise, distribute to your outsides.',
  },

  '5-1-5-serve-outside': {
    responsibility: 'Back-row defense in zone 6 or 5.',
    tip: 'Read the opponent\'s hitter and dig from the back row. Communicate court assignments with the libero.',
  },
  '5-1-5-receive-outside': {
    responsibility: 'Pass in serve receive (back row).',
    tip: 'Focus on a clean pass to the front-row setter. You have no attack duties this rotation.',
  },
  '5-1-5-transition-outside': {
    responsibility: 'Back-row attack (pipe) if called.',
    tip: 'Stay behind the 3-meter line and attack only if the set goes to the pipe position.',
  },

  '5-1-5-serve-middle': {
    responsibility: 'Back-row defense or replaced by libero.',
    tip: 'The libero typically subs in for you. Rest and prepare for your next front-row rotation.',
  },
  '5-1-5-receive-middle': {
    responsibility: 'Replaced by libero or play back-row defense.',
    tip: 'If you are on the court, stay in zone 6 and let the passers handle serve receive.',
  },
  '5-1-5-transition-middle': {
    responsibility: 'Back-row defense; cannot attack above the net.',
    tip: 'Dig and cover. If the libero is in, you are on the bench -- stay engaged and ready.',
  },

  '5-1-5-serve-opposite': {
    responsibility: 'Block from left-front and transition to attack.',
    tip: 'Close the block toward the middle. After the block attempt, get ready for a left-side attack.',
  },
  '5-1-5-receive-opposite': {
    responsibility: 'Attack from zone 4 (left side) in the front row.',
    tip: 'With the setter in the middle, you are the go-to attacker. Stay wide for a full approach.',
  },
  '5-1-5-transition-opposite': {
    responsibility: 'Front-row attack from the left or right side.',
    tip: 'Be ready to swing from either pin. Adjust based on where the setter delivers the ball.',
  },

  '5-1-5-serve-libero': {
    responsibility: 'Back-row defense in zone 5 or 6.',
    tip: 'You may be replacing the middle blocker. Get in position quickly and communicate your coverage area.',
  },
  '5-1-5-receive-libero': {
    responsibility: 'Primary passer in serve receive.',
    tip: 'Take the biggest share of the court. A perfect pass to the front-row setter makes the offense lethal.',
  },
  '5-1-5-transition-libero': {
    responsibility: 'Dig and pursue in the back row.',
    tip: 'Position based on the block. If your block takes cross, play the line and vice versa.',
  },

  // ── 5-1 Rotation 6 ─────────────────────────────────────────────────
  // Setter is front-left. Last front-row rotation before going back.
  '5-1-6-serve-setter': {
    responsibility: 'Block from left-front, then set on transition.',
    tip: 'You start on the left side blocking. After the play, get back to your setting position near zone 2-3 quickly.',
  },
  '5-1-6-receive-setter': {
    responsibility: 'Set from the front row; start near left-front.',
    tip: 'Release from the left side to the right to set. The short path lets you read the pass well.',
  },
  '5-1-6-transition-setter': {
    responsibility: 'Set or dump from the front row.',
    tip: 'Look for dump opportunities, especially when the middle blockers are late reacting to the dig.',
  },

  '5-1-6-serve-outside': {
    responsibility: 'Back-row defense in zone 5 or 6.',
    tip: 'Stay deep and read the hitter. You are responsible for hard-driven balls in your zone.',
  },
  '5-1-6-receive-outside': {
    responsibility: 'Pass in serve receive from the back row.',
    tip: 'No front-row attack this rotation. Put all your energy into a perfect pass.',
  },
  '5-1-6-transition-outside': {
    responsibility: 'Back-row pipe attack or defensive coverage.',
    tip: 'Be available as a back-row option. Attack the pipe if the setter calls for it.',
  },

  '5-1-6-serve-middle': {
    responsibility: 'Blocking base at center-front.',
    tip: 'You are front row. Stay disciplined at the net and read the setter before committing to a block.',
  },
  '5-1-6-receive-middle': {
    responsibility: 'Run the quick attack from the middle.',
    tip: 'Start your approach as the ball reaches the passer. Be ready for a fast set from the front-row setter.',
  },
  '5-1-6-transition-middle': {
    responsibility: 'Quick attack and middle blocking.',
    tip: 'Stay ready for a fast set even in transition. The front-row setter can deliver quick balls easily.',
  },

  '5-1-6-serve-opposite': {
    responsibility: 'Block from right-front or middle-front.',
    tip: 'Anchor the right-side block. Be ready to close to the middle on quick attacks.',
  },
  '5-1-6-receive-opposite': {
    responsibility: 'Attack zone 2 from the front row.',
    tip: 'Stay near the right antenna and be ready for a back set from the setter.',
  },
  '5-1-6-transition-opposite': {
    responsibility: 'Attack zone 2 in transition.',
    tip: 'You are a primary front-row option. If the middle is jammed, call for the ball on the right side.',
  },

  '5-1-6-serve-libero': {
    responsibility: 'Back-row defense in zone 5 or 6.',
    tip: 'Read the block and position accordingly. Stay low and be ready for off-speed shots.',
  },
  '5-1-6-receive-libero': {
    responsibility: 'Primary passer in serve receive.',
    tip: 'Control the back row in receive. Direct the other passers and take the tough serves.',
  },
  '5-1-6-transition-libero': {
    responsibility: 'Dig and cover from the back row.',
    tip: 'After your team attacks, sprint in to cover the hitter in case of a block.',
  },
};

function getDefaultTip(role: PlayerRole, phase: Phase): PositionTip {
  const defaults: Record<Phase, Record<PlayerRole, PositionTip>> = {
    serve: {
      setter: {
        responsibility: 'Prepare to set after your team serves.',
        tip: 'If back row, penetrate to the net after the serve. If front row, start at the net and be ready to block first.',
      },
      outside: {
        responsibility: 'Move to your defensive position after the serve.',
        tip: 'Get to your blocking or defensive spot quickly. Read the opponent\'s pass to anticipate the attack.',
      },
      middle: {
        responsibility: 'Get to your blocking base at the net.',
        tip: 'If front row, move to the center of the net and read the opponent\'s setter. If back row, play zone 6 defense.',
      },
      opposite: {
        responsibility: 'Move to your blocking or defensive position.',
        tip: 'Front row: block the left-side attack. Back row: play defense in zone 1 and prepare for transition attacks.',
      },
      libero: {
        responsibility: 'Move to your back-row defensive position.',
        tip: 'Read the opponent\'s offense and position yourself where the block is not covering. Communicate with your teammates.',
      },
      ds: {
        responsibility: 'Play back-row defense.',
        tip: 'Cover your assigned zone and be ready to dig. Communicate court responsibilities with the libero.',
      },
    },
    receive: {
      setter: {
        responsibility: 'Get to your setting position.',
        tip: 'If back row, penetrate to the net before the serve arrives. If front row, set from near the right antenna.',
      },
      outside: {
        responsibility: 'Pass in serve receive and prepare to attack.',
        tip: 'Pass to the setter\'s target area, then transition outside for your approach to zone 4.',
      },
      middle: {
        responsibility: 'Prepare your quick attack approach.',
        tip: 'Stay out of serve receive. Focus entirely on timing your approach for a first-tempo set.',
      },
      opposite: {
        responsibility: 'Prepare to attack from zone 2.',
        tip: 'If front row, stay near the right antenna. If back row, be ready for a back-row attack or play defense.',
      },
      libero: {
        responsibility: 'Lead the serve-receive formation.',
        tip: 'Take the biggest share of the court and communicate clearly. A great pass sets up the entire offense.',
      },
      ds: {
        responsibility: 'Pass in serve receive.',
        tip: 'Cover your zone and make a clean pass to the setter\'s target area.',
      },
    },
    transition: {
      setter: {
        responsibility: 'Set every ball in transition offense.',
        tip: 'Get to the ball quickly and give your hitters a good set. On a tight dig, set high to the outside.',
      },
      outside: {
        responsibility: 'Attack zone 4 or play back-row defense.',
        tip: 'Front row: get outside for a full approach. Back row: dig first, then look for a pipe attack opportunity.',
      },
      middle: {
        responsibility: 'Quick attack or block the middle.',
        tip: 'Front row: stay loaded for a fast set after the dig. Back row: focus on defense and coverage.',
      },
      opposite: {
        responsibility: 'Attack zone 2 or play back-row defense.',
        tip: 'Front row: be ready for a right-side set. Back row: dig and look for a back-row attack opportunity.',
      },
      libero: {
        responsibility: 'Dig, pursue, and cover hitters.',
        tip: 'Never stop moving. After every dig, look to cover your team\'s hitter in case of a blocked ball.',
      },
      ds: {
        responsibility: 'Dig and play back-row defense.',
        tip: 'Stay low and be ready for anything. After the dig, cover the hitter.',
      },
    },
  };

  return defaults[phase][role];
}

export function getPositionTip(
  system: RotationSystem,
  rotation: RotationNumber,
  phase: Phase,
  role: PlayerRole
): PositionTip {
  const key = `${system}-${rotation}-${phase}-${role}` as TipKey;
  return positionTips[key] ?? getDefaultTip(role, phase);
}
