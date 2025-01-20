```markdown
# Getting Started

## 基本要求
- NodeJS 版本 >= 18
- Java 版本 11

## 下载体验
- 下载最新版本的 APK 文件：[app-release.apk](https://github.com/hejun041/CloudTest/releases/latest/download/app-release.apk)

## 步骤

1. **克隆代码**
   ```bash
   git clone <repository-url>
   cd <repository-name>
   ```

2. **安装依赖**
   ```bash
   yarn
   ```

3. **对于安卓**
   - 运行应用：
     ```bash
     yarn android
     ```
   - 运行 Metro Bundler：
     ```bash
     yarn start
     ```
   - 真机调试：
     ```bash
     adb reverse tcp:8081 tcp:8081
     ```
   - 打包：
     ```bash
     npm run release-android-bundle
     npm run release-android
     ```

4. **对于iOS**
   - 安装依赖：
     ```bash
     bundle install
     cd ios
     pod install
     cd ..
     ```
   - 运行应用：
     ```bash
     yarn ios
     ```
   - 打包：
     ```bash
     npm run release-ios-bundle
     打开Xcode product->archive，打包
     ```

# 故障排除
可能遇到的问题：
   ```
  -bundle install
   (node:11438) Warning: Accessing non-existent property 'padLevels' of module exports inside circular dependency
   (Use `node --trace-warnings ...` to show where the warning was created)
                  Welcome to Metro v0.76.9
               Fast - Scalable - Integrated

   info Writing bundle output to:, android/app/src/main/assets/index.android.bundle
   error ENOENT: no such file or directory, open 'android/app/src/main/assets/index.android.bundle'.
   Error: ENOENT: no such file or directory, open 'android/app/src/main/assets/index.android.bundle'

   先执行npm run release-android-bundle ,再执行bundle install
   ```
  -[!] Error installing boost
    ```
    Verification checksum was incorrect, expected f0397ba6e982c4450f27bf32a2a83292aba035b827a5623a14636ea583318c41, got 79e6d3f986444e5a80afbeccdaf2d1c1cf964baa8d766d20859d653a16c39848

    [fix hear](https://github.com/facebook/react-native/pull/42118/files)
    ```
```plaintext
MIT License

Copyright (c) [2025] [JimHo]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```