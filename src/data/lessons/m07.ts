import type { Module } from '../../types';

// LEVEL 6 — PLATFORM · Module 07: Platform & Component Vulnerabilities
// Original curriculum content synthesized from public official documentation:
// developer.android.com and OWASP MASTG. All prose is original; reference
// links point to the official sources used for study. All hands-on examples
// target intentionally vulnerable local training apps (MASTG crackmes, DIVA).

export const m07: Module = {
  id: 'm07',
  title: 'Platform & Component Vulnerabilities',
  level: 6,
  description:
    'Where Android apps actually get hurt: components exposed to the outside world. Exported activities, deep links, content providers, broadcast receivers, PendingIntents, the UI layer, and the manifest switches (backup, debuggable, task affinity) that quietly widen the attack surface — and how to enumerate and test each one on authorized training targets.',
  outcomes: [
    'Enumerate every exported component of an app and turn it into an attack-surface inventory',
    'Launch and drive exported activities, deep links, providers, and receivers with adb and crafted intents',
    'Explain intent redirection, PendingIntent hijacking, and tapjacking at both concept and test level',
    'Evaluate backup, debuggable, and task-affinity configurations for compromise potential'
  ],
  lessons: [
    {
      id: 'm07-l01',
      moduleId: 'm07',
      title: 'Exported Activities and Component Abuse',
      difficulty: 'Intermediate',
      minutes: 25,
      prerequisites: ['m01-l04', 'm01-l05', 'm04-l05'],
      objectives: [
        'Enumerate the exported components of an app from manifest and runtime data',
        'Launch exported activities with crafted extras using adb am start',
        'Recognize sensitive actions that run without caller validation',
        'Describe the guarding patterns that make exported components safe'
      ],
      diagram: 'component-interaction',
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'In web terms, an exported Activity is a public URL: anyone — another app, adb, the launcher, a browser — can request it directly, no navigation required. Module 01 introduced the four components and the exported attribute; this lesson turns that knowledge into a repeatable test: enumerate what is public, drive it with crafted intents, and see how much privileged functionality you can reach while skipping the app\u2019s own UI.'
          },
          {
            type: 'p',
            text:
              'The security question is never just "is it exported?" — it is "is the exported component safe for callers the developer did not anticipate?" Many apps expose powerful screens and simply assume the only entry point is their own navigation flow. Assumptions like that are exactly what a pentester tests.'
          }
        ],
        technical: [
          {
            type: 'diagram',
            id: 'component-interaction',
            caption: 'Exported components are reachable from other apps and from adb through the framework.'
          },
          {
            type: 'p',
            text:
              'Three mechanisms make a component public: an explicit android:exported="true"; an intent-filter (which historically implied export — since Android 12, apps targeting API 31+ must declare exported explicitly for any component that has a filter); and same-UID shared setups. Once public, the component receives Intents whose action, data URI, and extras are fully attacker-controlled.'
          },
          {
            type: 'p',
            text:
              'Android gives developers caller-verification tools, each with pitfalls a tester should know: getCallingActivity()/getCallingPackage() return non-null only when the component was started for a result (startActivityForResult); Binder.getCallingUid()/checkCallingPermission() work for Binder-mediated calls (services, providers) but are meaningless in a plain onCreate() triggered by startActivity; and android:permission on the manifest declaration enforces a requirement at the framework level for every caller, including adb.'
          },
          {
            type: 'compare',
            title: 'Same exported activity, two postures',
            beforeTitle: 'Trusting every caller',
            beforeCode:
              '// Exported, no caller validation\n@Override\nprotected void onCreate(Bundle b) {\n    super.onCreate(b);\n    if (getIntent().getBooleanExtra("admin_confirm", false)) {\n        unlockAdminPanel();   // any app, or one adb command\n    }\n}',
            afterTitle: 'Guarded at the boundary',
            afterCode:
              '// Permission enforced by the framework + explicit caller check\n@Override\nprotected void onCreate(Bundle b) {\n    super.onCreate(b);\n    // com.example.PERM_ADMIN declared as signature-level in the manifest\n    if (checkCallingPermission("com.example.PERM_ADMIN") != PERMISSION_GRANTED) {\n        finish();\n        return;\n    }\n    if (getIntent().getBooleanExtra("admin_confirm", false)) {\n        unlockAdminPanel();\n    }\n}'
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'This is forced browsing for Android: you skip the login wall by starting the screen directly. Typical confirmed findings include admin or secret panels reachable via am start, activities that act on unvalidated extras (a url extra loaded into a WebView), and screens that mutate state — logout, unlock, redeem — on start. Findings map to the MASVS-PLATFORM requirements and the MASTG platform-interaction tests.'
          },
          {
            type: 'list',
            items: [
              'Evidence to collect per finding: component name, the exact crafted command, and the observable privileged behavior',
              'Code excerpt showing the missing caller/input validation',
              'Severity drivers: impact of the action, whether a normal/dangerous permission could satisfy a guard, preconditions for the attacker'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'android:exported="true" and every component with an intent-filter (check targetSdk: pre-12 apps may rely on implicit export)',
              'Activities performing sensitive actions on start or in onNewIntent: unlock, redeem, reset, WebView loads from extras',
              'Custom permissions declared with protectionLevel="normal" or "dangerous" guarding sensitive components — a malicious app can simply request those',
              'onCreate reading getIntent() extras without validation; singleTask/singleTop activities trusting onNewIntent',
              'Exported activities that return sensitive data via setResult() — reachable with startActivityForResult from a malicious app'
            ]
          }
        ],
        howToTest: [
          {
            type: 'callout',
            variant: 'legal',
            title: 'Authorized targets only',
            text:
              'Launching components with crafted intents is active testing. Restrict it to training apps, emulators, and contractually in-scope targets, and collect evidence only from those.'
          },
          {
            type: 'terminal',
            title: 'Enumerate and drive exported activities',
            lines: [
              '$ adb shell dumpsys package com.example.trainingapp | grep -B1 -A4 "exported=true"',
              '$ adb shell am start -n com.example.trainingapp/.SecretAdminActivity',
              'Starting: Intent { cmp=com.example.trainingapp/.SecretAdminActivity }',
              '# the admin panel opened without any in-app navigation',
              '$ adb shell am start -n com.example.trainingapp/.SecretAdminActivity --es action "unlock" --ez confirm true',
              '$ adb logcat --pid=$(adb shell pidof com.example.trainingapp)'
            ]
          },
          {
            type: 'p',
            text:
              'Watch logcat as each intent lands: crashes, "Permission Denial", or silent state changes all tell you how the component handles hostile input. If am start is refused by a permission guard, record which guard — and whether that permission is at protectionLevel normal or dangerous, which a malicious app could simply request.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'DIVA-style training apps ship unprotected-activity scenarios: an Activity that displays vendor secrets or performs a privileged action, exported purely as a side effect of an intent-filter. Running the am start line above reproduces exactly what a customer-facing report would show — sensitive functionality reachable with one shell command and zero UI interaction.'
          },
          {
            type: 'callout',
            variant: 'note',
            title: 'Training targets',
            text:
              'The MASTG crackmes and DIVA (github.com/payatu/diva-android) are purpose-built, legally usable targets for this lesson. Never rehearse these commands on apps outside your authorization.'
          }
        ],
        tools: [
          {
            type: 'table',
            headers: ['Tool', 'Role'],
            rows: [
              ['adb shell dumpsys package / pm dump', 'Enumerate components and exported state at runtime'],
              ['adb shell am start', 'Launch activities with crafted action, data, and extras'],
              ['apkanalyzer / aapt2 dump xmltree', 'Read the manifest: exported flags, permissions, launch modes'],
              ['Drozer / MobSF', 'Systematic component enumeration and intent fuzzing']
            ]
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Stopping at exported=false — same-UID packages, shared userId setups, and platform-mediated flows can still reach the component',
              'Reporting "exported" without demonstrating impact; always drive the component and record what it lets you do',
              'Testing only onCreate — singleTop/singleTask activities receive re-delivered intents in onNewIntent, often unvalidated',
              'Accepting a guarding permission without checking its protectionLevel; normal/dangerous permissions are attacker-obtainable'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Pick a training app, inventory every exported component, then drive each one: start with no extras, with wrong types, with extra keys the code never reads, and with plausible action names. Log the observable result of every invocation in a table — that table becomes the evidence section of a component-abuse finding.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
              'Exported components are public API surface — enumerate them on every assessment',
              'am start with crafted extras is the adb equivalent of forced browsing',
              'Guards that matter: framework-enforced permissions, caller validation, and input validation on every entry point (onCreate and onNewIntent)',
              'An exported component without demonstrated impact is not a finding — drive it and record behavior'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'm07-l01-q1',
          type: 'mcq',
          prompt: 'Which manifest attribute most directly controls whether other apps may start an activity?',
          options: ['android:exported', 'android:launchMode', 'android:taskAffinity', 'android:enabled'],
          answerIndex: 0,
          hint: 'One attribute literally means "available to other applications".',
          explanation:
            'android:exported decides external reachability. launchMode and taskAffinity shape task behavior, and enabled only toggles whether the component can be instantiated at all.'
        },
        {
          id: 'm07-l01-q2',
          type: 'truefalse',
          prompt: 'Setting android:exported="false" makes a component completely unreachable from outside the app\u2019s own code.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'Think about shared userId, adb on debuggable builds, and platform-mediated flows.',
          explanation:
            'exported=false blocks normal cross-app starts, but the component remains reachable from code running inside the same UID, from adb on debuggable builds, and through platform-mediated paths. It is a strong default, not a magic wall.'
        },
        {
          id: 'm07-l01-q3',
          type: 'short',
          prompt: 'Name two code-level ways an activity can verify who started it, and note one limitation of each.',
          modelAnswer:
            'getCallingActivity()/getCallingPackage() return the caller only when the activity was started for a result (startActivityForResult) — null otherwise. checkCallingPermission()/enforceCallingPermission() work in Binder-mediated contexts but are meaningless for plain startActivity flows. The manifest android:permission attribute is the framework-enforced option covering every caller.',
          hint: 'One works for for-result starts, one for Binder calls.',
          explanation:
            'Each verification tool has a scope. Misunderstanding the scope is exactly how developers ship components they believe are guarded but are not — and how testers turn "it looks checked" into a real finding.'
        },
        {
          id: 'm07-l01-q4',
          type: 'scenario',
          prompt:
            'A training app\u2019s SecretAdminActivity is exported, requires no permission, and wipes its database when started with --ez confirm true. Draft the finding: what do you include, and which severity factors do you weigh?',
          modelAnswer:
            'Include: component name and manifest excerpt, the exact am start command, logcat or screenshot evidence of the wipe executing without authentication, and the missing-guard analysis (no android:permission, no caller check). Severity factors: impact of the privileged action, absence of preconditions (no extra app or root needed — higher), whether a legitimate caller flow exists, and whether the data loss is recoverable.',
          hint: 'Evidence first, impact second.',
          explanation:
            'Component-abuse findings live or die on evidence quality: a reproducible one-line trigger plus a clear statement of what the exposure enables. Generic "it is exported" claims without demonstrated behavior are weak findings.'
        }
      ],
      references: [
        {
          title: 'Android Developers — Manifest: activity element',
          url: 'https://developer.android.com/guide/topics/manifest/activity-element',
          note: 'Official reference for exported and the Android 12 declaration requirement.'
        },
        {
          title: 'OWASP MASTG — Testing Platform Interaction',
          url: 'https://mas.owasp.org/MASTG/Android/0x05h-Testing-Platform-Interaction/',
          note: 'The canonical component testing chapter.'
        },
        {
          title: 'Android Developers — Security tips',
          url: 'https://developer.android.com/training/articles/security-tips',
          note: 'Official guidance on components, permissions, and IPC.'
        }
      ]
    },
    {
      id: 'm07-l02',
      moduleId: 'm07',
      title: 'Deep Links and Intent Redirection',
      difficulty: 'Intermediate',
      minutes: 25,
      prerequisites: ['m07-l01'],
      objectives: [
        'Explain how deep-link intent-filters resolve and what BROWSABLE and autoVerify mean',
        'Attack link-handling parameters on training apps',
        'Recognize and test intent redirection patterns',
        'Check App Links verification state from adb'
      ],
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'Deep links extend component abuse with a remote trigger: a link in a browser, SMS, or another app lands directly in a handler activity with attacker-chosen parameters. m07-l01 showed how to start exported components from adb; this lesson shows how the same components get started by anyone who can make a user click a link — and what apps must do so a link can do no more than navigate.'
          }
        ],
        technical: [
          {
            type: 'h',
            text: 'How deep links resolve'
          },
          {
            type: 'p',
            text:
              'A deep link is an intent-filter with an action (VIEW), the categories BROWSABLE and DEFAULT, and a data specification (scheme, host, pathPattern). BROWSABLE is the security-relevant part: it marks the activity as callable from browser and WebView contexts. Verified App Links (https scheme + autoVerify + a signed assetlinks.json published on the domain) let an app claim a web domain so links open without the disambiguation chooser; unverified custom schemes always leave room for a chooser — or a malicious volunteer.'
          },
          {
            type: 'h',
            text: 'The two recurring abuse patterns'
          },
          {
            type: 'p',
            text:
              'First, parameter abuse: the handler parses the data URI and feeds pieces of it to privileged code — a WebView loads url=, a profile screen trusts user=, a redemption flow trusts code=. The link is just another input channel into the unvalidated-input problem. Second, intent redirection: the handler reads an attacker-supplied intent (a Parcelable extra, or an intent:// URI parsed with Intent.parseUri) and calls startActivity()/sendBroadcast() with it — executing the attacker\u2019s intent with the app\u2019s identity and permissions, including reaching the app\u2019s own non-exported internal components.'
          },
          {
            type: 'code',
            lang: 'java',
            title: 'Vulnerable redirect handler',
            code:
              '// Exported deep-link handler — executes attacker-supplied intents as this app\nUri data = getIntent().getData();\nif ("forward".equals(data.getHost())) {\n    Intent next = Intent.parseUri(\n        data.getQueryParameter("i"), Intent.URI_INTENT_SCHEME);\n    next.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);\n    startActivity(next);   // runs with our identity, permissions, and exports\n}'
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'Deep links collapse the "the user would have to navigate there" argument: one click is enough. A link like myapp://profile?redirect=https://evil.example turns an exported activity into an open redirect; an intent:// payload can bounce a victim app into starting internal screens or firing privileged intents. Combined with WebView handlers this is a common real-world chain into internal surfaces, and the MASTG platform tests treat link handling as first-class attack surface.'
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Filters declaring custom schemes plus BROWSABLE, and autoVerify https handlers',
              'getData()/getQueryParameter chains feeding WebView.loadUrl, database queries, or navigation state',
              'Intent.parseUri calls and getParcelableExtra() results that are immediately started or broadcast',
              'onNewIntent handling in singleTop/singleTask activities that trusts the new intent',
              'WebViewClient.shouldOverrideUrlLoading implementations that re-dispatch URLs into app internals'
            ]
          }
        ],
        howToTest: [
          {
            type: 'callout',
            variant: 'legal',
            title: 'Click, but only on your targets',
            text:
              'Triggering deep links on a device is active testing. Use training apps on your own emulator; never point crafted links at apps, users, or domains outside your authorization.'
          },
          {
            type: 'terminal',
            title: 'Driving deep links from adb',
            lines: [
              '$ adb shell am start -a android.intent.action.VIEW -d "myapp://profile?user=admin"',
              '$ adb shell am start -a android.intent.action.VIEW -d "myapp://forward?i=intent://x/#Intent;scheme=https;component=com.example.trainingapp/.InternalPayScreen;end"',
              '$ adb shell pm get-app-links com.example.trainingapp',
              '# link-handling state per domain; nothing verified = chooser fallback'
            ]
          },
          {
            type: 'p',
            text:
              'am start -a VIEW -d is your browser substitute: the framework runs the exact same resolution path a browser link would. Test the negative space too — drop the query, swap hosts, change scheme casing. For App Links, pm get-app-links reports verification status; an unverified domain means chooser fallback, which is a UX observation unless it feeds a security-relevant flow.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'A MASTG-style crackme handler accepts myapp://redeem?code= and grants premium when code matches a constant. Triggering it from a browser tab (or am start) redeems without login — the constant was sitting in the decompiled handler all along. The redirection variant: an exported ForwardActivity that startActivity()s whatever intent arrives in its data hands you a bounce into components only the app itself could normally reach — its own internal screens and services.'
          }
        ],
        tools: [
          {
            type: 'list',
            items: [
              'adb am start / pm get-app-links — trigger links and inspect verification state',
              'JADX — trace getData/getQueryParameter/Intent.parseUri consumers',
              'Drozer — intent fuzzing including intent:// payloads',
              'A browser or Custom Tabs tab — the realistic delivery path for links'
            ]
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Assuming autoVerify in the manifest means verified — verification is an online process against assetlinks.json and fails silently',
              'Testing deep links only via adb and missing browser-context nuances (BROWSABLE required, scheme case sensitivity)',
              'Treating the chooser prompt as a security boundary — a malicious helper app can still volunteer for the match',
              'Hunting only data URIs; whole intents also arrive as Parcelable extras in getIntent().getExtras()'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'In a training app, find its deep-link filters (aapt2 dump xmltree), then trigger the link with every parameter slot you can think of: url=, redirect=, user=, next=. Watch logcat for how the handler consumes each. Then attempt an intent:// redirection aimed at an internal screen and record whether it lands.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
              'Deep links are remote-triggered component abuse: one click replaces one adb command',
              'Parameter abuse and intent redirection are the two recurring patterns — hunt both in handler code',
              'BROWSABLE marks an activity callable from browsers; verification (assetlinks.json) is separate and often unconfirmed',
              'A deep-link handler must validate inputs as rigorously as a public API endpoint'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'm07-l02-q1',
          type: 'mcq',
          prompt: 'Which category must an intent-filter declare for its activity to be openable from a web browser?',
          options: [
            'android.intent.category.LAUNCHER',
            'android.intent.category.BROWSABLE',
            'android.intent.category.DEFAULT only',
            'android.intent.category.HOME'
          ],
          answerIndex: 1,
          hint: 'The name says it — browsable.',
          explanation:
            'BROWSABLE marks the activity as safe to invoke from browser and WebView link contexts. DEFAULT is also required for implicit resolution, but BROWSABLE is the browser-specific gate.'
        },
        {
          id: 'm07-l02-q2',
          type: 'truefalse',
          prompt: 'An app that declares autoVerify="true" is guaranteed to be the verified handler of its https domain.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'Verification is a runtime, online process.',
          explanation:
            'autoVerify requests domain verification; the system then checks a signed assetlinks.json on the domain. If verification fails (redirects, DNS, JSON mismatch), links fall back to the disambiguation chooser.'
        },
        {
          id: 'm07-l02-q3',
          type: 'short',
          prompt: 'In one sentence, what is intent redirection in the mobile context?',
          modelAnswer:
            'An app forwards an attacker-controlled intent (from an extra or a parsed intent:// URI) to startActivity/sendBroadcast/bindService, so the attacker\u2019s intent executes with the forwarding app\u2019s identity and permissions — reaching components and privileges the attacker could not touch directly.',
          hint: 'Think: the app runs your errand with its own badge.',
          explanation:
            'The danger is borrowed privilege: the forwarding app can reach its own internal (non-exported) components and use its own permissions, so redirection converts an exported entry point into a proxy for privileged actions.'
        },
        {
          id: 'm07-l02-q4',
          type: 'scenario',
          prompt:
            'You find myapp://forward?i=<url-encoded intent> on a training app, forwarding into an internal (non-exported) payment screen. Why can you not start that screen directly with am start, yet the link gets you there?',
          modelAnswer:
            'The payment screen is not exported, so direct external starts are denied by the framework. ForwardActivity, however, runs inside the app and starts the screen as the app itself — the redirection pattern borrows the app\u2019s own privileges. The finding: an exported entry point that proxies intent execution without validating targets.',
          hint: 'Who is actually executing the second startActivity call?',
          explanation:
            'Export checks apply to external callers; code inside the app can always start its own components. That asymmetry is what makes intent redirection powerful — and why the exported handler must allowlist redirect targets.'
        }
      ],
      references: [
        {
          title: 'Android Developers — Create Deep Links to App Content',
          url: 'https://developer.android.com/training/app-links/deep-linking',
          note: 'Official deep-link and intent-filter documentation.'
        },
        {
          title: 'Android Developers — Verify Android App Links',
          url: 'https://developer.android.com/training/app-links/verify-android-app-links',
          note: 'Official App Links verification and assetlinks.json documentation.'
        },
        {
          title: 'OWASP MASTG — Testing Platform Interaction',
          url: 'https://mas.owasp.org/MASTG/Android/0x05h-Testing-Platform-Interaction/',
          note: 'Testing methodology for deep links and intent handling.'
        }
      ]
    },
    {
      id: 'm07-l03',
      moduleId: 'm07',
      title: 'Content Provider Vulnerabilities',
      difficulty: 'Intermediate',
      minutes: 30,
      prerequisites: ['m01-l04', 'm01-l07'],
      objectives: [
        'Map provider access control from manifest and code',
        'Test injection through selection, projection, and sortOrder arguments',
        'Test path traversal in openFile implementations',
        'Explain grantUriPermissions pitfalls and probe providers from adb'
      ],
      diagram: 'binder-ipc',
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'A content provider is a tiny REST-style data API embedded in your app: URIs under content:// with query/insert/update/delete/getType/openFile/call operations. Everything m01-l07 said about Binder applies — provider calls cross process boundaries — so a provider without permission checks is a database endpoint other apps can query. Four vulnerability classes dominate: missing access control, injection through query parameters, path traversal in openFile, and over-broad URI grants.'
          }
        ],
        technical: [
          {
            type: 'p',
            text:
              'The manifest declares the provider with authorities, exported, readPermission/writePermission, grantUriPermissions, and optional path-permission rules. Defaults matter: for providers, exported defaulted to true only for very old targetSdk values (16 and lower); modern defaults are safe — but explicit declarations still tell you intent, and legacy apps still exist. Enforcement exists at two levels: manifest-level (exported, permissions, path-permission) and code-level (checks against Binder.getCallingUid() inside query/call implementations).'
          },
          {
            type: 'p',
            text:
              'grantUriPermissions="true" combined with FLAG_GRANT_READ_URI_PERMISSION lets an app hand out temporary access to specific URIs. With permissive grant-uri-permission path patterns, that access is handed out broadly — and the grant stays valid for its recipients for as long as the URI is, outliving the intent that delivered it.'
          },
          {
            type: 'h',
            text: 'Injection and traversal'
          },
          {
            type: 'p',
            text:
              'Because query() receives the caller-supplied selection, selectionArgs, projection, and sortOrder, a provider that concatenates them into raw SQL is injectable by any caller — the classic DIVA scenario. openFile() is the file sibling: if it builds a path from uri.getPath() without canonicalization, a URI like content://app/root/../databases/secret.db escapes the intended directory and reads arbitrary files in the app\u2019s sandbox.'
          },
          {
            type: 'table',
            headers: ['Provider parameter', 'What to try on a training app'],
            rows: [
              ['selection (where)', 'Boolean conditions like 1=1; UNION-shaped selections'],
              ['projection', 'Extra column names; SQL fragments where the provider concatenates'],
              ['sortOrder', 'ORDER BY fragments; blind-injection oracle'],
              ['openFile path', '../ segments aimed at databases/ or shared_prefs/'],
              ['call()', 'Undocumented method names reachable via content call']
            ]
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'Providers are where injection lives on Android, and they are quiet: no UI interaction needed, one content query command proves a data exposure. Remediation framing writes itself — parameterized queries via selectionArgs, permission enforcement, canonical-path checks in openFile, and minimal grant patterns. All map to the MASVS-PLATFORM and MASTG platform tests.'
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Exported providers with no readPermission/writePermission, and legacy providers relying on old export defaults',
              'SQL built by concatenation: rawQuery with a composed where string, projection appended into the statement',
              'openFile implementations using uri.getPath() directly without getCanonicalPath validation',
              'grantUriPermissions="true" plus a permissive grant-uri-permission pathPattern',
              'Providers serving every table regardless of caller identity'
            ]
          }
        ],
        howToTest: [
          {
            type: 'callout',
            variant: 'legal',
            title: 'Query only what is yours',
            text:
              'content query/insert/read against providers is active IPC testing. Run it against training apps and in-scope targets on your own devices only.'
          },
          {
            type: 'terminal',
            title: 'Probing a provider from adb',
            lines: [
              '$ adb shell content query --uri content://com.example.trainingapp.provider/notes',
              'Row 0: {_id=1, title=Invoice, body=...}',
              '$ adb shell content query --uri content://com.example.trainingapp.provider/notes --where "1=1) UNION SELECT sql FROM sqlite_master--"',
              '$ adb shell content insert --uri content://com.example.trainingapp.provider/notes --bind title:s:ATTACKER_ROW',
              '$ adb shell content read --uri content://com.example.trainingapp.provider/root/databases/secret.db'
            ]
          },
          {
            type: 'p',
            text:
              'Also compare ground truth with what the provider serves: run-as com.example.trainingapp sqlite3 databases/<db> inspects the schema directly. If drozer is in your toolkit, app.provider.query, app.provider.update, and app.provider.read automate the same probes with friendlier output.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'DIVA\u2019s content provider scenario stores notes in SQLite and exposes them through string-concatenated SQL; a single crafted --where extracts the full schema and every row. The openFile variant appears in MASTG-style training apps: a file provider rooted at files/ that accepts traversal segments and hands out the app\u2019s own database file. Both are two-command demonstrations with high-impact outcomes.'
          },
          {
            type: 'callout',
            variant: 'note',
            title: 'Chains matter',
            text:
              'A non-exported provider is not automatically safe: the app\u2019s own exported components (deep links, extras) may reach it with attacker-controlled arguments. Injection there is a chained finding — document the full path.'
          }
        ],
        tools: [
          {
            type: 'table',
            headers: ['Tool', 'Role'],
            rows: [
              ['adb content query/insert/read', 'Direct provider probing without extra tooling'],
              ['Drozer app.provider.*', 'Systematic injection and traversal modules'],
              ['run-as + sqlite3', 'Ground truth of the database versus provider output'],
              ['MobSF', 'Static flags for exported providers and risky SQL patterns']
            ]
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Testing only query — insert/update/delete paths are equally exploitable and often prove impact better',
              'Reading the manifest but not the code: chained access through exported components or grants bypasses exported=false',
              'Assuming FileProvider is safe by default — review its <paths> configuration for over-broad roots',
              'Stopping at the first error message; "no content provider" usually means a URI typo, not a denial'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Against your training provider, systematically try: no parameters, boolean where, extra projection columns, sortOrder fragments, and traversal segments in a file URI. Record each request/response pair. Then fix the provider yourself (selectionArgs plus a canonical-path check) and re-run the same commands — the diff is your remediation section.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
              'Exported, unguarded providers are public data endpoints',
              'selection, projection, sortOrder, and openFile paths are the four injection surfaces',
              'content query/insert/read makes provider testing a one-liner on any authorized target',
              'Remediation: parameterized queries, manifest permissions, canonical-path checks, minimal grants'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'm07-l03-q1',
          type: 'mcq',
          prompt: 'Which manifest child element of <provider> defines URI prefixes the app may temporarily grant to other apps?',
          options: ['<path-permission>', '<grant-uri-permission>', '<meta-data>', '<paths>'],
          answerIndex: 1,
          hint: 'Its name contains the word grant.',
          explanation:
            '<grant-uri-permission> children (with grantUriPermissions="true") define the URI prefixes that FLAG_GRANT_READ/WRITE_URI_PERMISSION may hand out temporarily. <path-permission> instead restricts which paths require which permissions.'
        },
        {
          id: 'm07-l03-q2',
          type: 'truefalse',
          prompt: 'A selection clause built by string concatenation is harmless if the provider is not exported.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'Who else can call query()?',
          explanation:
            'Non-exported providers remain callable from the app\u2019s own code — including exported components processing external input such as deep links and extras. The injection then becomes a chained finding that starts at the exported boundary.'
        },
        {
          id: 'm07-l03-q3',
          type: 'short',
          prompt: 'Give the openFile hardening rule that defeats ../ traversal.',
          modelAnswer:
            'Canonicalize the resolved path (File.getCanonicalFile()) and verify it is still inside the intended base directory (a startsWith check against the canonical base) before opening it — or restrict reads to a fixed allowlist of files.',
          hint: 'Compare the canonical path against the base directory.',
          explanation:
            'Canonicalization resolves ../ segments before any comparison, so the check cannot be fooled by path tricks. Without it, callers walk out of the intended root into the app\u2019s whole sandbox.'
        },
        {
          id: 'm07-l03-q4',
          type: 'scenario',
          prompt:
            'content query with --where "1=1) UNION SELECT sql FROM sqlite_master--" returns the schema of a training app\u2019s provider. What does this prove, and what do you do next?',
          modelAnswer:
            'It proves SQL injection in selection handling: caller input is concatenated into the query. Next, enumerate tables via sqlite_master, extract data that demonstrates impact (tokens, PII), document the exact command and output as evidence, and write the remediation: parameterized selectionArgs, allowlisted projections, and access control on the provider.',
          hint: 'The UNION worked — that is the proof. Now quantify it.',
          explanation:
            'One working UNION converts "possible injection" into confirmed data exposure. Follow through with schema and sensitive-row extraction so the report shows real impact, then fix and re-test.'
        }
      ],
      references: [
        {
          title: 'Android Developers — Content providers',
          url: 'https://developer.android.com/guide/topics/providers/content-providers',
          note: 'Official provider architecture and access-control documentation.'
        },
        {
          title: 'Android Developers — Manifest: provider element',
          url: 'https://developer.android.com/guide/topics/manifest/provider-element',
          note: 'Official reference for exported defaults, permissions, and grants.'
        },
        {
          title: 'OWASP MASTG — Testing Platform Interaction',
          url: 'https://mas.owasp.org/MASTG/Android/0x05h-Testing-Platform-Interaction/',
          note: 'Provider testing methodology including injection and traversal.'
        },
        {
          title: 'DIVA Android (Payatu)',
          url: 'https://github.com/payatu/diva',
          note: 'Intentionally vulnerable training app with provider injection scenarios.'
        }
      ]
    },
    {
      id: 'm07-l04',
      moduleId: 'm07',
      title: 'Broadcast Receivers and PendingIntents',
      difficulty: 'Intermediate',
      minutes: 25,
      prerequisites: ['m01-l05', 'm07-l01'],
      objectives: [
        'Test spoofed broadcasts against exported receivers',
        'Explain ordered broadcast abuse and sender-verification gaps',
        'Recognize mutable PendingIntent hijacking at concept and test level',
        'Apply FLAG_IMMUTABLE and RECEIVER_NOT_EXPORTED best practices'
      ],
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'Broadcasts are the framework\u2019s pub-sub: anyone can send an Intent to whoever listens, and receivers act on what arrives. PendingIntents go further — they delegate the right to fire an intent as your app. Both mechanisms cross trust boundaries by design, so both fail interestingly when developers assume the sender or the holder is trustworthy.'
          }
        ],
        technical: [
          {
            type: 'h',
            text: 'Receivers'
          },
          {
            type: 'p',
            text:
              'Receivers are declared in the manifest (static) or registered at runtime (dynamic). A manifest receiver with an intent-filter follows the same Android 12 explicit-export rule as activities. On send, the system resolves matching receivers; ordered broadcasts (sendOrderedBroadcast) deliver sequentially by priority and let each receiver read and rewrite the result — and call abortBroadcast(). Since Android 13/14, dynamically registered receivers must declare RECEIVER_EXPORTED or RECEIVER_NOT_EXPORTED for non-system broadcasts, closing a long-standing accidental-exposure default. Note the asymmetry: system broadcasts declared as protected broadcasts cannot be spoofed by third-party apps — the framework throws a SecurityException — but your custom actions carry no such protection unless you verify the sender.'
          },
          {
            type: 'code',
            lang: 'kotlin',
            title: 'Registering a receiver non-exported (modern, safe)',
            code:
              '// Targeting API 34+: choose the export state explicitly\nContextCompat.registerReceiver(\n    this,\n    unlockReceiver,\n    IntentFilter("com.example.trainingapp.UNLOCK"),\n    ContextCompat.RECEIVER_NOT_EXPORTED\n)'
          },
          {
            type: 'h',
            text: 'PendingIntents'
          },
          {
            type: 'p',
            text:
              'A PendingIntent wraps an intent plus the creator\u2019s identity: the framework executes it as the creator, with the creator\u2019s permissions. Before Android 12, PendingIntents were mutable unless told otherwise; a mutable PendingIntent whose base intent is under-specified (empty action or component) lets the receiving app fill in the blanks and fire an intent as the creator — the classic privilege-escalation family in framework notification code. Android 12 requires every PendingIntent to state FLAG_IMMUTABLE or FLAG_MUTABLE; immutable plus a fully specified wrapped intent is the safe default.'
          },
          {
            type: 'compare',
            title: 'PendingIntent construction',
            beforeTitle: 'Mutable and under-specified (fill-in hijack)',
            beforeCode:
              'PendingIntent.getActivity(ctx, REQ,\n    new Intent(),   // empty: no action, no component\n    PendingIntent.FLAG_MUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);\n// any app that obtains this PI can set the fields\n// and fire the intent AS YOUR APP',
            afterTitle: 'Immutable and fully specified',
            afterCode:
              'PendingIntent.getActivity(ctx, REQ,\n    new Intent(ctx, InternalPayScreen.class)  // explicit target\n        .putExtra("src", "internal"),\n    PendingIntent.FLAG_IMMUTABLE);'
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'Receiver findings are cheap to confirm — one am broadcast command. Impact ranges from UI glitches to state corruption (a forged "premium unlocked" broadcast) and data leaks (your implicit broadcast resolves to an attacker-registered receiver). Mutable PendingIntent findings are rarer but severe: the mutable flag on a sensitive operation is the same class as an unvalidated redirect — someone else fires your credentials.'
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Exported receivers for custom actions whose onReceive trusts extras without sender verification',
              'Runtime receivers registered without RECEIVER_NOT_EXPORTED on API 33+ targets',
              'sendOrderedBroadcast flows where a high-priority malicious receiver could rewrite shared results',
              'PendingIntent construction without FLAG_IMMUTABLE, or with FLAG_MUTABLE on intents lacking explicit action/component',
              'Notification, AlarmManager, and widget code paths — the usual habitat of mutable PendingIntents'
            ]
          }
        ],
        howToTest: [
          {
            type: 'callout',
            variant: 'legal',
            title: 'Broadcast only at your own targets',
            text:
              'Sending crafted broadcasts is active testing. Restrict am broadcast and companion-app probes to training apps and in-scope devices you own.'
          },
          {
            type: 'terminal',
            title: 'Probing receivers on a training app',
            lines: [
              '$ adb shell am broadcast -a com.example.trainingapp.UNLOCK --ei level 99',
              '$ adb shell dumpsys package com.example.trainingapp | grep -B2 -A6 Receiver',
              '$ adb shell dumpsys activity broadcasts | grep -i "com.example.trainingapp" | head',
              '$ adb shell am broadcast -a android.intent.action.BOOT_COMPLETED',
              '# rejected: BOOT_COMPLETED is a protected broadcast — the framework blocks third-party senders'
            ]
          },
          {
            type: 'p',
            text:
              'dumpsys lists both manifest-declared and live runtime registrations. For dynamic receivers a companion test app is the reliable probe: register for the same custom actions and observe. For ordered broadcasts, register a high-priority receiver in your test app and watch whether your result supersedes the victim\u2019s.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'Training apps commonly include an exported UNLOCK receiver whose onReceive flips a "premium" preference; one am broadcast unlocks the app. The PendingIntent variant: a notification PendingIntent left mutable with an empty base intent — your test harness fills in the component and starts the app\u2019s internal screen as the victim app. Both write up as MASVS-PLATFORM items with one-command reproducers.'
          }
        ],
        tools: [
          {
            type: 'list',
            items: [
              'adb am broadcast — manual probing',
              'dumpsys activity broadcasts — live receiver registrations',
              'JADX — trace onReceive implementations and PendingIntent builders',
              'Drozer — broadcast fuzzing modules'
            ]
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Assuming only your app can send your custom action — any app can, unless the sender is verified or a signature permission guards the receiver',
              'Reporting spoof attempts on protected system broadcasts as findings — the framework rejecting them is the control working',
              'Auditing manifest receivers only; runtime-registered ones are invisible in the manifest',
              'Treating FLAG_MUTABLE as broadly required — scope mutability to the specific feature, and always fill the wrapped intent completely'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Build a two-app exercise on your emulator: a victim training app with a custom-action receiver, and a tiny sender app. Send from the sender (not just adb) to prove cross-app reachability. Then add RECEIVER_NOT_EXPORTED or a signature permission in the victim and show the same send now fails — capture both logcat traces for your notes.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
              'Custom-action broadcasts are spoofable by default; verify senders or restrict with permissions and RECEIVER_NOT_EXPORTED',
              'Ordered broadcasts let any high-priority receiver rewrite results — assume adversarial receivers',
              'PendingIntents execute as their creator: immutable plus fully specified wrapped intents is the safe default',
              'The platform is closing these defaults: Android 12 forces explicit mutability, Android 13/14 force explicit receiver export state'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'm07-l04-q1',
          type: 'mcq',
          prompt: 'What makes a PendingIntent security-critical compared to a normal Intent?',
          options: [
            'It is encrypted',
            'It executes the wrapped intent with the creator\u2019s identity and permissions',
            'It cannot ever be modified once created',
            'It only works for system apps'
          ],
          answerIndex: 1,
          hint: 'It delegates more than a message — it delegates identity.',
          explanation:
            'The framework fires the PendingIntent on behalf of its creator, so a mutable or under-specified PendingIntent lets another app act as the creator. FLAG_IMMUTABLE prevents modification; a fully specified wrapped intent prevents hijack-by-fill-in.'
        },
        {
          id: 'm07-l04-q2',
          type: 'truefalse',
          prompt: 'A malicious app can spoof android.intent.action.BOOT_COMPLETED to a receiver.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'Some framework actions are declared as protected broadcasts.',
          explanation:
            'Protected broadcasts cannot be sent by third-party apps; the system throws a SecurityException. Custom app-defined actions have no such protection unless the app verifies the sender itself.'
        },
        {
          id: 'm07-l04-q3',
          type: 'short',
          prompt: 'Name the export-state constants a dynamically registered receiver must choose on recent Android, and what each means.',
          modelAnswer:
            'RECEIVER_EXPORTED (any app can deliver broadcasts to it) and RECEIVER_NOT_EXPORTED (only the app itself and the system can). ContextCompat.registerReceiver provides backward-compatible registration for older API levels.',
          hint: 'Exported versus not — the same idea as manifest components.',
          explanation:
            'Requiring the explicit choice (Android 13/14 behavior for non-system broadcasts) removes the historical default of implicitly exported dynamic receivers — a recurring source of accidental exposure.'
        },
        {
          id: 'm07-l04-q4',
          type: 'scenario',
          prompt:
            'A training app creates its notification PendingIntent as PendingIntent.getActivity(ctx, 0, new Intent(), FLAG_MUTABLE). Describe the attack and the minimal fix.',
          modelAnswer:
            'Attack: any app that obtains the PendingIntent calls fillIntent/send after supplying action, component, and extras, so the victim\u2019s internal screen or service executes with the victim\u2019s identity. Minimal fix: build the wrapped intent fully (explicit component or action) and mark FLAG_IMMUTABLE.',
          hint: 'The empty Intent() is the tell.',
          explanation:
            'Mutability plus an under-specified intent is the hijack recipe. Immutable flags protect the intent from modification, and a complete intent leaves nothing for a recipient to fill in — both halves matter.'
        }
      ],
      references: [
        {
          title: 'Android Developers — Broadcasts overview',
          url: 'https://developer.android.com/guide/components/broadcasts',
          note: 'Official broadcasts documentation including export-state rules.'
        },
        {
          title: 'Android Developers — PendingIntent reference',
          url: 'https://developer.android.com/reference/android/app/PendingIntent',
          note: 'Official reference including FLAG_IMMUTABLE guidance.'
        },
        {
          title: 'Android Developers — Android 12 behavior changes',
          url: 'https://developer.android.com/about/versions/12/behavior-changes-12',
          note: 'PendingIntent mutability requirement and exported declaration changes.'
        }
      ]
    },
    {
      id: 'm07-l05',
      moduleId: 'm07',
      title: 'Tapjacking and UI-Layer Threats',
      difficulty: 'Intermediate',
      minutes: 20,
      prerequisites: ['m07-l01'],
      objectives: [
        'Explain overlay tapjacking and the view-level defenses',
        'Verify screen-capture protection (FLAG_SECURE) behavior',
        'Assess clipboard and notification leakage channels',
        'Discuss accessibility-service abuse at concept level'
      ],
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'Not every platform attack needs an intent. The UI layer itself can lie: overlays can sit on top of your controls and swallow or redirect taps, the screen can be recorded while a user types a PIN, the clipboard can carry secrets, notifications can display them, and accessibility services — a blind user\u2019s eyes — can be abused as an automation superuser. This lesson treats each as a concept plus a minimal test you can run on a training harness.'
          }
        ],
        technical: [
          {
            type: 'h',
            text: 'Overlay tapjacking'
          },
          {
            type: 'p',
            text:
              'An app holding SYSTEM_ALERT_WINDOW can draw a window above the victim\u2019s UI. Depending on window flags, touch events are intercepted or passed through while the user believes they are tapping the victim. Views can detect the situation: MotionEvent carries FLAG_WINDOW_IS_OBSCURED and (API 29+) FLAG_WINDOW_IS_PARTIALLY_OBSCURED, and the per-view defense setFilterTouchesWhenObscured(true) makes a view refuse touches while obscured. Modern platform versions block some overlay scenarios by default — treat the attribute as defense-in-depth for genuinely sensitive controls such as confirm-payment or unlock buttons.'
          },
          {
            type: 'h',
            text: 'Capture, clipboard, notifications, accessibility'
          },
          {
            type: 'p',
            text:
              'FLAG_SECURE on a window prevents screenshots, screen recording, and the recents-thumbnail capture; screencap of such a window returns a black frame. The clipboard is a system-wide channel: since Android 10, background clipboard reads are restricted to the focused app or IME, but focused-app windows and keyboard paste histories still make it a leakage path for copied tokens. Notifications carry data to lock screens, where VISIBILITY_PRIVATE versus PUBLIC decides how much is shown. Accessibility services, finally, can read screen content and perform gestures — concept-level abuse means a malicious "helper" service harvests every field or taps every button on the user\u2019s behalf.'
          },
          {
            type: 'table',
            headers: ['Threat', 'Primary defense', 'Concept-level test'],
            rows: [
              ['Overlay tapjacking', 'setFilterTouchesWhenObscured(true); hide sensitive views when obscured', 'Minimal overlay harness over a training app control'],
              ['Screen capture', 'FLAG_SECURE on sensitive windows', 'adb shell screencap — expect a black frame'],
              ['Clipboard theft', 'Avoid clipboard for secrets; clear on blur', 'Copy a token; read it from a focused test activity'],
              ['Notification leakage', 'VISIBILITY_PRIVATE; no secrets in content text', 'Lock-screen inspection of the notification'],
              ['Accessibility abuse', 'Least privilege; block accessibility for sensitive flows', 'Concept discussion only in assessments']
            ]
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'These findings bridge web intuition (clickjacking) onto Android. They also carry a privacy dimension: capture and clipboard checks are quick wins in assessments of apps handling payments or credentials. In reports, separate demonstrated impact — your overlay harness proves tap misrouting on a training app — from theoretical risk, and keep accessibility abuse at concept level unless your authorization explicitly covers it.'
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Sensitive controls without filterTouchesWhenObscured and no obscuring detection in the touch pipeline',
              'PIN, password, or payment screens without FLAG_SECURE (verify via screencap)',
              'Secrets placed on the clipboard via ClipboardManager.setPrimaryClip',
              'Notifications containing OTPs, tokens, or balances with default visibility',
              'Apps requesting SYSTEM_ALERT_WINDOW without a clear, user-facing reason'
            ]
          }
        ],
        howToTest: [
          {
            type: 'callout',
            variant: 'legal',
            title: 'Harness permissions, own devices',
            text:
              'Overlay and capture tests require granting your own harness app permissions on a test device or emulator you own. Never attempt overlay or accessibility techniques against devices or apps outside your authorization.'
          },
          {
            type: 'terminal',
            title: 'Capture and overlay probes on a training harness',
            lines: [
              '$ adb shell screencap -p /sdcard/shot.png && adb pull /sdcard/shot.png',
              '# if the window sets FLAG_SECURE, the PNG is a black frame',
              '$ adb shell appops set com.overlay.harness SYSTEM_ALERT_WINDOW allow',
              '# launch the harness overlay, tap the target control, watch events:',
              '$ adb logcat | grep -i obscured'
            ]
          },
          {
            type: 'p',
            text:
              'For tapjacking proof, build a minimal overlay app (one transparent view) and demonstrate that taps land on your overlay while the user aims at the victim — on the training app only. For clipboard checks, copy a token inside the training app, then read the clipboard from your focused test activity. Negative tests matter too: a patched control with filterTouchesWhenObscured simply will not react while covered.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'A training exercise: the "confirm payment" button sits behind an overlay. The unpatched version transfers funds because the touch is delivered to the obscured control or swallowed by the overlay while the user\u2019s finger aims elsewhere. The patched version refuses the touch — MotionEvent reports the obscured flag and the handler logs and ignores it. Capture both behaviors as before/after evidence.'
          }
        ],
        tools: [
          {
            type: 'list',
            items: [
              'adb appops / screencap — permission and capture probes',
              'A self-written two-activity overlay harness (transparent view)',
              'JADX — search for FLAG_SECURE, filterTouchesWhenObscured, setPrimaryClip',
              'logcat — touch-event and obscuring traces'
            ]
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Confusing FLAG_SECURE (anti-capture) with input protection — it does nothing against tapjacking',
              'Testing tapjacking only with real-world malware PoCs; a minimal harness is sufficient evidence and far safer',
              'Ignoring partial obscuring — API 29+ added the partially-obscured flag for translucent overlays; check both flags',
              'Enabling accessibility experiments on personal or production devices — keep it conceptual and lab-only'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'On your emulator: (1) set FLAG_SECURE on your own demo app\u2019s PIN screen and verify screencap turns black; (2) build or reuse an overlay harness and target a training app\u2019s confirm button; (3) copy a token and observe which components can read it while focused versus backgrounded. Record each defense\u2019s behavior in a table.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
              'Overlay tapjacking is web clickjacking on Android; per-view filterTouchesWhenObscured is the targeted fix',
              'FLAG_SECURE prevents screenshots, recording, and recents thumbnails — its absence on PIN screens is a finding',
              'Clipboard and notifications leak by design unless apps actively minimize them',
              'Accessibility services are legitimate power tools with an abuse side — concept-level awareness, strict authorization in testing'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'm07-l05-q1',
          type: 'mcq',
          prompt: 'Which view-level API makes a control refuse touch events while an overlay covers it?',
          options: [
            'View.setSecure(true)',
            'setFilterTouchesWhenObscured(true)',
            'FLAG_NOT_TOUCHABLE',
            'setImportantForAccessibility(NO)'
          ],
          answerIndex: 1,
          hint: 'The name mentions "when obscured".',
          explanation:
            'setFilterTouchesWhenObscured(true) (or the XML attribute android:filterTouchesWhenObscured) drops touches delivered while the window is obscured. FLAG_SECURE prevents capture, not touch redirection.'
        },
        {
          id: 'm07-l05-q2',
          type: 'truefalse',
          prompt: 'FLAG_SECURE prevents the user from taking a screenshot of the window.',
          options: ['True', 'False'],
          answerIndex: 0,
          hint: 'What does screencap return for such windows?',
          explanation:
            'FLAG_SECURE marks the window content as secure: screenshots, screen recordings, and the recents overview thumbnail are blocked or black. It does not affect touch events — that is filterTouchesWhenObscured\u2019s job.'
        },
        {
          id: 'm07-l05-q3',
          type: 'short',
          prompt: 'Since Android 10, which apps can still read the clipboard without user interaction?',
          modelAnswer:
            'The app with input focus and the default IME (plus the system itself); background apps are blocked from reading clipboard data.',
          hint: 'Who is "in front" right now?',
          explanation:
            'Android 10 restricted background clipboard access, which blunted the old drive-by clipboard theft — but focused apps and keyboards still see clipboard content, so copied secrets remain a leakage channel.'
        },
        {
          id: 'm07-l05-q4',
          type: 'scenario',
          prompt:
            'During an authorized test of a training app you find its payment-confirmation button lacks filterTouchesWhenObscured. How do you demonstrate impact without deploying anything malware-like?',
          modelAnswer:
            'Build a minimal harness app on the same emulator: grant SYSTEM_ALERT_WINDOW to the harness via appops, draw a transparent overlay over the confirm button, and show taps being delivered to or intercepted by the overlay while the user intends the button. Capture screencap/logcat evidence from the training app only, and contrast with the patched behavior.',
          hint: 'Small harness, training target, clear before/after.',
          explanation:
            'A two-activity transparent-overlay harness demonstrates the mechanism cleanly. Evidence quality comes from the before/after contrast — the vulnerable control reacts, the patched control refuses while obscured.'
        }
      ],
      references: [
        {
          title: 'Android Developers — View reference (touch filtering)',
          url: 'https://developer.android.com/reference/android/view/View',
          note: 'Official documentation for filterTouchesWhenObscured and obscuring flags.'
        },
        {
          title: 'Android Developers — WindowManager.LayoutParams',
          url: 'https://developer.android.com/reference/android/view/WindowManager.LayoutParams',
          note: 'Official reference for window flags including FLAG_SECURE.'
        },
        {
          title: 'OWASP MASTG — Testing Platform Interaction',
          url: 'https://mas.owasp.org/MASTG/Android/0x05h-Testing-Platform-Interaction/',
          note: 'UI-layer and platform interaction testing methodology.'
        }
      ]
    },
    {
      id: 'm07-l06',
      moduleId: 'm07',
      title: 'Backup, Debuggable and Task Exploitation',
      difficulty: 'Intermediate',
      minutes: 25,
      prerequisites: ['m01-l06', 'm01-l08'],
      objectives: [
        'Test backup configuration and extract backup data on training targets',
        'Demonstrate debuggable-build compromise with run-as and debugger attach',
        'Explain taskAffinity/launchMode task-hijacking risks at concept level',
        'Spot exposed debug-only components in release builds'
      ],
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'Three manifest-level switches quietly redefine what "private data" means: android:allowBackup lets app data ride device backups, android:debuggable turns the app\u2019s sandbox into a shell-accessible folder, and taskAffinity/launchMode choices can strand an app\u2019s screens inside an attacker-controlled task. Each is a one-line finding with outsized impact, and each is testable in minutes on an authorized target.'
          }
        ],
        technical: [
          {
            type: 'h',
            text: 'Backup'
          },
          {
            type: 'p',
            text:
              'allowBackup="true" (the historic default) enrolls the app in Auto Backup: up to 25 MB of internal files, preferences, and databases go to cloud backup and device-transfer flows, governed by fullBackupContent (legacy) or dataExtractionRules (Android 12+). The adb backup tool was deprecated in Android 12 and returns nothing on many modern builds; the realistic tester paths are bmgr-based backup on an emulator with a backup transport, device-transfer simulation, and — always — reading the backup rules themselves. Test the rules and the live channels, not only the legacy tool.'
          },
          {
            type: 'h',
            text: 'Debuggable'
          },
          {
            type: 'p',
            text:
              'android:debuggable="true" is correct only for development builds; when a build misconfiguration ships it to production it enables run-as <package> for any shell user, JDWP debugger attachment, and trivial data extraction — every file under /data/data/<pkg> becomes readable. It converts every other "requires root" test into a one-line command, and on a release build it is a critical finding on its own.'
          },
          {
            type: 'h',
            text: 'Tasks and affinity'
          },
          {
            type: 'p',
            text:
              'Activities with a custom taskAffinity or non-standard launchMode can be manipulated by a malicious companion app that declares the same affinity: on some platform versions and flows, a victim activity is re-parented into the attacker\u2019s task, letting the attacker stack a phishing screen above a real one — the published StrandHogg research popularized this family. Modern Android versions added mitigations, so treat it as configuration review plus concept: note risky declarations, verify the mitigations on your test platform, and keep exploitability claims version-scoped. Debug builds often also ship extra exported debug components (leak screens, test drawers) that disappear only in properly configured releases.'
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'These are the classic quick wins: a debuggable release build is full compromise of local data and behavior; an over-broad backup configuration exports the storage findings of module 08 off the device; task-affinity risk is a phishing primitive. Each finding is fast to verify, high-signal, and maps to the MASTG code-quality/build-settings tests and MASVS-PLATFORM.'
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'android:allowBackup="true" with backup rules including prefs/databases holding tokens',
              'android:debuggable="true" in the merged manifest of the shipped release APK (check the artifact, not the repo)',
              'dataExtractionRules / fullBackupContent with cloud-backup or device-transfer inclusion of sensitive files',
              'Custom taskAffinity values, singleTask/singleInstance launch modes, allowTaskReparenting',
              'Debug-only exported activities/services/receivers left enabled in release builds'
            ]
          }
        ],
        howToTest: [
          {
            type: 'callout',
            variant: 'legal',
            title: 'Own devices, own builds',
            text:
              'Backup extraction, run-as access, and task manipulation are invasive techniques. Perform them only on training apps running on devices and emulators you own or are authorized to test.'
          },
          {
            type: 'terminal',
            title: 'Manifest switches on an authorized target',
            lines: [
              '$ adb shell dumpsys package com.example.trainingapp | grep -E "flags="',
              'flags=[ DEBUGGABLE ALLOW_BACKUP ... ]',
              '$ adb shell run-as com.example.trainingapp ls shared_prefs/',
              '$ adb shell run-as com.example.trainingapp cat shared_prefs/session.xml',
              '$ adb shell bmgr backupnow com.example.trainingapp',
              'Backup finished with result: Success',
              '$ adb shell dumpsys activity activities | grep -iE "affinity|TaskRecord"'
            ]
          },
          {
            type: 'p',
            text:
              'If bmgr returns data on your emulator (Google-apis images ship a backup transport), extract and inspect it, and document which files were captured against the app\u2019s backup rules. For debuggable: run-as alone proves the exposure; attach Android Studio\u2019s debugger to the process to show the full compromise path. For affinity: record the declarations and attempt a benign re-parenting demo on your own two-app harness, keeping the write-up at configuration-risk level unless your platform version lets you demonstrate the flow.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'The OWASP UnCrackable crackmes ship with protections designed to be defeated; DIVA-style training apps often ship intentionally debuggable. A canonical demonstration: run-as into the training app, cat the SharedPreferences holding the challenge secret, and read the answer without defeating any code-level protection. The finding text writes itself: "release build ships debuggable; full local data disclosure via run-as."'
          }
        ],
        tools: [
          {
            type: 'list',
            items: [
              'adb (run-as, bmgr, dumpsys) — the three probes in one tool',
              'Android Backup Extractor — unpack legacy .ab archives',
              'aapt2 dump badging / apkanalyzer — flags and manifest review of the artifact',
              'Android Studio debugger — JDWP attach on debuggable builds'
            ]
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Testing the source repo\u2019s manifest instead of the built release APK — flags are merged and can differ',
              'Assuming adb backup is dead and skipping backup review: cloud Auto Backup and device transfer are the live channels',
              'Reporting task affinity as proven exploitability without platform-version context; frame it as configuration risk with mitigations noted',
              'Ignoring internal/UAT builds in dev-leak assessments — debuggable test builds leak just as hard as production mistakes'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Take a training APK: (1) read its flags with aapt2 dump badging; (2) if DEBUGGABLE, run-as and dump every shared_prefs file; (3) rebuild with allowBackup=false (or stricter rules) and show the difference in bmgr output; (4) add a custom taskAffinity to a demo app and watch dumpsys activity activities report the task structure. That covers all three switches end to end.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
              'allowBackup, debuggable, and task affinity are manifest decisions with sandbox-wide consequences',
              'run-as on a debuggable release build is full local data disclosure — a critical, one-line finding',
              'Backup review means rules plus realistic channels (cloud, transfer), not just the deprecated adb backup',
              'Task hijacking is concept/config-level on modern Android: report risky declarations and verify mitigations'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'm07-l06-q1',
          type: 'mcq',
          prompt: 'What does android:debuggable="true" enable for an adb shell user on the same device?',
          options: [
            'Only logcat access',
            'run-as access to the app\u2019s private data and JDWP debugger attachment',
            'Root on the device',
            'Remote code execution over the network'
          ],
          answerIndex: 1,
          hint: 'It makes the app a debug target.',
          explanation:
            'Debuggable builds allow run-as <pkg> (execute shell as the app UID, reading its private data) and JDWP attachment (full runtime control). On a release build this is a critical misconfiguration.'
        },
        {
          id: 'm07-l06-q2',
          type: 'truefalse',
          prompt: 'Setting android:allowBackup="false" only affects the deprecated adb backup command.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'Auto Backup and device-to-device transfer also read the flag.',
          explanation:
            'allowBackup governs all backup and restore channels, including Auto Backup to cloud and device-transfer flows; false opts the app out. Fine-grained control uses dataExtractionRules (Android 12+) or legacy fullBackupContent.'
        },
        {
          id: 'm07-l06-q3',
          type: 'short',
          prompt: 'Name the two attributes that control backup content on Android 12+ and the legacy counterpart.',
          modelAnswer:
            'dataExtractionRules (Android 12+; covers cloud backup and device transfer) and fullBackupContent (legacy adb backup and key/value backup flows). Both are declared on <application> and reference XML rule files.',
          hint: 'One is new, one is legacy; both live on <application>.',
          explanation:
            'Reviewing only the legacy attribute misses the modern channels. A complete backup review checks both rule files against the data inventory from the storage sweep.'
        },
        {
          id: 'm07-l06-q4',
          type: 'scenario',
          prompt:
            'A training app is debuggable. List three distinct things you can demonstrate in under five minutes using adb alone.',
          modelAnswer:
            'run-as com.example.app cat of any private file (data disclosure); run-as edits of the app\u2019s prefs or database (state manipulation); and pulling the APK plus cached artifacts for further static analysis. With more tooling, JDWP attach adds full runtime control.',
          hint: 'Data read, data write, and deeper analysis all unlock.',
          explanation:
            'Debuggable removes the main friction of dynamic analysis: everything a rooted-device threat model assumes becomes available with plain adb commands, which is exactly why the flag on a release build is critical.'
        }
      ],
      references: [
        {
          title: 'Android Developers — Data backup overview',
          url: 'https://developer.android.com/guide/topics/data/autobackup',
          note: 'Official Auto Backup and rules documentation.'
        },
        {
          title: 'Android Developers — Manifest: application element',
          url: 'https://developer.android.com/guide/topics/manifest/application-element',
          note: 'Official reference for allowBackup and debuggable attributes.'
        },
        {
          title: 'Android Developers — Tasks and the back stack',
          url: 'https://developer.android.com/guide/components/activities/tasks-and-back-stack',
          note: 'Official taskAffinity and launchMode documentation.'
        },
        {
          title: 'OWASP MASTG — Testing Code Quality and Build Settings',
          url: 'https://mas.owasp.org/MASTG/Android/0x05i-Testing-Code-Quality-and-Build-Settings/',
          note: 'Covers debuggable and backup configuration tests.'
        }
      ]
    }
  ]
};
