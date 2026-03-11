export default function StepIndicator({ currentStep }: { currentStep: number }) {
  // Cap at step 3 for display
  const displayStep = Math.min(currentStep, 3);
  
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-2">
        {[1, 2, 3].map((step) => (
          <div
            key={step}
            className={`flex-1 h-2 mx-1 rounded ${
              step <= displayStep ? 'bg-blue-500' : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
      <p className="text-center text-sm text-gray-600">
        {currentStep >= 4 ? 'Completed' : `Step ${displayStep} of 3`}
      </p>
    </div>
  );
}
