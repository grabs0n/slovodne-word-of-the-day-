import fetch from 'node-fetch';

export async function getWikipediaSummary(searchTerm) {
    const userAgent = 'SlovoDneBot/1.0 (grabson06@gmail.com)';

    try {
        // Step 1: Search for the article on Czech Wikipedia
        const searchUrl = `https://cs.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(searchTerm)}&format=json`;
        const searchResponse = await fetch(searchUrl, { headers: { 'User-Agent': userAgent } });

        if (!searchResponse.ok) {
            throw new Error(`Search request failed with status ${searchResponse.status}`);
        }

        const searchData = await searchResponse.json();

        if (searchData.query.search.length === 0) {
            console.log('No results found');
            return;
        }

        // Get the title of the first search result
        const title = searchData.query.search[0].title;

        // Step 2: Fetch the summary of the article from Czech Wikipedia
        const summaryUrl = `https://cs.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
        const summaryResponse = await fetch(summaryUrl, { headers: { 'User-Agent': userAgent } });

        if (!summaryResponse.ok) {
            throw new Error(`Summary request failed with status ${summaryResponse.status}`);
        }

        const summaryData = await summaryResponse.json();

        if (!summaryData.extract) {
            console.log('No summary available for this article');
            return;
        }

        // Display the summary
        // console.log(`Title: ${summaryData.title}`);
        // console.log(`Summary: ${summaryData.extract}`);
        return summaryData;
    } catch (error) {
        console.error('Error fetching Wikipedia summary:', error);
    }
}

// console.log(await getWikipediaSummary('Komárek'));
