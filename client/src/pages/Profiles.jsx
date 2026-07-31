import React, { useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiCheck, FiUser, FiUsers } from 'react-icons/fi';
import { useProfile } from '../contexts/ProfileContext';
import { dependentApi } from '../api/dependents';
import toast from 'react-hot-toast';

const commonAllergens = [
  'Peanuts', 'Tree Nuts', 'Dairy', 'Eggs', 'Soy',
  'Gluten', 'Shellfish', 'Sesame', 'Fish', 'Corn'
];

const dietaryOptions = [
  'Vegetarian', 'Vegan', 'Pescatarian', 'Keto', 'Paleo',
  'Low FODMAP', 'Gluten-Free', 'Dairy-Free', 'Nut-Free'
];

const emptyForm = {
  name: '',
  relationship: '',
  allergies: [],
  dietaryRestrictions: [],
  medications: [],
};

const Profiles = () => {
  const { dependents, refreshDependents, loadingDependents } = useProfile();
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [medicationInput, setMedicationInput] = useState('');
  const [saving, setSaving] = useState(false);

  const openNewForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setFormOpen(true);
  };

  const openEditForm = (dep) => {
    setForm({
      name: dep.name,
      relationship: dep.relationship || '',
      allergies: dep.preferences?.allergies || [],
      dietaryRestrictions: dep.preferences?.dietaryRestrictions || [],
      medications: dep.preferences?.medications || [],
    });
    setEditingId(dep._id);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingId(null);
    setForm(emptyForm);
    setMedicationInput('');
  };

  const toggleTag = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((v) => v !== value)
        : [...prev[field], value],
    }));
  };

  const handleAddMedication = () => {
    const trimmed = medicationInput.trim();
    if (!trimmed) return;
    if (form.medications.some((m) => m.toLowerCase() === trimmed.toLowerCase())) {
      setMedicationInput('');
      return;
    }
    setForm((prev) => ({ ...prev, medications: [...prev.medications, trimmed] }));
    setMedicationInput('');
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error('Please enter a name');
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        await dependentApi.updateDependent(editingId, form);
        toast.success('Profile updated');
      } else {
        await dependentApi.createDependent(form);
        toast.success('Profile created');
      }
      await refreshDependents();
      closeForm();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to save profile';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (dep) => {
    const confirmed = window.confirm(`Delete ${dep.name}'s profile? This cannot be undone.`);
    if (!confirmed) return;

    try {
      await dependentApi.deleteDependent(dep._id);
      toast.success('Profile deleted');
      await refreshDependents();
    } catch (error) {
      toast.error('Failed to delete profile');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <FiUsers className="text-primary-500" />
            Family Profiles
          </h1>
          <p className="text-gray-600 mt-1">
            Manage allergy, diet, and medication profiles for people you scan food for.
          </p>
        </div>
        {!formOpen && (
          <button onClick={openNewForm} className="btn-primary flex items-center gap-2 whitespace-nowrap">
            <FiPlus /> Add Profile
          </button>
        )}
      </div>

      {/* Add/Edit Form */}
      {formOpen && (
        <div className="card mb-8 border border-primary-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {editingId ? 'Edit Profile' : 'New Profile'}
            </h2>
            <button onClick={closeForm} className="text-gray-400 hover:text-gray-600">
              <FiX />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Alex"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Relationship (optional)</label>
              <input
                type="text"
                value={form.relationship}
                onChange={(e) => setForm({ ...form, relationship: e.target.value })}
                placeholder="e.g. Son, Mother, Partner"
                className="input-field"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Allergies</label>
            <div className="flex flex-wrap gap-2">
              {commonAllergens.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => toggleTag('allergies', a)}
                  className={`px-3 py-1.5 text-sm rounded-full border-2 transition-all ${
                    form.allergies.includes(a)
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-gray-200 hover:border-red-300 text-gray-600'
                  }`}
                >
                  {form.allergies.includes(a) && <FiCheck className="inline mr-1" />}
                  {a}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Dietary Restrictions</label>
            <div className="flex flex-wrap gap-2">
              {dietaryOptions.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => toggleTag('dietaryRestrictions', d)}
                  className={`px-3 py-1.5 text-sm rounded-full border-2 transition-all ${
                    form.dietaryRestrictions.includes(d)
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:border-primary-300 text-gray-600'
                  }`}
                >
                  {form.dietaryRestrictions.includes(d) && <FiCheck className="inline mr-1" />}
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Medications</label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={medicationInput}
                onChange={(e) => setMedicationInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') { e.preventDefault(); handleAddMedication(); }
                }}
                placeholder="Type a medication and press Enter"
                className="input-field flex-1"
              />
              <button onClick={handleAddMedication} type="button" className="btn-primary px-4 flex items-center gap-1">
                <FiPlus /> Add
              </button>
            </div>
            {form.medications.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {form.medications.map((med) => (
                  <span key={med} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-50 border border-primary-200 text-primary-700 text-sm">
                    {med}
                    <button
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, medications: prev.medications.filter(m => m !== med) }))}
                    >
                      <FiX className="text-primary-500 hover:text-primary-800" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3 justify-end">
            <button onClick={closeForm} className="px-4 py-2 text-gray-600 hover:text-gray-900">
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving} className="btn-primary">
              {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Create Profile'}
            </button>
          </div>
        </div>
      )}

      {/* Existing Profiles List */}
      {loadingDependents ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : dependents.length === 0 && !formOpen ? (
        <div className="text-center py-16 text-gray-500">
          <FiUser className="text-4xl mx-auto mb-3 text-gray-300" />
          <p className="mb-1">No family profiles yet</p>
          <p className="text-sm">Add one to start scanning food for someone else's allergies or diet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {dependents.map((dep) => (
            <div key={dep._id} className="card">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{dep.name}</h3>
                  {dep.relationship && <p className="text-sm text-gray-500">{dep.relationship}</p>}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEditForm(dep)} className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg">
                    <FiEdit2 />
                  </button>
                  <button onClick={() => handleDelete(dep)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                    <FiTrash2 />
                  </button>
                </div>
              </div>

              {dep.preferences?.allergies?.length > 0 && (
                <div className="mb-2">
                  <span className="text-xs font-medium text-gray-500">Allergies: </span>
                  <span className="text-sm text-gray-700">{dep.preferences.allergies.join(', ')}</span>
                </div>
              )}
              {dep.preferences?.dietaryRestrictions?.length > 0 && (
                <div className="mb-2">
                  <span className="text-xs font-medium text-gray-500">Diet: </span>
                  <span className="text-sm text-gray-700">{dep.preferences.dietaryRestrictions.join(', ')}</span>
                </div>
              )}
              {dep.preferences?.medications?.length > 0 && (
                <div>
                  <span className="text-xs font-medium text-gray-500">Medications: </span>
                  <span className="text-sm text-gray-700">{dep.preferences.medications.join(', ')}</span>
                </div>
              )}
              {!dep.preferences?.allergies?.length && !dep.preferences?.dietaryRestrictions?.length && !dep.preferences?.medications?.length && (
                <p className="text-sm text-gray-400">No preferences set yet</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Profiles;