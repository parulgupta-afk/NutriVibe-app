import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FiCheck, FiChevronRight, FiChevronLeft, FiPlus, FiX } from 'react-icons/fi';

const Onboarding = () => {
  const [step, setStep] = useState(0);
  const [preferences, setPreferences] = useState({
    dietaryRestrictions: [],
    allergies: [],
    healthGoals: [],
    medications: [],
  });
  const [medicationInput, setMedicationInput] = useState('');
  const { updatePreferences, user } = useAuth();
  const navigate = useNavigate();

  const commonAllergens = [
    'Peanuts', 'Tree Nuts', 'Dairy', 'Eggs', 'Soy',
    'Gluten', 'Shellfish', 'Sesame', 'Fish', 'Corn'
  ];

  const dietaryRestrictions = [
    'Vegetarian', 'Vegan', 'Pescatarian', 'Keto', 'Paleo',
    'Low FODMAP', 'Gluten-Free', 'Dairy-Free', 'Nut-Free'
  ];

  const healthGoals = [
    'Weight Loss', 'Muscle Gain', 'Heart Health',
    'Diabetic-Friendly', 'General Wellness', 'Better Sleep',
    'Increased Energy', 'Digestive Health'
  ];

  const commonMedications = [
    'Warfarin', 'Statin (e.g. Atorvastatin)', 'Levothyroxine',
    'Metformin', 'Lisinopril', 'SSRI Antidepressant'
  ];

  const handleToggle = (category, item) => {
    const current = preferences[category] || [];
    const updated = current.includes(item)
      ? current.filter(i => i !== item)
      : [...current, item];
    
    setPreferences({ ...preferences, [category]: updated });
  };

  const handleAddMedication = () => {
    const trimmed = medicationInput.trim();
    if (!trimmed) return;
    if (preferences.medications.some(m => m.toLowerCase() === trimmed.toLowerCase())) {
      setMedicationInput('');
      return;
    }
    setPreferences({
      ...preferences,
      medications: [...preferences.medications, trimmed]
    });
    setMedicationInput('');
  };

  const handleRemoveMedication = (med) => {
    setPreferences({
      ...preferences,
      medications: preferences.medications.filter(m => m !== med)
    });
  };

  const handleNext = () => {
    if (step === 0) {
      // Validate at least one allergy selected
      if (preferences.allergies.length === 0) {
        alert('Please select at least one allergen to track');
        return;
      }
    }
    if (step < 3) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    const result = await updatePreferences(preferences);
    if (result.success) {
      navigate('/dashboard');
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Allergen Safety First
            </h2>
            <p className="text-gray-600 mb-6">
              Select any allergens you need to avoid. This helps us give you instant safety verdicts.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {commonAllergens.map((allergen) => (
                <button
                  key={allergen}
                  onClick={() => handleToggle('allergies', allergen)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    preferences.allergies.includes(allergen)
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-gray-200 hover:border-red-300 text-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{allergen}</span>
                    {preferences.allergies.includes(allergen) && (
                      <FiCheck className="text-red-500" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 1:
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Dietary Preferences
            </h2>
            <p className="text-gray-600 mb-6">
              Tell us about your dietary choices for better recommendations.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {dietaryRestrictions.map((diet) => (
                <button
                  key={diet}
                  onClick={() => handleToggle('dietaryRestrictions', diet)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    preferences.dietaryRestrictions.includes(diet)
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:border-primary-300 text-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{diet}</span>
                    {preferences.dietaryRestrictions.includes(diet) && (
                      <FiCheck className="text-primary-500" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Medications
            </h2>
            <p className="text-gray-600 mb-6">
              Optional, but recommended — we'll flag foods that interact with these.
              Your data stays private and is only used to personalize your results.
            </p>

            <div className="flex flex-wrap gap-2 mb-4">
              {commonMedications.map((med) => (
                <button
                  key={med}
                  onClick={() => {
                    if (!preferences.medications.includes(med)) {
                      setPreferences({
                        ...preferences,
                        medications: [...preferences.medications, med]
                      });
                    }
                  }}
                  className="px-3 py-1.5 text-sm rounded-full border border-gray-200 text-gray-600 hover:border-primary-300 hover:text-primary-700"
                >
                  + {med}
                </button>
              ))}
            </div>

            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={medicationInput}
                onChange={(e) => setMedicationInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddMedication();
                  }
                }}
                placeholder="Type a medication name and press Enter"
                className="input-field flex-1"
              />
              <button
                onClick={handleAddMedication}
                className="btn-primary px-4 flex items-center gap-1"
                type="button"
              >
                <FiPlus /> Add
              </button>
            </div>

            {preferences.medications.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {preferences.medications.map((med) => (
                  <span
                    key={med}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-50 border border-primary-200 text-primary-700 text-sm"
                  >
                    {med}
                    <button onClick={() => handleRemoveMedication(med)} type="button">
                      <FiX className="text-primary-500 hover:text-primary-800" />
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">No medications added — you can skip this step or add them later in your profile.</p>
            )}
          </div>
        );

      case 3:
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Your Health Goals
            </h2>
            <p className="text-gray-600 mb-6">
              What are you working towards? Select all that apply.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {healthGoals.map((goal) => (
                <button
                  key={goal}
                  onClick={() => handleToggle('healthGoals', goal)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    preferences.healthGoals.includes(goal)
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 hover:border-green-300 text-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{goal}</span>
                    {preferences.healthGoals.includes(goal) && (
                      <FiCheck className="text-green-500" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg p-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Allergies</span>
            <span>Dietary</span>
            <span>Medications</span>
            <span>Goals</span>
          </div>
          <div className="flex gap-1">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`flex-1 h-2 rounded-full ${
                  i <= step ? 'bg-primary-600' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step Content */}
        {renderStep()}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          {step > 0 && (
            <button
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <FiChevronLeft /> Back
            </button>
          )}
          <button
            onClick={handleNext}
            className="btn-primary flex items-center gap-2 ml-auto"
          >
            {step === 3 ? 'Complete Setup' : 'Next'}
            {step < 3 && <FiChevronRight />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;