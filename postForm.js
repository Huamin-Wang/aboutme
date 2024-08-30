// postForm.js
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('postButton').addEventListener('click', togglePostForm);
    document.getElementById('postFormElement').addEventListener('submit', submitPost);
});

function togglePostForm() {
    const postForm = document.getElementById('postForm');
    postForm.style.display = postForm.style.display === 'none' ? 'block' : 'none';
}

async function submitPost(event) {
    event.preventDefault();
    const title = document.getElementById('postTitle').value;
    const content = document.getElementById('postContent').value;
    const newPost = { id: generateUniqueId(), title, content, timestamp: new Date().toISOString(), replies: [] };

    try {
        let { sha, content: fileContent } = await getFileContent();
        fileContent.push(newPost);
        await updateFileContent(fileContent, sha);
        loadPosts();
        document.getElementById('postFormElement').reset();
    } catch (error) {
        console.error('Error:', error.message);
    }
}

function generateUniqueId() {
    return '_' + Math.random().toString(36).substr(2, 9);
}