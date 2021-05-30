import WalletConnectProvider from '@walletconnect/web3-provider'
import { ThreeIdConnect, EthereumAuthProvider } from '@3id/connect'
import Authereum from 'authereum'
import type { DIDProvider } from 'dids'
import {ethers} from 'ethers'
import Fortmatic from 'fortmatic'
import Web3Modal from 'web3modal'

// @ts-ignore
export const threeID = new ThreeIdConnect()

export const web3Modal = new Web3Modal({
  network: 'mainnet',
  cacheProvider: true,
  providerOptions: {
    walletconnect: {
      package: WalletConnectProvider,
      options: {
        infuraId: 'e87f83fb85bf4aa09bdf6605ebe144b7',
      },
    },
    fortmatic: {
      package: Fortmatic,
      options: {
        key: 'pk_live_EC842EEAC7F08995',
      },
    },
    authereum: {
      package: Authereum,
      options: {},
    },
  },
})


// const providerOptions = {
//   portis: {
//     package: Portis, 
//     options: {
//       id: "bda38cc8-d135-4d4d-bc96-e15ce7ad6da5"
//     }
//   }
// };



// export const web3Modal = new Web3Modal({
//   network: "mainnet",
//   cacheProvider: true,
//   providerOptions
// });

export async function getProvider(): Promise<DIDProvider> {
  const ethProvider = await web3Modal.connect()
  const addresses = await ethProvider.enable()
  await threeID.connect(new EthereumAuthProvider(ethProvider, addresses[0]))
  return threeID.getDidProvider()
}


export async function connectWeb3() {

  web3Modal.clearCachedProvider();
  const externalProvider = await web3Modal.connect();
  return new ethers.providers.Web3Provider(externalProvider);
}