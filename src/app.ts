import { DID } from 'dids'
import KeyDidResolver from 'key-did-resolver'

import { createCeramic } from './ceramic'
import { getProvider } from './wallet'
import type { ResolverRegistry } from 'did-resolver'
import { NFTStorage } from 'nft.storage'

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
let publicationType = '' // document.getElementById("publicationType").value

// Replace the hardcoded value, does not work with env yet
const nftStorageApiKey = process.env.NFT_STORAGE_API_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDUyZTA5ZTRBNEFBODVkQjMxMTZENjM3Y0Y4ZjhlODU5ZEVkRGExOTQiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTYyMjI0ODQ0NDk4OSwibmFtZSI6Im9wZW4tcGlkIn0.GtHzC6K9f4yiErBYPoNUcS0EgKV6v8El7NWlwmj05Xc'
const nftStorageClient = new NFTStorage({ token: nftStorageApiKey })

const ceramicPromise = createCeramic()

const authenticate = async (): Promise<string> => {
  const [ceramic, provider] = await Promise.all([ceramicPromise, getProvider()])
  const keyDidResolver = KeyDidResolver.getResolver()
  const resolverRegistry: ResolverRegistry = {
    keyDidResolver
  }
  const did = new DID({
    provider: provider,
    resolver: resolverRegistry,
  })
  await did.authenticate()
  await ceramic.setDID(did)
  window.did = ceramic.did
  return ceramic.did
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
  const myFile = files && files[0];
  nftStorageClient.storeBlob(myFile).then(
    (_cid) => {
      console.log('CID:', _cid)
      cid = _cid;
    },
    (err) => {
      console.error('Failed to upload:', err)
    }
  )
})

document.getElementById('publish')?.addEventListener('click', () => {
  if (cid === '') {
    cid = (<HTMLInputElement>document.getElementById('myCid'))?.value
  }
  console.log("cid", cid);

  const authors:any = [];
  // loop through author inputs and build the authors array
  document.getElementsByName("author")?.forEach((e1:any) => {
    let author:Author = {};
    e1.childNodes.forEach((e2:any) => {
      if (e2.name === "pid[]" && e2.value !== '') {
        author.pid = e2.value;
      }
      if (e2.name === "name[]" && e2.value !== '') {
        author.name = e2.value;
      }
      if (e2.name === "organization[]" && e2.value !== '') {
        author.organization = e2.value;
      }
    });
    authors.push(author);
  });
  console.log("authors", authors);

  const description = (<HTMLTextAreaElement>document.getElementById('myDescription'))?.value
  console.log("description", description);

  const pid = (<HTMLInputElement>document.getElementById('myPid'))?.value
  console.log("pid", pid);

  const type = (<HTMLInputElement>document.getElementById('publicationType'))?.value
  console.log("type", type);
  // TODO build JSON-LD based on the schema of the selected type
})