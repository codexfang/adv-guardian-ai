import currentAdv from '../../data/sample-current-adv.txt?raw'
import previousAdv from '../../data/sample-previous-adv.txt?raw'
import websiteClaims from '../../data/sample-website-claims.txt?raw'
import custodialJson from '../../data/sample-custodial.json?raw'

export const sampleInputs = {
  currentAdv,
  previousAdv,
  websiteClaims,
  custodialData: custodialJson,
}

export default sampleInputs
