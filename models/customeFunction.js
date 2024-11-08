const moment = require("moment");
const User = require("../models/User");

/**
 * Updates the login expiry of a user by their ID.
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

module.exports = { updateLoginExpiryById };
