import joi from "joi";
import { generalFields } from "../../middleware/validation.js";

export const addUserVal = joi.object({
  userName: generalFields.name.required(),
  email:generalFields.email.required(),
  phone: joi.string().required(),
}).required()