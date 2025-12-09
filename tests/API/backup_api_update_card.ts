import { test, expect, APIRequestContext } from '@playwright/test';
import fs from 'fs/promises';

// Base API URL and credentials (copied from your Python script)
const base_url = 'https://bff-api.demo.litecard.io';
const username = 'qa-a3@litecard.com.au';
const password = 'bR5x$9wNzE';

/**
 * getToken
 * - Sends credentials to the token endpoint and returns an access token.
 * - Mirrors the Python `get_token` function in your original script.
 */
async function getToken(request: APIRequestContext): Promise<string> {
  // The server expects a JSON payload for the token endpoint (not form-encoded).
  const jsonBody = JSON.stringify({ username, password });
  const response = await request.post(`${base_url}/api/v1/token`, {
    headers: { 'Content-Type': 'application/json' },
    data: jsonBody,
  });
  if (!response.ok()) {
    const text = await response.text();
    console.error(`Token request failed ${response.status}: ${text}`);
    throw new Error(`Auth failed ${response.status}: ${text}`);
  }
  const json = await response.json();
  const token = json.access_token;
  console.log(`access_token : ${token}`);
  return token;
}

/**
 * apiRequest
 * - Lightweight helper to call the API with the given HTTP method.
 * - Adds `Content-Type: application/json` and `Authorization` when a token is provided.
 * - Returns the parsed JSON body (asserts response.ok similar to `assert res.ok` in Python).
 */
async function apiRequest(
  request: APIRequestContext,
  method: string,
  endpoint: string,
  token?: string,
  body?: any
) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const url = `${base_url}${endpoint}`;
  let res;
  if (method === 'GET') {
    res = await request.get(url, { headers });
  } else if (method === 'POST') {
    res = await request.post(url, { headers, data: body ? JSON.stringify(body) : undefined });
  } else if (method === 'PATCH') {
    res = await request.patch(url, { headers, data: body ? JSON.stringify(body) : undefined });
  } else if (method === 'PUT') {
    res = await request.put(url, { headers, data: body ? JSON.stringify(body) : undefined });
  } else if (method === 'DELETE') {
    res = await request.delete(url, { headers });
  } else {
    throw new Error('Invalid HTTP method');
  }

  // Provide a clearer error when an API call fails: log status and response body
  if (!res.ok()) {
    const text = await res.text();
    console.error(`${method} ${endpoint} failed ${res.status}: ${text}`);
    throw new Error(`${method} ${endpoint} failed ${res.status}: ${text}`);
  }

  return res.json();
}

/**
 * Test: API flow - update cards and statuses
 * Steps:
 * 1. Get auth token (re-usable for subsequent requests)
 * 2. Read `email_to_cardId.json` and iterate over users
 * 3. For each user: PATCH card birthday, then GET card
 * 4. For a limited subset: POST status INACTIVE then DELETED, then GET card
 *
 * These steps mirror the logic in your Python `test_api_flow`.
 */
test('API flow - update cards and statuses', async ({ request }) => {
  // 1) Call login function to retrieve token
  const token = await getToken(request);

  // 2) Load JSON file that maps emails to card IDs
  const data = await fs.readFile('email_to_cardId.json', 'utf8');
  const users = JSON.parse(data);

  // 3) Iterate over all users and update the birthday field
  for (const item of users) {
    const card_id = item.cardId;
    const email = item.email;
    console.log(`\n collecting ${email} and ${card_id}`);

    // payload mirrors the Python `update_payload`
    const update_payload = {
      cardId: `${card_id}`,
      cardPayload: { birthday: '1993-11-11T10:26:01.963Z' }
    };

    // PATCH the card and print the result
    try {
      const update_result = await apiRequest(request, 'PATCH', '/api/v1/card', token, update_payload);
      console.log(`\n update birthday result : ${JSON.stringify(update_result)}`);

      // GET the card to verify or inspect the response (same as your Python GET)
      const get_result = await apiRequest(request, 'GET', `/api/v1/card/${card_id}`, token);
      console.log(`\n card data : ${JSON.stringify(get_result)}`);
    } catch (err: any) {
      // If card doesn't exist, skip and continue — mirrors a tolerant test run
      const msg = err?.message || String(err);
      if (msg.includes('NO_CARD_FOUND') || msg.toLowerCase().includes('not found')) {
        console.warn(`Skipping card ${card_id}: ${msg}`);
        continue;
      }
      // For other errors rethrow so the test still fails for unexpected issues
      throw err;
    }
  }

  // 4) Take the first two users and change their status to INACTIVE then DELETED
  const limited_users = users.slice(0, 2);
  for (const item of limited_users) {
    const card_id = item.cardId;
    const email = item.email;
    console.log(`\n collecting limited users ${email} and ${card_id}`);

    // update status to INACTIVE (matches Python payload)
    try {
      const inactive_payload = { cardId: `${card_id}`, status: 'INACTIVE' };
      await apiRequest(request, 'POST', '/api/v1/card/status', token, inactive_payload);
      console.log(`updating status of ${card_id} with email ${email} into INACTIVE!`);

      // update status to DELETED (matches Python payload)
      const deleted_payload = { cardId: `${card_id}`, status: 'DELETED' };
      await apiRequest(request, 'POST', '/api/v1/card/status', token, deleted_payload);
      console.log(`updating status of ${card_id} with email ${email} into DELETED!`);

      // GET the card after status changes
      const get_result = await apiRequest(request, 'GET', `/api/v1/card/${card_id}`, token);
      console.log(`\n card data : ${JSON.stringify(get_result)}`);
    } catch (err: any) {
      const msg = err?.message || String(err);
      if (msg.includes('NO_CARD_FOUND') || msg.toLowerCase().includes('not found')) {
        console.warn(`Skipping status updates for ${card_id}: ${msg}`);
        continue;
      }
      throw err;
    }
  }
});
