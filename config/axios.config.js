const axios = require('axios');

//Comment
exports.AXIOS_REQUEST = axios.create({
    baseURL: process.env.MOMO_URL,
    headers: {
        'Ocp-Apim-Subscription-Key': process.env.MOMO_API_SUBSCRIPTION_KEY,
        'X-Target-Environment': process.env.MOMO_ENVIRONMENT
    }
});