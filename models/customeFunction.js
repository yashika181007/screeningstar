const moment = require("moment");
const User = require("../models/User");

/**
 * Updates the login expiry of a user by their ID.
 * Sets the login expiry to 15 minutes from now.
 * @param {number} userId - The ID of the user.
 * @returns {object} - Returns the updated user or an error message.
 */
const updateLoginExpiryById = async (userId) => {
  try {
    // Find the user by ID
    const user = await User.findOne({ where: { id: userId } });
    if (!user) {
      return { success: false, message: "User not found" };
    }

    // Update the login expiry to 15 minutes from now
    user.login_expiry = moment().add(15, "minutes").toDate();
    await user.save();

    return {
      success: true,
      message: "Login expiry updated successfully",
      user,
    };
  } catch (error) {
    console.error("Error updating login expiry:", error);
    return {
      success: false,
      message: "Error updating login expiry",
      error: error.message,
    };
  }
};

/**
 * Sets the login expiry to null for a user by their ID.
 * @param {number} userId - The ID of the user.
 * @returns {object} - Returns the updated user or an error message.
 */
const setLoginExpiryToNullById = async (userId) => {
  try {
    // Find the user by ID
    const user = await User.findOne({ where: { id: userId } });
    if (!user) {
      return { success: false, message: "User not found" };
    }

    // Set the login expiry to null
    user.login_expiry = null;
    await user.save();

    return {
      success: true,
      message: "Login expiry set to null successfully",
      user,
    };
  } catch (error) {
    console.error("Error setting login expiry to null:", error);
    return {
      success: false,
      message: "Error setting login expiry to null",
      error: error.message,
    };
  }
};

module.exports = {
  updateLoginExpiryById,
  setLoginExpiryToNullById,
};
