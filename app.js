// 处理发帖提交
document.getElementById('postForm').addEventListener('submit', (event) => {
    event.preventDefault();
    console.log("Submit post form triggered");  // 添加调试日志
    submitPost(event);
});

async function submitPost(event) {
    event.preventDefault();  // 阻止表单的默认提交行为
    const title = document.getElementById('postTitle').value;
    const content = document.getElementById('postContent').value;
    const imageFile = document.getElementById('postImage').files[0];
    const timestamp = new Date().toISOString();
    const id = generateUniqueId();
    let imageUrl = '';

    if (imageFile) {
        imageUrl = await uploadImage(imageFile);
    }

    const newPost = { id, title, content, imageUrl, timestamp, replies: [] };

    try {
        console.log("Fetching file content...");  // 添加调试日志
        let { sha, content: fileContent } = await getFileContent();
        console.log("File content fetched:", fileContent);  // 输出获取的文件内容

        fileContent.push(newPost);
        console.log("Updating file content with new post...");  // 添加调试日志
        await updateFileContent(fileContent, sha);
        console.log("File content updated");  // 添加调试日志
        loadPosts();  // 刷新帖子列表

        // 清空表单
        document.getElementById('postTitle').value = '';
        document.getElementById('postContent').value = '';
        document.getElementById('postImage').value = '';
    } catch (error) {
        console.error('Error in submitPost:', error.message);  // 输出错误信息
    }
}

// 获取 GitHub 文件内容
async function getFileContent() {
    try {
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
            headers: { "Authorization": `token ${token}`, "Accept": "application/vnd.github.v3+json" }
        });

        if (response.status === 404) {
            console.log("File not found, returning empty content");  // 添加调试日志
            return { sha: null, content: [] };  // 文件不存在，返回空内容
        } else if (!response.ok) {
            throw new Error('Failed to fetch file content');
        }

        const fileData = await response.json();
        const content = JSON.parse(decodeURIComponent(escape(atob(fileData.content))));
        return { sha: fileData.sha, content };
    } catch (error) {
        console.error('Error in getFileContent:', error.message);  // 输出错误信息
        throw error;  // 重新抛出错误以在上层捕获
    }
}

// 更新 GitHub 文件内容
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

        console.log("File content updated successfully");  // 添加调试日志
    } catch (error) {
        console.error('Error in updateFileContent:', error.message);  // 输出错误信息
        throw error;  // 重新抛出错误以在上层捕获
    }
}

async function uploadImage(imageFile) {
    const formData = new FormData();
    formData.append('file', imageFile);
    formData.append('message', 'Upload post image');
    formData.append('branch', 'main');

    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/images/${imageFile.name}`, {
        method: 'PUT',
        headers: {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json'
        },
        body: formData
    });

    if (!response.ok) {
        throw new Error('Failed to upload image');
    }

    const data = await response.json();
    return data.content.download_url;
}

function generateUniqueId() {
    return '_' + Math.random().toString(36).substr(2, 9);
}