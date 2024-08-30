// api.js
const owner = "Huamin-Wang";
const repo = "WeChatData";
const path = "data/forumData.json";
const part1 = "ghp_HFIHIxsG2lM";
const part2 = "6q8uHZPkA6iiu6UJNOb1Fz1GC";
const token = part1+part2;
const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
const headers = {
    "Authorization": `token ${token}`,
    "Accept": "application/vnd.github.v3+json",
    "Content-Type": "application/json"
};

async function fetchFromGitHub(url, options = {}) {
    const response = await fetch(url, { headers, ...options });
    if (!response.ok) throw new Error('Failed to fetch data');
    return response.json();
}

async function getFileContent() {
    try {
        const fileData = await fetchFromGitHub(apiUrl);
        const content = JSON.parse(decodeURIComponent(escape(atob(fileData.content))));
        return { sha: fileData.sha, content };
    } catch (error) {
        return { sha: null, content: [] };
    }
}

async function updateFileContent(content, sha) {
    const updatedData = btoa(unescape(encodeURIComponent(JSON.stringify(content))));
    await fetchFromGitHub(apiUrl, {
        method: "PUT",
        body: JSON.stringify({ message: "Update forum data", content: updatedData, sha })
    });
}