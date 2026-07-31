const Dependent = require('../models/Dependent');

// @desc    Get all dependents for the logged-in user
// @route   GET /api/dependents
// @access  Private
exports.getDependents = async (req, res, next) => {
  try {
    const dependents = await Dependent.find({ owner: req.user.id }).sort({ createdAt: 1 });
    res.status(200).json({
      success: true,
      data: dependents
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new dependent profile
// @route   POST /api/dependents
// @access  Private
exports.createDependent = async (req, res, next) => {
  try {
    const { name, relationship, dietaryRestrictions, allergies, healthGoals, medications } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a name for this profile'
      });
    }

    const dependent = await Dependent.create({
      owner: req.user.id,
      name: name.trim(),
      relationship: relationship?.trim() || '',
      preferences: {
        dietaryRestrictions: dietaryRestrictions || [],
        allergies: allergies || [],
        healthGoals: healthGoals || [],
        medications: medications || []
      }
    });

    res.status(201).json({
      success: true,
      data: dependent
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a dependent profile
// @route   PUT /api/dependents/:id
// @access  Private
exports.updateDependent = async (req, res, next) => {
  try {
    const { name, relationship, dietaryRestrictions, allergies, healthGoals, medications } = req.body;

    const existing = await Dependent.findOne({ _id: req.params.id, owner: req.user.id });
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    const dependent = await Dependent.findByIdAndUpdate(
      req.params.id,
      {
        name: name?.trim() ?? existing.name,
        relationship: relationship !== undefined ? relationship.trim() : existing.relationship,
        preferences: {
          dietaryRestrictions: dietaryRestrictions ?? existing.preferences.dietaryRestrictions,
          allergies: allergies ?? existing.preferences.allergies,
          healthGoals: healthGoals ?? existing.preferences.healthGoals,
          medications: medications ?? existing.preferences.medications
        }
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: dependent
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a dependent profile
// @route   DELETE /api/dependents/:id
// @access  Private
exports.deleteDependent = async (req, res, next) => {
  try {
    const dependent = await Dependent.findOneAndDelete({
      _id: req.params.id,
      owner: req.user.id
    });

    if (!dependent) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile deleted'
    });
  } catch (error) {
    next(error);
  }
};