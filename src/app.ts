import { DID } from 'dids'
import ThreeIdResolver from '@ceramicnetwork/3id-did-resolver'
import KeyDidResolver from 'key-did-resolver'

import {ethers} from 'ethers'
import { createCeramic } from './ceramic'
import { createIDX } from './idx'
// import {registerOnENS} from './ens' 
import { getProvider, web3Modal, connectWeb3} from './wallet'
import type { ResolverRegistry } from 'did-resolver'
import { NFTStorage } from 'nft.storage'
import ENS from '@ensdomains/ensjs'

declare global {
  interface Window {
    did?: DID
  }
}

interface Author {
  pid?: string
  name?: string
  organization?: string
}

// global variables to be hydrated and published
let cid = '' // document.getElementById("myCid").value
const publicationType = '' // document.getElementById("publicationType").value
let ethProvider: any = null

// Replace the hardcoded value, does not work with env yet
const nftStorageApiKey =
  process.env.NFT_STORAGE_API_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDUyZTA5ZTRBNEFBODVkQjMxMTZENjM3Y0Y4ZjhlODU5ZEVkRGExOTQiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTYyMjI0ODQ0NDk4OSwibmFtZSI6Im9wZW4tcGlkIn0.GtHzC6K9f4yiErBYPoNUcS0EgKV6v8El7NWlwmj05Xc'
const nftStorageClient = new NFTStorage({ token: nftStorageApiKey })

const ceramicPromise = createCeramic()


const authenticate = async (): Promise<string> => {
  ethProvider = await connectWeb3()
  console.log(ethProvider)
  const [ceramic, provider] = await Promise.all([ceramicPromise, getProvider()])
  const keyDidResolver = KeyDidResolver.getResolver()
  const threeIdResolver = ThreeIdResolver.getResolver(ceramic)
  const resolverRegistry: ResolverRegistry = {
    ...threeIdResolver,
    ...keyDidResolver,
  }
  const did = new DID({
    provider: provider,
    resolver: resolverRegistry,
  })
  await did.authenticate()
  await ceramic.setDID(did)
  const idx = createIDX(ceramic)
  window.did = ceramic.did
  return idx.id
  // let string_var: any = 'hallo'
  // return new Promise(()=>{string_var})
}

document.getElementById('bauth')?.addEventListener('click', () => {
  authenticate().then(
    (id) => {
      console.log('Connected with DID:', id)
    },
    (err) => {
      console.error('Failed to authenticate:', err)
    }
  )
})

document.getElementById('upload')?.addEventListener('click', () => {
  const files: any = (<HTMLInputElement>document.getElementById('myFile'))?.files
  const myFile = files && files[0]
  nftStorageClient.storeBlob(myFile).then(
    (_cid) => {
      console.log('CID:', _cid)
      cid = _cid
    },
    (err) => {
      console.error('Failed to upload:', err)
    }
  )
})

document.getElementById('publish')?.addEventListener('click', () => {

  const authors: any = []
  // loop through author inputs and build the authors array
  document.getElementsByName('author')?.forEach((e1: any) => {
    const author: Author = {}
    e1.childNodes.forEach((e2: any) => {
      if (e2.name === 'pid[]' && e2.value !== '') {
        author.pid = e2.value
      }
      if (e2.name === 'name[]' && e2.value !== '') {
        author.name = e2.value
      }
      if (e2.name === 'organization[]' && e2.value !== '') {
        author.organization = e2.value
      }
    })
    authors.push(author)
  })
  console.log('authors', authors)

  const description = (<HTMLTextAreaElement>document.getElementById('myDescription'))?.value
  console.log('description', description)

  const pid = (<HTMLInputElement>document.getElementById('myPid'))?.value
  console.log('pid', pid)

  const type = (<HTMLInputElement>document.getElementById('publicationType'))?.value
  console.log("type", type);

  // TODO build JSON-LD based on the schema of the selected type
})


function getRandomInt2String(max: number) {
  const digits = max.toString().length
  const number = Math.floor(Math.random() * max).toString()
  return '0'.repeat(digits-number.length) + number
}

// function getIdentifyer

document.getElementById('register-pid')?.addEventListener('click', async () => {
  const type = (<HTMLInputElement>document.getElementById('publicationType'))?.value
  const identifyer = type + getRandomInt2String(10000)
  const ens_domain = (<HTMLInputElement>document.getElementById('myDomain'))?.value
  console.log(ens_domain)
  console.log(identifyer)
  // console.log(ethProvider)
  const myprovider = await connectWeb3()
  // const myprovider = ethProvider
  console.log(myprovider)
  const ensAddress = '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e'
  const ens = new ENS({ myprovider, ensAddress })
  const ENSName = ens.name(ens_domain)
  // create subdomain
  const subdomain_tx = await ENSName.createSubdomain(identifyer)
  const ens_sub = new ENS({ myprovider, ensAddress })

  const ENSSubName = ens_sub.name(identifyer + '.' + ens_domain)
  const ipfs_cid = 'QmWfVY9y3xjsixTgbd9AorQxH7VtMpzfx2HaWtsoUYecaX'
  const ipfs_path = `ipfs://${ipfs_cid}`
  const ctx_tx = await ENSSubName.setContenthash(ipfs_path)
  await ctx_tx.wait()
  const url_tx = await ENSSubName.setText('url', 'http:/openpid/' + identifyer + '.' + ens_domain)
  await url_tx.wait()
  console.log('url_tx')
  console.log(url_tx)

})