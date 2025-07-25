describe("Union Search", () => {
  beforeAll(require("./support/beforeAll"), 60 * 1000);

  beforeEach(async () => {
    return page.goto("http://localhost:3000/union_search.html");
  }, 30 * 1000);

  describe("when searching for a term", () => {
    beforeEach(async () => {
      return expect(page).toFill("#searchbox input[type=search]", "Charger");
    });

    it("renders the merged results from multiple indices", async () => {
      // With union search, results from both indices should be merged into a single result set
      // The stats should show the combined count from both indices
      await expect(page).toMatchElement("#stats", {
        text: /\d+ results found/,
      });

      // Check that we have results displayed
      await expect(page).toMatchElement("#hits .ais-Hits-item:nth-of-type(1)");

      // Check that we have both product and brand results merged together
      // This verifies that union search is working by combining results from both collections
      await expect(page).toMatchElement("#hits", {
        text: /Charger/,
      });
    });

    it("displays merged results without separate index sections", async () => {
      // Unlike federated search which has separate sections for each index,
      // union search should merge everything into one result set

      // Should have merged results container
      await expect(page).toMatchElement("#hits");

      // Should have single stats container showing combined results
      await expect(page).toMatchElement("#stats");

      // Should not have separate product/brand sections like in federated search
      await expect(page).not.toMatchElement("#product-hits", { timeout: 1000 });
      await expect(page).not.toMatchElement("#brand-hits", { timeout: 1000 });
    });
  });

  describe("when searching for a brand-specific term", () => {
    beforeEach(async () => {
      return expect(page).toFill("#searchbox input[type=search]", "ChargeIt");
    });

    it("includes brand results in the unified result set", async () => {
      await expect(page).toMatchElement("#stats", {
        text: /\d+ results found/,
      });

      await expect(page).toMatchElement("#hits", {
        text: /ChargeIt/,
      });
    });
  });

  describe("pagination with union search", () => {
    beforeEach(async () => {
      return expect(page).toFill("#searchbox input[type=search]", "phone");
    });

    it("renders pagination controls for merged results from multiple indices", async () => {
      await page.waitForSelector("#pagination a.ais-Pagination-link");

      const paginationLinks = await page.$$("#pagination a.ais-Pagination-link");
      expect(paginationLinks.length).toBeGreaterThan(0);

      await expect(page).toMatchElement("#hits .ais-Hits-item:nth-of-type(1)");
    });

    it("shows different merged results when navigating to the second page", async () => {
      await page.waitForSelector("#pagination a.ais-Pagination-link");

      const firstPageFirstResult = await page.$eval("#hits .ais-Hits-item:nth-of-type(1)", (el) => el.textContent);

      await expect(page).toClick("#pagination a", { text: "2" });

      await page.waitForSelector("#hits .ais-Hits-item:nth-of-type(1)");

      const secondPageFirstResult = await page.$eval("#hits .ais-Hits-item:nth-of-type(1)", (el) => el.textContent);

      expect(firstPageFirstResult).not.toBe(secondPageFirstResult);

      await expect(page).toMatchElement("#hits");
      await expect(page).not.toMatchElement("#product-hits", { timeout: 1000 });
      await expect(page).not.toMatchElement("#brand-hits", { timeout: 1000 });
    });
  });
});
