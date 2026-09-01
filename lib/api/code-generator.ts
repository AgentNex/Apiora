import { ApiRequestConfig, Environment } from './types';
import { prepareRequest } from './request-builder';

export type TargetLanguage = 'curl' | 'python-sdk' | 'python-requests' | 'typescript-sdk' | 'typescript-fetch' | 'go' | 'rust';

export function generateSnippet(
  config: ApiRequestConfig,
  environment: Environment | null | undefined,
  target: TargetLanguage,
  maskSecret = false
): string {
  const prepared = prepareRequest(config, environment);
  const activeKey = maskSecret ? 'YOUR_API_KEY' : config.apiKey || 'YOUR_API_KEY';
  const model = config.modelId || 'gpt-4o';

  switch (target) {
    case 'curl': {
      let cmd = `curl -X ${prepared.method} "${prepared.url}" \\\n`;
      for (const [k, v] of Object.entries(prepared.headers)) {
        const val = maskSecret && (k.toLowerCase().includes('auth') || k.toLowerCase().includes('key')) ? 'YOUR_API_KEY' : v;
        cmd += `  -H "${k}: ${val}" \\\n`;
      }
      if (prepared.body) {
        cmd += `  -d '${prepared.body.replace(/'/g, "'\\''")}'`;
      }
      return cmd;
    }

    case 'python-sdk': {
      if (config.presetId === 'anthropic-messages') {
        return `import os
from anthropic import Anthropic

client = Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY", "${activeKey}"))

response = client.messages.create(
    model="${model}",
    max_tokens=${config.parameters.max_tokens || 1024},
    temperature=${config.parameters.temperature ?? 0.7},
    messages=${JSON.stringify(config.messages.map(m => ({ role: m.role === 'system' ? 'user' : m.role, content: m.content })), null, 4)}
)

print(response.content[0].text)`;
      }

      if (config.presetId === 'gemini-generate-content') {
        return `import os
import google.generativeai as genai

genai.configure(api_key=os.environ.get("GEMINI_API_KEY", "${activeKey}"))
model = genai.GenerativeModel("${model}")

response = model.generate_content(
    "${config.messages[config.messages.length - 1]?.content || 'Hello'}"
)

print(response.text)`;
      }

      // Default: OpenAI SDK (compatible with OpenAI, DeepSeek, Groq, Mistral, Together, OpenRouter)
      const baseApiUrl = config.endpoint.includes('/chat/completions')
        ? config.endpoint.split('/chat/completions')[0]
        : 'https://api.openai.com/v1';

      return `import os
from openai import OpenAI

client = OpenAI(
    api_key=os.environ.get("AI_API_KEY", "${activeKey}"),
    base_url="${baseApiUrl}"
)

response = client.chat.completions.create(
    model="${model}",
    messages=${JSON.stringify(config.messages.map(m => ({ role: m.role, content: m.content })), null, 4)},
    temperature=${config.parameters.temperature ?? 0.7},
    stream=${config.isStreaming ? 'True' : 'False'}
)

if ${config.isStreaming ? 'True' : 'False'}:
    for chunk in response:
        content = chunk.choices[0].delta.content
        if content:
            print(content, end="", flush=True)
else:
    print(response.choices[0].message.content)`;
    }

    case 'python-requests': {
      return `import requests
import json

url = "${prepared.url}"
headers = ${JSON.stringify(prepared.headers, null, 4)}
payload = ${prepared.body ? prepared.body : '{}'}

response = requests.${prepared.method.toLowerCase()}(url, headers=headers, json=payload)
print("Status:", response.status_code)
print("Response:", response.json())`;
    }

    case 'typescript-sdk': {
      if (config.presetId === 'anthropic-messages') {
        return `import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '${activeKey}'
});

async function main() {
  const message = await anthropic.messages.create({
    model: '${model}',
    max_tokens: ${config.parameters.max_tokens || 1024},
    temperature: ${config.parameters.temperature ?? 0.7},
    messages: ${JSON.stringify(config.messages.map(m => ({ role: m.role === 'system' ? 'user' : m.role, content: m.content })), null, 4)}
  });

  console.log(message.content);
}

main().catch(console.error);`;
      }

      return `import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '${activeKey}',
  baseURL: '${config.endpoint.split('/chat/completions')[0] || 'https://api.openai.com/v1'}'
});

async function main() {
  const completion = await openai.chat.completions.create({
    model: '${model}',
    messages: ${JSON.stringify(config.messages.map(m => ({ role: m.role, content: m.content })), null, 4)},
    temperature: ${config.parameters.temperature ?? 0.7},
    stream: ${config.isStreaming ? 'true' : 'false'}
  });

  if (${config.isStreaming ? 'true' : 'false'}) {
    for await (const chunk of completion) {
      process.stdout.write(chunk.choices[0]?.delta?.content || '');
    }
  } else {
    console.log(completion.choices[0].message.content);
  }
}

main().catch(console.error);`;
    }

    case 'typescript-fetch': {
      return `async function dispatchAIRequest() {
  const url = '${prepared.url}';
  const headers = ${JSON.stringify(prepared.headers, null, 2)};
  const body = ${prepared.body ? prepared.body : 'null'};

  const response = await fetch(url, {
    method: '${prepared.method}',
    headers,
    body: body ? JSON.stringify(body) : undefined
  });

  const data = await response.json();
  console.log(data);
}

dispatchAIRequest().catch(console.error);`;
    }

    case 'go': {
      return `package main

import (
	"bytes"
	"fmt"
	"io"
	"net/http"
)

func main() {
	url := "${prepared.url}"
	payload := []byte(\`${prepared.body || ''}\`)

	req, err := http.NewRequest("${prepared.method}", url, bytes.NewBuffer(payload))
	if err != nil {
		panic(err)
	}

${Object.entries(prepared.headers).map(([k, v]) => `\treq.Header.Set("${k}", "${v}")`).join('\n')}

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		panic(err)
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	fmt.Println("Status:", resp.Status)
	fmt.Println(string(body))
}`;
    }

    case 'rust': {
      return `use reqwest::header::{HeaderMap, HeaderValue, HeaderName};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std.error::Error>> {
    let client = reqwest::Client::new();
    let mut headers = HeaderMap::new();

${Object.entries(prepared.headers).map(([k, v]) => `    headers.insert(HeaderName::from_static_names("${k.toLowerCase()}")?, HeaderValue::from_str("${v}")?);`).join('\n')}

    let response = client
        .${prepared.method.toLowerCase()}("${prepared.url}")
        .headers(headers)
        .body(r#"${prepared.body || ''}"#)
        .send()
        .await?;

    let body = response.text().await?;
    println!("{}", body);
    Ok(())
}`;
    }

    default:
      return '';
  }
}
