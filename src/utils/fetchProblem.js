// NMKRSPVLIDATAPERMANENE
const fetchProblemDetails = async (contestId, index, retries = 3) => {
  const url = `http://localhost:5000/fetchProblem?contestId=${contestId}&index=${index}`;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`Attempt ${attempt}: Fetching URL: ${url}`);
      const response = await axios.get(url);
      const html = response.data;
      const $ = cheerio.load(html);

      const name = $('.title').text().trim();
      const description = $('.problem-statement .header').next().html()?.trim();
      const inputFormat = $('.input-specification').html()?.trim();
      const outputFormat = $('.output-specification').html()?.trim();
      const constraints = $('.constraints').html()?.trim();
      const examples = $('.sample-test').html()?.trim();

      console.log("Extracted Problem Details:", { name, description, inputFormat, outputFormat, constraints, examples });
      return { name, description, inputFormat, outputFormat, constraints, examples };
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error.message);
      if (attempt === retries) {
        console.error("All attempts failed.");
        return null;
      }
    }
  }
};

export default fetchProblemDetails;