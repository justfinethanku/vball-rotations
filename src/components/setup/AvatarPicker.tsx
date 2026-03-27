'use client';

interface AvatarPickerProps {
  selected: string;
  onSelect: (avatar: string) => void;
}

const PRESET_AVATARS = [
  { id: 'red', color: '#EF4444', label: 'A' },
  { id: 'orange', color: '#F97316', label: 'B' },
  { id: 'amber', color: '#F59E0B', label: 'C' },
  { id: 'yellow', color: '#EAB308', label: 'D' },
  { id: 'lime', color: '#84CC16', label: 'E' },
  { id: 'green', color: '#22C55E', label: 'F' },
  { id: 'teal', color: '#14B8A6', label: 'G' },
  { id: 'cyan', color: '#06B6D4', label: 'H' },
  { id: 'blue', color: '#3B82F6', label: 'I' },
  { id: 'indigo', color: '#6366F1', label: 'J' },
  { id: 'purple', color: '#A855F7', label: 'K' },
  { id: 'pink', color: '#EC4899', label: 'L' },
];

export function AvatarPicker({ selected, onSelect }: AvatarPickerProps) {
  return (
    <div>
      <label className="mb-2 block text-xs text-gray-400">Avatar</label>
      <div className="grid grid-cols-6 gap-2">
        {PRESET_AVATARS.map((avatar) => (
          <button
            key={avatar.id}
            onClick={() => onSelect(avatar.id)}
            className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white transition-all ${
              selected === avatar.id
                ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-900'
                : 'opacity-70 hover:opacity-100'
            }`}
            style={{ backgroundColor: avatar.color }}
            aria-label={`Avatar ${avatar.label}`}
          >
            {avatar.label}
          </button>
        ))}
      </div>
    </div>
  );
}
