import fs from 'fs/promises';
import { test, expect, APIRequestContext } from '@playwright/test';

const base_url = "https://bff-api.dev.litecard.io";
const username = "qa-dev@litecard.com.au";
const password = "Litecard@123!";
const businessId = "EHbF6Y4rlB-dNPzmw8Ids#3Bh4sUCq_ZD93CfQPLajn";

export async function getToken(request: APIRequestContext): Promise<string> {
  const loginPayload = {
    username,
    password,
  };

  const response = await request.post(`${base_url}/api/v1/token`, {
    headers: { "Content-Type": "application/json"},
    data: JSON.stringify(loginPayload),
  });


  if (!response.ok()) {
    const text = await response.text();
    throw new Error(`Auth failed ${response.status()} : ${text}`);
  }

  const json = await response.json();
  const token = json.access_token;

  console.log("Access Token:", token);
  return token;
}

async function apiRequest(
  request: APIRequestContext,
  method: string,
  endpoint: string,
  token?: string,
  businessId?: string,
  body?: any
) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  // FIXED: Use the required header name
  if (businessId) headers["x-active-business-id"] = businessId;

  const url = `${base_url}${endpoint}`;

  let res;
  const options = {
    headers,
    data: body ? JSON.stringify(body) : undefined,
  };

  switch (method) {
    case "GET": res = await request.get(url, { headers }); break;
    case "POST": res = await request.post(url, options); break;
    case "PATCH": res = await request.patch(url, options); break;
    case "PUT": res = await request.put(url, options); break;
    case "DELETE": res = await request.delete(url, { headers }); break;
    default:
      throw new Error(`Invalid HTTP method: ${method}`);
  }

  if (!res.ok()) {
    const text = await res.text();
    console.error(`${method} ${url} failed ${res.status()}: ${text}`);
    throw new Error(`${method} ${url} failed ${res.status()}: ${text}`);
  }

  return res.json();
}

let payload_create: any;

test.beforeAll(async () => {
  payload_create = JSON.parse(
    await fs.readFile('tests/API/create_template.json', 'utf-8')
  );
});

test('create template using json', async ({ request }) => {
  const token = await getToken(request);

  const method = "POST";
  const endpoint = "/api/v1/template";

  const response = await apiRequest(
    request,
    method,
    endpoint,
    token,
    businessId,
    payload_create
  );

  console.log("Response:", response);
  expect(response).toBeTruthy();
});
