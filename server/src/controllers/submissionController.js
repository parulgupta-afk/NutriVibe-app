const ProductSubmission = require('../models/ProductSubmission');

/**
 * Handles community food product contribution submission.
 * Saves candidate product into pending review state for manual administrator moderation.
 * @param {import('express').Request} req Express request containing user and product payload
 * @param {import('express').Response} res Express response
 * @param {import('express').NextFunction} next Express next callback
 */
async function submit(req, res, next) {
  try {
    const { barcode, name, brand, ingredients, imageUrl, notes } = req.body;
    if (!name) return res.status(400).json({ message: 'name is required' });
    const doc = await ProductSubmission.create({
      submittedBy: req.user._id,
      barcode,
      name,
      brand,
      ingredients: ingredients || [],
      imageUrl,
      notes,
      status: 'pending',
    });
    res.status(201).json({
      success: true,
      data: doc,
      message: 'Submission received. It will not appear in the catalog until moderated.',
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Retrieves list of product contributions submitted by currently authenticated user.
 * @param {import('express').Request} req Express request with user
 * @param {import('express').Response} res Express response
 * @param {import('express').NextFunction} next Express next callback
 */
async function listMine(req, res, next) {
  try {
    const list = await ProductSubmission.find({ submittedBy: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: list });
  } catch (err) {
    next(err);
  }
}

/**
 * Administrative endpoint listing submitted products filtered by moderation status.
 * @param {import('express').Request} req Express request with admin user and status query
 * @param {import('express').Response} res Express response
 * @param {import('express').NextFunction} next Express next callback
 */
async function adminList(req, res, next) {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin only' });
    }
    const status = req.query.status || 'pending';
    const list = await ProductSubmission.find({ status }).sort({ createdAt: -1 }).limit(100);
    res.json({ success: true, data: list });
  } catch (err) {
    next(err);
  }
}

/**
 * Admin review endpoint to approve or reject a pending submission.
 * @param {object} req Express request with user, params.id, and body.status
 * @param {object} res Express response
 * @param {Function} next Express next callback
 */
async function adminReview(req, res, next) {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin only' });
    }
    const { status, reviewNotes } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'status must be approved or rejected' });
    }
    const doc = await ProductSubmission.findByIdAndUpdate(
      req.params.id,
      {
        status,
        reviewNotes,
        reviewedBy: req.user._id,
        reviewedAt: new Date(),
      },
      { new: true }
    );
    if (!doc) return res.status(404).json({ message: 'Not found' });
    res.json({ success: true, data: doc });
  } catch (err) {
    next(err);
  }
}

module.exports = { submit, listMine, adminList, adminReview };
