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



// postList.js
function displayPosts(posts) {
    const postsContainer = document.getElementById('posts');
    const fragment = document.createDocumentFragment();

    posts.forEach(post => {
        const postElement = document.createElement('div');
        postElement.classList.add('post');
        postElement.innerHTML = `
            <a href="post.html?id=${post.id}" class="post-title">${post.title}</a>
            <div class="timestamp">${new Date(post.timestamp).toLocaleString()}</div>
            ${post.image ? `<img src="${post.image}" alt="Post Image" class="post-image">` : ''}
        `;
        fragment.appendChild(postElement);
    });

    postsContainer.appendChild(fragment);
}

// postDetail.js
function displayReplies(replies) {
    const repliesContainer = document.getElementById('replies');
    repliesContainer.innerHTML = '';
    const fragment = document.createDocumentFragment();

    replies.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    replies.forEach((reply, index) => {
        const replyElement = document.createElement('div');
        replyElement.classList.add('reply');
        replyElement.innerHTML = `
            ${index + 1}楼: ${reply.content}
            <span class="reply-timestamp">${new Date(reply.timestamp).toLocaleString()}</span>
            <button class="like-button" data-reply-index="${index}">Like (${reply.likes || 0})</button>
            <button class="dislike-button" data-reply-index="${index}">Dislike (${reply.dislikes || 0})</button>
        `;
        fragment.appendChild(replyElement);
    });

    repliesContainer.appendChild(fragment);
    document.querySelectorAll('.like-button').forEach(button => button.addEventListener('click', handleLike));
    document.querySelectorAll('.dislike-button').forEach(button => button.addEventListener('click', handleDislike));
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