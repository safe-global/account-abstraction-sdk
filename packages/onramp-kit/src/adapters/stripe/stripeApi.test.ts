import * as stripeApi from './stripeApi'

const baseUrl = 'https://api.stripe.com/v1'
const config = {
  walletAddress: '0x',
  networks: ['ethereum']
}
const session = {
  id: 'cos_1MhDe5KSn9ArdBimmQzf4vzc',
  object: 'crypto.onramp_session',
  client_secret: 'cos_1MhDe5KSn9ArdBimmQzf4vzc_secret_NaOoTfOKoDPCXfGVJz3KX15XO00H6ZNiTOm',
  livemode: false,
  status: 'initialized'
}

describe('stripeApi', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should allow to create a new session', async () => {
    global.fetch = jest
      .fn()
      .mockImplementationOnce(() =>
        Promise.resolve({ json: () => Promise.resolve(session), ok: true })
      )

    const createdSession = await stripeApi.createSession(baseUrl, config)

    expect(createdSession).toEqual(session)
  })

  it('should throw an exception when the fetch call fail', async () => {
    global.fetch = jest
      .fn()
      .mockImplementationOnce(() =>
        Promise.resolve({ json: () => Promise.reject('http error'), ok: false })
      )

    await expect(stripeApi.createSession(baseUrl, config)).rejects.toThrowError(
      "Error: Couldn't create a new Stripe session"
    )
  })

  it('should allow to get a new session', async () => {
    global.fetch = jest
      .fn()
      .mockImplementationOnce(() =>
        Promise.resolve({ json: () => Promise.resolve(session), ok: true })
      )

    const createdSession = await stripeApi.getSession(baseUrl, 'session-id')

    expect(createdSession).toEqual(session)
  })

  it('should throw an exception when the get session call fail', async () => {
    global.fetch = jest
      .fn()
      .mockImplementationOnce(() =>
        Promise.resolve({ json: () => Promise.reject('http error'), ok: false })
      )

    await expect(stripeApi.getSession(baseUrl, 'session-id')).rejects.toThrowError(
      "Error: Couldn't get the session with id  session-id"
    )
  })
})
