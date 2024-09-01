// forum.js
// forum.js

// forum.js
document.getElementById('uploadForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    const imageInput = document.getElementById('imageInput');
    const file = imageInput.files[0];
    const maxSize = 2 * 1024 * 1024; // 2MB

    if (file.size > maxSize) {
        alert('Error: File size exceeds 2MB');
        return;
    }

    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch('/upload_image', {
        method: 'POST',
        body: formData
    });

    if (response.ok) {
        const result = await response.json();
        alert(result.message);
        const imageUrl = `/download_image/${file.name}`;
        document.getElementById('uploadedImage').innerHTML = `<img src="${imageUrl}" alt="Uploaded Image">`;
    } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
    }
});


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
            const latestA = new Date(a.timestamp);
            const latestB = new Date(b.timestamp);
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

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('postButton').addEventListener('click', togglePostForm);
    document.getElementById('postFormElement').addEventListener('submit', submitPost);
    loadPosts(1);
});

function togglePostForm() {
    const postForm = document.getElementById('postForm');
    postForm.style.display = postForm.style.display === 'none' ? 'block' : 'none';
}

async function loadPosts(page = 1, pageSize = 10) {
    const loadingMessage = document.getElementById('loadingMessage');
    const postsContainer = document.getElementById('posts');
    loadingMessage.style.display = 'block';
    postsContainer.innerHTML = '';

    try {
        const { content } = await getFileContent();
        content.sort((a, b) => {
            const latestA = new Date(a.timestamp);
            const latestB = new Date(b.timestamp);
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
async function loadPostDetail(postId) {
    try {
        const { content } = await getFileContent();
        const post = content.find(p => p.id === postId);
        if (!post) throw new Error("Post not found");

        document.getElementById('postTitle').textContent = post.title;
        document.getElementById('postContent').textContent = post.content;
        document.getElementById('postTimestamp').textContent = new Date(post.timestamp).toLocaleString();
        displayReplies(post.replies);

        // Add event listener for reply form submission
        document.getElementById('replyForm').addEventListener('submit', (event) => {
            event.preventDefault();
            submitReply(postId);
        });
    } catch (error) {
        console.error('Error:', error.message);
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

async function submitReply(postId) {
    const replyContent = document.getElementById('replyInput').value;
    const newReply = { content: replyContent, timestamp: new Date().toISOString() };

    try {
        let { sha, content: fileContent } = await getFileContent();
        const post = fileContent.find(p => p.id === postId);
        post.replies.push(newReply);
        await updateFileContent(fileContent, sha);
        loadPostDetail(postId);
        document.getElementById('replyForm').reset();
    } catch (error) {
        console.error('Error:', error.message);
    }
}

async function handleLike(event) {
    await handleReaction(event, 'like');
}

async function handleDislike(event) {
    await handleReaction(event, 'dislike');
}

// postDetail.js
async function handleReaction(event, type) {
    const replyIndex = event.target.getAttribute('data-reply-index');
    const postId = new URLSearchParams(window.location.search).get('id');
    const userIP = await getUserIP();

    try {
        let { sha, content: fileContent } = await getFileContent();
        const post = fileContent.find(p => p.id === postId);
        const reply = post.replies[replyIndex];

        if (type === 'like') {
            if (reply.likedIPs && reply.likedIPs.includes(userIP)) {
                reply.likes -= 1;
                reply.likedIPs = reply.likedIPs.filter(ip => ip !== userIP);
                event.target.classList.remove('liked');
            } else {
                if (reply.dislikedIPs && reply.dislikedIPs.includes(userIP)) {
                    alert('您已经点踩过该回复，不能点赞');
                    return;
                }
                reply.likes = (reply.likes || 0) + 1;
                reply.likedIPs = reply.likedIPs || [];
                reply.likedIPs.push(userIP);
                event.target.classList.add('liked');
                event.target.classList.add('like-animation');
                setTimeout(() => event.target.classList.remove('like-animation'), 500);
            }
        } else {
            if (reply.dislikedIPs && reply.dislikedIPs.includes(userIP)) {
                reply.dislikes -= 1;
                reply.dislikedIPs = reply.dislikedIPs.filter(ip => ip !== userIP);
                event.target.classList.remove('disliked');
            } else {
                if (reply.likedIPs && reply.likedIPs.includes(userIP)) {
                    alert('您已经点赞过该回复，不能点踩');
                    return;
                }
                reply.dislikes = (reply.dislikes || 0) + 1;
                reply.dislikedIPs = reply.dislikedIPs || [];
                reply.dislikedIPs.push(userIP);
                event.target.classList.add('disliked');
                event.target.classList.add('dislike-animation');
                setTimeout(() => event.target.classList.remove('dislike-animation'), 500);
            }
        }

        event.target.textContent = `${type === 'like' ? 'Like' : 'Dislike'} (${type === 'like' ? reply.likes : reply.dislikes})`;

        updateFileContent(fileContent, sha).catch(error => {
            console.error(`Error in handle${type.charAt(0).toUpperCase() + type.slice(1)}:`, error.message);
        });
    } catch (error) {
        console.error(`Error in handle${type.charAt(0).toUpperCase() + type.slice(1)}:`, error.message);
    }
}



async function getUserIP() {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
}