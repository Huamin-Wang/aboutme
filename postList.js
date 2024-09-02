// postList.js







// postList.js
let currentPage = 1;
let isLoading = false;
// postList.js
const pageSize = 4; // Set page size to 4

async function loadPosts(page = 1) {
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
async function fetchImage(imagePath, token) {
    const response = await fetch(imagePath, {
        headers: {
            "Authorization": `token ${token}`,
            "Accept": "application/json"
        }
    });
    if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    const fileData = await response.json();
    const fileContentBase64 = fileData.content;
    return URL.createObjectURL(new Blob([new Uint8Array(atob(fileContentBase64).split("").map(char => char.charCodeAt(0)))]));
}

async function displayPosts(posts) {
    const postsContainer = document.getElementById('posts');
    const fragment = document.createDocumentFragment();
    const token = "4918bb3947dbf1402d7331a65bab1b3e";
    const owner = "wang_hua_min";
    const repo = "we-chat-data";
    const image_folder = "images";

    for (const post of posts) {
        const postElement = document.createElement('div');
        postElement.classList.add('post');
        postElement.innerHTML = `
            <a href="post.html?id=${post.id}" class="post-title">${post.title}</a>
            <div class="timestamp">${new Date(post.timestamp).toLocaleString()}</div>
        `;

        if (post.uniqueFilename) {
            try {
                const imagePath = `https://gitee.com/api/v5/repos/${owner}/${repo}/contents/${image_folder}/${post.uniqueFilename}`;
                const imageUrl = await fetchImage(imagePath, token);
                const imgElement = document.createElement('img');
                imgElement.src = imageUrl;
                imgElement.alt = 'Post Image';
                imgElement.classList.add('post-image');
                postElement.appendChild(imgElement);
            } catch (error) {
                console.error('Error fetching image:', error.message);
            }
        }

        fragment.appendChild(postElement);
    }

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

document.addEventListener('DOMContentLoaded', () => {
    loadPosts(1);
});

async function loadPostsChunk(page) {
    if (isLoading) return;
    isLoading = true;

    const loadingMessage = document.getElementById('loadingMessage');
    loadingMessage.style.display = 'block';

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

        const totalPages = Math.ceil(content.length / pageSize);
        const postsChunk = content.slice((page - 1) * pageSize, page * pageSize);
        displayPosts(postsChunk);

        if (page < totalPages) {
            currentPage++;
        } else {
            window.removeEventListener('scroll', handleScroll);
        }
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        loadingMessage.style.display = 'none';
        isLoading = false;
    }
}



function handleScroll() {
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
    if (scrollTop + clientHeight >= scrollHeight - 5) {
        loadPostsChunk(currentPage);
    }
}

// postList.js

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

