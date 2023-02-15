import express from "express";

import stripeController from "../controllers/stripe-controller";

const STRIPE_PATHNAME = "/api/v1/onramp/stripe/session";

const stripeRouter = express.Router();

stripeRouter.post(STRIPE_PATHNAME, stripeController);

export default stripeRouter;
