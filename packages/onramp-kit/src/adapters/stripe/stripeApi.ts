import { Session } from '../../types'

export const createSession = async (
  baseUrl: string,
  { walletAddress, networks }: { walletAddress: string; networks: string[] }
): Promise<Session> => {
  try {
    const response = await fetch(`${baseUrl}/api/v1/onramp/stripe/session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ walletAddress, networks })
    })
    console.log(response)
    if (!response.ok) throw new Error("Couldn't create a new Stripe session")

    return response.json()
  } catch (e) {
    throw new Error(e as string)
  }
}

export const getSession = async (baseUrl: string, sessionId: string) => {
  try {
    const response = await fetch(`${baseUrl}/api/v1/onramp/stripe/session/${sessionId}`)

    if (!response.ok) throw new Error(`Couldn't get the session with id  ${sessionId}`)

    return response.json()
  } catch (e) {
    throw new Error(e as string)
  }
}
