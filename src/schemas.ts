import BaseJoi, { Root, CustomHelpers } from "joi";
import sanitizeHtml from "sanitize-html";

const extension = (joi: Root) => ({
    type: "string",
    base: joi.string(),
    messages: {
        "string.escapeHTML": "{{#label}} must not include HTML!",
    },
    rules: {
        escapeHTML: {
            validate(value: string, helpers: CustomHelpers) {
                const clean = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                });
                if (clean !== value)
                    return helpers.error("string.escapeHTML", { value });
                return clean;
            },
        },
    },
});

const Joi = BaseJoi.extend(extension);

const campgroundSchema = Joi.object({
    title: Joi.string().required().escapeHTML(),
    price: Joi.number().required().min(0),
    description: Joi.string().required().escapeHTML(),
    location: Joi.object({
        name: Joi.string().required().escapeHTML(),
        lat: Joi.number().required().min(-90).max(90),
        lng: Joi.number().required().min(-180).max(180),
    }).required(),
});

const reviewSchema = Joi.object({
    body: Joi.string().required().escapeHTML(),
    rating: Joi.number().required().min(1).max(5),
});

const deleteImagesSchema = Joi.object({
    deleteImages: Joi.array().items(Joi.string().escapeHTML()),
});

export { campgroundSchema, reviewSchema, deleteImagesSchema };
