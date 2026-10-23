import type { Module } from '../../types';

// LEVEL 8 — API SECURITY · Module 10: Mobile API Security
// Original curriculum content. All prose is original; reference links point to
// the public official sources used for study (OWASP, PortSwigger Web Security
// Academy, developer.android.com). Examples assume training or authorized
// targets only.

export const m10: Module = {
  id: 'm10',
  title: 'Mobile API Security',
  level: 8,
  description:
    'Modern Android apps are thin clients over backend APIs: the interesting state, decisions, and data live server-side. This module teaches you to discover APIs from traffic and code, analyze tokens and session security, and test the object-level authorization and business-logic flaws that dominate real API findings.',
  outcomes: [
    'Explain why the mobile trust boundary sits at the API and what that means for testing scope',
    'Build an endpoint inventory from intercepted traffic, decompiled code, and embedded documentation',
    'Decode and evaluate JWT-based sessions and locate client-side token storage',
    'Run two-account BOLA/IDOR and business-logic tests against authorized targets'
  ],
  lessons: [
    {
      id: 'm10-l01',
      moduleId: 'm10',
      title: 'The Android-API Architecture',
      difficulty: 'Beginner',
      minutes: 20,
      prerequisites: ['m06-l03'],
      objectives: [
        'Describe the app-to-API architecture and where each responsibility lives',
        'Explain why the trust boundary moved from the device to the server',
        'Start reading an app as a client-side record of API behavior'
      ],
      diagram: 'app-api-flow',
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'Open a modern banking, shopping, or social app and you find surprisingly little business logic inside: screens, navigation, caching, and a lot of HTTP calls. The product itself — accounts, balances, prices, inventory, other users\u2019 data — lives behind HTTPS in backend services. The APK is the front door of a distributed system, not the whole house.'
          },
          {
            type: 'p',
            text:
              'This changes what you are actually testing. The device sandbox can be perfect and the app code spotless, yet the whole system is broken if the API returns another user\u2019s order to whoever asks with a modified ID. The real trust boundary is the API endpoint, so a serious mobile pentest always includes web/API testing. This module builds that bridge.'
          }
        ],
        technical: [
          {
            type: 'diagram',
            id: 'app-api-flow',
            caption: 'The thin-client conversation: every screen is backed by API requests your proxy can observe.'
          },
          {
            type: 'p',
            text:
              'A typical app separates UI (Activities, Composables) from data plumbing (repositories, view models). Repositories call an HTTP client — OkHttp wrapped by Retrofit is the dominant Java/Kotlin pairing — which serializes requests to JSON, adds headers, and sends them over TLS. On the server, a gateway or load balancer routes to services that hold state in databases and reply with JSON the app deserializes into model classes.'
          },
          {
            type: 'table',
            headers: ['Layer', 'Responsibility', 'What the tester sees'],
            rows: [
              ['UI layer', 'Screens, navigation, input validation (often)', 'Screens you can drive from adb (m01)'],
              ['Repository/HTTP layer', 'Requests, retries, auth headers, caching', 'OkHttp/Retrofit code, interceptors, pinning config (m06)'],
              ['Transport', 'TLS — the interception target of m06', 'Proxy-visible requests and responses'],
              ['API gateway/services', 'Authorization, business rules, data', 'The actual target of module 10 testing'],
              ['Database', 'State', 'Never directly reachable; only visible via API behavior']
            ]
          },
          {
            type: 'p',
            text:
              'Every call is a contract: method, path, headers (the auth scheme), body, and response shape. Reading that contract — from traffic and from code — is the raw material for the rest of this module.'
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'Mobile work gives you three lenses on the same system. The app is a record of API behavior: every feature maps to requests. It is an attack console: a working, authenticated client you can drive. And the server is where the crown jewels sit — which is why API-layer findings usually outrank client-only findings in impact.'
          },
          {
            type: 'list',
            items: [
              'The OWASP API Security Top 10 (BOLA, broken authentication, and friends) is the vocabulary for this module',
              'Client-side protections (pinning, validation) raise effort; server-side controls decide outcomes',
              'The API hosts the app talks to must be inside your written scope before you test them'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Hardcoded base URLs — including dev/staging hosts accidentally shipped in build config classes',
              'HTTP client setup: interceptors that inject auth headers, timeouts, certificate pinning config (m06 detail)',
              'Retrofit-style interface annotations (@GET, @POST) listing endpoint paths',
              'Version segments such as /api/v1/ or /api/v2/ — versions are a testing surface',
              'Locally persisted tokens and API keys — the bridge to lesson m10-l03'
            ]
          }
        ],
        howToTest: [
          {
            type: 'callout',
            variant: 'legal',
            title: 'Authorized targets only',
            text:
              'API testing is active testing of server-side systems. Test only APIs you own, training targets such as crAPI, or endpoints explicitly included in your signed scope. Probing third-party APIs through a mobile app is not authorized by the app\u2019s mere presence on your device.'
          },
          {
            type: 'p',
            text:
              'On an authorized or training target, first let the app behave normally through the proxy you set up in m06-l03. Watch the conversation and write down every distinct request.'
          },
          {
            type: 'terminal',
            title: 'Observing the API conversation',
            lines: [
              '$ # proxy capture of a training app login (m06-l03 setup)',
              'POST /api/v2/auth/login HTTP/1.1',
              'Host: api.training.example',
              'Content-Type: application/json',
              '',
              '{"username":"tester1","password":"[REDACTED]"}',
              '',
              'HTTP/1.1 200 OK',
              'Set-Cookie: session=9f13...; HttpOnly',
              '{"userId":1001,"displayName":"tester1"}'
            ]
          },
          {
            type: 'p',
            text:
              'Even this tiny exchange teaches you the auth scheme (cookie here; compare bearer tokens in your later captures), the response shape, and an object identifier (userId) worth remembering for m10-l04.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'A good first target is OWASP crAPI, a deliberately vulnerable API behind a mobile-style client. Log in, walk through every screen, and sketch the first ten to fifteen endpoints you see. CrAPI\u2019s BOLA and JWT exercises map directly onto lessons m10-l03 and m10-l04 of this module.'
          },
          {
            type: 'callout',
            variant: 'note',
            title: 'Training targets',
            text:
              'OWASP crAPI is published specifically for legal API practice. The academy\u2019s Sources page links it along with other intentionally vulnerable targets.'
          }
        ],
        tools: [
          {
            type: 'table',
            headers: ['Tool', 'Why it matters here'],
            rows: [
              ['Burp Suite', 'The standard intercepting proxy; the sitemap becomes your endpoint inventory'],
              ['mitmproxy', 'Scriptable alternative; good for replaying and modifying requests'],
              ['JADX', 'Read the HTTP client code that produced the traffic you captured'],
              ['OWASP crAPI', 'Deliberately vulnerable API target for legal practice']
            ]
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Judging security by app behavior alone — the app can be solid while the API is wide open',
              'Treating client-side validation as a control; the server must re-validate everything',
              'Assuming everything is REST/JSON — gRPC, WebSockets, and raw TCP show up in real apps',
              'Testing API hosts that were never explicitly included in your written scope'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'With a training app behind your proxy, build a two-column inventory: endpoint path and what feature triggered it. Star every call whose path or body contains an identifier (an order number, user id, vehicle id). You have just pre-selected the candidates for the BOLA tests of lesson m10-l04.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
              'Apps are thin clients; authorization and truth live server-side',
              'The trust boundary is the API endpoint — mobile pentesting includes API testing',
              'The app is simultaneously documentation, attack console, and scope definition',
              'An endpoint inventory is the backbone artifact of every API assessment'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'm10-l01-q1',
          type: 'mcq',
          prompt: 'Where must the decision "is this user allowed to see this object?" live in a secure app/API system?',
          options: [
            'In the app, before the request is sent',
            'On the server, evaluated per request',
            'In the API gateway only for /admin routes',
            'Nowhere — the client decides'
          ],
          answerIndex: 1,
          hint: 'Think about who controls the client.',
          explanation:
            'The client is attacker-controllable, so any decision enforced only there can be bypassed. Authorization must be evaluated server-side on every request; client-side checks are UX, not security.'
        },
        {
          id: 'm10-l01-q2',
          type: 'truefalse',
          prompt: 'A complete mobile assessment can be performed by analyzing the APK alone.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'Where does the data actually live?',
          explanation:
            'The APK is one client of a distributed system. Storage, platform, and binary findings live on-device, but authentication, authorization, and business logic must be tested through the API — which requires traffic analysis and server-side testing.'
        },
        {
          id: 'm10-l01-q3',
          type: 'short',
          prompt: 'Name two places inside an APK where API base URLs commonly appear.',
          modelAnswer:
            'Decompiled code (HTTP client builders, Retrofit-style interfaces, constants/config classes) and resources such as strings.xml; they also appear in network security configs and sometimes in embedded documentation files.',
          hint: 'One lives in code, one lives in resources.',
          explanation:
            'Static harvesting complements traffic capture because code reveals endpoints the UI may never call — the topic of the next lesson.'
        },
        {
          id: 'm10-l01-q4',
          type: 'scenario',
          prompt:
            'A training app validates that order quantity is at least 1 entirely in the UI, and its server accepts any quantity value. Classify this finding and explain why the client-side check does not mitigate it.',
          modelAnswer:
            'A server-side input-validation / business-logic flaw (API-side). Client-side validation is trivially bypassed by driving the API directly (proxy replay or a crafted client), so the server accepting out-of-range quantities is the reportable defect; the UI check is at most a convenience feature.',
          hint: 'Who can bypass the UI entirely?',
          explanation:
            'The UI is one client among many. Servers must enforce type, range, and business rules themselves — client checks only reduce honest mistakes by honest users.'
        }
      ],
      references: [
        {
          title: 'OWASP API Security Top 10',
          url: 'https://owasp.org/API-Security/',
          note: 'The canonical API risk list this module uses as vocabulary.'
        },
        {
          title: 'PortSwigger Web Security Academy — API testing',
          url: 'https://portswigger.net/web-security/api-testing',
          note: 'Free, hands-on API testing methodology and labs.'
        },
        {
          title: 'OWASP MASTG — Testing Network Communication',
          url: 'https://mas.owasp.org/MASTG/Android/0x05g-Testing-Network-Communication/',
          note: 'The Android-specific bridge from traffic capture to API testing.'
        }
      ]
    },
    {
      id: 'm10-l02',
      moduleId: 'm10',
      title: 'API Discovery and Traffic Analysis',
      difficulty: 'Intermediate',
      minutes: 25,
      prerequisites: ['m10-l01', 'm04-l02'],
      objectives: [
        'Harvest endpoints dynamically from proxy traffic and statically from decompiled code',
        'Map request/response shapes, auth headers, and status-code behavior',
        'Locate hidden, debug, and administrative endpoints that the UI never calls'
      ],
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'You cannot test what you never found. Discovery therefore runs on two channels: dynamic (watch the app talk) and static (read what the app says about itself). Each channel covers the other\u2019s blind spots: traffic shows real behavior but only for features you exercised; code reveals endpoints the UI may never call, including hidden and administrative ones.'
          },
          {
            type: 'p',
            text:
              'The goal artifact is an endpoint inventory: method, path, parameters, auth requirements, and where you learned each. Every later lesson in this module is a set of tests you run against that inventory.'
          }
        ],
        technical: [
          {
            type: 'h',
            text: 'Dynamic harvesting'
          },
          {
            type: 'p',
            text:
              'Drive every feature of the app through your intercepting proxy while logged in as each available role. Record method, path, status, and notable headers for each distinct request. Save the proxy session — it is both your inventory and your evidence (m14-l02).'
          },
          {
            type: 'h',
            text: 'Static harvesting'
          },
          {
            type: 'p',
            text:
              'The decompiled sources from m04 contain the app\u2019s complete API vocabulary: HTTP client builders, Retrofit-style interfaces, and raw string constants. Assets and resources often hold more: OpenAPI/Swagger documents, Postman collections, feature flags, and environment config files left in by mistake.'
          },
          {
            type: 'h',
            text: 'Reading shapes'
          },
          {
            type: 'p',
            text:
              'For each endpoint, note the auth mechanism (Authorization: Bearer, cookies, custom API-key headers), required parameters, and how the server behaves when something is wrong. Status-code differentials are information: 401 vs 403 vs 404 tell you whether you failed to authenticate, to authorize, or to hit something that exists.'
          },
          {
            type: 'table',
            headers: ['Signal in code/assets', 'What it tells you'],
            rows: [
              ['@POST("v1/transfers")', 'An endpoint and its path structure, even if the app currently disables the feature'],
              ['OkHttp interceptor adding X-API-KEY', 'The API\u2019s authentication mechanism and where its key is stored'],
              ['swagger.json / openapi.json in assets', 'A complete, machine-readable map of the API — test everything it documents'],
              ['Strings like /internal/, /debug/, /admin', 'Surface the UI never calls; prime candidates for missing access control']
            ]
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'Inventory quality decides assessment quality. Hidden endpoints are disproportionately fragile: they were never meant for users, so they often skip the auth middleware that public routes share. Deprecated versions (v1 still routed after v2 shipped) are similarly neglected — keep them in the inventory and test them too (m10-l04).'
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'OpenAPI/Swagger/Postman artifacts in assets/, res/raw, or config classes',
              'API keys and bearer tokens in constants, build config, or resource strings',
              'Path fragments containing admin, internal, debug, test, beta, legacy, v1',
              'Response model classes (Dto/Vo suffixes) hinting at endpoints the UI never renders',
              'Version selectors, feature flags, or environment switches in settings screens'
            ]
          }
        ],
        howToTest: [
          {
            type: 'callout',
            variant: 'legal',
            title: 'Scope and documentation files',
            text:
              'Embedded API documentation makes testing easier, not more authorized. Written scope governs what you may probe — on training targets, you are the scope.'
          },
          {
            type: 'terminal',
            title: 'Static endpoint harvesting over a decompiled APK',
            lines: [
              '$ jadx -d out target.apk',
              '$ grep -RniE "https?://" out/sources --include="*.java" | grep -viE "w3|apache|schemas" | head -20',
              '$ grep -RniE "@(GET|POST|PUT|DELETE)\\(" out/sources | head -20',
              '$ grep -RniE "(/admin|/internal|/debug|/legacy)" out/sources | head',
              '$ find out -iname "*swagger*" -o -iname "*openapi*" -o -iname "*.postman*"'
            ]
          },
          {
            type: 'p',
            text:
              'Cross-check the grep results against your proxy captures. Endpoints present in code but absent from traffic are exactly where you focus next — on an authorized target, invoke them carefully with valid credentials and observe.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'A classic training-app moment: assets/swagger.json documents /api/v1/internal/users, an endpoint your proxy never saw because no screen calls it. With your own test account, a GET returns the full user list — no role check. That single inventory row becomes the missing function-level authorization finding that lesson m10-l04 formalizes.'
          }
        ],
        tools: [
          {
            type: 'table',
            headers: ['Tool', 'Role'],
            rows: [
              ['Burp Suite — Sitemap & Discovery', 'Passive inventory from traffic; content discovery for guessable paths (within scope)'],
              ['mitmproxy', 'Scriptable capture and replay of endpoints'],
              ['JADX + grep', 'Static harvesting of paths, headers, and keys'],
              ['MobSF', 'Automated static pass that flags URLs, keys, and debug artifacts quickly']
            ]
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Testing only what the proxy captured — the UI hides the most interesting routes',
              'Sending one GET and concluding an endpoint does not exist; try the method the code uses and read the 401/403/404 differential',
              'Not saving proxy sessions — unrecorded traffic cannot become evidence later',
              'Forgetting that keys found in code are findings themselves (hardcoded secrets), not just testing aids'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'For a training app, produce the full inventory table: Method | Path | Auth scheme | Seen in (traffic/code/both) | Notes. Highlight code-only rows and pick one for careful, authorized verification. Keep the table — it becomes the test plan for lessons m10-l03 and m10-l04.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
              'Discovery = traffic capture + code reading + documentation artifacts',
              'The inventory (method, path, auth, source) is the backbone of API testing',
              'Hidden, debug, and legacy endpoints are high-value targets',
              'Status-code differentials are reconnaissance data'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'm10-l02-q1',
          type: 'mcq',
          prompt: 'Where are you most likely to discover endpoints that the app\u2019s UI never calls?',
          options: [
            'In the proxy traffic during normal use',
            'In decompiled code and embedded documentation',
            'In the app\u2019s store listing',
            'In logcat of a non-rooted device'
          ],
          answerIndex: 1,
          hint: 'What covers the UI\u2019s blind spots?',
          explanation:
            'Traffic only shows features you exercised. Static harvesting — annotations, constants, and files like swagger.json — reveals routes the UI never touches, including hidden and admin endpoints.'
        },
        {
          id: 'm10-l02-q2',
          type: 'truefalse',
          prompt: 'Receiving 404 for a GET request to /api/v2/admin/users proves the endpoint does not exist.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'Does the method matter? Does the version prefix?',
          explanation:
            'A 404 may reflect a wrong method, a wrong version prefix, or the server\u2019s masking policy. Try the methods the code suggests and compare status-code differentials before concluding anything.'
        },
        {
          id: 'm10-l02-q3',
          type: 'short',
          prompt: 'Name two kinds of documentation or config files that often leak API structure inside an APK.',
          modelAnswer:
            'OpenAPI/Swagger specifications and Postman collections; also environment/config files and internal README-style assets. Any of them turn static harvesting into a guided tour.',
          hint: 'What do API teams write and sometimes forget to remove from builds?',
          explanation:
            'Documentation files are meant for developers, so they are complete and accurate — which makes them gold for the tester when they ship by accident.'
        },
        {
          id: 'm10-l02-q4',
          type: 'scenario',
          prompt:
            'Your inventory shows a Bearer-token API and fifteen endpoints. On an authorized target, describe your immediate setup before testing any endpoint.',
          modelAnswer:
            'Get valid credentials for accounts you own (at least two, for later authorization tests), script authenticated requests with the captured header format, and record baseline responses for each endpoint. Baselines make tampering results interpretable — you test deviations from normal, not noise.',
          hint: 'You need identity and a "normal" recording before you can deviate.',
          explanation:
            'Authorization and logic tests are comparisons against baseline behavior. Testing without your own accounts and baselines produces uninterpretable results and weak evidence.'
        }
      ],
      references: [
        {
          title: 'PortSwigger Web Security Academy — API testing',
          url: 'https://portswigger.net/web-security/api-testing',
          note: 'Discovery and testing workflow with labs.'
        },
        {
          title: 'OWASP MASTG — Testing Network Communication',
          url: 'https://mas.owasp.org/MASTG/Android/0x05g-Testing-Network-Communication/',
          note: 'Android traffic interception and analysis playbook.'
        },
        {
          title: 'OWASP crAPI',
          url: 'https://github.com/OWASP/crAPI',
          note: 'Completely Ridiculous API — deliberately vulnerable target for legal practice.'
        }
      ]
    },
    {
      id: 'm10-l03',
      moduleId: 'm10',
      title: 'Tokens, JWT and Session Security',
      difficulty: 'Intermediate',
      minutes: 25,
      prerequisites: ['m10-l02'],
      objectives: [
        'Decode JWT structure and evaluate claims, algorithm choice, and expiry',
        'Recognize the classic token-flaw patterns and what each one enables',
        'Locate token storage on an Android device and explain the associated threat model'
      ],
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'After login, the server hands the app a credential it presents on every request: a session cookie, an opaque bearer token, or a JWT. Session security therefore splits cleanly in two questions: where does the client keep the credential (a device finding), and does the server validate it correctly (an API finding)?'
          },
          {
            type: 'p',
            text:
              'JWTs dominate modern APIs, and they are tester-friendly: they are readable without any key, and their claims tell you how the server thinks about identity — which is exactly what the next lesson manipulates.'
          }
        ],
        technical: [
          {
            type: 'h',
            text: 'JWT anatomy'
          },
          {
            type: 'p',
            text:
              'A JWT is three base64url segments joined by dots: header.payload.signature. The header names the algorithm; the payload carries claims such as iss (issuer), sub (subject/user id), exp (expiry), iat (issued at), and whatever the developers added — often role, tenant, or plan. The signature is an HMAC (shared secret) or an asymmetric signature computed over the first two segments.'
          },
          {
            type: 'code',
            lang: 'json',
            title: 'A decoded token (segments 1 and 2 — readable by anyone)',
            code:
              '// header\n{\n  "alg": "HS256",\n  "typ": "JWT"\n}\n// payload\n{\n  "sub": "1001",\n  "role": "user",\n  "tenant": "acme",\n  "iat": 1690000000,\n  "exp": 1767225600\n}'
          },
          {
            type: 'p',
            text:
              'Note what the signature does and does not do: it guarantees the payload was not modified by anyone without the key. It provides zero confidentiality — base64url is encoding, not encryption, so treat every claim as public.'
          },
          {
            type: 'h',
            text: 'Where Android keeps the token'
          },
          {
            type: 'p',
            text:
              'The client-side half of the question. Common homes, from worst to best: logs and crash reports (leaks beyond the app), plaintext SharedPreferences (readable XML inside the sandbox), plain SQLite rows, EncryptedSharedPreferences or SQLCipher (key-wrapped by the Keystore), and memory-only with Keystore-anchored keys. The sandbox protects files from other apps — not from root, debuggable builds, backups, or device theft.'
          },
          {
            type: 'compare',
            title: 'Token storage: weak vs hardened',
            beforeTitle: 'Typical weak storage (decompiled pattern)',
            beforeCode:
              'SharedPreferences prefs =\n    ctx.getSharedPreferences("auth", MODE_PRIVATE);\nprefs.edit().putString("jwt", token).apply();\n// -> /data/data/<pkg>/shared_prefs/auth.xml\n//    plaintext XML on disk',
            afterTitle: 'Hardened pattern',
            afterCode:
              '// Jetpack Security / Keystore-wrapped key:\nMasterKey key = new MasterKey.Builder(ctx)\n    .setKeyScheme(AES256_GCM).build();\nEncryptedSharedPreferences prefs =\n    new EncryptedSharedPreferences.create(ctx,\n        "auth", key, AES256_SIV, AES256_GCM);\nprefs.edit().putString("jwt", token).apply();'
          },
          {
            type: 'h',
            text: 'Classic flaws'
          },
          {
            type: 'list',
            items: [
              'alg "none" — a server that accepts unsigned tokens lets anyone mint identities',
              'Weak HMAC secrets — short or guessable secrets make the signature forgeable',
              'Missing or distant exp — tokens that never expire turn every leak into permanent access',
              'Sensitive claims — PII or secrets readable by anyone who captures the token',
              'Trusting client-asserted values — identity decisions belong in signed tokens, validated server-side (m10-l04)'
            ]
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'Tokens are the connective tissue of this module. Decoding them reveals the identity model your BOLA tests will manipulate (m10-l04). Their lifetime and storage produce standalone findings on both sides of the boundary. And every captured token is a live credential — handle it with the same care you promise the client.'
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Authorization: Bearer eyJ... headers and Set-Cookie session ids in captures',
              'Refresh-token calls — refresh tokens are long-lived and often stored worse than access tokens',
              'Claims worth noting: sub, role, tenant, exp — and the gap between iat and exp',
              'Token material in shared_prefs, logcat, or crash-report payloads'
            ]
          }
        ],
        howToTest: [
          {
            type: 'callout',
            variant: 'legal',
            title: 'Your credentials only',
            text:
              'Decode and replay tokens only for accounts you created or are contractually authorized to use. Forging or replaying other users\u2019 tokens is unauthorized access, not testing.'
          },
          {
            type: 'terminal',
            title: 'Decoding a captured JWT on your workstation',
            lines: [
              '$ TOKEN="eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMDAxIiwicm9sZSI6InVzZXIifQ.KMUFsIDTnFmyG3nMiGM6H9FNFUROf3wh7SmqJp-QV30"',
              '$ printf %s "$TOKEN" | cut -d. -f1 | tr "_-" "/+" | base64 -d 2>/dev/null; echo',
              '{"alg":"HS256","typ":"JWT"}',
              '$ printf %s "$TOKEN" | cut -d. -f2 | tr "_-" "/+" | base64 -d 2>/dev/null; echo',
              '{"sub":"1001","role":"user"}'
            ]
          },
          {
            type: 'p',
            text:
              'Record the algorithm, the claims, and the expiry gap. Then find where the app keeps it — on a debuggable training build, run-as reads the preferences files directly (m01-l07).'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'On a training app: login returns a JWT with "role":"user" and an exp ten years out; run-as shows the same token sitting in plaintext XML. Three candidate findings in one capture: excessive lifetime, insecure storage, and — once you reach m10-l04 — the question of whether the server\u2019s authorization decisions can be influenced through identity fields.'
          }
        ],
        tools: [
          {
            type: 'list',
            items: [
              'base64/python3/jq — offline decoding without uploading client tokens anywhere',
              'Burp Suite — captures and replays token-bearing requests',
              'mitmproxy — scripted token extraction and replay',
              'jwt.io — convenient for learning; avoid pasting real client tokens into third-party sites'
            ]
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Treating base64 as encryption — the payload is public; only the signature is cryptographic',
              'Tampering claims without re-signing, seeing a rejection, and calling the server broken — rejecting bad signatures is correct behavior',
              'Pasting production client tokens into third-party online decoders',
              'Forgetting refresh tokens — they outlive access tokens and usually live in the same weak places'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'On a training app: capture the login response, decode header and payload, and note alg, claims, and expiry. Locate the on-device storage with run-as and classify it. Write one evidence line per observation — timestamped command plus output — exactly as m14-l02 will require.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
              'JWT = header.payload.signature; base64url is encoding, not encryption',
              'The signature gives integrity, never confidentiality',
              'Client-side questions (where stored) and server-side questions (how validated) are separate findings',
              'Refresh tokens are the long-lived crown jewels of session security'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'm10-l03-q1',
          type: 'mcq',
          prompt: 'What does a valid JWT signature guarantee?',
          options: [
            'The payload cannot be read by third parties',
            'The payload has not been modified by anyone without the signing key',
            'The user is authorized for the requested object',
            'The token will never expire'
          ],
          answerIndex: 1,
          hint: 'Integrity versus confidentiality.',
          explanation:
            'The signature is an integrity mechanism: with the signing key secret, payload alterations are detected. Confidentiality is not provided (the payload is readable), and authorization decisions are separate server-side checks.'
        },
        {
          id: 'm10-l03-q2',
          type: 'truefalse',
          prompt: 'A JWT payload is encrypted by default.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'What did your base64 decode show?',
          explanation:
            'Base64url is encoding, not encryption — anyone who captures the token reads every claim. Confidentiality comes from TLS in transit, not from the token format.'
        },
        {
          id: 'm10-l03-q3',
          type: 'short',
          prompt: 'Which claim tells you when a token stops being valid, and what flaw should you check for around it?',
          modelAnswer:
            'The exp claim (expiry timestamp). Check that it exists, that the lifetime is proportionate to the risk (minutes to hours for access tokens, not years), and that the server actually rejects expired tokens.',
          hint: 'Three letters, one timestamp.',
          explanation:
            'Missing or distant exp turns a single token leak into permanent access. Verifying that the server honours exp — not just that the claim exists — is part of the test.'
        },
        {
          id: 'm10-l03-q4',
          type: 'scenario',
          prompt:
            'You decode your own test account\u2019s token and find {"role":"user"}. Outline the correct, authorized way to explore whether role handling is weak.',
          modelAnswer:
            'First determine how the server consumes identity: does authorization depend on the signed token, or do requests also carry client-asserted fields (role, plan, user id) the client could lie about? Test the latter by modifying your own request fields — not your token — and observing. Token-level signature probes (e.g., algorithm handling) are known checks on authorized targets and must stay within your own accounts and written scope. Never fabricate identities of other users.',
          hint: 'There are two identity channels: the token and the request body.',
          explanation:
            'Many "role" flaws live in client-asserted request fields rather than the JWT itself. That path is testable with your own accounts alone and leads directly into the authorization tests of lesson m10-l04.'
        }
      ],
      references: [
        {
          title: 'jwt.io — Introduction to JSON Web Tokens',
          url: 'https://jwt.io/introduction',
          note: 'The standard visual introduction to JWT structure.'
        },
        {
          title: 'OWASP Cheat Sheet — JSON Web Token (for Java)',
          url: 'https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_Cheat_Sheet_for_Java.html',
          note: 'Token threats and mitigations, including algorithm handling.'
        },
        {
          title: 'Android Developers — Security tips',
          url: 'https://developer.android.com/training/articles/security-tips',
          note: 'Official guidance on storing credentials and keys on device.'
        }
      ]
    },
    {
      id: 'm10-l04',
      moduleId: 'm10',
      title: 'BOLA/IDOR, Business Logic and Client-Side Trust',
      difficulty: 'Advanced',
      minutes: 30,
      prerequisites: ['m10-l03'],
      objectives: [
        'Execute object-level authorization (BOLA/IDOR) tests with two controlled accounts',
        'Tamper with business parameters and workflow order against a training target',
        'Explain why deprecated API versions and client-side trust produce lasting findings'
      ],
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'The most damaging API bugs are authorization bugs: the server takes an object identifier from the request and answers without asking whether the caller owns that object. OWASP calls it BOLA (API Security #1); the web world calls it IDOR. It needs no crypto and no memory corruption — just a missing check.'
          },
          {
            type: 'p',
            text:
              'Its siblings: business-logic abuse (prices, quantities, and step orders the server never re-derives) and client-side trust (the server believing assertions only the server should be making). All three share one root cause: the server trusting something it must verify itself.'
          }
        ],
        technical: [
          {
            type: 'h',
            text: 'Object-level authorization'
          },
          {
            type: 'p',
            text:
              'The pattern: GET /api/v1/orders/1042, where 1042 is an object id. With accounts A and B (both yours), A requests B\u2019s objects by swapping ids. A secure server answers 403 or 404; a vulnerable one returns B\u2019s data with a normal 200. Object ids come in many shapes: sequential integers, usernames, email addresses, phone numbers — and GUIDs, which are identifiers, not secrets: they leak from other endpoints, emails, and referral links.'
          },
          {
            type: 'h',
            text: 'Parameter and workflow tampering'
          },
          {
            type: 'p',
            text:
              'Some fields are server decisions the client keeps echoing back: price, total, discount, currency, quantity, status, role. Change them on your own transactions and watch what the server accepts. Workflow order matters too: cancel after delivery, confirm before payment, reuse a one-time coupon twice — logic flaws live in the sequence, not just the values.'
          },
          {
            type: 'h',
            text: 'Versions and client-side trust'
          },
          {
            type: 'p',
            text:
              'Two force multipliers. Deprecated versions (/api/v1 still routed after v2 hardened) frequently miss the authorization and validation fixes their successors received. And wherever the client computes or asserts (cart totals, feature flags, "I am admin" headers), the server must re-derive or reject — anything less is a finding.'
          },
          {
            type: 'table',
            headers: ['Test', 'Server-side answer required', 'Vulnerable answer'],
            rows: [
              ['A requests B\u2019s order by id', '403/404, or empty result', '200 with B\u2019s data'],
              ['Price/discount edited in your own cart', 'Value re-derived and re-validated server-side', 'Server bills the client-supplied number'],
              ['Confirm call replayed out of order', 'Workflow state machine rejects', 'State advances anyway'],
              ['Old version v1 of a fixed endpoint', 'Same controls as v2', 'Missing checks, forgotten route']
            ]
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'These tests dominate real API bug reports because impact is direct: cross-tenant data exposure, revenue manipulation, state corruption. They are also where evidence discipline pays most — every claim is a request/response pair from two accounts you control (m14-l02), and the severity argument writes itself from the data that crossed the boundary.'
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Object ids in paths and bodies, especially ones not derived from your own token',
              'Amounts, quantities, discounts, statuses, or roles echoed by the client',
              'Endpoints performing state transitions (pay, confirm, cancel, unlock)',
              'Legacy version routes still answering after a newer version ships',
              'Responses that differ between accounts only in payload data'
            ]
          }
        ],
        howToTest: [
          {
            type: 'callout',
            variant: 'legal',
            title: 'Two accounts, one rule',
            text:
              'Run object-level tests only between accounts you created inside the engagement\u2019s scope. Never probe, modify, or delete data belonging to real users — stop at the first response that proves exposure, and document it.'
          },
          {
            type: 'terminal',
            title: 'Two-account BOLA check (training target)',
            lines: [
              '$ # A = your tester account, B = your second account. Both created by you.',
              '$ curl -s -o /dev/null -w "%{http_code}\\n" -H "Authorization: Bearer $TOKEN_A" https://api.training.example/api/v1/orders/1042',
              '200',
              '$ curl -s -H "Authorization: Bearer $TOKEN_A" https://api.training.example/api/v1/orders/1041 | head -c 200',
              '{"id":1041,"owner":"user_B","total":99.90,"status":"shipped"}'
            ]
          },
          {
            type: 'p',
            text:
              'The pair is your evidence: A\u2019s token, B\u2019s object, a 200 with foreign data. Vary ids systematically (neighbors, your own id, a GUID), repeat for body-supplied ids, then move to parameter tampering on your own transactions. Record every pair — including the requests that were correctly rejected. Clean denials prove the check exists where it does.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'On crAPI-style targets the classic loop is: register two accounts, list one account\u2019s vehicle or order ids, request them from the other account, and watch the 200 come back. The remediation writes itself: authorize every object access against the authenticated identity per request, fail closed, and never derive decisions from client-supplied totals or flags.'
          }
        ],
        tools: [
          {
            type: 'table',
            headers: ['Tool', 'Role'],
            rows: [
              ['curl / HTTPie', 'Replayable, scriptable requests — the cleanest evidence format'],
              ['Burp Autorize extension', 'Automates the second-account comparison for every proxied request'],
              ['mitmproxy', 'Scripted id-swapping across a whole endpoint inventory']
            ]
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Assuming GUIDs prevent BOLA — they are identifiers, not secrets, and they leak',
              'Testing against accounts or data you do not own, or touching destructive endpoints on shared targets',
              'Only editing path parameters while ignoring ids and amounts in JSON bodies',
              'Stopping at one endpoint — BOLA is a class; map it across the inventory',
              'Not recording the correctly-rejected requests; denials are part of the evidence too'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'On a training target: create accounts A and B, inventory object endpoints from lesson m10-l02, and run the id-swap and parameter-tampering tests above. Log every attempt as a request/response pair and classify each result: BOLA (object access), missing function-level authorization (whole function reachable), or business-logic flaw (state/value abuse). You now hold the raw material for a complete report entry — m14-l03 shows you how to write it.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
              'BOLA/IDOR = missing per-request ownership checks; test with two controlled accounts',
              'Client-echoed money and status fields must be re-derived server-side',
              'Deprecated API versions frequently miss later fixes — inventory and test them',
              'Evidence is the pair: your request, the server\u2019s answer'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'm10-l04-q1',
          type: 'mcq',
          prompt: 'What distinguishes BOLA from missing function-level authorization?',
          options: [
            'BOLA affects only GET requests',
            'BOLA is about object access (whose data), function-level is about feature access (which operations)',
            'They are the same thing',
            'BOLA only occurs with GUID identifiers'
          ],
          answerIndex: 1,
          hint: 'One is about which object, the other about which operation.',
          explanation:
            'Function-level authorization asks "may this role call POST /admin/users at all?" BOLA assumes the function is allowed and asks "does this object belong to the caller?" Both need testing, with different evidence.'
        },
        {
          id: 'm10-l04-q2',
          type: 'truefalse',
          prompt: 'Using GUIDs as object identifiers makes BOLA impossible.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'Where else have you seen those GUIDs?',
          explanation:
            'GUIDs are unguessable, not secret: they leak via other endpoints, referral links, emails, and exports. Once obtained, the same missing ownership check hands over the object. Unpredictability raises effort; server-side authorization decides the outcome.'
        },
        {
          id: 'm10-l04-q3',
          type: 'scenario',
          prompt:
            'Design the two-account test for an order-history endpoint /api/v1/orders/{id}, and state exactly what counts as vulnerable versus safe.',
          modelAnswer:
            'Create accounts A and B; with B, place an order and record its id and content. Using A\u2019s token, request B\u2019s order id, plus neighboring and malformed ids as controls. Vulnerable: 200 responses containing B\u2019s order data. Safe: 403/404 (or empty results) for foreign ids while A still receives A\u2019s own orders. Record both response classes; also note status differentials that leak the existence of B\u2019s order (e.g., 200-with-empty vs 403) as a lesser finding.',
          hint: 'You need both the positive control (own id works) and the negative test (foreign id).',
          explanation:
            'The own-id request proves your account and tooling work; the foreign-id request is the actual test. Differentials that leak existence are real, lower-severity findings worth reporting alongside the primary result.'
        },
        {
          id: 'm10-l04-q4',
          type: 'short',
          prompt: 'Why must you also test deprecated API versions, and where do you find them?',
          modelAnswer:
            'Authorization and validation fixes are often applied only to the latest version while old routes remain routed and forgotten — so /api/v1 can lack the controls v2 received. Version markers appear in captured paths, decompiled constants, and documentation artifacts from lesson m10-l02.',
          hint: 'Fixes usually land where the developers are looking.',
          explanation:
            'Version skew is one of the most reliable sources of "we already fixed that" findings. The inventory from m10-l02 is what makes the skew visible.'
        }
      ],
      references: [
        {
          title: 'PortSwigger Web Security Academy — IDOR',
          url: 'https://portswigger.net/web-security/access-control/idor',
          note: 'Insecure direct object references, with labs.'
        },
        {
          title: 'PortSwigger Web Security Academy — Business logic vulnerabilities',
          url: 'https://portswigger.net/web-security/logic-flaws',
          note: 'The logic-abuse half of this lesson, with labs.'
        },
        {
          title: 'OWASP API Security Top 10',
          url: 'https://owasp.org/API-Security/',
          note: 'BOLA is API1 — the project page lists the full ranking.'
        }
      ]
    }
  ]
};
