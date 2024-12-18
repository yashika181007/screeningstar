const GenerateReport = require("../models/GenerateReport");
const {
  updateLoginExpiryById,
  setLoginExpiryToNullById,
} = require("../models/customeFunction");

exports.createGenerateReport = async (req, res) => {
  try {
    const { user_id, clientId, branchId, application_id, formjson } = req.body;

    // console.log('Request body:', req.body);

    const newReport = await GenerateReport.create({
      user_id,
      clientId,
      branchId,
      application_id,
      formjson,
    });

    // console.log('New GenerateReport entry created:', newReport);
    const updateExpiryResult = await updateLoginExpiryById(user_id);
    return res.status(201).json({
      message: "GenerateReport created successfully",
      data: newReport,
    });
  } catch (error) {
    console.error("Error creating GenerateReport:", error);
    return res
      .status(500)
      .json({ message: "Error creating report", error: error.message });
  }
};

exports.getAllGenerateReports = async (req, res) => {
  try {
    const reports = await GenerateReport.findAll();
    return res.status(200).json({
      message: "Reports retrieved successfully",
      data: reports,
    });
  } catch (error) {
    console.error("Error retrieving reports:", error);
    return res
      .status(500)
      .json({ message: "Error retrieving reports", error: error.message });
  }
};

exports.getGenerateReportById = async (req, res) => {
  try {
    const { application_id } = req.params; // Extract application_id from request parameters

    // Use findOne with a where clause to find the report by application_id
    const report = await GenerateReport.findOne({ where: { application_id } });

    if (!report) {
      return res.status(404).json({
        message: "Report not found",
      });
    }

    return res.status(200).json({
      message: "Report retrieved successfully",
      data: report,
    });
  } catch (error) {
    console.error("Error retrieving report:", error);
    return res
      .status(500)
      .json({ message: "Error retrieving report", error: error.message });
  }
};

exports.updateGenerateReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id, serviceid, formjson } = req.body;

    const report = await GenerateReport.findByPk(id);

    if (!report) {
      return res.status(404).json({
        message: "Report not found",
      });
    }

    report.user_id = user_id || report.user_id;
    report.serviceid = serviceid || report.serviceid;
    report.formjson = formjson || report.formjson;

    await report.save();
    const updateExpiryResult = await updateLoginExpiryById(user_id);
    return res.status(200).json({
      message: "Report updated successfully",
      data: report,
    });
  } catch (error) {
    console.error("Error updating report:", error);
    return res
      .status(500)
      .json({ message: "Error updating report", error: error.message });
  }
};

exports.deleteGenerateReport = async (req, res) => {
  try {
    const { id } = req.params;

    const report = await GenerateReport.findByPk(id);

    if (!report) {
      return res.status(404).json({
        message: "Report not found",
      });
    }

    await report.destroy();

    return res.status(200).json({
      message: "Report deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting report:", error);
    return res
      .status(500)
      .json({ message: "Error deleting report", error: error.message });
  }
};
