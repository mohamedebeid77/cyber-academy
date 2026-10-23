import type { Module } from '../../types';

// LEVEL 5 — NETWORK · Module 06: Network Security
// Original curriculum content synthesized from public official documentation:
// developer.android.com, OWASP MASTG, and PortSwigger Burp Suite documentation.
// All prose is original; reference links point to the official sources used for study.

export const m06: Module = {
  id: 'm06',
  title: 'Network Security',
  level: 5,
  description:
    'How Android apps talk to backends, why TLS trust makes interception hard by default, how the Network Security Configuration changes the rules, and how a full interception session runs end to end — closing with certificate pinning: what it is, where it lives, and how to assess its configuration.',
  outcomes: [
    'Explain how Android apps make HTTP(S) calls and why default TLS trust blocks naive man-in-the-middle interception',
    'Read an app\u2019s network_security_config.xml and state its exact trust policy as one sentence',
    'Run a complete interception session on a training app: proxy, trusted CA, capture, endpoint inventory',
    'Recognize certificate pinning in code and in traffic behavior, and assess its coverage and configuration'
  ],
  lessons: [
    {
      id: 'm06-l01',
      moduleId: 'm06',
      title: 'HTTP, TLS and Trust on Android',
      difficulty: 'Beginner',
      minutes: 25,
      prerequisites: ['m02-l04', 'm05-l02'],
      objectives: [
        'Describe how Android apps make network calls (HttpURLConnection, OkHttp) and where TLS is decided',
        'Walk through the TLS handshake and what certificate validation proves',
        'Explain the system and user CA trust stores and why man-in-the-middle interception normally fails'
      ],
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'Almost every Android app is a front end for a remote service: logins, feeds, payments, sync. All of that happens over HTTP, almost always wrapped in TLS. Before you can intercept or assess any of it, you need to know what the platform does by default — because Android is deliberately engineered to stop a stranger on the network (including you) from reading or modifying app traffic.'
          },
          {
            type: 'p',
            text:
              'The core concept is the trust store: the set of certificate authorities (CAs) an app will accept when a server presents its certificate during the TLS handshake. If your proxy cannot present a certificate the app trusts, interception fails — and understanding exactly why is what separates a controlled test setup from mysterious SSL errors.'
          }
        ],
        technical: [
          {
            type: 'h',
            text: 'Making HTTP calls on Android'
          },
          {
            type: 'p',
            text:
              'The platform ships HttpURLConnection; in practice most apps use OkHttp (directly or via Retrofit) for its cleaner API and connection pooling. The libraries differ in ergonomics but funnel into the same platform TLS stack (Conscrypt wrapping BoringSSL), so trust behavior is decided by the platform and the app\u2019s configuration — not by the HTTP library.'
          },
          {
            type: 'code',
            lang: 'java',
            title: 'The de-facto pattern you will see in decompiled code',
            code:
              'OkHttpClient client = new OkHttpClient.Builder().build();\nRequest req = new Request.Builder()\n    .url("https://api.example.org/v1/session")\n    .header("Authorization", "Bearer " + token)\n    .build();\nResponse res = client.newCall(req).execute();'
          },
          {
            type: 'h',
            text: 'The TLS handshake in thirty seconds'
          },
          {
            type: 'p',
            text:
              'During the handshake, client and server agree on cipher suites, the server presents a certificate chain, and the client validates it: the chain must terminate in a trusted root CA, the certificate\u2019s hostname must match the requested host (the SAN entries), and the certificate must be within its validity window. Only then do both sides derive session keys and HTTP begins. Every one of those validation steps is a place where misconfiguration — or deliberate weakening — shows up.'
          },
          {
            type: 'h',
            text: 'Android trust stores'
          },
          {
            type: 'table',
            headers: ['Store', 'Where it lives', 'Who trusts it by default'],
            rows: [
              ['System CAs', '/system/etc/security/cacerts', 'Every app — the platform baseline maintained with the OS image'],
              ['User CAs', '/data/misc/user/0/cacerts-added', 'Only apps targeting SDK < 24; since Android 7, targetSdk 24+ apps ignore user CAs unless configured otherwise'],
              ['App-bundled CAs', 'res/raw or assets, wired up via the Network Security Configuration or custom code', 'Only the app that ships and trusts them — the basis for private PKIs and pinning']
            ]
          },
          {
            type: 'p',
            text:
              'Why man-in-the-middle normally fails: your proxy (Burp, mitmproxy) generates a certificate signed by its own CA. That CA is not in the app\u2019s trust set — a targetSdk 24+ app does not trust user-installed CAs by default — so chain validation fails and the app sees an SSLHandshakeException. Nothing is broken; the default is working exactly as designed.'
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'Network interception is the highest-yield dynamic technique in mobile testing: it exposes endpoints, authentication tokens, ID parameters, and what the backend actually does with your input. But every serious assessment starts with a TLS failure inside the app — and reading that failure correctly (CA not trusted? pinning? cleartext blocked?) is the diagnostic skill this module builds.'
          },
          {
            type: 'list',
            items: [
              'Knowing the trust model tells you which setup step is missing when interception fails',
              'Recognizing when an app is harder to intercept than the platform default is itself a reportable positive-security observation',
              'Weak trust configurations — user CAs trusted in release builds, cleartext permitted — are concrete, reportable weaknesses'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'targetSdkVersion — 24 or higher means user-installed CAs are ignored by default',
              'android:networkSecurityConfig in the manifest and the XML it points to (next lesson)',
              'android:usesCleartextTraffic="true", or no NSC on targetSdk < 28 apps (cleartext allowed by default below 28)',
              'Bundled certificates (.pem, .crt, .der) in res/raw or assets — private PKI or pinning material',
              'Custom TrustManager / HostnameVerifier implementations in decompiled code, especially ones that return true unconditionally'
            ]
          }
        ],
        howToTest: [
          {
            type: 'callout',
            variant: 'legal',
            title: 'Authorized targets only',
            text:
              'Setting up proxies and installing CAs is preparation for active testing. Restrict all of it to apps you own, training apps, or engagements where you have written authorization.'
          },
          {
            type: 'p',
            text:
              'You can inspect the platform side of the trust model from any shell, before touching the app at all:'
          },
          {
            type: 'terminal',
            title: 'Inspecting trust stores on a device',
            lines: [
              '$ adb shell ls /system/etc/security/cacerts | wc -l',
              '142',
              '$ adb shell ls /data/misc/user/0/cacerts-added',
              '(empty by default — no user CAs installed)',
              '$ adb shell dumpsys package com.example.app | grep -E "targetSdk|versionName"',
              '    targetSdk=33',
              '    versionName=1.4.2'
            ]
          },
          {
            type: 'p',
            text:
              'Then read the app: in decompiled sources (module 04), find every URL construction and every place TLS behavior is customized. The combination of target SDK, NSC file, and custom TLS code gives you the app\u2019s real trust policy.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'Point a training app at a proxy before installing any CA: the app refuses to load its feed and logcat shows an SSLHandshakeException mentioning an untrusted chain. That failure is the lesson — the app validated the proxy\u2019s certificate against its trust store and correctly rejected it. Over the next two lessons you will learn the legitimate ways to change that outcome for an authorized test: a configuration that trusts user CAs, a debug-overrides setup, or a system-level CA on a test image.'
          },
          {
            type: 'callout',
            variant: 'note',
            title: 'Not every TLS failure is missing trust',
            text:
              'There is a third possibility: certificate pinning, where the app rejects any certificate that does not match embedded keys. It is covered at the end of this module.'
          }
        ],
        tools: [
          {
            type: 'table',
            headers: ['Tool', 'Why it matters here'],
            rows: [
              ['Burp Suite', 'The standard interception proxy; generates the CA your device must trust'],
              ['mitmproxy', 'Scriptable CLI/Web proxy, great for automation and replay'],
              ['openssl', 'Inspect server certificates and compute the digests pinning relies on'],
              ['adb', 'Configure device proxies, push certificates, tunnel ports']
            ]
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Installing a CA as a "user CA" and expecting modern apps to trust it — targetSdk 24+ apps do not by default',
              'Reading an SSLHandshakeException as "the app is broken" — it usually means the trust model is working',
              'Conflating chain validation with hostname verification; an app can get one right and the other wrong',
              'Assuming the HTTP library decides trust — OkHttp, HttpURLConnection and Volley all end up in the same platform trust decision unless custom TLS code overrides it'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'On your emulator: run the ls commands above, note the empty user-CA directory, then install any CA through Settings > Security > Encryption & credentials > Install a certificate and confirm the file appears in cacerts-added. Finally, try a training app with and without a proxy — you are building the mental model that lessons l02 and l03 will operationalize.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
              'Apps call HTTP(S) via HttpURLConnection/OkHttp; TLS is validated by the platform stack',
              'Handshake validation = trusted chain + hostname match + validity; any failure means no HTTP',
              'System CAs are trusted by everyone; user CAs are not trusted by targetSdk 24+ apps by default',
              'Interception failures are diagnostic information, not noise'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'm06-l01-q1',
          type: 'mcq',
          prompt: 'Which certificate store do apps targeting SDK 24+ trust by default?',
          options: [
            'System CAs only',
            'System and user CAs',
            'User CAs only',
            'Whatever CAs the app bundles'
          ],
          answerIndex: 0,
          hint: 'A security change landed in Android 7.0 specifically about user CAs.',
          explanation:
            'Since Android 7.0 (targetSdk 24+), apps trust only the system CAs by default. Trusting user CAs or bundling CAs now requires an explicit Network Security Configuration or custom code.'
        },
        {
          id: 'm06-l01-q2',
          type: 'truefalse',
          prompt:
            'An app making calls through OkHttp validates TLS differently than one using HttpURLConnection.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'Both end up in the same platform TLS stack.',
          explanation:
            'Libraries may customize sockets, but by default they all delegate to the platform TLS implementation (Conscrypt/BoringSSL), so the trust-store decision is identical unless the app overrides it with custom TLS code.'
        },
        {
          id: 'm06-l01-q3',
          type: 'short',
          prompt: 'Name three checks a TLS client performs when validating a server certificate.',
          modelAnswer:
            'That the chain terminates in a trusted root CA, that the certificate\u2019s hostname matches the requested host (SAN), and that the certificate is within its validity period (and ideally not revoked).',
          hint: 'Who signed it, who is it for, until when.',
          explanation:
            'These three checks are the baseline. Pinning adds a fourth: the presented key must also match an embedded digest, which the last lesson of this module covers.'
        },
        {
          id: 'm06-l01-q4',
          type: 'scenario',
          prompt:
            'During an authorized test you proxy a training app and every request fails with a certificate error. Give two distinct technical explanations and one way to distinguish them.',
          modelAnswer:
            'Explanation 1: missing trust — the proxy CA is not in the app\u2019s trust store (for example it was installed only as a user CA for a targetSdk 24+ app). Explanation 2: certificate pinning — the app rejects any certificate not matching embedded pins. Distinguish statically by decoding the APK and checking for a Network Security Configuration pin-set or CertificatePinner usage; dynamically, if some hosts work and only specific domains fail, domain-scoped pinning is likely.',
          hint: 'One explanation is a configuration gap, the other is a deliberate defense.',
          explanation:
            'TLS failure triage is the first skill of network testing: trust misconfiguration is fixable setup; pinning is a defense you must recognize and assess. Both readings of the same symptom matter.'
        }
      ],
      references: [
        {
          title: 'Android Developers — Network Security Configuration',
          url: 'https://developer.android.com/training/articles/security-config',
          note: 'The official reference for trust anchors, cleartext and pin-sets — used throughout this module.'
        },
        {
          title: 'Android Developers — Security with HTTPS and SSL',
          url: 'https://developer.android.com/training/articles/security-ssl',
          note: 'Official background on TLS usage and validation on Android.'
        },
        {
          title: 'OWASP MASTG',
          url: 'https://mas.owasp.org/MASTG/',
          note: 'The testing guide whose network chapters this module follows conceptually.'
        },
        {
          title: 'PortSwigger — Burp Suite',
          url: 'https://portswigger.net/burp',
          note: 'Official Burp Suite product documentation portal.'
        }
      ]
    },
    {
      id: 'm06-l02',
      moduleId: 'm06',
      title: 'Network Security Configuration',
      difficulty: 'Intermediate',
      minutes: 20,
      prerequisites: ['m06-l01'],
      objectives: [
        'Read network_security_config.xml: base-config, domain-config, trust anchors, debug-overrides',
        'Explain usesCleartextTraffic and how the NSC interacts with platform defaults per targetSdk',
        'Derive an app\u2019s exact trust policy from its APK before running anything'
      ],
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'Every decision from the previous lesson — which CAs to trust, whether cleartext is allowed — is controlled by a single XML file an app may ship: network_security_config.xml. Reading it is the fastest way to know an app\u2019s network trust policy before you even install it. This lesson teaches you to parse it line by line and to recognize both permissive and hardened configurations on sight.'
          },
          {
            type: 'p',
            text:
              'It is also a file you will eventually write yourself: debug-overrides exists precisely so developers (and authorized testers, on debug builds) can add a trusted proxy CA without weakening the release configuration.'
          }
        ],
        technical: [
          {
            type: 'p',
            text:
              'The file lives under res/xml/ and is referenced from the manifest with android:networkSecurityConfig="@xml/network_security_config". Defaults depend on targetSdk: below 24, apps trust system plus user CAs and allow cleartext; from 24, user CAs are dropped; from 28, cleartext is disallowed. The NSC file overrides those defaults per app and per domain.'
          },
          {
            type: 'code',
            lang: 'xml',
            title: 'A deliberately permissive configuration (training-app style)',
            code:
              '<?xml version="1.0" encoding="utf-8"?>\n<network-security-config>\n    <base-config cleartextTrafficPermitted="true">\n        <trust-anchors>\n            <certificates src="system" />\n            <certificates src="user" />\n        </trust-anchors>\n    </base-config>\n</network-security-config>'
          },
          {
            type: 'p',
            text:
              'base-config applies to everything the app connects to unless a domain-config overrides it. domain-config scopes trust and cleartext policy to specific domains (and their subdomains via includeSubdomains). trust-anchors selects which sources count: the system store, the user store, or certificates bundled with the app (src="@raw/cert"). debug-overrides adds extra trust anchors only when android:debuggable="true" — the release build is untouched. A pin-set declares pinned keys; it gets its own lesson (l04).'
          },
          {
            type: 'compare',
            title: 'Permissive vs hardened base configuration',
            beforeTitle: 'Permissive (trusts user CAs, cleartext allowed)',
            beforeCode:
              '<base-config cleartextTrafficPermitted="true">\n  <trust-anchors>\n    <certificates src="system" />\n    <certificates src="user" />\n  </trust-anchors>\n</base-config>',
            afterTitle: 'Hardened (system anchors only, TLS enforced)',
            afterCode:
              '<base-config cleartextTrafficPermitted="false">\n  <trust-anchors>\n    <certificates src="system" />\n  </trust-anchors>\n</base-config>'
          },
          {
            type: 'table',
            headers: ['Element / attribute', 'Meaning', 'Assessment note'],
            rows: [
              ['base-config', 'Default policy for all connections', 'Weakened anchors here affect every host'],
              ['domain-config', 'Per-domain policy override', 'Check which sensitive domains received relaxed rules'],
              ['trust-anchors / certificates', 'Which CA sources are trusted', 'src="user" outside debug-overrides in a release build is a finding candidate'],
              ['debug-overrides', 'Extra anchors for debuggable builds only', 'Legitimate testing hook; verify release builds do not depend on it'],
              ['pin-set', 'Pinned keys per domain', 'The pinning mechanism — detailed in l04'],
              ['usesCleartextTraffic (manifest)', 'Global cleartext switch', 'Superseded when an NSC exists — the NSC carries the real policy']
            ]
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'NSC is where configuration findings hide in plain sight: a release build trusting user CAs means anyone who can install a certificate on the device can intercept the app; cleartextTrafficPermitted="true" on a domain carrying credentials means the session can be read or manipulated on-path. Reading the file first also saves hours of proxy debugging — you can predict whether interception will work before you start.'
          },
          {
            type: 'list',
            items: [
              'Predict interception feasibility from static files alone',
              'Distinguish developer-intended testing hooks (debug-overrides) from release weaknesses',
              'Justify findings with the exact XML line — excellent report evidence'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'No NSC plus targetSdk < 28: cleartext allowed app-wide by platform default',
              'trust-anchors with src="user" outside debug-overrides in a release build',
              'cleartextTrafficPermitted="true" on domains handling credentials or tokens',
              'domain-config entries for third-party analytics or CDNs with weaker trust than the API — inconsistent policy',
              'debug-overrides listing a CA that is also trusted in release (copy-paste mistakes)'
            ]
          }
        ],
        howToTest: [
          {
            type: 'p',
            text: 'Decode and read — no device needed:'
          },
          {
            type: 'terminal',
            title: 'Extracting the network policy from an APK',
            lines: [
              '$ apktool d target.apk -o target_out',
              '$ grep -n "networkSecurityConfig\\|usesCleartextTraffic" target_out/AndroidManifest.xml',
              '36:        android:networkSecurityConfig="@xml/network_security_config"',
              '$ cat target_out/res/xml/network_security_config.xml'
            ]
          },
          {
            type: 'p',
            text:
              'Write the policy down as one sentence: "This app trusts system and user CAs for all hosts and permits cleartext to cdn.example.net." If you cannot produce that sentence, you have not finished reading the configuration. Then verify the sentence dynamically in l03.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'A training app ships base-config with both system and user anchors. You install the proxy CA as a user CA, set the proxy, and interception works on the first try — predicted correctly from the XML before launch. A second training app has no NSC and targetSdk 30: it rejects the user CA exactly as the platform default predicts. Two minutes of static reading replaced an hour of trial and error.'
          },
          {
            type: 'callout',
            variant: 'tip',
            title: 'The one-sentence rule',
            text:
              'State the app\u2019s trust policy as a sentence before testing. The sentence is also the baseline you compare against when behavior surprises you.'
          }
        ],
        tools: [
          {
            type: 'list',
            items: [
              'apktool — decode the APK to readable XML',
              'aapt2 dump xmltree — inspect manifest and resources without a full decode',
              'JADX — read the NSC and any code that touches TLS side by side',
              'MobSF — automated static report that surfaces NSC and cleartext flags'
            ]
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Assuming the NSC governs every networking path: custom TrustManagers and some cross-platform TLS stacks bypass it',
              'Flagging debug-overrides as a release weakness: it only applies when android:debuggable="true"',
              'Ignoring precedence: an NSC present in the APK supersedes the android:usesCleartextTraffic attribute',
              'Reading only base-config and missing a permissive domain-config entry — or the reverse'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Decode three training apps (or your own builds), write each trust policy as one sentence, and predict whether a user-CA proxy will intercept each. Then check your predictions on the emulator. Keep the sentences — they become the network-configuration section of your test notes.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
              'network_security_config.xml is the app\u2019s trust policy: base-config default, domain-config overrides',
              'Platform defaults: user CAs dropped at targetSdk 24, cleartext off at 28 — the NSC can weaken or harden either',
              'debug-overrides are a testing hook for debuggable builds only',
              'Read the config first: it predicts exactly what interception will and will not do'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'm06-l02-q1',
          type: 'mcq',
          prompt:
            'An NSC declares a domain-config for api.example.org that trusts user CAs, while base-config trusts system only. What does the app do for api.example.org?',
          options: [
            'Uses base-config; domain-config only registers domains, it does not override policy',
            'Trusts user CAs for api.example.org, system-only everywhere else',
            'Fails to install because the anchors conflict',
            'Trusts user CAs for all hosts'
          ],
          answerIndex: 1,
          hint: 'The name says config-per-domain.',
          explanation:
            'domain-config overrides base-config for the matched domain (and subdomains when includeSubdomains is set). Every other host keeps the base policy.'
        },
        {
          id: 'm06-l02-q2',
          type: 'truefalse',
          prompt: 'debug-overrides trust anchors are active in release builds if no pin-set is declared.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'Read the name: debug-overrides.',
          explanation:
            'debug-overrides applies only when android:debuggable="true". Release builds ignore it entirely — which is exactly what makes it a safe testing hook.'
        },
        {
          id: 'm06-l02-q3',
          type: 'short',
          prompt:
            'Your target app targets SDK 30 and ships no NSC at all. Will it trust a user-installed CA? Will it send cleartext HTTP?',
          modelAnswer:
            'It will not trust the user CA (targetSdk 24+ default) and it will not send cleartext (targetSdk 28+ default). Both behaviors would require an explicit NSC to change.',
          hint: 'Two threshold SDK versions: 24 and 28.',
          explanation:
            'Defaults below 24: system plus user anchors, cleartext allowed. From 24: user CAs dropped. From 28: cleartext forbidden. No NSC means you get the defaults for the declared targetSdk.'
        },
        {
          id: 'm06-l02-q4',
          type: 'scenario',
          prompt:
            'A release app\u2019s NSC has base-config with cleartextTrafficPermitted="true" and user anchors, while one domain-config for pay.example.org is hardened. Draft the finding lines.',
          modelAnswer:
            'Finding 1: the release build trusts user-installed CAs globally, enabling interception after a local certificate install (remove src="user" from base-config). Finding 2: cleartext is permitted globally, allowing downgrade and reading of traffic to non-hardened hosts (set cleartextTrafficPermitted="false"). Note the hardened pay.example.org entry: it shows the team knows the mechanism, which makes the weakened base-config a clear inconsistency rather than an accident.',
          hint: 'Two weaknesses plus one inconsistency worth mentioning.',
          explanation:
            'Strong findings quote the XML, describe the attack path (local user CA install), and propose the minimal fix. The hardened domain proves intent — it sharpens the base-config finding rather than excusing it.'
        }
      ],
      references: [
        {
          title: 'Android Developers — Network Security Configuration',
          url: 'https://developer.android.com/training/articles/security-config',
          note: 'Official reference: base-config, domain-config, debug-overrides, pin-set.'
        },
        {
          title: 'Android Developers — App manifest: application element',
          url: 'https://developer.android.com/guide/topics/manifest/application-element',
          note: 'Where android:networkSecurityConfig and usesCleartextTraffic are declared.'
        },
        {
          title: 'OWASP MASTG',
          url: 'https://mas.owasp.org/MASTG/',
          note: 'Network communication testing leans on this configuration mechanism on both platforms.'
        },
        {
          title: 'OWASP MASVS',
          url: 'https://mas.owasp.org/MASVS/',
          note: 'The MASVS-NETWORK controls define what a hardened configuration should look like.'
        }
      ]
    },
    {
      id: 'm06-l03',
      moduleId: 'm06',
      title: 'Intercepting App Traffic',
      difficulty: 'Intermediate',
      minutes: 30,
      prerequisites: ['m06-l01', 'm06-l02'],
      objectives: [
        'Set up a device proxy and route app traffic through an interception proxy',
        'Choose and apply the correct CA-installation route for a given app policy',
        'Build an endpoint inventory from captured traffic and explain what breaks and why'
      ],
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'This lesson is the full loop you will repeat on every engagement: point a device at a proxy, give the app a reason to trust that proxy, capture the traffic, and turn raw requests into test hypotheses. We run it end to end on a training app so every step — including the failures — happens on a target you are allowed to break.'
          },
          {
            type: 'p',
            text:
              'By the end you will be able to name every endpoint the app talks to, identify where tokens live, and explain why a given app does or does not cooperate with the setup.'
          }
        ],
        technical: [
          {
            type: 'h',
            text: 'The interception chain'
          },
          {
            type: 'p',
            text:
              'The device sends traffic to a listener on your workstation (the proxy); the proxy terminates TLS, logs the request and lets you modify it, then opens a second TLS connection to the real server. The app only cooperates if it trusts the proxy\u2019s CA — which is why the previous two lessons came first. On an emulator, the host is reachable at 10.0.2.2; on a physical device, use your workstation\u2019s LAN IP and the Wi-Fi proxy settings.'
          },
          {
            type: 'terminal',
            title: 'Route the emulator through the proxy',
            lines: [
              '$ adb shell settings put global http_proxy 10.0.2.2:8080',
              '$ adb shell settings get global http_proxy',
              '10.0.2.2:8080',
              '$ # ... do the testing ...',
              '$ adb shell settings delete global http_proxy   # always clean up'
            ]
          },
          {
            type: 'h',
            text: 'Give the app a trusted CA'
          },
          {
            type: 'p',
            text:
              'Three legitimate routes, chosen by what l02 told you: (1) if the app trusts user CAs, install the proxy CA via Settings as a user certificate; (2) if it trusts only system CAs but runs on your own test image, mount the CA into the system store on a rooted emulator; (3) if the app ships debug-overrides, use a debug build. The terminal shows the system-store route, which works for every non-pinned app on a test image:'
          },
          {
            type: 'terminal',
            title: 'Installing the proxy CA into the system store (test image only)',
            lines: [
              '$ # Export the proxy CA (Proxy > Options > Import/export CA certificate, DER format)',
              '$ openssl x509 -inform DER -in burp_ca.der -out burp_ca.pem',
              '$ openssl x509 -inform PEM -subject_hash_old -in burp_ca.pem | head -1',
              '9a5ba575',
              '$ cp burp_ca.pem 9a5ba575.0',
              '$ adb root && adb remount   # userdebug emulator image',
              '$ adb push 9a5ba575.0 /system/etc/security/cacerts/',
              '$ adb shell chmod 644 /system/etc/security/cacerts/9a5ba575.0'
            ]
          },
          {
            type: 'h',
            text: 'Reading what you captured — and what breaks'
          },
          {
            type: 'p',
            text:
              'Open Proxy > HTTP history and walk the app\u2019s real behavior: which host boots the app, which call authenticates, which calls carry the token, and which parameters look like IDs the backend trusts. For each request of interest, record the method, path, notable headers (Authorization, Cookie, custom version or signature headers), and body shape. This inventory is the raw input for authorization, injection, and business-logic testing in later modules. Expect four typical failure patterns:'
          },
          {
            type: 'list',
            items: [
              'All hosts fail TLS: the CA is not trusted at all (not installed, or installed in the wrong store) — fix the setup',
              'Only specific domains fail: likely per-domain pinning — recognized and assessed in l04',
              'The app works but no entries appear: it may use its own socket path, another port, or pinning that resets connections',
              'Cleartext complaints in logcat: the app wants http:// but the NSC forbids it — note the endpoint, it is a finding hint'
            ]
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'With capture working, every later technique has raw material: replay a request with someone else\u2019s user ID (authorization testing), inject payloads into parameters (input validation), or simply document that the mobile API is fully visible and modifiable on the wire. Equally important is noting what you did NOT see: apps that refuse to be intercepted are telling you about their defenses, and that belongs in the report too.'
          },
          {
            type: 'callout',
            variant: 'legal',
            title: 'Active testing of a live backend',
            text:
              'Interception captures real requests and responses — tokens, PII, session data. Do it only against training apps, your own services, or in-scope targets with written authorization, and handle captured data per the engagement rules.'
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Authentication flow: where the token is issued and where it is attached afterwards',
              'ID-shaped parameters (user_id, account, order) that indicate IDOR potential',
              'Sensitive data in unexpected places: request bodies, query strings, verbose error responses',
              'Headers that gate behavior: X-Debug, X-Version, signature or MAC headers',
              'Hidden or unreferenced endpoints revealed by walking every screen of the app'
            ]
          }
        ],
        howToTest: [
          {
            type: 'terminal',
            title: 'A disciplined capture session',
            lines: [
              '$ adb logcat -c',
              '$ # Launch the training app, log in, open each screen once',
              '$ # In the proxy: review HTTP history, send interesting requests to Repeater',
              '$ adb shell dumpsys package com.example.app | grep targetSdk   # sanity-check your policy notes'
            ]
          },
          {
            type: 'p',
            text:
              'Work one screen at a time and annotate the history: after ten minutes you should have a table of endpoint, purpose, parameters, and authentication. Re-running a request in Repeater with one changed parameter is your first dynamic test — a changed response tells you the backend trusts client-controlled input.'
          },
          {
            type: 'callout',
            variant: 'tip',
            title: 'Save evidence immediately',
            text:
              'Export or save interesting request/response pairs into your evidence folder as you go. History buffers are not a reliable long-term evidence store.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'On a training app, the login call POST /api/v1/login returns a JSON body with a token and role. Replaying it with a modified role field changes nothing (the backend derives roles itself — good). Changing /api/v1/users/42/history to /api/v1/users/43/history with the same token returns another user\u2019s records (IDOR). One interception session, one finding, and a clean request/response pair as evidence.'
          }
        ],
        tools: [
          {
            type: 'table',
            headers: ['Tool', 'Role'],
            rows: [
              ['Burp Suite', 'Interception, history, Repeater — the daily workhorse'],
              ['mitmproxy', 'Scriptable alternative; flows saved as files for regression'],
              ['adb', 'Proxy configuration, port tunnels, logcat correlation'],
              ['Wireshark', 'Passive capture when you also need non-HTTP protocols']
            ]
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Leaving the global proxy set after testing — the emulator loses connectivity and the next session starts confused',
              'Installing the CA as a user CA for a targetSdk 24+ app and concluding "pinning" when it is just the platform default',
              'Capturing everything without annotation — an unorganized history is not evidence',
              'Ignoring responses: error bodies frequently leak stack traces, SQL fragments and internal IDs'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Full loop on a training app: set the proxy, choose the correct CA route based on your l02 notes, capture login plus two features, produce the endpoint table, and replay one request with a modified parameter. Write down every point where the app did not cooperate and your hypothesis why — bring those hypotheses to l04.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
              'Proxy chain: the app trusts the proxy CA, the proxy terminates TLS, then forwards to the real server',
              'The CA route depends on the app\u2019s policy: user anchors, system store on a test image, or debug-overrides',
              'An annotated history is an endpoint inventory — the input for every later module',
              'Clean up global proxy settings, and record what refused to be intercepted'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'm06-l03-q1',
          type: 'mcq',
          prompt:
            'On an emulator, which address reaches a service on your host machine, such as a proxy listening on 127.0.0.1:8080?',
          options: [
            '10.0.2.2',
            '127.0.0.1 on the device',
            '192.168.0.1',
            'The emulator cannot reach the host'
          ],
          answerIndex: 0,
          hint: 'The emulator reserves special addresses for host mapping.',
          explanation:
            '10.0.2.2 is the alias for the host loopback from inside an Android emulator. The device\u2019s own 127.0.0.1 refers to the device itself.'
        },
        {
          id: 'm06-l03-q2',
          type: 'truefalse',
          prompt:
            'If one app\u2019s HTTP history stays empty while other apps capture fine, certificate pinning is the only possible explanation.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'What else could bypass your proxy entirely?',
          explanation:
            'Non-HTTP protocols, custom socket/DNS behavior, a different proxy port, or policy effects can all hide traffic. Pinning usually manifests as TLS failures, not silence. Verify before concluding.'
        },
        {
          id: 'm06-l03-q3',
          type: 'short',
          prompt:
            'Name the three legitimate routes for making a proxied app trust your CA, and when each applies.',
          modelAnswer:
            'User-CA install when the app\u2019s policy trusts user anchors; system-store install on a rooted test image when it trusts only system anchors; debug-overrides via a debuggable build when the app ships them.',
          hint: 'Map each route to a trust-anchor source from l02.',
          explanation:
            'Choosing the route from the static policy instead of trial and error is the mark of an organized tester — and it keeps release builds untouched.'
        },
        {
          id: 'm06-l03-q4',
          type: 'scenario',
          prompt:
            'After a capture session you hold POST /api/v1/login (returns a token) and GET /api/v1/users/<id>/history (authenticated by that token). List three concrete next tests and what result would be a finding.',
          modelAnswer:
            '(1) Authorization: replay the history call with a different <id> using the same token — records returned for another user is an IDOR finding. (2) Input validation: inject payloads into <id> and query parameters — unusual errors or behavior indicate injection surface. (3) Session handling: replay after logout or let the token age — acceptance of a dead token is a session-management finding.',
          hint: 'Think who, what input, and what lifetime.',
          explanation:
            'Capture is the beginning: every token and parameter becomes a test hypothesis. Authorization, input handling, and session lifetime are formalized in later modules.'
        }
      ],
      references: [
        {
          title: 'Android Developers — Network Security Configuration',
          url: 'https://developer.android.com/training/articles/security-config',
          note: 'Reference for the policy decisions you exploited during setup.'
        },
        {
          title: 'PortSwigger — Burp Suite',
          url: 'https://portswigger.net/burp',
          note: 'Official documentation for Proxy, HTTP history and Repeater.'
        },
        {
          title: 'mitmproxy',
          url: 'https://mitmproxy.org/',
          note: 'Official site and documentation for the scriptable proxy alternative.'
        },
        {
          title: 'OWASP MASTG',
          url: 'https://mas.owasp.org/MASTG/',
          note: 'The network interception chapters mirror this workflow on both platforms.'
        }
      ]
    },
    {
      id: 'm06-l04',
      moduleId: 'm06',
      title: 'Certificate Pinning and Validation Testing',
      difficulty: 'Intermediate',
      minutes: 25,
      prerequisites: ['m06-l01', 'm06-l03'],
      objectives: [
        'Explain what certificate pinning is and which threat it mitigates',
        'Recognize pinned apps during interception and locate pinning in code and configuration',
        'Assess pinning quality (coverage, redundancy, correctness) at configuration level on authorized targets'
      ],
      diagram: 'cert-pinning-flow',
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'Pinning is the app saying: "I do not just trust any CA — I expect this exact key." Instead of relying only on the trust store, the app embeds one or more expected certificate public keys (usually SHA-256 digests of the SubjectPublicKeyInfo) and rejects anything else. It is defense in depth against compromised or malicious CAs — and it is the reason some apps refuse to talk to your perfectly configured proxy.'
          },
          {
            type: 'p',
            text:
              'Your job at this stage is recognition and assessment: find pinning in code and configuration, understand its scope, and judge whether it is done well. Runtime bypass techniques are a separate skill, deliberately deferred to module m12.'
          }
        ],
        technical: [
          {
            type: 'diagram',
            id: 'cert-pinning-flow',
            caption:
              'Where pinning sits in the validation path: after normal chain validation, the presented key must also match an embedded pin.'
          },
          {
            type: 'p',
            text:
              'Conceptually, pinning adds one check to the handshake: after normal validation succeeds, the app compares the keys presented in the chain against its embedded digests and aborts on mismatch. Where the check lives varies:'
          },
          {
            type: 'list',
            items: [
              'OkHttp CertificatePinner — pins added in code, often per-domain; applies to all calls through that client',
              'Network Security Configuration <pin-set> — pins declared per domain-config in XML',
              'Custom X509TrustManager — hand-rolled validation; the most error-prone form',
              'Cross-platform frameworks — Flutter, React Native and friends may bring their own TLS stacks with separate pinning APIs'
            ]
          },
          {
            type: 'code',
            lang: 'java',
            title: 'OkHttp CertificatePinner (the common in-code form)',
            code:
              'CertificatePinner pinner = new CertificatePinner.Builder()\n    .add("api.example.org", "sha256/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=")\n    .add("api.example.org", "sha256/BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB=")\n    .build();\nOkHttpClient client = new OkHttpClient.Builder()\n    .certificatePinner(pinner)\n    .build();'
          },
          {
            type: 'code',
            lang: 'xml',
            title: 'The same intent in the Network Security Configuration',
            code:
              '<domain-config>\n    <domain includeSubdomains="true">api.example.org</domain>\n    <pin-set expiration="2026-12-31">\n        <pin digest="SHA-256">AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=</pin>\n        <pin digest="SHA-256">BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB=</pin>\n    </pin-set>\n</domain-config>'
          },
          {
            type: 'p',
            text:
              'Recognizing pinned apps during interception: the behavioral tell is that with a valid proxy CA installed, most hosts work but the pinned domain immediately fails the handshake or resets the connection, and logcat shows pinning or trust errors naming the expected key. Statically, search decompiled sources for CertificatePinner, pin-set, and X509TrustManager implementations, plus framework-specific pinning APIs.'
          },
          {
            type: 'p',
            text:
              'Assessing the configuration at concept level (on your own or training apps) means judging whether the defense is correctly built: pins for every sensitive domain, not just the login host; a backup pin so key rotation does not brick the app; a sane expiration for pin-set entries; and digests that actually match the deployed chain — verifiable with openssl against the live certificate. Attempting to defeat the control, even where authorized, belongs to module m12.'
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'Pinning changes the shape of an engagement, not its validity: you enumerate what is pinned and how well, test everything that remains reachable, and report pinning gaps — unpinned sensitive domains, single-pin setups without a backup, expiring pins — as findings. Correctly implemented pinning is also worth stating in the report: it materially raises the bar against on-path attackers.'
          },
          {
            type: 'list',
            items: [
              'Coverage: is every sensitive endpoint pinned, or only one?',
              'Redundancy: at least two independent pins (current key plus backup) so rotation does not break the app',
              'Correctness: digests match the real deployed chain (verify with openssl)',
              'Consistency: one pinning mechanism — code and NSC can disagree, and half-pinned apps fail closed'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'CertificatePinner usage or sha256/ pin constants in decompiled code',
              '<pin-set> entries and their expiration dates in the NSC',
              'Custom TrustManager / SSLSocketFactory / HostnameVerifier wiring in the networking layer',
              'Pinned domain lists that omit domains you observed carrying tokens during interception',
              'Pinning failures in logcat naming the expected digest while you proxy the app'
            ]
          }
        ],
        howToTest: [
          {
            type: 'callout',
            variant: 'legal',
            title: 'Recognition is passive; defeat is not',
            text:
              'Identifying pinning is observation. Attempting to bypass it is active testing of an anti-abuse control — restrict that to training apps, your own builds, or explicitly authorized engagements, and see module m12 for that curriculum.'
          },
          {
            type: 'p',
            text: 'Static recognition first:'
          },
          {
            type: 'terminal',
            title: 'Finding pinning in an authorized app',
            lines: [
              '$ grep -rn "CertificatePinner" jadx_out/sources/ | head -5',
              '$ grep -rn "sha256/" jadx_out/sources/ | head -5',
              '$ grep -n -A6 "pin-set" target_out/res/xml/network_security_config.xml'
            ]
          },
          {
            type: 'p',
            text:
              'Then confirm behaviorally on the l03 proxy setup: note exactly which domains fail, and whether the failure is a handshake abort (consistent with pinning) versus no traffic at all (proxy bypass). Finally, compare embedded pins against the live chain:'
          },
          {
            type: 'terminal',
            title: 'Verifying a pin against the live chain',
            lines: [
              '$ openssl s_client -connect api.example.org:443 2>/dev/null | openssl x509 -pubkey -noout | openssl pkey -pubin -outform DER | openssl dgst -sha256 -binary | openssl base64',
              'e.g. K3rJbDCLJMrGOGhW5kU6h9UJv8Ck3S3Z1k0KcPqW1mY=  # compare with the pin inside the app'
            ]
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'A training app pins api.training.local via an NSC pin-set with two pins. During interception every screen works except the account page — exactly the pin-set\u2019s scope. Static reading shows the pins match the current leaf key and its intermediate (a correct backup pair). Assessment conclusion: pinning present, correctly scoped to the sensitive host, correctly redundant — recorded as a strength, while the unpinned hosts (analytics, CDN) are tested normally.'
          }
        ],
        tools: [
          {
            type: 'table',
            headers: ['Tool', 'Role'],
            rows: [
              ['JADX', 'Locate CertificatePinner, TrustManager and pin constants in code'],
              ['apktool', 'Extract and read the NSC pin-set declarations'],
              ['openssl', 'Compute SPKI/SHA-256 digests of the live chain for comparison'],
              ['Burp Suite', 'Observe which domains fail TLS and how (abort vs reset)'],
              ['MobSF', 'Automated first pass that flags pinning presence in static reports']
            ]
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Pinning only the leaf certificate: a routine server-side rotation then bricks the app — pin with a backup key',
              'Concluding "pinned" from any TLS failure — a missing CA produces the same symptom; check the l02 policy first',
              'Assuming pinning covers the whole app — it is usually per-domain and per-mechanism',
              'Treating pinning as a substitute for TLS hygiene: a pinned API next to a permissive base-config elsewhere is still weak',
              'Attempting bypass techniques against apps you are not authorized to test'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'In your own demo app (module 05 setup), add a pin-set for a domain you control, compute its digest with openssl, run the app through your proxy, and watch the handshake fail for that domain only. Then rotate the server certificate and reason through what the backup pin does. That is the whole assessment loop in miniature.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
              'Pinning = embedded expected keys checked in addition to normal chain validation',
              'It lives in OkHttp CertificatePinner, NSC pin-sets, custom TrustManagers, or framework APIs',
              'Recognition: specific domains fail with a valid proxy CA installed; static grep confirms',
              'Assessment = coverage, redundancy, correctness, consistency — runtime bypass waits for m12'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'm06-l04-q1',
          type: 'mcq',
          prompt: 'What does a pin in a pin-set or CertificatePinner actually match against?',
          options: [
            'The full server certificate file, byte for byte',
            'A SHA-256 digest of a key (SPKI) presented in the chain',
            'The CA organization name string',
            'The server IP address'
          ],
          answerIndex: 1,
          hint: 'Pins look like sha256/<base64>.',
          explanation:
            'Pins are digests of the SubjectPublicKeyInfo of keys in the presented chain. Any chain containing a matching key passes — which is what makes rotation with a backup pin workable.'
        },
        {
          id: 'm06-l04-q2',
          type: 'truefalse',
          prompt: 'A <pin-set> declared inside a domain-config applies to every host the app talks to.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'Recall how domain-config scopes policy from l02.',
          explanation:
            'Pins in a domain-config apply to that domain (and subdomains if declared). Only a pin-set in base-config would apply app-wide — and even then only to connections covered by that policy.'
        },
        {
          id: 'm06-l04-q3',
          type: 'short',
          prompt: 'Name two static indicators that an app implements certificate pinning.',
          modelAnswer:
            'Usage of OkHttp\u2019s CertificatePinner (sha256/ pin constants) in decompiled code, or a <pin-set> block in the Network Security Configuration; custom X509TrustManager implementations are a third, weaker indicator.',
          hint: 'One lives in code, one lives in XML.',
          explanation:
            'Static indicators let you predict interception outcomes before running anything — the same static-first discipline as lesson l02.'
        },
        {
          id: 'm06-l04-q4',
          type: 'scenario',
          prompt:
            'With a valid proxy CA installed, all endpoints of an authorized target work through your proxy except api.target.example, which aborts the handshake instantly. State the likely cause, one static check to confirm it, and one configuration property you would assess.',
          modelAnswer:
            'Likely cause: certificate pinning scoped to api.target.example. Confirm statically by grepping decompiled sources for CertificatePinner/sha256 pins and the NSC for a pin-set on that domain. Assess pin redundancy and coverage: whether the pin-set includes a backup key, and whether all sensitive domains (not just this one) are pinned.',
          hint: 'Behavior narrows it to one domain; statics confirm; then judge the quality.',
          explanation:
            'This is the complete concept-level evaluation loop: behavioral recognition, static confirmation, configuration-quality judgment. Runtime defeat techniques are out of scope here and covered in module m12.'
        }
      ],
      references: [
        {
          title: 'Android Developers — Network Security Configuration',
          url: 'https://developer.android.com/training/articles/security-config',
          note: 'Official pin-set reference, including expiration and digest format.'
        },
        {
          title: 'OkHttp',
          url: 'https://square.github.io/okhttp/',
          note: 'Official documentation of CertificatePinner, the most common in-code pinning API.'
        },
        {
          title: 'OWASP MASTG',
          url: 'https://mas.owasp.org/MASTG/',
          note: 'Covers pinning assessment and, in later chapters, anti-controls — mirrored by module m12 here.'
        },
        {
          title: 'PortSwigger — Burp Suite',
          url: 'https://portswigger.net/burp',
          note: 'Recognizing and working with TLS failures during interception.'
        }
      ]
    }
  ]
};
