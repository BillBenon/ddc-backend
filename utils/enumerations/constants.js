/**
 * Minimum 8 characters<br>
 * AtLeast 1 UPPERCASE letter<br>
 * AtLeast 1 LOWERCASE letter<br>
 * AtLeast 1 NUMBER<br>
 * AtLeast 1 SPECIAL CHARACTER<br>
 * @type {RegExp}
 */
exports.PASSWORD = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;


/**
 * Value Added Tax Percentage
 * @type {number}
 */
exports.VAT_PERCENTAGE = 18;

/**
 * Digit pattern
 * @type {RegExp}
 */
exports.DIGIT_PATTERN = /^(0|[0-9][0-9]*)$/;


/**
 * One Day TimeStamp
 * @type {number}
 */
exports.ONE_DAY = 24 * 60 * 60 * 1000;


/**
 * Enum: User Category
 * @type {{EMPLOYEE: string, CUSTOMER: string, SYSTEM_ADMIN: string, SUPPLIER: string, SHIPPER: string}}
 */
exports.USER_CATEGORY_ENUM = {
    SYSTEM_ADMIN: 'SYSTEM_ADMIN',
    CUSTOMER: 'CUSTOMER',
    EMPLOYEE: 'EMPLOYEE',
    SUPPLIER: 'SUPPLIER',
    SHIPPER: 'SHIPPER'
}

/**
 * Enum: Employee Category Enum
 * @type {{ADMIN: string}}
 * @type {{SALES_MANAGER: string}}
 */
exports.EMPLOYEE_CATEGORY_ENUM = {
    ADMIN: 'ADMIN',
    SALES_MANAGER: 'SALES_MANAGER',
}


/**
 * Enum: Order Status
 * @type {{DELIVERED: string, FAILED: string, PAID: string, INITIATED: string, PAYING: string, ARCHIVED: string, SHIPPING: string}}
 */
exports.ORDER_STATUS_ENUM = {
    INITIATED: 'INITIATED',
    PAYING: 'PAYING',
    PAID: 'PAID',
    SHIPPING: 'SHIPPING',
    DELIVERED: 'DELIVERED',
    ARCHIVED: 'ARCHIVED',
    EXPIRED: 'EXPIRED',
    FAILED: 'FAILED'
}


/**
 * Enum: Shipment Status
 * @type {{CANCELLED: string, DELIVERED: string, FAILED: string, PENDING: string}}
 */
exports.SHIPMENT_STATUS_ENUM = {
    PENDING: 'PENDING',
    CANCELLED: 'CANCELLED',
    FAILED: 'FAILED',
    DELIVERED: 'DELIVERED'
}

exports.WEEKDAYS = {
    0: 'SUNDAY',
    1: 'MONDAY',
    2: 'TUESDAY',
    3: 'WEDNESDAY',
    4: 'THURSDAY',
    5: 'FRIDAY',
    6: 'SATURDAY',
}


/**
 * Enum: Discount Scope
 * @type {{GENERAL: string, CUSTOMER_BASED: string}}
 */
exports.ORDER_DISCOUNT_SCOPE_ENUM = {
    GENERAL: 'GENERAL',
    CUSTOMER_BASED: 'CUSTOMER_BASED'
}

/**
 * Enum: Discount Type
 * @type {{CAR_ORDER_BASED: string, PART_ORDER_BASED: string,BOTH: string}}
 */
exports.ORDER_DISCOUNT_TYPE_ENUM = {
    CAR_ORDER_BASED: 'CAR_ORDER_BASED',
    PART_ORDER_BASED: 'PART_ORDER_BASED',
    BOTH: 'BOTH'
}

/**
 * Enum: Duration Type
 * @type {{MONTHS: string, YEARS: string, HOURS: string, WEEKS: string, SECONDS: string, DAYS: string, MINUTES: string}}
 */
exports.DURATION_TYPE_ENUM = {
    SECONDS: 'SECONDS',
    MINUTES: 'MINUTES',
    HOURS: 'HOURS',
    DAYS: 'DAYS',
    WEEKS: 'WEEKS',
    MONTHS: 'MONTHS',
    YEARS: 'YEARS'
}

/**
 * ENUM: Discount Status
 * @type {{DURATION_EXPIRED: string,CANCELLED: string, UNUSED: string,ACTIVATED:string, DELETED: string, USAGE_COUNT_EXPIRED: string}}
 */
exports.ORDER_DISCOUNT_STATUS_ENUM = {
    ACTIVATED: 'ACTIVATED',
    UNUSED: 'UNUSED',
    USAGE_COUNT_EXPIRED: 'USAGE_COUNT_EXPIRED',
    DURATION_EXPIRED: 'DURATION_EXPIRED',
    DELETED: 'DELETED',
    CANCELLED: 'CANCELLED'
}


/**
 * ENUM: Discount Status
 * @type {{DURATION_EXPIRED: string, UNUSED: string, DELETED: string, ACTIVATED: string}}
 */
exports.APPLIED_DISCOUNT_STATUS_ENUM = {
    ACTIVATED: 'ACTIVATED',
    UNUSED: 'UNUSED',
    DURATION_EXPIRED: 'DURATION_EXPIRED',
    DELETED: 'DELETED'
}


/**
 * Enum: Purchase Status
 * @type {{INITIATED: string, OTHERS: string, NOT_PAID: string, PAID: string, PENDING: string, DEBT: string, DELETED: string}}
 */
exports.PURCHASE_STATUS_ENUM = {
    INITIATED: 'INITIATED',
    PENDING: 'PENDING',
    NOT_PAID: 'NOT_PAID',
    DEBT: 'DEBT',
    PAID: 'PAID',
    OTHERS: 'OTHERS',
    DELETED: 'DELETED'
};

/**
 * Enum: Purchase Status
 * @type {{VALID: string,INVALID: string,CANCELLED: string}}
 */
exports.DIRECT_PURCHASE_PAYMENT_ENUM = {
    VALID: 'VALID',
    INVALID: 'INVALID',
    CANCELLED: 'CANCELLED'
};

/**
 * Enum: PortPricing Status
 * @type {{COMPLETE: string,INCOMPLETE: string}}
 */
exports.COMPLETE_INFO_ENUM = {
    COMPLETE: 'COMPLETE',
    INCOMPLETE: 'INCOMPLETE'
};


/**
 * Enum: Payment Methods Enum
 * @type {{CardPayment: string, DirectCashPayment: string, MTNMomoPayment: string}}
 */
exports.PAYMENT_METHODS_ENUM = {
    CardPayment: 'CardPayment',
    MTNMomoPayment: 'MTNMomoPayment',
    DirectCashPayment: 'DirectCashPayment'
};


/**
 * Enum: App Service Type
 * @type {{WEB: string, USSD: string, DIRECT_PURCHASE_FROM_MARKET: string}}
 */
exports.SERVICE_TYPE_ENUM = {
    USSD: 'USSD',
    WEB: 'WEB',
    DIRECT_PURCHASE_FROM_MARKET: 'DIRECT_PURCHASE_FROM_MARKET'
};


/**
 * Enum: User Status
 * @type {{ACTIVE: string, INACTIVE: string, PENDING: string}}
 */
exports.USER_STATUS_ENUM = {
    PENDING: 'PENDING',
    ACTIVE: 'ACTIVE',
    INACTIVE: 'INACTIVE'
}

/**
 * Enum: CarOnMarket Status
 * @type {{BOOKED: string, SELLING: string, SOLD: string}}
 */
exports.CAR_ON_MARKET_STATUS_ENUM = {
    BOOKED: 'BOOKED',
    SELLING: 'SELLING',
    SOLD: 'SOLD'
}


/**
 * Enum: User Gender
 * @type {{MALE: string, FEMALE: string}}
 */
exports.USER_GENDER_ENUM = {
    MALE: 'MALE',
    FEMALE: 'FEMALE'
};

/**
 * Enum: Notification type
 * @type {{DISCOUNT_APPLIED:string,NEW_SHIPPING_ORIGIN:string,NEW_DISCOUNT_INITIATED: string,NEW_DELIVERY_PORT:string,PAID_PART_ORDER: string,CAR_ORDER_DELIVERED:string,NEW_VEHICLE_TYPE:string,CAR_ORDER_SHIPPED: string,NEW_BOOKING: string,PAYMENT_RECEIVED:string,PAYMENT_FAILED:string,ORDER_PAYED: string,BOOK_SUCCESS: string,BOOK_FAILURE:string,AN_ERROR_OCCURED: string,NEW_SHIPPER_CREATED, USER_STATUS_CHANGED: string,PURCHASE_MARKERD_AS_PAID: string,CAR_PURCHASE_MARKED_AS_PAID:string,SUPPLY_DELETION: string,DIRECT_PURCHASE_DELETION: string,NEW_ORDER: string, PURCHASE_MARKED_AS_PAID: string, SUPPLY: string,DIRECT_PURCHASE: string,CUSTOMER_REVIVEW: string,CONTACTED: string,SPARE_PART_TO_VANISH: string,DELIVERY_CONFIRMATION: string,ORDER_GOES_TO_SHIPPING: string, OTHER: string,PAID_CAR_ORDER:string}},
 */
exports.NOTIFICATION_TYPE_ENUM = {
    DISCOUNT_APPLIED: "DISCOUNT_APPLIED",
    NEW_SHIPPING_ORIGIN: "NEW_SHIPPING_ORIGIN",
    NEW_DELIVERY_PORT: "NEW_DELIVERY_PORT",
    NEW_VEHICLE_TYPE: "NEW_VEHICLE_TYPE",
    CAR_ORDER_DELIVERED: "CAR_ORDER_DELIVERED",
    CAR_ORDER_SHIPPED: "CAR_ORDER_SHIPPED",
    PAYMENT_FAILED: "PAYMENT_FAILED",
    NEW_DISCOUNT_INITIATED: "NEW_DISCOUNT_INITIATED",
    PAYMENT_RECEIVED: "PAYMENT_RECEIVED",
    BOOK_SUCCESS: "BOOK_SUCCESS",
    BOOK_FAILURE: "BOOK_FAILURE",
    PAID_PART_ORDER: "PAID_PART_ORDER",
    PAID_CAR_ORDER: "PAID_CAR_ORDER",
    ORDER_PAYED: "ORDER_PAYED",
    AN_ERROR_OCCURED: "AN_ERROR_OCCURED",
    NEW_BOOKING: "NEW_BOOKING",
    NEW_SHIPPER_CREATED: "NEW_SHIPPER_CREATED",
    USER_STATUS_CHANGED: "USER_STATUS_CHANGED",
    CAR_PURCHASE_MARKED_AS_PAID: "CAR_PURCHASE_MARKED_AS_PAID",
    PURCHASE_MARKED_AS_PAID: "PURCHASE_MARKED_AS_PAID",
    NEW_ORDER: 'NEW_ORDER',
    SUPPLY: 'SUPPLY_MADE',
    DIRECT_PURCHASE_DELETION: "DIRECT_PURCHASE_DELETION",
    SUPPLY_DELETION: "SUPPLY_DELETION",
    DIRECT_PURCHASE: 'DIRECT_PURCHASE',
    CONTACTED: 'NEW_CONTACT_MESSAGE',
    CUSTOMER_REVIVEW: 'NEW_CUSTOMER_REVIEW',
    SPARE_PART_TO_VANISH: 'SPARE_PART_ABOUT_TO_VANISH',
    DELIVERY_CONFIRMATION: 'DELIVERY_CONFIRMATION',
    ORDER_GOES_TO_SHIPPING: 'ORDER_GOES_TO_SHIPPING',
    OTHER: 'OTHER'
};

/**
 * Enum: Notification status
 * @type {{UNREAD: string, READ: string}},
 */
exports.NOTIFICATION_STATUS_ENUM = {
    UNREAD: 'UNREAD',
    READ: 'READ'
};

/**
 * Enum: Customer Status
 * @type {{ACTIVE: string, INACTIVE: string, PENDING: string}}
 */
exports.CUSTOMER_STATUS_ENUM = {
    PENDING: 'PENDING',
    ACTIVE: 'ACTIVE',
    INACTIVE: 'INACTIVE'
}

/**
 * Enum: Employee Status
 * @type {{ACTIVE: string, INACTIVE: string, PENDING: string}}
 */
exports.EMPLOYEE_STATUS_ENUM = {
    PENDING: 'PENDING',
    ACTIVE: 'ACTIVE',
    INACTIVE: 'INACTIVE'
};

/**
 * Enum: Shipper Status
 * @type {{ACTIVE: string, INACTIVE: string, PENDING: string}}
 */
exports.SHIPPER_STATUS_ENUM = {
    PENDING: 'PENDING',
    ACTIVE: 'ACTIVE',
    INACTIVE: 'INACTIVE'
}

/**
 * Enum: Supplier Status
 * @type {{ACTIVE: string, INACTIVE: string, PENDING: string}}
 */
exports.SUPPLIER_STATUS_ENUM = {
    PENDING: 'PENDING',
    ACTIVE: 'ACTIVE',
    INACTIVE: 'INACTIVE'
}

/**
 * Enum: Supplier Status
 * @type {{SPARE_PART_SUPPLIER: string, CAR_SUPPLIER: string, BOTH_SUPPLIER: string}}
 */
exports.SUPPLIER_TYPE_ENUM = {
    SPARE_PART_SUPPLIER: 'SPARE_PART_SUPPLIER',
    CAR_SUPPLIER: 'CAR_SUPPLIER',
    BOTH_SUPPLIER: 'BOTH_SUPPLIER'
}

/**
 * Enum: Payment Status Enum
 * @type {{INITIATED: string, CANCELLED: string, FAILED: string, PAID: string, PENDING: string, APPROVED: string}}
 */
exports.PAYMENT_STATUS_ENUM = {
    PENDING: 'PENDING',
    INITIATED: 'INITIATED',
    PAID: 'PAID',
    CANCELLED: 'CANCELLED',
    FAILED: 'FAILED',
    APPROVED: 'APPROVED'
}


/**
 * Enum: Telecom Enum
 * @type {{AIRTEL: string, MTN: string, TIGO: string}}
 */
exports.TELECOM_ENUM = {
    AIRTEL: 'AIRTEL',
    MTN: 'MTN',
    TIGO: 'TIGO'
}


/**
 * Enum: Payment Source Enum
 * @type {{DIRECT_PURCHASE: string, ONLINE_PURCHASE: string}}
 */
exports.PAYMENT_SOURCE_ENUM = {
    DIRECT_PURCHASE: 'DIRECT_PURCHASE',
    ONLINE_PURCHASE: 'ONLINE_PURCHASE'
}
/**
 * Enum: Payment Status Enum
 * @type {{PENDING: string, PAID: string, RETURNED: string}}
 */
exports.CASH_PAYMENT_STATUS_ENUM = {
    PENDING: 'PENDING',
    PAID: 'PAID',
    RETURNED: 'RETURNED'
}


/**
 * Enum: General Product Types
 * @type {{OTHER: string, ACCESSORY: string, SPARE_PART: string}}
 */
exports.GENERAL_TYPE_ENUM = {
    SPARE_PART: 'SPARE_PART',
    ACCESSORY: 'ACCESSORY',
    OTHER: 'OTHER'
}

const now = new Date();

/**
 * Fixed Timeframes
 * @type {{THIS_WEEK: Date, TODAY: Date, THIS_YEAR: Date, THIS_MONTH: Date}}
 */
exports.DATE = {
    TODAY: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
    THIS_WEEK: new Date(new Date() - 7 * 60 * 60 * 24 * 1000),
    THIS_MONTH: new Date(now.getFullYear(), now.getUTCMonth()),
    THIS_YEAR: new Date(now.getFullYear())
}


/**
 * Enum: Channel Type
 * @type {{WEB: string, USSD: string, DIRECT: string, MOBILE: string}}
 */
exports.CHANNEL_TYPE_ENUM = {
    WEB: 'WEB',
    DIRECT: 'DIRECT',
    USSD: 'USSD',
    MOBILE: 'MOBILE'
}


//  car module base enums

exports.CAR_ORDER_PAYMENT_STATUS_ENUM = {
    PENDING: 'PENDING',
    VALID: 'VALID',
    INVALID: 'INVALID',
}


exports.CAR_ORDER_STATUS_ENUM = {
    PAYING: 'PAYING',
    PAID: 'PAID',
    SHIPPED: 'SHIPPED',
    SHIPPING: 'SHIPPING',
    DELIVERED: 'DELIVERED',
    CANCELLED: 'CANCELLED',
    EXPIRED: 'EXPIRED',
}


exports.CAR_BOOKINGS_STATUS_ENUM = {
    INITIATED: 'INITIATED',
    PROCESSING: 'PROCESSING',
    CANCELLED: 'CANCELLED',
    FAILED: 'FAILED',
    SUCCESS: 'SUCCESS'
}

exports.CAR_DOMINANT_COLOR_ENUM = {
    WHITE: 'WHITE',
    BLACK: 'BLACK',
    GRAY: 'GRAY',
    CHARCOAL: 'CHARCOAL',
    SILVER: 'SILVER',
    BLUE: 'BLUE',
    RED: 'RED',
    ORANGE: 'ORANGE',
    YELLOW: 'YELLOW',
    OTHERS: 'OTHERS'
}

exports.CAR_STEERING_ENUM = {
    LEFT: 'LEFT',
    RIGHT: 'RIGHT',
}

exports.CAR_FUEL_TYPE_ENUM = {
    DIESEL: 'DIESEL',
    PETROL: 'PETROL',
    LPG: 'LPG',
    ELECTRIC: 'ELECTRIC',
    OTHERS: 'OTHERS'
}

exports.CAR_TRANSIMISSION_ENUM = {
    AUTOMATIC: 'AUTOMATIC',
    MANUAL: 'MANUAL'
}

exports.CAR_DRIVE_TYPE_ENUM = {
    '2WD': '2WD',
    '4WD': '4WD'
}

exports.getOptions = (method, path) => {
    return {
        hostname: process.env.MOMO_URL,
        port: 443,
        method,
        path
    }
}