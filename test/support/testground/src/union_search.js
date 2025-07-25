import instantsearch from "instantsearch.js";
import { searchBox, pagination, hits, stats, index } from "instantsearch.js/es/widgets";

import TypesenseInstantSearchAdapter from "typesense-instantsearch-adapter";

const typesenseInstantsearchAdapter = new TypesenseInstantSearchAdapter({
  server: {
    apiKey: "xyz", // Be sure to use an API key that only has search permissions, since this is exposed in the browser
    nodes: [
      {
        host: "localhost",
        port: "8109",
        protocol: "http",
      },
    ],
  },
  // Enable union search to merge results from multiple collections
  union: true,
  // The following parameters are directly passed to Typesense's search API endpoint.
  //  So you can pass any parameters supported by the search endpoint below.
  // Parameters set in collectionSpecificSearchParameters override parameters set in additionalSearchParameters
  collectionSpecificSearchParameters: {
    products: {
      query_by: "name,description,categories",
    },
    brands: {
      query_by: "name",
    },
  },
});

const searchClient = typesenseInstantsearchAdapter.searchClient;
const search = instantsearch({
  searchClient,
  indexName: "products",
  routing: true,
});

// ============ Begin Widget Configuration
search.addWidgets([
  searchBox({
    container: "#searchbox",
  }),
  pagination({
    container: "#pagination",
  }),
  index({ indexName: "products" }).addWidgets([
    hits({
      container: "#hits",
      templates: {
        item: `
        <div>
          <img src="{{image}}" align="left" alt="{{name}}" />
          <div class="hit-name">
            {{#helpers.highlight}}{ "attribute": "name" }{{/helpers.highlight}}
          </div>
          <div class="hit-description">
            {{#helpers.highlight}}{ "attribute": "description" }{{/helpers.highlight}}
          </div>
          <div class="hit-price">\${{price}}</div>
          <div class="hit-rating">Categories: {{categories}}</div>
          <div class="hit-rating">Rating: {{rating}}</div>
          <div class="hit-free-shipping">Free Shipping: {{free_shipping}}</div>
        </div>
      `,
      },
    }),
    stats({
      container: "#stats",
      templates: {
        text: `
      {{#hasNoResults}}No results{{/hasNoResults}}
      {{#hasOneResult}}1 result{{/hasOneResult}}
      {{#hasManyResults}}{{#helpers.formatNumber}}{{nbHits}}{{/helpers.formatNumber}} results{{/hasManyResults}}
      found in {{processingTimeMS}}ms for {{query}}
    `,
      },
    }),
  ]),
  index({ indexName: "brands" }),
]);

search.start();
