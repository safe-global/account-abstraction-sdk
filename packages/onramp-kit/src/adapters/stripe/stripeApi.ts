export const createSession = (
  baseUrl: string,
  { walletAddress, networks }: { walletAddress: string; networks: string[] }
) => {
  return fetch(`${baseUrl}/api/v1/onramp/stripe/session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ walletAddress, networks })
  })
}

export const getSession = (baseUrl: string, sessionId: string) => {
  return fetch(`${baseUrl}/api/v1/onramp/stripe/session/${sessionId}`)
}
