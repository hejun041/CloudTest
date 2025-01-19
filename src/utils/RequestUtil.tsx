export function fetchGet(url: string, headers = {}, timeout = 5000) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    return fetch(url, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            ...headers,
        },
        signal: controller.signal,
    })
        .then(async (response) => {
            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // 等待 response.json() 解析完成
            const res = await response.json();
            if (__DEV__) {
                console.log(`fetchGet===>\n${url}\nresult===>\n${JSON.stringify(res, null, 2)}\n`);
            }
            return res;
        })
        .catch((error) => {
            clearTimeout(timeoutId);

            if (__DEV__) {
                // 打印具体的错误信息
                console.log(`error===>\n${url}\nresult===>\n${error.message || error.reason || error}\n`);
            }

            if (error.name === 'AbortError') {
                throw new Error('Request timed out');
            } else if (error instanceof SyntaxError) {
                throw new Error('Failed to parse JSON response');
            } else {
                throw new Error(`GET request failed: ${error.message}`);
            }
        });
}

export function fetchPost(url: string, body = {}, headers = {}, timeout = 5000) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    return fetch(url, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            ...headers,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
    })
        .then(async (response) => {
            clearTimeout(timeoutId);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // 等待 response.json() 解析完成
            const res = await response.json();
            if (__DEV__) {
                console.log(`fetchPost===>\n${url}\nresult===>\n${JSON.stringify(res, null, 2)}\n`);
            }
            return res;
        })
        .catch((error) => {
            clearTimeout(timeoutId);

            if (__DEV__) {
                // 打印具体的错误信息
                console.log(`error===>\n${url}\nresult===>\n${error.message || error.reason || error}\n`);
            }

            if (error.name === 'AbortError') {
                throw new Error('Request timed out');
            } else if (error instanceof SyntaxError) {
                throw new Error('Failed to parse JSON response');
            } else {
                throw new Error(`POST request failed: ${error.message}`);
            }
        });
}



interface FetchOptions {
    headers?: Record<string, string>;
    body?: Record<string, any>;
    method?: 'GET' | 'POST';
}


export async function fetchWithRetry(url: string, options: FetchOptions = {}, retries = 3, timeout = 5000) {
    for (let i = 0; i < retries; i++) {
        try {
            if (options.method === 'POST') {
                return await fetchPost(url, options.body || {}, options.headers || {}, timeout);
            } else {
                return await fetchGet(url, options.headers || {}, timeout);
            }
        } catch (error) {
            if (i === retries - 1) throw error;
            await new Promise((resolve) => setTimeout(resolve, 1000));
        }
    }
}
