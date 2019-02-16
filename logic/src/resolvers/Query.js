const { getUserId } = require('../utils')
const {
  keyPhrases,
  entities
} = require('../wrappers/cognitiveservices-textanalytics')

const flatten = arr => {
  return arr.reduce(function(prev, curr) {
    return prev.concat(curr)
  })
}

const Query = {
  async keyPhrases(parent, { documents }) {
    return await keyPhrases(
      documents.map((d, key) => ({ text: d, language: 'en', id: key }))
    )
  },
  async entities(parent, { documents }) {
    return await entities(
      documents.map((d, key) => ({ text: d, language: 'en', id: key }))
    )
  },
  async entitiesNames(parent, { documents }) {
    let res = await entities(
      documents.map((d, key) => ({ text: d, language: 'en', id: key }))
    )

    return res.map(r => r.name)
  },
  async entitiesWikipediaUrl(parent, { documents }) {
    let res = await entities(
      documents.map((d, key) => ({ text: d, language: 'en', id: key }))
    )
    return res.map(r => r.wikipediaUrl)
  },
  async entitiesType(parent, { documents }) {
    let res = await entities(
      documents.map((d, key) => ({ text: d, language: 'en', id: key }))
    )
    return res.map(r => r.type)
  }
}

module.exports = { Query }
