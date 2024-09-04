// postForm.js
let uniqueFilename;

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('postButton').addEventListener('click', togglePostForm);
    document.getElementById('postFormElement').addEventListener('submit', submitPost);
});

function togglePostForm() {
    const postForm = document.getElementById('postForm');
    const postsContainer = document.getElementById('posts');
    const isFormVisible = postForm.style.display === 'block';

    postForm.style.display = isFormVisible ? 'none' : 'block';
    if (isFormVisible) {
        postsContainer.classList.remove('posts-container-adjusted');
        postsContainer.style.top = '0'; // Reset top position when form is hidden
        document.querySelector('.header h2').style.display = 'none'; // Hide h2 when form is hidden
    } else {
        postsContainer.classList.add('posts-container-adjusted');
        const header = document.querySelector('.header');
        postsContainer.style.top = `${header.offsetHeight}px`;

        // Show and add animation to the h2 element
        const h2Element = document.querySelector('.header h2');
        h2Element.style.display = 'block';
        h2Element.classList.add('highlight-animation');
    }

    // Adjust the position of the pagination element
    const pagination = document.getElementById('pagination');
    pagination.style.position = 'relative';
    pagination.style.top = postForm.style.display === 'block' ? '20px' : '0';
}

async function submitPost(event) {
    event.preventDefault();
    const title = document.getElementById('postTitle').value;
    const content = document.getElementById('postContent').value;
    const newPost = { id: generateUniqueId(), title, content, timestamp: new Date().toISOString(), uniqueFilename, replies: [] };

    // Show loading indicator
    const loadingIndicator = document.getElementById('loadingIndicator');
    loadingIndicator.style.display = 'block';

    await savePost(newPost);
}

async function savePost(newPost) {
    try {
        let { sha, content: fileContent } = await getFileContent();
        fileContent.push(newPost);
        await updateFileContent(fileContent, sha);
        loadPosts();
        document.getElementById('postFormElement').reset();
        togglePostForm(); // Hide the post form after submission
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        // Hide loading indicator
        const loadingIndicator = document.getElementById('loadingIndicator');
        loadingIndicator.style.display = 'none';
    }
}

function generateUniqueId() {
    return '_' + Math.random().toString(36).substr(2, 9);
}

// 上传图片的逻辑
document.getElementById('postFormElement').addEventListener('submit', async function(event) {
    event.preventDefault(); // 阻止默认表单提交

    const imageInput = document.getElementById('postImage');
    const file = imageInput.files[0];

    if (file) {
        // 获取文件扩展名
        const fileExtension = file.name.split('.').pop();

        // 生成唯一文件名，可以使用时间戳 + 随机数
        uniqueFilename = `image_${Date.now()}_${Math.floor(Math.random() * 10000)}.${fileExtension}`;

        // 读取图片并进行Base64编码
        const reader = new FileReader();
        reader.onloadend = async function() {
            const base64Image = reader.result.split(',')[1]; // 仅获取Base64部分

            // 存储图片的配置信息
            const owner = "wang_hua_min";
            //const repo = "we-chat-data";

            const token = "4918bb3947dbf1402d7331a65bab1b3e"; // 使用您的Gitee个人访问令牌

            // Gitee API URL
            const apiUrl = `https://gitee.com/api/v5/repos/${owner}/${imgs_repo}/contents/${imageFolder}/${uniqueFilename}`;

            // 上传请求的payload
            const payload = {
                access_token: token,
                content: base64Image,
                message: `Upload ${uniqueFilename}`
            };

            try {
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });

                const result = await response.json();

                if (response.status === 201) {
                    document.getElementById('statusMessage').innerText = `图片 '${uniqueFilename}' 上传成功！`;
                } else {
                    document.getElementById('statusMessage').innerText = `图片上传失败。状态码：${response.status}, 响应：${result.message}`;
                }
            } catch (error) {
                document.getElementById('statusMessage').innerText = `发生错误：${error.message}`;
            }
        };

        reader.readAsDataURL(file); // 开始读取文件
    } else {
        uniqueFilename = null; // 如果没有选择文件，重置 uniqueFilename
    }
});