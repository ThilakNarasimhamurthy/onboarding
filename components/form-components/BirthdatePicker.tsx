interface BirthdatePickerProps {
  value: string;
  onChange: (value: string) => void;
}

export default function BirthdatePicker({ value, onChange }: BirthdatePickerProps) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium mb-2">Birthdate</label>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-2 border rounded"
        required
      />
    </div>
  );
}
