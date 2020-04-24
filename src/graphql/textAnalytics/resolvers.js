import fetch from "node-fetch";
import hash from "object-hash";
require("dotenv").config();

// --- Functions

const subscriptionKey = process.env.SUBSCRIPTION_KEY;
const uriBase = process.env.AZURE_TA_ENDPOINT;

// Supported services
const EndpointEnum = {
  KeyPhrases: "keyPhrases",
  Entities: "entities",
};

// Common Azure call handler
const callAzure = async (endpoint, documents) => {
  const options = {
    method: "POST",
    body: JSON.stringify({
      documents,
    }),
    headers: {
      "Content-Type": "application/json",
      "Ocp-Apim-Subscription-Key": subscriptionKey,
    },
  };

  // If the fetch fails, it'll throw.  If there was some other
  // problem communicating to the server (expired key, rate limit),
  // then we want to throw that as an error, too. Per document
  // errors are considerd "soft" and are return as part of the result
  // schema
  let res;
  try {
    const data = await fetch(`${uriBase}/${endpoint}`, options);
    res = await data.json();
  } catch (e) {
    throw new Error("Failed to fetch " + JSON.stringify(e));
  }
  if (res.statusCode) throw new Error(`${res.statusCode}: ${res.message}`);
  return res;
};

// The objects returned from the service don't have IDs, which
// are (currently) retquired by Q, so patch them in
const fixMatches = (matches) =>
  matches.map((m) => ({ id: `${m.text}@${m.offset}:${m.length}`, ...m }));
const fixEntities = (entities) =>
  entities.map((e) => ({
    ...e,
    id: `${e.type}:${e.name}`,
    matches: fixMatches(e.matches),
  }));

// --- Resolvers

export const resolver = {
  Query: {
    // The single document case doesn't need to deal with
    // correlating entities and errors with the input, since
    // there is only one
    async entities(_, { text, language = "en" }) {
      const res = await callAzure(EndpointEnum.Entities, [
        { id: 0, text, language },
      ]);
      const doc = res.documents[0];
      const err = res.errors[0];
      return {
        id: 0,
        entities: doc ? fixEntities(doc.entities) : [],
        error: err ? err.message : undefined,
      };
    },
    // The batch API must correlate entities and errors with each
    // input document
    async entitiesBatch(_, { documents }) {
      const res = await callAzure(
        EndpointEnum.Entities,
        documents.map((d) => ({ language: "en", ...d })) // ensure language
      );
      return {
        id: hash(documents),
        documentEntities: res.documents.map((d) => ({
          id: d.id,
          entities: fixEntities(d.entities),
        })),
        errors: res.errors,
      };
    },

    async keyPhrases(_, { text, language = "en" }) {
      const res = await callAzure(EndpointEnum.KeyPhrases, [
        { id: 0, text, language },
      ]);
      console.log("kp", res);
      const doc = res.documents[0];
      const err = res.errors[0];
      return {
        id: 0,
        keyPhrases: doc ? doc.keyPhrases : [],
        error: err ? err.message : undefined,
      };
    },
    async keyPhrasesBatch(_, { documents }) {
      const res = await callAzure(
        EndpointEnum.KeyPhrases,
        documents.map((d) => ({ language: "en", ...d })) // ensure language
      );
      return {
        id: hash(documents),
        documentKeyPhrases: res.documents,
        errors: res.errors,
      };
    },
  },
};
