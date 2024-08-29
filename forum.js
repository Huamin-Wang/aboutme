document.addEventListener('DOMContentLoaded', () => {
    // 显示发帖表单
    document.getElementById('postButton').addEventListener('click', () => {
        const postForm = document.getElementById('postForm');
        postForm.style.display = postForm.style.display === 'none' ? 'block' : 'none';
    });

    // 绑定发帖表单提交事件
    document.getElementById('postFormElement').addEventListener('submit', submitPost);

    // 加载第一页帖子
    loadPosts(1);
});

// 生成唯一ID
function generateUniqueId() {
    return '_' + Math.random().toString(36).substr(2, 9);
}

// 加载帖子列表并按时间排序
async function loadPosts(page = 1, pageSize = 10) {
    const loadingMessage = document.getElementById('loadingMessage');
    const postsContainer = document.getElementById('posts');
    loadingMessage.style.display = 'block';
    postsContainer.innerHTML = '';  // 清空旧的帖子

    try {
        const { content } = await getFileContent();

        // 按最新发帖或回复时间排序
        content.sort((a, b) => {
            const lastActivityA = a.replies.length ? new Date(a.replies[a.replies.length - 1].timestamp) : new Date(a.timestamp);
            const lastActivityB = b.replies.length ? new Date(b.replies[b.replies.length - 1].timestamp) : new Date(b.timestamp);
            return lastActivityB - lastActivityA;
        });

        // 分页处理
        const totalPosts = content.length;
        const totalPages = Math.ceil(totalPosts / pageSize);
        const start = (page - 1) * pageSize;
        const end = page * pageSize;
        const postsToShow = content.slice(start, end);

        displayPosts(postsToShow);
        setupPagination(totalPages, page);
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        loadingMessage.style.display = 'none';
    }
}
// 显示帖子标题
function displayPosts(posts) {
    const postsContainer = document.getElementById('posts');
    postsContainer.innerHTML = '';  // 清空旧的帖子

    posts.forEach((post) => {
        const postElement = document.createElement('div');
        postElement.classList.add('post');
        postElement.innerHTML = `
            <a href="post.html?id=${post.id}" class="post-title">${post.title}</a>
            <div class="timestamp">${new Date(post.timestamp).toLocaleString()}</div>
        `;
        postsContainer.appendChild(postElement);
    });
}

// 设置分页控件
function setupPagination(totalPages, currentPage) {
    const paginationContainer = document.getElementById('pagination');
    paginationContainer.innerHTML = '';

    for (let i = 1; i <= totalPages; i++) {
        const pageLink = document.createElement('button');
        pageLink.textContent = i;

        // 确保只有在 currentPage 有值时才添加 'active' 类
        if (i === currentPage) {
            pageLink.classList.add('active');
        }

        pageLink.onclick = () => loadPosts(i);
        paginationContainer.appendChild(pageLink);
    }
}

// 加载帖子详情
async function loadPostDetail(postId) {
    try {
        const { content } = await getFileContent();
        const post = content.find(p => p.id === postId);

        if (!post) {
            throw new Error("Post not found");
        }

        document.getElementById('postTitle').textContent = post.title;
        document.getElementById('postContent').textContent = post.content;
        document.getElementById('postTimestamp').textContent = new Date(post.timestamp).toLocaleString();

        // 显示回复
        displayReplies(post.replies);

    } catch (error) {
        console.error('Error:', error.message);
    }
}

// 显示回复
function displayReplies(replies) {
    const repliesContainer = document.getElementById('replies');
    repliesContainer.innerHTML = '';

    // 按时间先后排序回复
    replies.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    replies.forEach((reply, index) => {
        const replyElement = document.createElement('div');
        replyElement.classList.add('reply');
        replyElement.innerHTML = `
            ${index + 1}楼: ${reply.content}
            <span class="reply-timestamp">${new Date(reply.timestamp).toLocaleString()}</span>
        `;
        repliesContainer.appendChild(replyElement);
    });
}
// 获取用户IP地址
async function getUserIP() {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
}

// 处理点赞
async function handleLike(event) {
    const replyIndex = event.target.getAttribute('data-reply-index');
    const postId = new URLSearchParams(window.location.search).get('id');
    const userIP = await getUserIP();

    try {
        let { sha, content: fileContent } = await getFileContent();
        const post = fileContent.find(p => p.id === postId);
        const reply = post.replies[replyIndex];

        // 检查是否已经点赞
        if (reply.likedIPs && reply.likedIPs.includes(userIP)) {
            // 取消点赞
            reply.likes -= 1;
            reply.likedIPs = reply.likedIPs.filter(ip => ip !== userIP);
        } else {
            // 检查是否已经点踩
            if (reply.dislikedIPs && reply.dislikedIPs.includes(userIP)) {
                alert('您已经点踩过该回复，不能点赞');
                return;
            }
            // 更新点赞数和IP地址
            reply.likes = (reply.likes || 0) + 1;
            reply.likedIPs = reply.likedIPs || [];
            reply.likedIPs.push(userIP);
        }

        await updateFileContent(fileContent, sha);
        loadPostDetail(postId);  // 重新加载帖子详情以更新显示
    } catch (error) {
        console.error('Error in handleLike:', error.message);
    }
}

// 处理点踩
async function handleDislike(event) {
    const replyIndex = event.target.getAttribute('data-reply-index');
    const postId = new URLSearchParams(window.location.search).get('id');
    const userIP = await getUserIP();

    try {
        let { sha, content: fileContent } = await getFileContent();
        const post = fileContent.find(p => p.id === postId);
        const reply = post.replies[replyIndex];

        // 检查是否已经点踩
        if (reply.dislikedIPs && reply.dislikedIPs.includes(userIP)) {
            // 取消点踩
            reply.dislikes -= 1;
            reply.dislikedIPs = reply.dislikedIPs.filter(ip => ip !== userIP);
        } else {
            // 检查是否已经点赞
            if (reply.likedIPs && reply.likedIPs.includes(userIP)) {
                alert('您已经点赞过该回复，不能点踩');
                return;
            }
            // 更新点踩数和IP地址
            reply.dislikes = (reply.dislikes || 0) + 1;
            reply.dislikedIPs = reply.dislikedIPs || [];
            reply.dislikedIPs.push(userIP);
        }

        await updateFileContent(fileContent, sha);
        loadPostDetail(postId);  // 重新加载帖子详情以更新显示
    } catch (error) {
        console.error('Error in handleDislike:', error.message);
    }
}

// 显示回复
function displayReplies(replies) {
    const repliesContainer = document.getElementById('replies');
    repliesContainer.innerHTML = '';

    // 按时间先后排序回复
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
        repliesContainer.appendChild(replyElement);
    });

    // 添加事件监听器
    document.querySelectorAll('.like-button').forEach(button => {
        button.addEventListener('click', handleLike);
    });

    document.querySelectorAll('.dislike-button').forEach(button => {
        button.addEventListener('click', handleDislike);
    });
}

// 显示回复
function displayReplies(replies) {
    const repliesContainer = document.getElementById('replies');
    repliesContainer.innerHTML = '';

    // 按时间先后排序回复
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
        repliesContainer.appendChild(replyElement);
    });

    // 添加事件监听器
    document.querySelectorAll('.like-button').forEach(button => {
        button.addEventListener('click', handleLike);
    });

    document.querySelectorAll('.dislike-button').forEach(button => {
        button.addEventListener('click', handleDislike);
    });
}

// 显示回复
function displayReplies(replies) {
    const repliesContainer = document.getElementById('replies');
    repliesContainer.innerHTML = '';

    // 按时间先后排序回复
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
        repliesContainer.appendChild(replyElement);
    });

    // 添加事件监听器
    document.querySelectorAll('.like-button').forEach(button => {
        button.addEventListener('click', handleLike);
    });

    document.querySelectorAll('.dislike-button').forEach(button => {
        button.addEventListener('click', handleDislike);
    });
}
// 处理发帖提交
async function submitPost(event) {
    event.preventDefault();  // 阻止表单的默认提交行为
    const title = document.getElementById('postTitle').value;
    const content = document.getElementById('postContent').value;
    const timestamp = new Date().toISOString();
    const id = generateUniqueId();
    const newPost = { id, title, content, timestamp, replies: [] };

    try {
        let { sha, content: fileContent } = await getFileContent();
        fileContent.push(newPost);
        await updateFileContent(fileContent, sha);
        loadPosts();  // 刷新帖子列表

        // 清空表单
        document.getElementById('postTitle').value = '';
        document.getElementById('postContent').value = '';
    } catch (error) {
        console.error('Error:', error.message);
    }
}

// 处理回复提交
document.getElementById('replyForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const replyContent = document.getElementById('replyInput').value;
    const postId = new URLSearchParams(window.location.search).get('id');
    const timestamp = new Date().toISOString();
    const newReply = { content: replyContent, timestamp };

    try {
        let { sha, content: fileContent } = await getFileContent();
        const post = fileContent.find(p => p.id === postId);
        post.replies.push(newReply);
        await updateFileContent(fileContent, sha);
        loadPostDetail(postId);  // 刷新帖子详情

        // 清空回复表单
        document.getElementById('replyInput').value = '';
    } catch (error) {
        console.error('Error:', error.message);
    }
});