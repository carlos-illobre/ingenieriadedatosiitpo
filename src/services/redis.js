const REDIS_URL = process.env.REACT_APP_UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.REACT_APP_UPSTASH_REDIS_REST_TOKEN;

export const redisSet = async (key, value) => {
  const response = await fetch(`${REDIS_URL}/set/${key}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${REDIS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify([value]),
  });

  return response.ok;
};

export const redisGet = async (key) => {
  const response = await fetch(`${REDIS_URL}/get/${key}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${REDIS_TOKEN}`,
    },
  });

  if (!response.ok) return null;
  const data = await response.json();
  return data.result;
};

export const redisDel = async (key) => {
  const response = await fetch(`${REDIS_URL}/del/${key}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${REDIS_TOKEN}`,
    },
  });

  return response.ok;
};

export const logRedisCommand = (command, key, value) => {
  console.log(`Redis Command: ${command} ${key} ${value || ''}`);
};