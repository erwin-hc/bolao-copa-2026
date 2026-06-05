"use client";

interface LockedInputProps {
  value: number | string;
  onChange: (value: number) => void;
  isLocked: boolean;
  lockReason?: string;
  placeholder?: string;
  teamName: string;
}

export default function LockedInput({
  value,
  onChange,
  isLocked,
  lockReason,
  placeholder,
  teamName,
}: LockedInputProps) {
  if (isLocked) {
    return (
      <div className="relative">
        <input
          type="number"
          value={value}
          disabled
          className="w-20 mx-auto mt-2 text-center text-2xl font-bold bg-gray-100 border-2 border-gray-300 rounded-lg p-2 cursor-not-allowed opacity-60"
          placeholder={placeholder}
        />
        {lockReason && (
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1">
            <div className="bg-red-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
              🔒 {lockReason}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <input
      type="number"
      min="0"
      max="20"
      value={value !== undefined && value !== null ? value : ""}
      onChange={(e) => {
        const newValue = parseInt(e.target.value) || 0;
        onChange(newValue);
      }}
      className="w-20 mx-auto mt-2 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none p-2 hover:border-blue-300 transition"
      placeholder={placeholder}
    />
  );
}
