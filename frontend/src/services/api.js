// Simulate fetching data from platforms
// In a real app, this would call backend proxies to avoid CORS or use official APIs

export const fetchLeetCodeStats = async (handle) => {
    try {
        const response = await fetch(`/api/auth/leetcode/${handle}`);
        if (!response.ok) throw new Error('Failed to fetch LeetCode');
        const data = await response.json();

        return {
            count: data.totalSolved,
            history: data.submissionCalendar, // { "timestamp": count }
            activeSeconds: data.totalSolved * 1800 // Est. 30 mins per problem
        };
    } catch (error) {
        console.warn('LeetCode fetch failed (likely CORS or invalid handle), using mock data:', error);
        // Fallback Mock
        return { count: "-", activeSeconds: 0 };
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
                return {
                    count: solved.size,
                    activeSeconds: solved.size * 2400 // Est. 40 mins per problem
                };
            }
        }
        return { count: 120, activeSeconds: 120 * 2400 }; // Default fallback
    } catch (error) {
        console.warn('CodeForces fetch failed, using mock data:', error);
        return { count: "-", activeSeconds: 0 };
    }
};

export const fetchCodeChefStats = async (handle) => {
    // CodeChef does not have a simple public CORS-friendly API.
    // We will return mock data for the demo.
    return new Promise(resolve => {
        setTimeout(() => resolve(Math.floor(Math.random() * 50) + 40), 500);
    });
};
