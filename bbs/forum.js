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