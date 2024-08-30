// postList.js
document.addEventListener('DOMContentLoaded', () => {
    loadPosts(1);
});


// postList.js
async function loadPosts(page = 1, pageSize = 10) {
    const loadingMessage = document.getElementById('loadingMessage');
    const postsContainer = document.getElementById('posts');
    loadingMessage.style.display = 'block';
    postsContainer.innerHTML = '';

    try {
        const { content } = await getFileContent();
        console.log("Fetched content:", content);  // Debugging log

        // Sort posts by the latest activity timestamp (post or comment)
        content.sort((a, b) => {
            let latestA = new Date(a.timestamp);
            let latestB = new Date(b.timestamp);
            if (a.replies.length > 0) {
                const latestReplyA = new Date(a.replies[a.replies.length - 1].timestamp);
                if (latestReplyA > latestA) latestA = latestReplyA;
            }
            if (b.replies.length > 0) {
                const latestReplyB = new Date(b.replies[b.replies.length - 1].timestamp);
                if (latestReplyB > latestB) latestB = latestReplyB;
            }
            return latestB - latestA;
        });

        console.log("Sorted content:", content);  // Debugging log

        const totalPages = Math.ceil(content.length / pageSize);
        displayPosts(content.slice((page - 1) * pageSize, page * pageSize));
        setupPagination(totalPages, page);
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        loadingMessage.style.display = 'none';
    }
}
function displayPosts(posts) {
    const postsContainer = document.getElementById('posts');
    const fragment = document.createDocumentFragment();

    console.log("Displaying posts:", posts);  // Debugging log

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