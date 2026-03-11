import AboutMe from '@/components/form-components/AboutMe';
import AddressFields from '@/components/form-components/AddressFields';
import BirthdatePicker from '@/components/form-components/BirthdatePicker';

interface Step2DynamicProps {
  components: string[];
  formData: any;
  setFormData: (data: any) => void;
  onSubmit: () => void;
}

export default function Step2Dynamic({ components, formData, setFormData, onSubmit }: Step2DynamicProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  const renderComponent = (component: string) => {
    switch (component) {
      case 'about_me':
        return <AboutMe key="about_me" value={formData.about_me} onChange={(v: string) => setFormData({ ...formData, about_me: v })} />;
      case 'address':
        return <AddressFields key="address" formData={formData} setFormData={setFormData} />;
      case 'birthdate':
        return <BirthdatePicker key="birthdate" value={formData.birthdate} onChange={(v: string) => setFormData({ ...formData, birthdate: v })} />;
      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-2xl font-bold mb-6">Tell Us More</h2>
      {components.map(renderComponent)}
      <button
        type="submit"
        className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
      >
        Continue
      </button>
    </form>
  );
}
