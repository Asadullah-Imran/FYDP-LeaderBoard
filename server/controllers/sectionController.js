const DatasetSection = require('../models/DatasetSection');

const getSections = async (req, res) => {
  try {
    const sections = await DatasetSection.find({});
    res.json(sections);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const createSection = async (req, res) => {
  const { name, description } = req.body;

  try {
    const section = new DatasetSection({
      name,
      description
    });

    const createdSection = await section.save();
    res.status(201).json(createdSection);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteSection = async (req, res) => {
  try {
    const section = await DatasetSection.findById(req.params.id);

    if (section) {
      await DatasetSection.deleteOne({ _id: section._id });
      res.json({ message: 'Section removed' });
    } else {
      res.status(404).json({ message: 'Section not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getSections, createSection, deleteSection };
