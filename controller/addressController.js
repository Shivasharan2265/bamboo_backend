const Address = require("../models/Address");

// 🧠 Create Address
exports.createAddress = async (req, res) => {
  try {
    const { firstName, lastName, address, city, state, zipCode } = req.body;

    if (!firstName || !lastName || !address || !city || !state || !zipCode) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newAddress = new Address({
      user: req.user._id,
      firstName,
      lastName,
      address,
      city,
      state,
      zipCode,
    });

    await newAddress.save();
    res.status(201).json({ message: "Address added successfully", address: newAddress });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 📋 Get All Addresses for a User
exports.getAddresses = async (req, res) => {
  try {
    const addresses = await Address.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(addresses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✏️ Update Address
exports.updateAddress = async (req, res) => {
  try {
    const address = await Address.findOne({ _id: req.params.id, user: req.user._id });
    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    const updated = await Address.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({ message: "Address updated successfully", address: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ❌ Delete Address
exports.deleteAddress = async (req, res) => {
  try {
    const address = await Address.findOne({ _id: req.params.id, user: req.user._id });
    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    await Address.findByIdAndDelete(req.params.id);
    res.json({ message: "Address deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
