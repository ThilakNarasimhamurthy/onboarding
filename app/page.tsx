'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import StepIndicator from '@/components/wizard/StepIndicator';
import Step1Auth from '@/components/wizard/Step1Auth';
import Step2Dynamic from '@/components/wizard/Step2Dynamic';
import Step3Dynamic from '@/components/wizard/Step3Dynamic';

// Utility function to safely handle API responses
const safeApiCall = async (url: string, options?: RequestInit) => {
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      console.error(`API call failed: ${response.status} ${response.statusText}`);
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const text = await response.text();
    if (!text) {
      console.error(`Empty response from ${url}`);
      throw new Error('Empty response from server');
    }
    
    try {
      return JSON.parse(text);
    } catch (parseError) {
      console.error(`JSON parse error for ${url}:`, parseError, 'Response:', text);
      throw new Error('Invalid JSON response from server');
    }
  } catch (error) {
    console.error(`API call error for ${url}:`, error);
    throw error;
  }
};

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [userId, setUserId] = useState<string | null>(null);
  const [config, setConfig] = useState<any>(null);
  const [formData, setFormData] = useState({
    about_me: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    birthdate: ''
  });

  const fetchConfig = async () => {
    try {
      const data = await safeApiCall('/api/page-config');
      setConfig(data);
    } catch (error) {
      console.error('Error fetching config:', error);
      // Set default config if fetch fails
      setConfig({
        page2_components: ['about_me'],
        page3_components: ['address', 'birthdate']
      });
    }
  };

  useEffect(() => {
    fetchConfig();
    
    // Poll for config changes every 5 seconds (only when user is active)
    const interval = setInterval(() => {
      if (!document.hidden) {
        fetchConfig();
      }
    }, 5000);
    
    // Also refetch when user returns to tab
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchConfig();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const handleStep1Submit = async (email: string, password: string) => {
    try {
      const checkRes = await fetch(`/api/users?email=${encodeURIComponent(email)}`);
      
      if (!checkRes.ok) {
        console.error('User check failed:', checkRes.status, checkRes.statusText);
        throw new Error(`Failed to check user: ${checkRes.status}`);
      }
      
      const checkText = await checkRes.text();
      if (!checkText) {
        throw new Error('Empty response from user check');
      }
      
      let checkData;
      try {
        checkData = JSON.parse(checkText);
      } catch (parseError) {
        console.error('JSON parse error in user check:', parseError, 'Response:', checkText);
        throw new Error('Invalid response from server');
      }
      
      if (checkData.exists) {
        setUserId(checkData.userId);
        
        // Fetch current config and user's profile data
        await fetchConfig();
        
        // Get user's profile data to pre-populate form
        const profileRes = await fetch('/api/profiles');
        if (!profileRes.ok) {
          console.error('Profile fetch failed:', profileRes.status);
          setStep(checkData.currentStep);
          return;
        }
        
        const profileText = await profileRes.text();
        if (!profileText) {
          setStep(checkData.currentStep);
          return;
        }
        
        let profileData;
        try {
          profileData = JSON.parse(profileText);
        } catch (parseError) {
          console.error('Profile JSON parse error:', parseError);
          setStep(checkData.currentStep);
          return;
        }
        
        const userProfile = profileData.users?.find((u: any) => u.id === checkData.userId)?.user_profiles?.[0];
        
        if (userProfile) {
          // Pre-populate form with existing data
          setFormData({
            about_me: userProfile.about_me || '',
            street: userProfile.street || '',
            city: userProfile.city || '',
            state: userProfile.state || '',
            zip: userProfile.zip || '',
            birthdate: userProfile.birthdate || ''
          });
        }
        
        // Always use smart resume logic when user returns, regardless of profile data
        // This ensures we respect current admin configuration
        const userProfileData = userProfile || {};
        const smartStep = calculateSmartResumeStep(userProfileData, config);
        console.log('User returning, using smart resume. Smart step:', smartStep, 'Saved step:', checkData.currentStep);
        setStep(smartStep);
        return;
      }
      
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      if (!res.ok) {
        console.error('User creation failed:', res.status, res.statusText);
        throw new Error(`Failed to create user: ${res.status}`);
      }
      
      const resText = await res.text();
      if (!resText) {
        throw new Error('Empty response from user creation');
      }
      
      let data;
      try {
        data = JSON.parse(resText);
      } catch (parseError) {
        console.error('User creation JSON parse error:', parseError, 'Response:', resText);
        throw new Error('Invalid response from server');
      }
      
      setUserId(data.userId);
      
      // Refetch config before moving to step 2
      await fetchConfig();
      setStep(2);
    } catch (error) {
      console.error('Step 1 submission error:', error);
      alert('An error occurred. Please try again.');
    }
  };

  const calculateSmartResumeStep = (userProfile: any, currentConfig: any) => {
    if (!currentConfig) {
      console.log('No config available, defaulting to step 2');
      return 2;
    }
    
    // Check what data user has
    const hasAboutMe = userProfile.about_me && userProfile.about_me.trim() !== '';
    const hasAddress = userProfile.street && userProfile.city && userProfile.state && userProfile.zip;
    const hasBirthdate = userProfile.birthdate;
    
    const page2Components = currentConfig.page2_components || [];
    const page3Components = currentConfig.page3_components || [];
    
    // If no components configured, default to step 2
    if (page2Components.length === 0 && page3Components.length === 0) {
      console.log('No components configured, defaulting to step 2');
      return 2;
    }
    
    console.log('Smart Resume Debug:', {
      userProfile,
      currentConfig,
      hasAboutMe,
      hasAddress,
      hasBirthdate,
      page2Components,
      page3Components
    });
    
    // Check if ALL components on page 2 are completed
    const page2Complete = page2Components.length > 0 && page2Components.every((component: string) => {
      if (component === 'about_me') return hasAboutMe;
      if (component === 'address') return hasAddress;
      if (component === 'birthdate') return hasBirthdate;
      return false;
    });
    
    // Check if ALL components on page 3 are completed
    const page3Complete = page3Components.length > 0 && page3Components.every((component: string) => {
      if (component === 'about_me') return hasAboutMe;
      if (component === 'address') return hasAddress;
      if (component === 'birthdate') return hasBirthdate;
      return false;
    });
    
    console.log('Page completion status:', {
      page2Complete,
      page3Complete,
      page2ComponentsLength: page2Components.length,
      page3ComponentsLength: page3Components.length
    });
    
    // If both pages are complete, show completion
    if (page2Complete && page3Complete) {
      console.log('Both pages complete, going to step 4');
      return 4; // Completed
    }
    
    // If page 2 has components and is not complete, go to page 2
    if (page2Components.length > 0 && !page2Complete) {
      console.log('Page 2 has components and is not complete, going to step 2');
      return 2;
    }
    
    // If page 2 is complete (or has no components) but page 3 is not complete, go to page 3
    if ((page2Complete || page2Components.length === 0) && page3Components.length > 0 && !page3Complete) {
      console.log('Page 2 complete (or empty), page 3 not complete, going to step 3');
      return 3;
    }
    
    // If page 2 is complete and page 3 has no components, show completion
    if (page2Complete && page3Components.length === 0) {
      console.log('Page 2 complete and page 3 empty, going to step 4');
      return 4;
    }
    
    // Fallback to step 2
    console.log('Fallback to step 2');
    return 2;
  };

  const handleStep2Submit = async () => {
    const components = config?.page2_components || [];
    const dataToSave: any = {};
    
    // Only save data for components that are actually on this step
    if (components.includes('about_me') && formData.about_me.trim()) {
      dataToSave.about_me = formData.about_me;
    }
    if (components.includes('address') && formData.street && formData.city) {
      dataToSave.street = formData.street;
      dataToSave.city = formData.city;
      dataToSave.state = formData.state;
      dataToSave.zip = formData.zip;
    }
    if (components.includes('birthdate') && formData.birthdate) {
      dataToSave.birthdate = formData.birthdate;
    }

    // Only make API call if there's data to save
    if (Object.keys(dataToSave).length > 0) {
      await fetch('/api/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, data: dataToSave, currentStep: 3 })
      });
    }
    
    // Refetch config before moving to step 3
    await fetchConfig();
    setStep(3);
  };

  const handleStep3Submit = async () => {
    const components = config?.page3_components || [];
    const dataToSave: any = {};
    
    // Only save data for components that are actually on this step
    if (components.includes('about_me') && formData.about_me.trim()) {
      dataToSave.about_me = formData.about_me;
    }
    if (components.includes('address') && formData.street && formData.city) {
      dataToSave.street = formData.street;
      dataToSave.city = formData.city;
      dataToSave.state = formData.state;
      dataToSave.zip = formData.zip;
    }
    if (components.includes('birthdate') && formData.birthdate) {
      dataToSave.birthdate = formData.birthdate;
    }

    // Always make API call to update step to completed
    await fetch('/api/profiles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, data: dataToSave, currentStep: 4 })
    });
    
    // Move to completion screen
    setStep(4);
  };

  if (!config) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow p-8">
        <StepIndicator currentStep={step} />

        {step === 1 && <Step1Auth onSubmit={handleStep1Submit} />}
        {step === 2 && (
          <Step2Dynamic
            components={config.page2_components}
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleStep2Submit}
          />
        )}
        {step === 3 && (
          <Step3Dynamic
            components={config.page3_components}
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleStep3Submit}
          />
        )}
        {step >= 4 && (
          <div className="text-center">
            <div className="mb-6">
              <svg className="mx-auto h-16 w-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-4">Onboarding Complete!</h2>
            <p className="text-gray-600 mb-6">Thank you for completing your profile.</p>
            <button
              onClick={() => router.push('/data')}
              className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
            >
              View All Users
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
