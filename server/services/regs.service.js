const logger = require('../utility/logger').logger;
const registerationModel = require('../models/registeration')
const samparkSchema = require('../models/sampark');
const mongoose = require('mongoose')

const regsService = {};

// { 'Full Name': 1, 'Mobile': 1, 'Ref Name': 1, 'FollowUp Name': 1, 'Gender': 1, 'Sabha': 1,'Email':1,'Attending Sabha':1}
regsService.mobileAutofill = async (req, res) => {
    try {
        var mob = req.query.mobileNo;
        if (mob && mob.length >= 3 && mob.length <= 10) {
            var predictions = await samparkSchema.find({ "Mobile": new RegExp('.*' + mob + '.*') }, { 'Full Name': 1, 'Mobile': 1 });
            return { statusCode: 200, message: 'Mobile autofill', data: predictions, res }
        }
        return { statusCode: 404, message: 'No Data found', data: '', res }
    } catch (e) {
        return { statusCode: 500, message: 'Internal Server Error', data: '', res, error: e }

    }
}

regsService.nameAutoFill = async (req, res) => {
    try {
        var name = req.query.name;
        if (name && name.length >= 3) {
            var predictions = await samparkSchema.find({ 'Full Name': { $regex: name.toLowerCase(), "$options": "i" } }, { 'Full Name': 1, 'Mobile': 1, 'Sabha': 1 });
            return { statusCode: 200, message: 'Mobile autofill', data: predictions, res }
        }
        return { statusCode: 404, message: 'No Data found', data: '', res }
    } catch (e) {
        return { statusCode: 500, message: 'Internal Server Error', data: '', res, error: e }

    }
}

regsService.formDataFromMobile = async (req, res) => {
    try {
        var mob = req.query.mobileNo;
        if (mob && mob.length == 10) {
            const id = await alreadyRegistered(req.body.Mobile);
            if (id != 0) {
                return { statusCode: 400, message: 'Member already Registered', data: '', res }
            }
            var member = await samparkSchema.find({ "Mobile": mob }, { 'First Name': 1, 'Middle Name': 1, 'Last Name': 1, 'Mobile': 1, 'Ref Name': 1, 'FollowUp Name': 1, 'Gender': 1, 'Sabha': 1, 'Email': 1, 'Attending Sabha': 1, 'Birth Date': 1 });
            return { statusCode: 200, message: 'Full Details', data: member, res }
        }
        return { statusCode: 404, message: 'No Data found', data: '', res }
    } catch (e) {
        return { statusCode: 500, message: 'Internal Server Error', data: '', res, error: e };
    }
}

regsService.register = async (req, res) => {
    try {
        const id = await alreadyRegistered(req.body.Mobile);
        if (id == 0) {
            if (!req.body.isNew) {
                var samparkDetails = await samparkSchema.findOne({ Mobile: req.body.Mobile }, { "Ref Name": 1, "FollowUp Name": 1 }).lean();
                req.body['Ref Name'] = samparkDetails['Ref Name']
                req.body['FollowUp Name'] = samparkDetails['FollowUp Name']
            }
            var reg = await registerMember(req.body);
            if (reg) {
                return { statusCode: 200, message: 'Register Successful', data: reg, res }
            }
            else {
                logger.error(reg);
                return { statusCode: 500, message: 'Error registering player', data: '', res }
            }
        }
        else {
            logger.info('Member Already Registered');
            return { statusCode: 400, message: 'Member already Registered', data: '', res }
        }
    } catch (e) {
        logger.error('Registeration ERror ', e);
        console.log("error", e);
        return { statusCode: 500, message: 'Internal Server Error', data: '', res, error: e }
    }
}


const registerMember = async (data) => {
    try {
        data['Full Name'] = data['First Name'] + " " + data['Middle Name'] + " " + data['Last Name'];
        const member = await registerationModel.create(data);
        return member;
    } catch (error) {
        logger.error(error);
        return null;
    }
}

const alreadyRegistered = async (mobileNo) => {
    try {
        var registeration = await registerationModel.findOne({ Mobile: mobileNo }, { id: 1 });
        if (registeration) {
            console.log(registeration);
            return registeration.id;
        }
        else {
            return 0;
        }
    } catch (error) {
        return 0;
    }
}

// Admin

regsService.getAll = async (req, res) => {
    try {
        var regs = await registerationModel.find({
            $or: [
                { isDeleted: { $exists: false } },
                { isDeleted: false }
            ]
        }).sort({ createdAt: 1 });
        var totalRecords = await registerationModel.countDocuments({});
        return { statusCode: 200, message: 'Registerations List', data: { regs, totalRecords }, res }
    } catch (e) {
        return { statusCode: 500, message: 'Internal Server Error', data: '', res, error: e }
    }
}

regsService.getSabhaList = async (req, res) => {
    try {

        var totalRecords = await samparkSchema.distinct('Sabha', { 'Gender': req.query.gender });
        return { statusCode: 200, message: 'Sabha list', data: totalRecords.filter(s => s != "" && (req.query.gender == 'Male' ? !s.includes('Yuvati') : s)), res }
    } catch (e) {
        return { statusCode: 500, message: 'Internal Server Error', data: '', res, error: e }
    }
}



regsService.deRegisterMember = async (req, res) => {
    try {

        var rec = await registerationModel.updateOne({ _id: mongoose.Types.ObjectId(req.body._id) }, { $set: { isDeleted: true } })
        // var totalRecords = await samparkSchema.distinct('Sabha', { 'Gender': req.query.gender });
        return { statusCode: 200, message: 'Member Deleted', data: rec, res }
    } catch (e) {
        return { statusCode: 500, message: 'Internal Server Error', data: '', res, error: e }
    }
}

module.exports = regsService;