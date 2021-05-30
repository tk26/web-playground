import { web3Modal} from './wallet'
import ENS from '@ensdomains/ensjs'

export async function registerOnENS(ens_domain: string, identifyer: string){
    const ethProvider = await web3Modal.connect()
    console.log(ethProvider)
    const ensAddress = '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e'
    const ens = new ENS({ ethProvider, ensAddress })
    const ENSName = ens.name(ens_domain)
    const subdomain_tx = await ENSName.createSubdomain(identifyer)

    return ens_domain
  }
