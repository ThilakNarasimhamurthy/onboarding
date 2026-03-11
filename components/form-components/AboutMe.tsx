interface AboutMeProps {
  value: string;
  onChange: (value: string) => void;
}

export default function AboutMe({ value, onChange }: AboutMeProps) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium mb-2">About Me</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-2 border rounded h-32"
        required
      />
    </div>
  );
}
