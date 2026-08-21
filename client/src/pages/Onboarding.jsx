import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  FiCheck,
  FiChevronRight,
  FiChevronLeft,
  FiPlus,
  FiX,
} from "react-icons/fi";

const Onboarding = () => {
  const [step, setStep] = useState(0);
  const [preferences, setPreferences] = useState({
    dietaryRestrictions: [],
    allergies: [],
    healthGoals: [],
    medications: [],
  });
  const [medicationInput, setMedicationInput] = useState("");
  const [allergyInput, setAllergyInput] = useState("");
  const [dietaryInput, setDietaryInput] = useState("");
  const [goalInput, setGoalInput] = useState("");
  const { updatePreferences, user } = useAuth();
  const navigate = useNavigate();

  const commonAllergens = [
    "Peanuts",
    "Tree Nuts",
    "Dairy",
    "Eggs",
    "Soy",
    "Gluten",
    "Shellfish",
    "Sesame",
    "Fish",
    "Corn",
  ];

  const dietaryRestrictions = [
    "Vegetarian",
    "Vegan",
    "Pescatarian",
    "Keto",
    "Paleo",
    "Low FODMAP",
    "Gluten-Free",
    "Dairy-Free",
    "Nut-Free",
  ];

  const healthGoals = [
    "Weight Loss",
    "Muscle Gain",
    "Heart Health",
    "Diabetic-Friendly",
    "General Wellness",
    "Better Sleep",
    "Increased Energy",
    "Digestive Health",
  ];

  const commonMedications = [
    "Warfarin",
    "Statin (e.g. Atorvastatin)",
    "Levothyroxine",
    "Metformin",
    "Lisinopril",
    "SSRI Antidepressant",
  ];

  const handleToggle = (category, item) => {
    const current = preferences[category] || [];
    const updated = current.includes(item)
      ? current.filter((i) => i !== item)
      : [...current, item];

    setPreferences({ ...preferences, [category]: updated });
  };

  const handleAddAllergy = () => {
    const trimmed = allergyInput.trim();
    if (!trimmed) return;
    if (
      preferences.allergies.some(
        (a) => a.toLowerCase() === trimmed.toLowerCase(),
      )
    ) {
      setAllergyInput("");
      return;
    }
    setPreferences({
      ...preferences,
      allergies: [...preferences.allergies, trimmed],
    });
    setAllergyInput("");
  };

  const handleRemoveAllergy = (allergy) => {
    setPreferences({
      ...preferences,
      allergies: preferences.allergies.filter((a) => a !== allergy),
    });
  };

  const handleAddDietary = () => {
    const trimmed = dietaryInput.trim();
    if (!trimmed) return;
    if (
      preferences.dietaryRestrictions.some(
        (d) => d.toLowerCase() === trimmed.toLowerCase(),
      )
    ) {
      setDietaryInput("");
      return;
    }
    setPreferences({
      ...preferences,
      dietaryRestrictions: [...preferences.dietaryRestrictions, trimmed],
    });
    setDietaryInput("");
  };

  const handleRemoveDietary = (item) => {
    setPreferences({
      ...preferences,
      dietaryRestrictions: preferences.dietaryRestrictions.filter(
        (d) => d !== item,
      ),
    });
  };

  const handleAddGoal = () => {
    const trimmed = goalInput.trim();
    if (!trimmed) return;
    if (
      preferences.healthGoals.some(
        (g) => g.toLowerCase() === trimmed.toLowerCase(),
      )
    ) {
      setGoalInput("");
      return;
    }
    setPreferences({
      ...preferences,
      healthGoals: [...preferences.healthGoals, trimmed],
    });
    setGoalInput("");
  };

  const handleRemoveGoal = (goal) => {
    setPreferences({
      ...preferences,
      healthGoals: preferences.healthGoals.filter((g) => g !== goal),
    });
  };

  const handleAddMedication = () => {
    const trimmed = medicationInput.trim();
    if (!trimmed) return;
    if (
      preferences.medications.some(
        (m) => m.toLowerCase() === trimmed.toLowerCase(),
      )
    ) {
      setMedicationInput("");
      return;
    }
    setPreferences({
      ...preferences,
      medications: [...preferences.medications, trimmed],
    });
    setMedicationInput("");
  };

  const handleRemoveMedication = (med) => {
    setPreferences({
      ...preferences,
      medications: preferences.medications.filter((m) => m !== med),
    });
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    const result = await updatePreferences(preferences);
    if (result.success) {
      navigate("/dashboard");
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Allergen Safety First
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-2">
              Select any allergens you need to avoid. This helps us give you
              instant safety verdicts.
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mb-6">
              No allergies? No problem — just click "Next" to skip this step.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {commonAllergens.map((allergen) => (
                <button
                  key={allergen}
                  onClick={() => handleToggle("allergies", allergen)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    preferences.allergies.includes(allergen)
                      ? "border-red-500 bg-red-50 text-red-700"
                      : "border-gray-200 hover:border-red-300 text-gray-700 dark:text-gray-200"
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

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Don't see it listed? Add your own
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={allergyInput}
                  onChange={(e) => setAllergyInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddAllergy();
                    }
                  }}
                  placeholder="e.g. Kiwi, Mustard, Sulfites"
                  className="input-field flex-1"
                />
                <button
                  onClick={handleAddAllergy}
                  className="btn-primary px-4 flex items-center gap-1"
                  type="button"
                >
                  <FiPlus /> Add
                </button>
              </div>
              {preferences.allergies.filter((a) => !commonAllergens.includes(a))
                .length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {preferences.allergies
                    .filter((a) => !commonAllergens.includes(a))
                    .map((allergy) => (
                      <span
                        key={allergy}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50 border border-red-200 text-red-700 text-sm"
                      >
                        {allergy}
                        <button
                          onClick={() => handleRemoveAllergy(allergy)}
                          type="button"
                        >
                          <FiX className="text-red-500 hover:text-red-800" />
                        </button>
                      </span>
                    ))}
                </div>
              )}
            </div>
          </div>
        );

      case 1:
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Dietary Preferences
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Tell us about your dietary choices for better recommendations.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {dietaryRestrictions.map((diet) => (
                <button
                  key={diet}
                  onClick={() => handleToggle("dietaryRestrictions", diet)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    preferences.dietaryRestrictions.includes(diet)
                      ? "border-primary-500 bg-primary-50 text-primary-700"
                      : "border-gray-200 hover:border-primary-300 text-gray-700 dark:text-gray-200"
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

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Following something else? Add your own
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={dietaryInput}
                  onChange={(e) => setDietaryInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddDietary();
                    }
                  }}
                  placeholder="e.g. Halal, Kosher, Low-Sodium"
                  className="input-field flex-1"
                />
                <button
                  onClick={handleAddDietary}
                  className="btn-primary px-4 flex items-center gap-1"
                  type="button"
                >
                  <FiPlus /> Add
                </button>
              </div>
              {preferences.dietaryRestrictions.filter(
                (d) => !dietaryRestrictions.includes(d),
              ).length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {preferences.dietaryRestrictions
                    .filter((d) => !dietaryRestrictions.includes(d))
                    .map((item) => (
                      <span
                        key={item}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-50 border border-primary-200 text-primary-700 text-sm"
                      >
                        {item}
                        <button
                          onClick={() => handleRemoveDietary(item)}
                          type="button"
                        >
                          <FiX className="text-primary-500 hover:text-primary-800" />
                        </button>
                      </span>
                    ))}
                </div>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Medications
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Optional, but recommended — we'll flag foods that interact with
              these. Your data stays private and is only used to personalize
              your results.
            </p>

            <div className="flex flex-wrap gap-2 mb-4">
              {commonMedications.map((med) => (
                <button
                  key={med}
                  onClick={() => {
                    if (!preferences.medications.includes(med)) {
                      setPreferences({
                        ...preferences,
                        medications: [...preferences.medications, med],
                      });
                    }
                  }}
                  className="px-3 py-1.5 text-sm rounded-full border border-gray-200 text-gray-600 dark:text-gray-300 hover:border-primary-300 hover:text-primary-700"
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
                  if (e.key === "Enter") {
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
                    <button
                      onClick={() => handleRemoveMedication(med)}
                      type="button"
                    >
                      <FiX className="text-primary-500 hover:text-primary-800" />
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 dark:text-gray-500">
                No medications added — you can skip this step or add them later
                in your profile.
              </p>
            )}
          </div>
        );

      case 3:
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Your Health Goals
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              What are you working towards? Select all that apply.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {healthGoals.map((goal) => (
                <button
                  key={goal}
                  onClick={() => handleToggle("healthGoals", goal)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    preferences.healthGoals.includes(goal)
                      ? "border-green-500 bg-green-50 text-green-700"
                      : "border-gray-200 hover:border-green-300 text-gray-700 dark:text-gray-200"
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

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Have a different goal in mind? Add your own
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={goalInput}
                  onChange={(e) => setGoalInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddGoal();
                    }
                  }}
                  placeholder="e.g. Train for a marathon"
                  className="input-field flex-1"
                />
                <button
                  onClick={handleAddGoal}
                  className="btn-primary px-4 flex items-center gap-1"
                  type="button"
                >
                  <FiPlus /> Add
                </button>
              </div>
              {preferences.healthGoals.filter((g) => !healthGoals.includes(g))
                .length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {preferences.healthGoals
                    .filter((g) => !healthGoals.includes(g))
                    .map((goal) => (
                      <span
                        key={goal}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 border border-green-200 text-green-700 text-sm"
                      >
                        {goal}
                        <button
                          onClick={() => handleRemoveGoal(goal)}
                          type="button"
                        >
                          <FiX className="text-green-500 hover:text-green-800" />
                        </button>
                      </span>
                    ))}
                </div>
              )}
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
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 mb-2">
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
                  i <= step ? "bg-primary-600" : "bg-gray-200"
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
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
            >
              <FiChevronLeft /> Back
            </button>
          )}
          <button
            onClick={handleNext}
            className="btn-primary flex items-center gap-2 ml-auto"
          >
            {step === 3 ? "Complete Setup" : "Next"}
            {step < 3 && <FiChevronRight />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
