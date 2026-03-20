const Joi = require('joi')

const validateRegister = (data) => {
    const schema = Joi.object({
        name: Joi.string().min(3).max(30).required(),
        phone: Joi.number().min(10).required(),
        password: Joi.string().min(6).required(),
        role: Joi.string().valid('user', 'admin').default('user'),
        adminKey: Joi.string().when('role', {
            is: 'admin',
            then: Joi.required(),
            otherwise: Joi.optional().allow('', null)
        }),
    })
    return schema.validate(data)
}

const validateLogin = (data) => {
    const schema = Joi.object({
        phone: Joi.number().min(10).required(),
        password: Joi.string().min(6).required(),
    });
    return schema.validate(data);
}

const validateMenu = (data) => {
    const schema = Joi.object({
        name: Joi.string().required(),
        price: Joi.number().greater(0).required(),
        stock: Joi.number().greater(0).required(),
    });
    return schema.validate(data);
}

const validateUpdateMenu = (data) => {
    const schema = Joi.object({
        name: Joi.string(),
        price: Joi.number().greater(0),
        stock: Joi.number().greater(0),
    });
    return schema.validate(data);
}

const validateOrder = (data) => {
    const schema = Joi.object({
        items: Joi.array()
            .items(
                Joi.object({
                    name: Joi.string().trim().required(),
                    quantity: Joi.number().integer().min(1).required(),
                })
            )
            .min(1)
            .required(),
    });
    return schema.validate(data);
};

const validateStatus = (data) => {
    const schema = Joi.object({
        status: Joi.string()
            .valid('CONFIRMED', 'CANCELLED')
            .required(),
    });

    return schema.validate(data);
};

module.exports = { validateRegister, validateLogin, validateMenu, validateUpdateMenu, validateOrder, validateStatus };