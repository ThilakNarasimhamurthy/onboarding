interface AddressFieldsProps {
  formData: any;
  setFormData: (data: any) => void;
}

export default function AddressFields({ formData, setFormData }: AddressFieldsProps) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium mb-2">Address</label>
      <input
        type="text"
        placeholder="Street Address"
        value={formData.street || ''}
        onChange={(e) => setFormData({ ...formData, street: e.target.value })}
        className="w-full p-2 border rounded mb-2"
        required
      />
      <input
        type="text"
        placeholder="City"
        value={formData.city || ''}
        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
        className="w-full p-2 border rounded mb-2"
        required
      />
      <input
        type="text"
        placeholder="State"
        value={formData.state || ''}
        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
        className="w-full p-2 border rounded mb-2"
        required
      />
      <input
        type="text"
        placeholder="ZIP Code"
        value={formData.zip || ''}
        onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
        className="w-full p-2 border rounded"
        required
      />
    </div>
  );
}
