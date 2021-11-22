const { genTimestamps } = require("../../utils/common");
const { Income } = require("../../models/Reporting/income.model");


let [ day, , month, year ] = genTimestamps();
month++;

/**
 * Income related to the totals
 * */

/**
 * Get all incomes we earned in a given year
 * @returns Object of the income.service.js
 * @param theYear the year
 * */
async function getIncomeStatisticsByYear(theYear) {
    let byMonths = [], z;
    if (theYear === year) z = month;
    else z = 11;
    for (let i = 0; i <= z; i++)
        byMonths.push(await getTotalIncomeByMonth(theYear, i))
    
    return byMonths;
}

/**
 * Get all incomes we earned in a given month
 * @returns Object of the income.service.js
 * @param theYear the year
 * @param theMonth the year
 * */
async function getIncomeStatisticsByMonth(theYear, theMonth) {
    let byDates = [], z;
    if (theYear === year && theMonth === month) z = day;
    else z = 31;
    if (z > 1) z--;
    for (let i = 1; i <= z; i++)
        byDates.push(await getTotalIncomeByDate(theYear, theMonth, i));
    
    return byDates;
    
}

async function getGeneralTotalIncome() {
    let income = await Income.aggregate([
        {
            $group: {
                _id: 1,
                totalIncome: { $sum: "$total_income" },
                count: { $sum: 1 }
            }
        }
    ])
    
    return (income.length > 0) ? income[0].totalIncome : 0;
}

/**
 * Get total incomes we earned in a given year
 * @param year the year
 * @returns Number number of the income.service.js
 * */
async function getTotalIncomeByYear(year) {
    let income = await Income.aggregate([
        { $match: { year } },
        {
            $group: {
                _id: 1,
                totalIncome: { $sum: "$total_income" },
                count: { $sum: 1 }
            }
        }
    ])
    
    return {
        year: year,
        income: (income.length > 0) ? income[0].totalIncome : 0,
    };
}

/**
 * Get total incomes we earned in a given month
 * @param theYear the year
 * @param theMonth the year
 * @returns Number number of the income.service.js
 * */
async function getTotalIncomeByMonth(theYear, theMonth) {
    let income = await Income.aggregate([
        { $match: { year: theYear, month: theMonth } },
        {
            $group: {
                _id: 1,
                totalIncome: { $sum: "$total_income" },
                count: { $sum: 1 }
            }
        }
    ])
    
    return {
        day: theMonth,
        income: (income.length > 0) ? income[0].totalIncome : 0
    }
}


/**
 * Get total incomes we earned in a given year
 * @param year the year
 * @param month the year
 * @param day the year
 * @returns Number number of the income.service.js
 * */
async function getTotalIncomeByDate(year, month, day) {
    let income = await Income.findOne({ day, year, month })
    return {
        day,
        income: income ? income.total_income : 0
    };
}

/**
 * Get the overall admin Income
 * @return Object the items in the income.service.js
 * */
async function getOverallAdminIncomeStatistics() {
    return {
        currentDay: await getTotalIncomeByDate(year, month, day),
        currentMonth: {
            perMonthDay: await getIncomeStatisticsByMonth(year, month),
            total: await getTotalIncomeByMonth(year, month),
        },
        currentYear: {
            perMonth: await getIncomeStatisticsByYear(year),
            total: await getTotalIncomeByYear(year),
        },
        general: await getGeneralTotalIncome(),
    }
}

module.exports = {
    getOverallAdminIncomeStatistics
}