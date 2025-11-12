const express = require("express");
const router = express.Router();
const { isAuth } = require("../config/auth");
const {
  createAddress,
  getAddresses,
  updateAddress,
  deleteAddress,
} = require("../controller/addressController");

// Protected Routes
router.post("/", isAuth, createAddress);
router.get("/", isAuth, getAddresses);
router.put("/:id", isAuth, updateAddress);
router.delete("/:id", isAuth, deleteAddress);

module.exports = router;
