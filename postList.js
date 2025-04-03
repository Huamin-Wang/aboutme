// postList.js
async function loadPosts(page = 1) {
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

async function displayPosts(posts) {
    const postsContainer = document.getElementById('posts');
    const fragment = document.createDocumentFragment();
    let imagesToLoad = 0;

    const lazyImageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(async (entry) => {
            if (entry.isIntersecting) {
                const imgElement = entry.target;
                const post = imgElement.postData;
                try {
                    const imagePath = `https://gitee.com/api/v5/repos/${owner}/${imgs_repo}/contents/${image_folder}/${post.uniqueFilename}`;
                    const imageUrl = await fetchImage(imagePath, token);
                    imgElement.src = imageUrl;
                } catch (error) {
                    console.error('Error fetching image:', error.message);
                } finally {
                    imagesToLoad--;
                    if (imagesToLoad === 0) {
                        loadingMessage.style.display = 'none';
                    }
                    observer.unobserve(imgElement);
                }
            }
        });
    });

    for (const post of posts) {
        const postElement = document.createElement('div');
        postElement.classList.add('post');
        postElement.innerHTML = `
            <a href="post.html?id=${post.id}" class="post-title">${post.title}</a>
            <div class="timestamp">${new Date(post.timestamp).toLocaleString()}</div>
        `;

        if (post.uniqueFilename) {
            imagesToLoad++;
            const imgElement = document.createElement('img');
            imgElement.alt = 'Post Image';
            imgElement.classList.add('post-image');
            imgElement.postData = post;
            imgElement.style.width = 'auto';
            imgElement.style.height = '200px';
            imgElement.src = 'img/placeholder.gif';
            imgElement.addEventListener('click', () => {
                window.location.href = `post.html?id=${post.id}`;
            });

            lazyImageObserver.observe(imgElement);
            postElement.appendChild(imgElement);
        }

        fragment.appendChild(postElement);
    }

    postsContainer.appendChild(fragment);

    if (imagesToLoad === 0) {
        loadingMessage.style.display = 'none';
    }
}

async function fetchImage(imagePath, token) {
    const response = await fetch(imagePath, {
        headers: {
            'Authorization': `token ${token}`
        }
    });
    const data = await response.json();
    return `data:${data.content_type};base64,${data.content}`;
}

let currentPage = 1;
let isLoading = false;
const pageSize = 4;

async function loadPostsChunk(page) {
    if (isLoading) return;
    isLoading = true;

    const loadingMessage = document.getElementById('loadingMessage');
    loadingMessage.style.display = 'block';

    try {
        const { content } = await getFileContent();
        content.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
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

document.addEventListener('DOMContentLoaded', () => {
    loadPosts(1);
    window.addEventListener('scroll', handleScroll);
});