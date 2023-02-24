import { RequestType, ResponseType } from 'src/server'
import stripeService from '../services/stripe-service'

const HTTP_ERROR_STATUS = 400

async function getStripeClientSecret(request: RequestType, response: ResponseType) {
  const { walletAddress, networks } = request.body

  try {
    const stripeResponse = await stripeService.getStripeClientSecret(walletAddress, networks)

    return response.send(stripeResponse)
  } catch (error: any) {
    response.status(HTTP_ERROR_STATUS)

    return response.send(error.response.data)
  }
}

async function getStripeSession(request: RequestType, response: ResponseType) {
  const { sessionId } = request.params

  try {
    const stripeResponse = await stripeService.getStripeSession(sessionId)

    return response.send(stripeResponse)
  } catch (error: any) {
    response.status(HTTP_ERROR_STATUS)

    return response.send(error.response.data)
  }
}

const stripeController = {
  getStripeClientSecret,
  getStripeSession
}

export default stripeController
