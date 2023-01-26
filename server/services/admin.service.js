const logger = require('../utility/logger').logger;
const registerationModel = require('../models/registeration')
const samparkSchema = require('../models/sampark');
const mongoose = require('mongoose')

const adminService = {};

adminService.regsByMandal = async (req, res) => {
  try {
    var dash = await registerationModel.aggregate([
      {
        $project: {
          Sabha: 1,
          isNew: 1,
          newMember: {
            $cond: [
              {
                $eq: ["$isNew", true],
              },
              1,
              0,
            ],
          },
          oldMember: {
            $cond: [
              {
                $eq: ["$isNew", false],
              },
              1,
              0,
            ],
          },
        },
      },
      {
        $group: {
          _id: "$Sabha",
          New: {
            $sum: "$newMember",
          },
          Existing: {
            $sum: "$oldMember",
          },
        },
      },
    ]);
    return { statusCode: 200, message: 'Regs Dashboard', data: dash, res }
  } catch (e) {
    return { statusCode: 500, message: 'Internal Server Error', data: '', res, error: e }
  }
}


module.exports = adminService;