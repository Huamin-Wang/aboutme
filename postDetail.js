document.addEventListener('DOMContentLoaded', () => {
    const postId = new URLSearchParams(window.location.search).get('id');
    loadPostDetail(postId);
});

async function loadPostDetail(postId) {
    try {
        const { content } = await getFileContent();
        const post = content.find(p => p.id === postId);
        if (!post) throw new Error("Post not found");

        document.getElementById('postTitle').textContent = post.title;
        document.getElementById('postContent').textContent = post.content;
        document.getElementById('postTimestamp').textContent = new Date(post.timestamp).toLocaleString();
        document.title = post.title;

        if (post.uniqueFilename) {
            const imagePath = `https://gitee.com/api/v5/repos/${owner}/${imgs_repo}/contents/${image_folder}/${post.uniqueFilename}`;
            const imageUrl = await fetchImage(imagePath, token);
            document.getElementById('postImage').src = imageUrl;
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

async function fetchImage(imagePath, token) {
    const response = await fetch(imagePath, {
        headers: {
            "Authorization": `token ${token}`,
            "Accept": "application/json"
        }
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
    }

    const fileData = await response.json();
    const fileContentBase64 = fileData.content;
    return URL.createObjectURL(new Blob([new Uint8Array(atob(fileContentBase64).split("").map(char => char.charCodeAt(0)))]));
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
            <button class="like-button" data-reply-index="${index}">同意 (${reply.likes || 0})</button>
            <button class="dislike-button" data-reply-index="${index}">不同意 (${reply.dislikes || 0})</button>
        `;

        fragment.appendChild(replyElement);
    });

    repliesContainer.appendChild(fragment);
    document.querySelectorAll('.like-button').forEach(button => {
        button.addEventListener('click', handleLike);
        button.addEventListener('dblclick', handleLike);

        // 增加移动端触摸事件支持
        button.addEventListener('touchstart', handleLike);
        button.addEventListener('touchend', handleLike);
    });

    document.querySelectorAll('.dislike-button').forEach(button => {
        button.addEventListener('click', handleDislike);
        button.addEventListener('dblclick', handleDislike);

        // 增加移动端触摸事件支持
        button.addEventListener('touchstart', handleDislike);
        button.addEventListener('touchend', handleDislike);
    });
}

async function submitReply(postId) {
    const replyContent = document.getElementById('replyInput').value;
    const newReply = { content: replyContent, timestamp: new Date().toISOString() };

    // Immediately add the new reply to the page
    const repliesContainer = document.getElementById('replies');
    const replyElement = document.createElement('div');
    replyElement.classList.add('reply');
    replyElement.innerHTML = `
        ${repliesContainer.children.length + 1}楼: ${newReply.content}
        <span class="reply-timestamp">${new Date(newReply.timestamp).toLocaleString()}</span>
        <button class="like-button" data-reply-index="${repliesContainer.children.length}">Like (0)</button>
        <button class="dislike-button" data-reply-index="${repliesContainer.children.length}">Dislike (0)</button>
    `;
    repliesContainer.appendChild(replyElement);

    // Reset the reply form
    document.getElementById('replyForm').reset();

    // Show loading indicator
    const loadingIndicator = document.getElementById('loadingIndicator');
    loadingIndicator.style.display = 'block';

    try {
        let { sha, content: fileContent } = await getFileContent();
        const post = fileContent.find(p => p.id === postId);
        post.replies.push(newReply);
        await updateFileContent(fileContent, sha);
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

        event.target.textContent = `${type === 'like' ? '👍' : '👎'} (${type === 'like' ? reply.likes : reply.dislikes})`;

        await updateFileContent(fileContent, sha);

        // Update the UI immediately
        loadPostDetail(postId);
    } catch (error) {
        console.error(`Error in handle${type.charAt(0).toUpperCase() + type.slice(1)}:`, error.message);
    }
}

async function getUserIP() {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
}
