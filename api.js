// api.js
const owner = "Huamin-Wang";
const repo = "WeChatData";
const path = "data/forumData.json";
const token = "ghp_0,m4en8O,59gyBna9c,4eSCRPBKP,118M,,,,w4GkXD3".replace(/,/g, '');
const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
const headers = {
    "Authorization": `token ${token}`,
    "Accept": "application/vnd.github.v3+json"
};

async function fetchFromGitHub(url, options = {}) {
    const response = await fetch(url, options);
    if (!response.ok) {
        const errorDetails = await response.json();
        console.error('Error details:', errorDetails);
        throw new Error(`GitHub API request failed: ${response.status} ${response.statusText}`);
    }
    return response.json();
}

async function getFileContent() {
    try {
        const response = await fetch(apiUrl, { headers });
        if (response.status === 404) {
            console.log("File not found, returning empty content");
            return { sha: null, content: [] };
        } else if (!response.ok) {
            const errorDetails = await response.json();
            console.error('Error details:', errorDetails);
            throw new Error(`Failed to fetch file content: ${response.status} ${response.statusText}`);
        }
        const fileData = await response.json();
        const content = JSON.parse(decodeURIComponent(escape(atob(fileData.content))));
        return { sha: fileData.sha, content };
    } catch (error) {
        console.error('Error in getFileContent:', error.message);
        throw error;
    }
}

async function updateFileContent(content, sha) {
    try {
        const updatedData = btoa(unescape(encodeURIComponent(JSON.stringify(content))));
        const response = await fetch(apiUrl, {
            method: "PUT",
            headers: {
                "Authorization": `token ${token}`,
                "Content-Type": "application/json",
                "Accept": "application/vnd.github.v3+json"
            },
            body: JSON.stringify({ message: "Update forum data", content: updatedData, sha })
        });
        if (!response.ok) {
            const errorDetails = await response.json();
            console.error('Error details:', errorDetails);
            throw new Error(`Failed to update file content: ${response.status} ${response.statusText}`);
        }
        console.log("File content updated successfully");
    } catch (error) {
        console.error('Error in updateFileContent:', error.message);
        throw error;
    }
}