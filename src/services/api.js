// Simulate fetching data from platforms
// In a real app, this would call backend proxies to avoid CORS or use official APIs

export const fetchLeetCodeStats = async (handle) => {
    try {
        // Attempt to use a public API proxy for LeetCode
        // If this fails, we fall back to mock data for demonstration
        const response = await fetch(`https://leetcode-stats-api.herokuapp.com/${handle}`);
        if (!response.ok) throw new Error('Failed to fetch LeetCode');
        const data = await response.json();

        if (data.status === 'error') throw new Error(data.message);

        return data.totalSolved; // Returns number
    } catch (error) {
        console.warn('LeetCode fetch failed (likely CORS or invalid handle), using mock data:', error);
        // Fallback Mock
        return Math.floor(Math.random() * 50) + 150;
    }
};

export const fetchCodeForcesStats = async (handle) => {
    try {
        const response = await fetch(`https://codeforces.com/api/user.info?handles=${handle}`);
        if (!response.ok) throw new Error('Failed to fetch CodeForces');
        const data = await response.json();

        // CodeForces API returns rank, rating, etc. but not simple "solved count" directly in user.info
        // We would typically need to fetch user.status and count AC submissions.
        // For this demo, we'll simulate a count based on rating or just return a mock if logic is too heavy for client

        // Let's try to fetch status (submissions)
        const statusRes = await fetch(`https://codeforces.com/api/user.status?handle=${handle}&from=1&count=1000`);
        if (statusRes.ok) {
            const statusData = await statusRes.json();
            if (statusData.status === "OK") {
                // Count unique solved problems
                const solved = new Set();
                statusData.result.forEach(sub => {
                    if (sub.verdict === "OK") {
                        solved.add(`${sub.problem.contestId}-${sub.problem.index}`);
                    }
                });
                return solved.size;
            }
        }
        return 120; // Default fallback
    } catch (error) {
        console.warn('CodeForces fetch failed, using mock data:', error);
        return Math.floor(Math.random() * 50) + 80;
    }
};

export const fetchCodeChefStats = async (handle) => {
    // CodeChef does not have a simple public CORS-friendly API.
    // We will return mock data for the demo.
    return new Promise(resolve => {
        setTimeout(() => resolve(Math.floor(Math.random() * 50) + 40), 500);
    });
};
