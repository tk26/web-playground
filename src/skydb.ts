import type { DID } from 'dids'

import { createCeramic } from './ceramic'
import { getProvider } from './wallet'
declare global {
  interface Window {
    did?: DID
  }
}

const ceramicPromise = createCeramic()

const SkyDBSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'SkyDB',
  type: 'object',
}

const authenticate = async (): Promise<void> => {
  console.log('Authenticating...')

  const [ceramic, provider] = await Promise.all([ceramicPromise, getProvider()])
  await ceramic.setDIDProvider(provider)

  window.did = ceramic.did
  console.log('Authenticated with DID:', ceramic.did)

document.getElementById('bauth')?.addEventListener('click', () => {
  authenticate().catch((err) => {
    console.error('Failed to authenticate:', err)
  })
})
