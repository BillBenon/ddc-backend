const {SHIPMENT_STATUS_ENUM} = require("../enumerations/constants");
const {WEEKDAYS} = require("../enumerations/constants");


exports.getWeekShipperStatisticsPerDay = async (shipper) => {
    let TODAY = new Date();
    let days = []
    for (let i = 7; i > 0; i--) {
        let currentDay = new Date(TODAY.setDate(TODAY.getDate() - 1))
        let commonFilter = {
            createdAt: {
                $gte: new Date(currentDay.getFullYear(), currentDay.getMonth(), currentDay.getDate()),
                $lt: new Date(currentDay.getFullYear(), currentDay.getMonth(), currentDay.getDate() + 1),
            },
            active: true,
            shipper: shipper
        }

        // let delivered = await Shipment.find({
        //     ...commonFilter,
        //     status: SHIPMENT_STATUS_ENUM.DELIVERED,
        // }).countDocuments()

        days.push({
            day: WEEKDAYS[currentDay.getDay()],
            delivered: delivered
        })
    }

    return days.reverse();
}


exports.getShipperShipmentsStatistics = async (shipper) => {
    // const pending = await Shipment.find({
    //     shipper: shipper,
    //     status: SHIPMENT_STATUS_ENUM.PENDING,
    //     active: true
    // }).countDocuments();
    // const cancelled = await Shipment.find({
    //     shipper: shipper,
    //     status: SHIPMENT_STATUS_ENUM.CANCELLED,
    //     active: true
    // }).countDocuments();
    // const failed = await Shipment.find({
    //     shipper: shipper,
    //     status: SHIPMENT_STATUS_ENUM.FAILED,
    //     active: true
    // }).countDocuments();
    // const delivered = await Shipment.find({
    //     shipper: shipper,
    //     status: SHIPMENT_STATUS_ENUM.DELIVERED,
    //     active: true
    // }).countDocuments();
    //
    // const total = await Shipment.find({ shipper: shipper, active: true }).countDocuments();
    //
    return {};
}

