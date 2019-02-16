const fetch = require('node-fetch')
const _ = require('lodash')

const subscriptionKey = process.env.SUBSCRIPTION_KEY
const uriBase = process.env.AZURE_TA_ENDPOINT

const Wrapper = {
  keyPhrases: async documents => {
    let options = {
      method: 'POST',
      body: JSON.stringify({
        documents
      }),
      headers: {
        'Content-Type': 'application/json',
        'Ocp-Apim-Subscription-Key': subscriptionKey
      }
    }

    try {
      let res = await fetch(uriBase + '/keyPhrases', options)
      let p = await res.json()

      let keyPhrases = []
      keyPhrases = !_.isUndefined(p.documents)
        ? _.flatten(p.documents.map(doc => doc.keyPhrases))
        : []
      return keyPhrases
    } catch (e) {
      throw 'Failed to fetch ' + e
    }
  },
  entities: async documents => {
    let options = {
      method: 'POST',
      body: JSON.stringify({ documents }),
      headers: {
        'Content-Type': 'application/json',
        'Ocp-Apim-Subscription-Key': subscriptionKey
      }
    }

    try {
      let res = await fetch(uriBase + '/entities', options)
      let p = await res.json()

      let entities = []
      entities = !_.isUndefined(p.documents)
        ? _.flatten(p.documents.map(doc => doc.entities))
        : []
      return entities
    } catch (e) {
      throw 'Failed to fetch ' + e
    }
  }
}

module.exports = { ...Wrapper }
