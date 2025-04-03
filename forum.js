// forum.js
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('postButton').addEventListener('click', togglePostForm);
    document.getElementById('postFormElement').addEventListener('submit', submitPost);
    loadPosts(1);
});

async function loadPosts(page = 1, pageSize = 10) {
    const loadingMessage = document.getElementById('loadingMessage');
    const postsContainer = document.getElementById('posts');
    loadingMessage.style.display = 'block';
    postsContainer.innerHTML = '';

    try {
        const { content } = await getFileContent();
        content.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        const totalPages = Math.ceil(content.length / pageSize);
        displayPosts(content.slice((page - 1) * pageSize, page * pageSize));
        setupPagination(totalPages, page);
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        loadingMessage.style.display = 'none';
    }
}

function togglePostForm() {
    const postForm = document.getElementById('postForm');
    postForm.style.display = postForm.style.display === 'none' ? 'block' : 'none';
}

function displayPosts(posts) {
    const postsContainer = document.getElementById('posts');
    const fragment = document.createDocumentFragment();

    posts.forEach(post => {
        const postElement = document.createElement('div');
        postElement.classList.add('post');
        postElement.innerHTML = `
            <a href="post.html?id=${post.id}" class="post-title">${post.title}</a>
            <div class="timestamp">${new Date(post.timestamp).toLocaleString()}</div>
        `;
        fragment.appendChild(postElement);
    });

    postsContainer.appendChild(fragment);
}

function setupPagination(totalPages, currentPage) {
    const paginationContainer = document.getElementById('pagination');
    paginationContainer.innerHTML = '';

    for (let i = 1; i <= totalPages; i++) {
        const pageLink = document.createElement('button');
        pageLink.textContent = i;
        if (i === currentPage) pageLink.classList.add('active');
        pageLink.onclick = () => loadPosts(i);
        paginationContainer.appendChild(pageLink);
    }
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