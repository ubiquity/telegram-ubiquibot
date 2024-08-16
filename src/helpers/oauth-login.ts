const env = checkEnvVars();
import { GITHUB_PATHNAME } from "../constants";
import { ExtendableEventType } from "../types/telegram";
import { getUserDataFromUsername } from "./github";
import { deleteUserSession, getUserSession, hasUserSession } from "./session";
import { bindGithubToTelegramUser } from "./supabase";
import { replyMessage } from "./triggers";
import { checkEnvVars } from "./parse-env";

// Define the scope for requesting access to public data and repo issues
const scope = "public_repo";

export async function getUserData(token: string, telegramId: number, username: string, groupId: number, headers: HeadersInit) {
  const getUserResponse = await fetch("https://api.github.com/user", {
    headers: {
      accept: "application/vnd.github.v3+json",
      authorization: `token ${token}`,
      "User-Agent": "Telegram Cloudflare Worker",
    },
  });

  const { login } = await getUserResponse.json();

  const id = await getUserDataFromUsername(login);

  if (id) {
    await bindGithubToTelegramUser(groupId, username, id, token);

    await replyMessage(telegramId, `Your telegram account has been associated with Github account: *${login}*`);

    return new Response(JSON.stringify({ success: `${login} has been associated to your telegram account` }), {
      status: 201,
      headers,
    });
  } else {
    return new Response(JSON.stringify({ error: "Error occurred while fetching user" }), {
      status: 400,
    });
  }
}

export async function oAuthHandler(event: ExtendableEventType, url: URL) {
  // handle CORS pre-flight request
  if (event.request.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  const queryParams = url.searchParams;

  const code = queryParams.get("code");
  const telegramId = queryParams.get("telegramId");

  // redirect GET requests to the OAuth login page on github.com
  if (event.request.method === "GET" && !code) {
    if (!telegramId)
      return new Response("", {
        status: 500,
      });

    return Response.redirect(
      `https://github.com/login/oauth/authorize?client_id=${env.GITHUB_OAUTH_CLIENT_ID}&scope=${scope}&redirect_uri=${url.origin}${GITHUB_PATHNAME}?telegramId=${telegramId}`,
      302
    );
  }

  try {
    if (await hasUserSession(telegramId as string)) {
      const response = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "User-Agent": "Telegram Cloudflare Worker",
          accept: "application/json",
        },
        body: JSON.stringify({ client_id: env.GITHUB_OAUTH_CLIENT_ID, client_secret: env.GITHUB_OAUTH_CLIENT_SECRET, code, scope }),
      });
      const result = await response.json();
      const headers = {
        "Access-Control-Allow-Origin": "*",
      };

      if (result.error) {
        return new Response(JSON.stringify(result), { status: 401, headers });
      }

      const { username, group, telegramId: id } = await getUserSession(telegramId as string);

      return await getUserData(result.access_token, id, username, group, headers);
    } else {
      return new Response(JSON.stringify({ error: "Not a valid session" }), {
        status: 400,
      });
    }
  } catch (error) {
    console.log(error);
    return new Response(JSON.stringify({ error }), {
      status: 400,
    });
  } finally {
    await deleteUserSession(telegramId as string);
  }
}
