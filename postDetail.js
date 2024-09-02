// postDetail.js
document.addEventListener('DOMContentLoaded', () => {
    const postId = new URLSearchParams(window.location.search).get('id');
    loadPostDetail(postId);
});

// postDetail.js
async function loadPostDetail(postId) {
    try {
        const { content } = await getFileContent();
        const post = content.find(p => p.id === postId);
        if (!post) throw new Error("Post not found");

        document.getElementById('postTitle').textContent = post.title;
        document.getElementById('postContent').textContent = post.content;
        document.getElementById('postTimestamp').textContent = new Date(post.timestamp).toLocaleString();

        if (post.image) {
            document.getElementById('postImage').src = post.image;
            document.getElementById('postImage').style.display = 'block';
        } else {
            document.getElementById('postImage').style.display = 'none';
        }

        displayReplies(post.replies);

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

    // Show loading indicator
    const loadingIndicator = document.getElementById('loadingIndicator');
    loadingIndicator.style.display = 'block';

    try {
        let { sha, content: fileContent } = await getFileContent();
        const post = fileContent.find(p => p.id === postId);
        post.replies.push(newReply);
        await updateFileContent(fileContent, sha);
        loadPostDetail(postId);
        document.getElementById('replyForm').reset();
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        // Hide loading indicator
        loadingIndicator.style.display = 'none';
    }
}

async function handleLike(event) {
    await handleReaction(event, 'like');
}

async function handleDislike(event) {
    await handleReaction(event, 'dislike');
}

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
                    reply.dislikes -= 1;
                    reply.dislikedIPs = reply.dislikedIPs.filter(ip => ip !== userIP);
                    document.querySelector(`.dislike-button[data-reply-index="${replyIndex}"]`).classList.remove('disliked');
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
                    reply.likes -= 1;
                    reply.likedIPs = reply.likedIPs.filter(ip => ip !== userIP);
                    document.querySelector(`.like-button[data-reply-index="${replyIndex}"]`).classList.remove('liked');
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

        await updateFileContent(fileContent, sha);

        // Update the UI immediately
        loadPostDetail(postId);
    } catch (error) {
        console.error(`Error in handle${type.charAt(0).toUpperCase() + type.slice(1)}:`, error.message);
    }
}

document.querySelectorAll('.like-button').forEach(button => {
    button.addEventListener('click', handleLike);
    button.addEventListener('dblclick', handleLike);
});

document.querySelectorAll('.dislike-button').forEach(button => {
    button.addEventListener('click', handleDislike);
    button.addEventListener('dblclick', handleDislike);
});

async function getUserIP() {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
}