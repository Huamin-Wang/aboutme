// app.js
document.getElementById('postForm').addEventListener('submit', (event) => {
    event.preventDefault();
    submitPost();
});

async function submitPost() {
    const title = document.getElementById('postTitle').value;
    const content = document.getElementById('postContent').value;
    const timestamp = new Date().toISOString();
    const newPost = { title, content, timestamp, replies: [] };

    try {
        let { sha, content: fileContent } = await getFileContent();
        fileContent.push(newPost);
        await updateFileContent(fileContent, sha);
        loadPosts();
    } catch (error) {
        console.error('Error in submitPost:', error.message);
    }
}

async function getFileContent() {
    try {
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
            headers: { "Authorization": `token ${token}`, "Accept": "application/vnd.github.v3+json" }
        });

        if (response.status === 404) {
            console.log("File not found, returning empty content");
            return { sha: null, content: [] };
        } else if (!response.ok) {
            throw new Error('Failed to fetch file content');
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
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
            method: "PUT",
            headers: {
                "Authorization": `token ${token}`,
                "Content-Type": "application/json",
                "Accept": "application/vnd.github.v3+json"
            },
            body: JSON.stringify({ message: "Update forum data", content: updatedData, sha })
        });

        if (!response.ok) {
            throw new Error('Failed to update file content');
        }

        console.log("File content updated successfully");
    } catch (error) {
        console.error('Error in updateFileContent:', error.message);
        throw error;
    }
}