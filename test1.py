import requests
import base64

# 配置信息
owner = "wang_hua_min"
repo = "we-chat-data"
image_folder = "images"
filename = "image_weixiin.jpg"
token = "4918bb3947dbf1402d7331a65bab1b3e"

# Gitee API 列出目录内容的 URL
directory_url = f"https://gitee.com/api/v5/repos/{owner}/{repo}/contents/{image_folder}"

# 设置请求头
headers = {
    "Authorization": f"token {token}",
    "Accept": "application/json"
}

# 发送请求列出目录内容
response = requests.get(directory_url, headers=headers)

# 检查响应状态码
if response.status_code == 200:
    directory_contents = response.json()
    print("Directory contents:", directory_contents)

    # 检查目标文件是否在目录中
    file_exists = False
    for file_info in directory_contents:
        print(f"File: {file_info['name']}, Path: {file_info['path']}")
        if file_info['name'] == filename:
            file_exists = True
            break

    if file_exists:
        # Gitee API 下载文件的 URL
        file_url = f"https://gitee.com/api/v5/repos/{owner}/{repo}/contents/{image_folder}/{filename}"

        # 发送请求获取文件内容
        file_response = requests.get(file_url, headers=headers)

        if file_response.status_code == 200:
            file_info = file_response.json()
            print("File info:", file_info)

            # 检查 file_info 是否是字典并包含 'content' 键
            if isinstance(file_info, dict) and 'content' in file_info:
                file_content_base64 = file_info['content']

                # 将 Base64 内容解码为二进制数据
                file_content = base64.b64decode(file_content_base64)

                # 将文件保存到本地
                with open(filename, 'wb') as file:
                    file.write(file_content)

                print(f"File '{filename}' downloaded successfully.")
            else:
                print("Unexpected response format for file download:", file_info)
        else:
            print(f"Failed to download file. Status code: {file_response.status_code}, Response: {file_response.text}")
    else:
        print(f"File '{filename}' not found in the directory.")
else:
    print(f"Failed to list directory contents. Status code: {response.status_code}, Response: {response.text}")
