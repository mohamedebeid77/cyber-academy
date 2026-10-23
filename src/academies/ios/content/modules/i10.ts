import type { Module } from '../../../../types';

// LEVEL 5 — DYNAMIC ANALYSIS · Module i10: Dynamic Analysis
// Original content synthesized from OWASP MASTG dynamic testing chapters and
// Apple developer tooling documentation.

export const i10: Module = {
  id: 'i10',
  title: 'Dynamic Analysis',
  level: 5,
  description:
    'What the app does while it runs: the observation model, logs and files and network traffic as evidence channels, and runtime state you can inspect without (and before) instrumentation. The bridge between static claims and Frida-level proof.',
  outcomes: [
    'Explain the static/dynamic division and design observations that confirm static claims',
    'Collect evidence from the three dynamic channels: logs, container files, network traffic',
    'Inspect runtime state (process, memory, UI state) with non-invasive tooling'
  ],
  lessons: [
    {
      id: 'i10-l01',
      moduleId: 'i10',
      title: 'Static vs Dynamic: The Observation Model',
      difficulty: 'Intermediate',
      minutes: 18,
      prerequisites: ['i09-l04'],
      objectives: [
        'Articulate what each analysis mode can and cannot establish',
        'Convert static claims into designed observations (trigger, channel, expected artifact)',
        'Sequence dynamic work so cheap observations precede instrumentation'
      ],
      diagram: 'ios-dynamic-workflow',
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'Static analysis asks "what can I learn without running the app?"; dynamic asks "what can I observe or manipulate while it runs?". The professional move is sequencing: every static claim deserves the cheapest dynamic observation that proves it, and only then the expensive ones (hooks, patching). This lesson installs that model — it is the operating system of the next six modules.'
          }
        ],
        technical: [
          {
            type: 'diagram',
            id: 'ios-dynamic-workflow',
            caption: 'The dynamic pipeline: install → observe → exercise → instrument → intercept → evidence.'
          },
          { type: 'h', text: 'The observation design pattern' },
          {
            type: 'list',
            items: [
              'Claim (from i09-l04 queue): "SessionLoader writes token to UserDefaults"',
              'Trigger: perform login in the app',
              'Channel: container file observation (pull Preferences plist before/after)',
              'Expected artifact: plist containing auth_token with a fresh value',
              'Verdict rule: artifact present → finding confirmed; absent → claim revised (maybe the code path needs another trigger — RE question reopened)'
            ]
          },
          { type: 'h', text: 'The channel stack, cheapest first' },
          {
            type: 'list',
            items: [
              '1. UI observation: what the app shows — free, always available',
              '2. Logs: Console or the log CLI, filtered by process — near-free, narrates decisions',
              '3. Files: container pulls (dev builds via Xcode; store builds via backup workflows) — cheap, shows persistence truth',
              '4. Network: proxy captures (module i07-l03) — cheap, shows traffic truth',
              '5. Runtime inspection: process/memory views (LLDB-lite via Xcode, later Frida) — costs setup',
              '6. Instrumentation: Frida hooks (i11), patching (i22) — the expensive tier, spent only when 1–5 cannot answer'
            ]
          },
          { type: 'h', text: 'Sequencing in practice' },
          {
            type: 'p',
            text:
              'Per queue entry, ask: can logs confirm this? can a file diff? can a capture? Only when the answer is no across the cheap stack do you design a hook. This is not laziness — it is evidentiary hygiene: cheap-channel evidence is less contestable (no instrumentation side-effects) and faster to collect, and the expensive tier is where reviewer skepticism concentrates ("your hook changed the behavior").'
          }
        ],
        pentestRelevance: [
          {
            type: 'list',
            items: [
              'Every queue entry from i09-l04 becomes one designed observation — trigger/channel/artifact/verdict — before any tooling is opened',
              'Mixed-evidence findings are the strongest: static function + file artifact + capture, three channels agreeing',
              'Failed observations are findings about your model, not failures: "plist absent after login" reopens RE with better questions',
              'The cheapest-tier-first discipline is what keeps engagements fast and reports contest-proof'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Queue entries designed as hook-first — redesign them through the cheap stack first',
              'Observations without verdict rules ("look at the logs") — unfinished designs produce unfalsifiable sessions',
              'Channels left unused: teams that capture traffic but never pull containers (or vice versa) systematically miss finding classes',
              'Environment mismatch in designs: simulator observations queued against device claims (module i07-l02\u2019s honesty rule applied per observation)'
            ]
          }
        ],
        howToTest: [
          {
            type: 'list',
            ordered: true,
            items: [
              'Take your i09-l04 queue (three entries from the training app) and design one observation per entry: trigger, channel (cheapest sufficient), expected artifact, verdict rule',
              'Execute the observations in cheap-first order; record artifacts with labels (device, build, timestamp)',
              'For each: verdict reached or RE question reopened — write either outcome down',
              'Only for unanswered entries, draft the instrumentation design (which function, which hook — i11 will execute it)',
              'File all artifacts into the evidence bundle with hashes — the dynamic half now has the same hygiene as the static half'
            ]
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'One claim through the model. Static claim: pin validator has a plist-gated early-accept (i09-l03\u2019s example). Cheapest design: trigger — set the flag path via app group plist IF the app exposes a writer (unknown); channel — file first (does the plist exist? who writes it?), then capture (does the app\u2019s TLS behavior change on flag state?), hook only if the file path is not reachable but RE says the reader exists. The design revealed the real question was "who writes the flag plist" — a storage/surface question (i13/i16), not a hook question. Sequencing did not just order the work; it re-framed it.'
          }
        ],
        tools: [
          {
            type: 'p',
            text:
              'Channels 1–4 use tooling you already own (module i07): Console/log, Xcode container access, backup workflows, proxy. Channel 5 preview: Xcode\u2019s memory/process views for dev builds. Channel 6 arrives with module i11 — this module\u2019s discipline exists so you arrive there needing fewer hooks, not more.'
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Hook-first thinking: reaching for Frida when a log filter or file diff would answer',
              'Observations without verdict rules — sessions end in "interesting" instead of findings',
              'Single-channel evidence: a capture without the file (or vice versa) invites "but maybe…" rebuttals the paired artifact would close',
              'Environment-mismatched designs (sim observations for device claims) surviving into reports'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Redesign your entire dynamic queue through this lesson\u2019s pattern: every entry gets trigger/channel/artifact/verdict and a cheapest-sufficient channel. Then execute the first two observations end to end on your lab. The redesign is the deliverable — execution proves the designs were real.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
            'Static claims → designed observations: trigger, channel, expected artifact, verdict rule',
            'The channel stack runs cheapest-first; instrumentation is the expensive tier spent last',
            'Mixed-channel evidence (code + file + capture) is the strongest finding form',
            'Failed observations reopen RE questions — they are progress, not noise'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'i10-l01-q1',
          type: 'mcq',
          prompt: 'Which observation design element makes a session falsifiable?',
          options: [
            'The hook script\u2019s verbosity',
            'The verdict rule: what artifact confirms the claim, and what reopens it',
            'The number of channels used',
            'Recording the session video'
          ],
          answerIndex: 1,
          hint: 'What turns "we watched the app" into "the claim held/failed"?',
          explanation:
            'The verdict rule names the expected artifact and the failure interpretation. Without it, sessions produce impressions; with it, they produce verdicts — including the verdict "claim wrong, RE reopened", which is progress.'
        },
        {
          id: 'i10-l01-q2',
          type: 'truefalse',
          prompt: 'If a static claim is strong, the correct first dynamic step is usually a Frida hook on the relevant function.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'What does the channel stack say comes before instrumentation — and why?',
          explanation:
            'False. Logs, files and captures are cheaper, faster and less contestable; hooks carry side-effect risk and setup cost. The hook comes when the cheap stack cannot answer — and by then its design is sharper because the other channels narrowed the question.'
        },
        {
          id: 'i10-l01-q3',
          type: 'scenario',
          prompt:
            'Claim: "the app disables TLS validation when flag X is set." Design the cheapest sufficient observation.',
          hint: 'File, capture, or hook — which channel answers TLS behavior, and what is the trigger?',
          explanation:
            'Trigger: reach flag-X state (if the writer is reachable — else this is the reopened RE question). Channel: network capture — observe whether the app completes TLS handshakes to your proxy (validation-off behavior) vs fails (validation-on). Expected artifact: paired captures in both flag states. Verdict rule: handshake success under flag-X with your CA (and no device trust change) confirms; failure refutes. No hook needed — the wire is the evidence.'
        },
        {
          id: 'i10-l01-q4',
          type: 'mcq',
          prompt: 'Why is mixed-channel evidence (code + file + capture) the strongest finding form?',
          options: [
            'It looks thorough in the report',
            'Independent channels agree on the same failure — removing the single-artifact rebuttal space',
            'Scanners require three artifacts',
            'It doubles the finding count'
          ],
          answerIndex: 1,
          hint: 'What does a reviewer attack when evidence is single-channel?',
          explanation:
            'Each channel has a rebuttal class (code misread, file coincidental, capture misattributed). When three independent channels show the same failure, the rebuttal space collapses — that is what makes mixed evidence the report standard.'
        }
      ],
      references: [
        {
          title: 'OWASP MASTG — iOS dynamic analysis chapters',
          url: 'https://mas.owasp.org/MASTG/iOS/',
          note: 'The guide\u2019s dynamic observation framing'
        },
        {
          title: 'Apple Developer — Console and log collection on device',
          url: 'https://developer.apple.com/documentation/xcode/monitoring-your-app-s-log-messages',
          note: 'The log channel\u2019s official tooling'
        },
        {
          title: 'OWASP MASVS — RESILIENCE/NETWORK/STORAGE (the claim categories being confirmed)',
          url: 'https://mas.owasp.org/MASVS/',
          note: 'Category vocabulary for verdict writing'
        }
      ]
    },
    {
      id: 'i10-l02',
      moduleId: 'i10',
      title: 'Logs, Files and Traffic: The Evidence Channels',
      difficulty: 'Intermediate',
      minutes: 24,
      prerequisites: ['i10-l01', 'i07-l03'],
      objectives: [
        'Collect and filter device logs for a target process, and read them as decision narration',
        'Diff containers across triggers to catch persistence truth',
        'Read captures with the endpoint inventory so traffic becomes findings, not noise'
      ],
      diagram: undefined,
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'The three workhorse channels — logs, files, traffic — share one property: they observe without touching the app\u2019s code, so their evidence carries no instrumentation caveat. This lesson makes each channel routine: log filtering and reading, container diffing, and inventory-driven capture analysis. Together they will confirm most of your queue before any hook is written.'
          }
        ],
        technical: [
          { type: 'h', text: 'Channel 1: logs' },
          {
            type: 'terminal',
            title: 'Log collection and filtering',
            lines: [
              '# stream device logs, filtered to the target process',
              '$ pymobiledevice3 syslog live --process com.target.app > app-logs.txt',
              '# or on a Mac with Xcode: Console.app → device → filter com.target.app',
              '# macOS-level structured query (for simulator logs)',
              '$ log show --predicate \u0027process == "TargetApp"\u0027 --last 5m',
              '# what to look for while exercising the app:',
              '# - custom app logs (developer breadcrumbs)',
              '# - network errors (CFNetwork/NSURLSession lines)',
              '# - keychain errors (securityd, errSec*)',
              '# - sandbox/AMFI denials (kernel)',
              '# - lifecycle events (didEnterBackground etc.)'
            ]
          },
          { type: 'h', text: 'Channel 2: files' },
          {
            type: 'list',
            ordered: true,
            items: [
              'Baseline pull of the container (dev build: Xcode Devices → Download Container; store build: backup workflow — module i13 formalizes)',
              'Trigger: perform the action under test (login, background, specific feature)',
              'Second pull; diff the trees (file lists + contents for plists/SQLite)',
              'Verdict artifacts: which files changed, with what content — persistence truth, immune to UI claims',
              'Label everything: build, timestamp, trigger description — the diff pair is one evidence unit'
            ]
          },
          { type: 'h', text: 'Channel 3: traffic' },
          {
            type: 'list',
            ordered: true,
            items: [
              'Baseline capture (module i07-l03\u2019s protocol) — idle + launch + core flows',
              'Test capture: the specific trigger plus manipulations (parameter changes, replay)',
              'Read captures against the endpoint inventory (module i08-l03): known hosts → confirm behavior; unknown hosts → investigate immediately',
              'Export captures as evidence (Burp: save state/XML; mitmproxy: dump files) with hashes'
            ]
          },
          {
            type: 'callout',
            variant: 'tip',
            title: 'The diff pair habit',
            text:
              'For files AND traffic AND logs: baseline-then-trigger pairs. Single-point artifacts invite "was it always like that?" rebuttals; pairs answer by construction. This habit alone upgrades most trainee evidence to review-proof.'
          }
        ],
        pentestRelevance: [
          {
            type: 'list',
            items: [
              'Log leakage is a finding class of its own: tokens/PII in os_log/NSLog output (readable via device logs) — collect the log channel not just for narration but for findings',
              'Container diffs confirm storage findings definitively (the module i05/i13 vocabulary applied to real bytes)',
              'Capture-vs-inventory deltas (unknown hosts, unexpected paths) surface hidden endpoints and data sharing — the static sweep\u2019s live counterpart',
              'All three channels produce evidence the client can independently verify — that verifiability is why cheap channels come first (i10-l01)'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Custom logs printing sensitive payloads (tokens, PII) — the classic self-pwn',
              'Container files appearing at unexpected lifecycle moments (data written on background, not on explicit save)',
              'Cookie/session artifacts persisting across logout flows in the diff pair',
              'Traffic to endpoints absent from the static inventory — hidden analytics, unseen processors, sprawl',
              'Requests replayed with identical tokens after logout — session-invalidation truth on the wire'
            ]
          }
        ],
        howToTest: [
          {
            type: 'list',
            ordered: true,
            items: [
              'Run the full channel loop on your training app: baseline log/file/capture, trigger (login + one feature), second capture of all three',
              'Read the three diff pairs and write one paragraph each: what changed, what it means for the audit',
              'Cross-confirm one static claim with all three channels (the mixed-evidence form from i10-l01)',
              'File every artifact with labels and hashes; add findings drafts for anything new',
              'Note which queue entries these channels resolved — the remaining entries are the honest hook-list for module i11'
            ]
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'Three channels, one logout finding. Claim under test: "logout invalidates the session." Logs: app prints "[AUTH] session cleared" — narration, not proof. Container diff: Preferences plist keeps auth_token; Cookies binary keeps the session cookie — persistence truth contradicts the log. Capture: after logout, the app polls an account endpoint with the old token and receives 200 — wire truth confirms the contradiction. Finding: "Logout clears UI state but retains and reuses credentials across the session boundary (plist + cookie + captured reuse); server-side revocation absent." One finding, three agreeing channels, no hooks — the lesson\u2019s thesis in one story.'
          }
        ],
        tools: [
          {
            type: 'p',
            text:
              'pymobiledevice3 syslog / Console.app (logs), Xcode container download or backup tooling (files — full workflow in i13), Burp/mitmproxy (traffic). SQLite and plist viewers for reading the diff contents. Nothing new: the channels were configured in module i07 — this lesson is their disciplined use.'
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Trusting log narration as truth ("the app says cleared") — logs are claims; files and wire are verdicts',
              'Single-point evidence (no baseline pairs) — the rebuttal space reopens',
              'Reading captures without the inventory — every request looks equally plausible and nothing is flagged',
              'Forgetting that simulator files/logs differ from device — channel evidence inherits module i07-l02\u2019s environment honesty per artifact'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Execute the logout scenario end to end on your training app: log stream, diff pair, capture pair. Write the three paragraphs and, if your app repeats the training pattern, the finding draft. If it does not (session genuinely revoked), write the verified-clean verdict with the three artifacts — a proven negative is equally report content.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
            'Logs narrate, files and wire prove — treat each channel\u2019s evidence class honestly',
            'Baseline-then-trigger pairs (diffs) are the evidence shape; singles invite rebuttals',
            'Capture reading runs against the endpoint inventory — deltas are the findings',
            'Log leakage is a finding class; the narration channel is also a target'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'i10-l02-q1',
          type: 'mcq',
          prompt: 'The app logs "[AUTH] session cleared" on logout, but the captured token still authenticates. Which artifact is the verdict?',
          options: [
            'The log line — it states the behavior',
            'The wire artifact: the captured request with the old token receiving a valid response',
            'The UI state after logout',
            'None — the artifacts conflict, so no conclusion is possible'
          ],
          answerIndex: 1,
          hint: 'Which channel\u2019s evidence class is "truth" for session validity?',
          explanation:
            'The wire: a request with the old token succeeding is the system\u2019s verdict on invalidation (logs are app-authored claims). The finding writes itself: narration contradicted by wire + persisted artifacts.'
        },
        {
          id: 'i10-l02-q2',
          type: 'truefalse',
          prompt: 'A container diff pair (before/after trigger) is stronger evidence for a storage finding than a single pulled plist.',
          options: ['True', 'False'],
          answerIndex: 0,
          hint: 'What does the "before" half of the pair eliminate?',
          explanation:
            'True — the baseline eliminates the "was already there" rebuttal and attributes the write to the trigger. Single artifacts are still evidence, but pairs attribute; attribution is what findings need.'
        },
        {
          id: 'i10-l02-q3',
          type: 'scenario',
          prompt:
            'Your capture shows traffic to api-v3.hidden-analytics.io — absent from the static inventory. What are the next two moves?',
          hint: 'One move classifies the traffic; one updates the documents.',
          explanation:
            '(1) Classify: inspect the request (method/headers/body) and the trigger context — what data leaves, when, under what feature; check for PII/identifiers. (2) Document: add the endpoint to the inventory with "runtime-discovered" provenance and draft the finding/note (undisclosed data sharing, privacy framing per module i05-l03). Never stop at "unknown host appeared".'
        },
        {
          id: 'i10-l02-q4',
          type: 'mcq',
          prompt: 'Why does log leakage count as a reportable finding?',
          options: [
            'Logs are encrypted, so exposure is theoretical',
            'Device logs are accessible via attached tooling (and crash/analytics flows) — sensitive payloads in logs are recoverable data at rest',
            'Because NSLog is deprecated',
            'Only if the logs reach Apple'
          ],
          answerIndex: 1,
          hint: 'Who can read device logs, and what did module i13 establish about "at rest" exposure?',
          explanation:
            'Logs are retrievable via attached Macs, backup/analytics flows, and (in many setups) on-device diagnostics. Tokens or PII printed to logs are therefore data-at-rest exposure — same family as plist findings, same MASVS-STORAGE framing.'
        }
      ],
      references: [
        {
          title: 'Apple Developer — Logging (os_log) guidance',
          url: 'https://developer.apple.com/documentation/os/logging',
          note: 'The logging system\u2019s design — and why sensitive data must never reach it'
        },
        {
          title: 'OWASP MASTG — iOS data storage and log testing',
          url: 'https://mas.owasp.org/MASTG/iOS/',
          note: 'The storage/log test families this channel implements'
        },
        {
          title: 'pymobiledevice3 — syslog tooling',
          url: 'https://github.com/doronz88/pymobiledevice3',
          note: 'The scriptable log channel used in labs'
        }
      ]
    },
    {
      id: 'i10-l03',
      moduleId: 'i10',
      title: 'Runtime State: Processes, Memory and UI State',
      difficulty: 'Advanced',
      minutes: 22,
      prerequisites: ['i10-l02', 'i02-l02'],
      objectives: [
        'Inspect process/runtime state with the built-in, non-invasive tooling',
        'Understand what live memory can (and cannot) tell you without instrumentation',
        'Read UI-state evidence (snapshots, state restoration) as a privacy/storage channel'
      ],
      diagram: 'ios-app-lifecycle',
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'Between "watch files" and "hook functions" lies runtime state: what the process is, what memory holds, what the UI left behind. Dev-build tooling (Xcode\u2019s debugger plumbing) exposes much of this without any scripting; it answers different questions than files do — questions about liveness: what is loaded, what is resident, what the app kept in RAM across transitions.'
          }
        ],
        technical: [
          { type: 'h', text: 'Process-level views' },
          {
            type: 'list',
            items: [
              'Device process inventory (Xcode Devices window, devicectl/pymobiledevice3): what runs, companion processes (extensions light up during their work — module i02-l02\u2019s process discipline in action)',
              'Termination reports: jetsam/watchdog reasons distinguish memory kills from logic death (module i03-l04\u2019s attribution rule)',
              'CPU/energy views: sustained background activity predicts the background-behavior tests (i02-l04) worth exercising'
            ]
          },
          { type: 'h', text: 'Memory, without instrumentation' },
          {
            type: 'list',
            items: [
              'Dev builds attach Xcode\u2019s debugger: view heap growth, object counts, and — with LLDB (module i12 formalizes) — read specific objects',
              'Memory graphs (Xcode) show object relationships: token caches, session singletons, view controllers retaining user data — the live version of i09\u2019s target list',
              'Boundaries: store builds do not attach (get-task-allow, module i06); memory claims therefore name their build channel like every other artifact',
              'What memory cannot tell you without hooks: precise call traces and argument values — that is Frida\u2019s tier (i11), and this lesson\u2019s honesty line'
            ]
          },
          { type: 'h', text: 'UI state as evidence' },
          {
            type: 'list',
            items: [
              'Switcher snapshots: background on a sensitive screen, inspect the card — screen-content leakage with a trivial visual proof (module i02-l04\u2019s snapshot test)',
              'State restoration: kill and relaunch — what the app restores (identifiers, screens, prefilled data) reveals what it persists beyond memory',
              'Scene state files: dev-build containers show scene/state storage — pair with the diff-pair method (i10-l02)',
              'Privacy overlay testing: the fix apps owe (cover sensitive screens on background) is verified exactly by the snapshot test'
            ]
          }
        ],
        pentestRelevance: [
          {
            type: 'list',
            items: [
              'Runtime state answers "is it live?" questions files cannot: caches held in RAM across logout, session singletons surviving re-auth, tokens retained after "clear"',
              'The memory-graph view is target-list enrichment: live object names and counts validate RE guesses (which singletons exist, which caches fill) before you hook anything',
              'UI-state evidence (snapshots, restoration) is cheap and finds the highest-ratio privacy findings in the discipline',
              'Process inventory catches the architecture surprises (extensions doing more than advertised) that static scope missed'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Session/token objects resident after logout (memory-graph: singleton still holding credential strings)',
              'Snapshots capturing account numbers, messages, health data — the visual proof is a screenshot of the switcher card',
              'State restoration carrying user identifiers across kills — pair with container diff for the persistence chain',
              'Background CPU/energy sustained by features that claim to be passive — predicts the silent-sync tests (i14 captures on background transitions)'
            ]
          }
        ],
        howToTest: [
          {
            type: 'list',
            ordered: true,
            items: [
              'Process inventory: record what runs during core flows (main app + which extensions + system helpers)',
              'Memory pass on a dev build: attach, exercise login/logout, inspect the graph for retained session/token objects; record object names and counts',
              'Snapshot test: sensitive screen → background → switcher card inspection (visual artifact) + (dev build) container pull of snapshot storage',
              'Restoration test: kill → relaunch → record restored state; container diff to find the restoration files',
              'Queue update: which i11 hooks did the memory pass justify (retained singletons to observe on logout)? Which claims did runtime state already confirm?'
            ]
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'RAM versus disk, one finding. A password manager\u2019s training variant claims "credentials are wiped from memory on lock." Test without hooks: dev build, memory graph after lock — the Vault singleton still retains three NSString objects matching vault passwords (readable in the debugger). Report: "Credentials retained in process memory after lock (object names/counts from memory graph); combined with i10-l02\u2019s wire evidence of token retention, the wipe claim fails at both storage layers." Static said the wipe function existed; runtime state showed what it did not reach — the live-view tier\u2019s exact value.'
          }
        ],
        tools: [
          {
            type: 'p',
            text:
              'Xcode (Devices window, memory graph, debugger — dev builds), devicectl/pymobiledevice3 (process inventory), the switcher UI itself (snapshot evidence), and container tooling for scene/state files. LLDB\u2019s full power arrives in module i12; this lesson uses its Xcode-integrated slice only.'
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Attempting memory claims on store builds without the jailbreak/dev-build context — get-task-allow gates attach; name the channel or make no claim',
              'Treating memory observations as persistent storage findings — RAM findings and disk findings are different classes with different severities; do not blend them',
              'Skipping the snapshot test because "it is too simple" — it is the highest-value-per-minute privacy test in the curriculum',
              'Over-reading memory graphs (any retained string is not automatically a leak) — tie objects to flows (logout, lock) before writing findings'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Run the four-step protocol (process inventory, memory pass, snapshot, restoration) on your training app. Produce the two visual artifacts (switcher card inspection, memory graph excerpt) and the one-paragraph runtime-state summary. Then answer: which single hook does this justify adding to the i11 queue? Runtime state\u2019s output is exactly that — fewer, better hooks.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
            'Runtime state answers liveness questions (loaded, resident, retained) that files and captures cannot',
            'Dev-build tooling (Xcode debugger, memory graph) exposes most of it without scripting; store builds gate attach by entitlement',
            'UI state — snapshots and restoration — is a cheap, high-yield privacy evidence channel',
            'Runtime inspection\u2019s output is justified hooks for module i11 — fewer, better instruments'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'i10-l03-q1',
          type: 'mcq',
          prompt: 'Which claim can a memory-graph pass support on a dev-signed build?',
          options: [
            'The app\u2019s production build retains credentials in RAM',
            'This dev build\u2019s Vault singleton retains N credential strings after lock — recorded with object names/counts',
            'All iOS apps retain credentials in RAM',
            'The app writes credentials to disk'
          ],
          answerIndex: 1,
          hint: 'Channel + build channel = claim scope. What exactly did the pass observe?',
          explanation:
            'Memory claims are build-scoped and artifact-backed (object names, counts). Transferring to "production" needs the transferability argument (same code path, store build not inspectable without jailbreak) stated explicitly — or re-validation in that environment.'
        },
        {
          id: 'i10-l03-q2',
          type: 'truefalse',
          prompt: 'A sensitive screen visible in the app switcher card is a reportable privacy finding with a known, cheap remediation.',
          options: ['True', 'False'],
          answerIndex: 0,
          hint: 'What is the standard fix pattern for snapshot leakage, and how cheap is the evidence?',
          explanation:
            'True — the visual artifact is immediate (background the app, look at the card), and the standard remediation (privacy overlay on backgrounding) is a small, platform-documented change. High-value-per-minute is the reason the test is mandatory in this curriculum.'
        },
        {
          id: 'i10-l03-q3',
          type: 'scenario',
          prompt:
            'Memory graph shows SessionManager still holding an accessToken string after logout. What two follow-ups make this a defensible finding?',
          hint: 'One shows the string matters (not just exists); one shows the flow fails.',
          explanation:
            '(1) Tie to flow: exercise logout with logging/capture — the retained token is actually used (i10-l02\u2019s wire evidence) or is demonstrably the same value; (2) artifact the claim: debugger excerpt naming object/value shape. "A string exists" is noise; "the session\u2019s token survives logout in memory and on the wire" is a finding.'
        },
        {
          id: 'i10-l03-q4',
          type: 'mcq',
          prompt: 'Why does the process inventory belong in every dynamic session\u2019s opening?',
          options: [
            'To measure CPU temperature',
            'It records which processes actually run — revealing extension activity and architecture the static scope may have missed',
            'It bypasses sandbox checks',
            'It replaces the memory graph'
          ],
          answerIndex: 1,
          hint: 'What did module i02-l02 say about extensions as processes — and when do you SEE that?',
          explanation:
            'Extensions execute as their own processes during their work — the inventory is when they become visible and testable (did the share extension run? for how long? doing what?). Opening sessions with it turns architecture knowledge into live scope.'
        }
      ],
      references: [
        {
          title: 'Apple Developer — Debugging with Xcode (memory graph)',
          url: 'https://developer.apple.com/documentation/xcode/improving-app-responsiveness',
          note: 'The dev-build memory tooling this lesson uses'
        },
        {
          title: 'Apple Developer — Preventing sensitive UI capture (privacy overlays)',
          url: 'https://developer.apple.com/documentation/uikit/screen_capturing_and_screen_recording',
          note: 'The platform mechanisms behind the snapshot remediation'
        },
        {
          title: 'OWASP MASTG — iOS dynamic analysis chapters',
          url: 'https://mas.owasp.org/MASTG/iOS/',
          note: 'Runtime observation framing consistent with this lesson'
        }
      ]
    }
  ]
};
