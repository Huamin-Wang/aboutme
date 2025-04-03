// api.js
const owner = "wang_hua_min";
const repo = "we-chat-data";
const imgs_repo = "bbs_images";
const path = "data/forumData.json";
const token = "4918bb3947dbf1402d7331a65bab1b3e";
const image_folder = "images";

const apiUrl = `https://gitee.com/api/v5/repos/${owner}/${repo}/contents/${path}`;
const headers = {
    "Authorization": `token ${token}`,
    "Accept": "application/json"
};

async function fetchFromGitee(url, options = {}) {
    const response = await fetch(url, options);
    if (!response.ok) {
        const errorDetails = await response.json();
        console.error('Error details:', errorDetails);
        throw new Error(`Gitee API request failed: ${response.status} ${response.statusText}`);
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
                "Accept": "application/json"
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