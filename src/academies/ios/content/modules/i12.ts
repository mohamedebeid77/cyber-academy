import type { Module } from '../../../../types';

// LEVEL 5 — DYNAMIC ANALYSIS · Module i12: LLDB & Debugging
// Original content synthesized from LLDB official documentation and Apple
// developer debugging guides.

export const i12: Module = {
  id: 'i12',
  title: 'LLDB & Debugging',
  level: 5,
  description:
    'The precision instrument: attaching LLDB to dev-signed apps, breakpoints and watchpoints, reading registers/memory/stack, and understanding exactly how LLDB\u2019s stop-the-world model differs from Frida\u2019s live scripting — and when each is the right tool.',
  outcomes: [
    'Attach LLDB to a dev-signed app on device or simulator and drive core commands',
    'Use breakpoints, watchpoints, backtraces and memory reads to answer state questions',
    'Articulate the LLDB/Frida division of labor and choose per question'
  ],
  lessons: [
    {
      id: 'i12-l01',
      moduleId: 'i12',
      title: 'LLDB Fundamentals: Attach, Break, Inspect',
      difficulty: 'Advanced',
      minutes: 25,
      prerequisites: ['i11-l01', 'i09-l01'],
      objectives: [
        'Attach to a running app (or launch under LLDB) on device/simulator',
        'Set breakpoints, read backtraces, inspect registers and memory',
        'Use expression evaluation to read object state at a stop'
      ],
      diagram: 'ios-lldb-debugserver',
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'LLDB is the debugger underneath Xcode — and the platform\u2019s native precision instrument. Where Frida scripts your observation continuously, LLDB stops the world at exact points and lets you interrogate memory, registers and object state with surgical focus. Debug builds (get-task-allow) are its domain; the mechanics of attach, break, and inspect are this lesson\u2019s core.'
          }
        ],
        technical: [
          {
            type: 'diagram',
            id: 'ios-lldb-debugserver',
            caption: 'The attach path: LLDB on the Mac drives debugserver on the device — gated by get-task-allow.'
          },
          { type: 'h', text: 'Attach and first commands' },
          {
            type: 'terminal',
            title: 'The core loop',
            lines: [
              '# launch under the debugger (dev build on device via Xcode plumbing)',
              '$ lldb',
              '(lldb) platform select ios',
              '(lldb) platform connect            # or: device attach via Xcode → Devices',
              '(lldb) process attach --name TargetApp',
              '# or launch:',
              '(lldb) process launch',
              '# break on a selector (ObjC) or symbol',
              '(lldb) breakpoint set --selector "validateUser:password:" --shelf LoginManager',
              '(lldb) breakpoint set --name "-[LoginManager validateUser:password:]"',
              '(lldb) c                            # continue',
              '# at a stop:',
              '(lldb) bt                           # backtrace of the stopped thread',
              '(lldb) register read x0 x1          # arm64 registers (i19 preview)',
              '(lldb) po self                      # print the stopped object (ObjC)',
              '(lldb) memory read --size 4 --format x --count 16 $x0',
              '(lldb) expression -- [self token]   # evaluate against the live process'
            ]
          },
          { type: 'h', text: 'The four moves that matter' },
          {
            type: 'list',
            items: [
              'Break: on selectors (ObjC, readable names), on symbols (C/Swift via names from your i09-l02 list), or at raw addresses (Swift-only code — same slide math as i11-l05)',
              'Backtrace: bt at a stop names the exact call chain that reached your breakpoint — reachability proof at instruction precision',
              'Inspect: po/expression evaluate real expressions against the live process — object state (self.token), arbitrary reads, even method calls',
              'Watch: watchpoint set on a memory location — "when does this variable change and by whom" is a watchpoint question, and nothing else answers it as precisely'
            ]
          },
          { type: 'h', text: 'What stops mean' },
          {
            type: 'p',
            text:
              'When LLDB stops the process, the app is frozen — the UI hangs, network timers stall, watchdogs may notice (long stops on foreground apps can trigger termination; stop on background transitions or keep stops short). This is the stop-the-world model: absolute precision on a frozen instant, zero continuous observation. Sessions are question-driven: set the break, trigger the flow, interrogate the instant, continue or detach.'
          }
        ],
        pentestRelevance: [
          {
            type: 'list',
            items: [
              'State questions ("what does this object hold at the moment of decision?") are LLDB\u2019s home turf — po self at a validation breakpoint reads the decision\u2019s inputs live',
              'Watchpoints answer provenance questions ("who writes this cached flag?") that hooks only answer by guessing where to look first',
              'Backtraces at security-relevant stops are the cleanest reachability evidence available — no reconstruction, the actual chain',
              'Dev-build requirement shapes scope: store-build questions route to Frida-on-jailbreak or stay unasked (module i07-l02\u2019s honesty, tool-specific edition)'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Validation methods whose inputs (po on arguments) contain cached/stale values — the decision-quality questions (i15\u2019s client-trust family)',
              'Flags/counters in memory that change outside user-visible flows — watchpoint provenance leads',
              'Stops that never hit despite correct symbols — wrong module scope or lazy loading; enumerate (i11-l03) and check addresses (i11-l05)',
              'Objects retained across flows (the i10-l03 memory-graph findings) — breakpoints in their mutation methods show who mutates and when'
            ]
          }
        ],
        howToTest: [
          {
            type: 'list',
            ordered: true,
            items: [
              'Attach to your dev-signed training app on device or simulator (platform select/connect loop)',
              'Set a selector breakpoint on the login path; trigger login; read the backtrace and po the self object; write the one-paragraph state observation',
              'Set one watchpoint on a suspicious flag (from i08-l03\u2019s sweep); exercise flows; record who writes it and when',
              'Use expression evaluation to answer one question hooks could not (a live method call, an object graph walk)',
              'Write the LLDB-session note: which question, which commands, which artifact — same discipline, new instrument'
            ]
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'A watchpoint finding. Question: the mockAuthEnabled flag (i08-l03) — who sets it at runtime? Set watchpoint on the flag\u2019s storage; launch; trigger login. Stop: written by SettingsReader.syncFromPlist called from AppDelegate.applicationDidFinishLaunching. The flag is set from the plist at launch — the influence question (module i16\u2019s surface tests: can external content set that plist value?) now has a precise writer named. Static guessed the reader; the watchpoint proved the write path and its timing — precision LLDB exists for.'
          }
        ],
        tools: [
          {
            type: 'p',
            text:
              'LLDB (ships with Xcode/macOS Command Line Tools), debugserver (device-side, deployed by Xcode\u2019s plumbing), and your i09 dumps for symbol/address targets. GUI alternative: Xcode\u2019s debugger UI drives the same engine — the CLI teaches the mechanics that the GUI hides.'
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Long stops on foreground apps triggering watchdog termination — keep stops short or stop on backgrounded flows',
              'Setting breakpoints by name across modules without scoping (symbol collisions from SDKs) — scope to your module or verify the hit is yours',
              'Confusing po/expression availability: Swift-only code evaluates through Swift\u2019s runtime (patchier than ObjC\u2019s) — memory/register views are the fallback',
              'Treating LLDB as a lesser Frida: it is a different instrument — continuous observation belongs to Frida; frozen-instant precision belongs here'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Run the four-step protocol on your training app. Then answer in one sentence: which of your queue entries is a watchpoint question rather than a hook question, and why? The instrument-choice reflex (next lesson formalizes it) is the skill being built.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
            'LLDB stops the world at exact points: break, backtrace, inspect, watch — precision over continuity',
            'Selector/symbol/address breakpoints + watchpoints cover the two question families: flow control and provenance',
            'po/expression evaluate against the live process — state questions answered at the decision moment',
            'get-task-allow gates the instrument: dev builds are LLDB\u2019s domain; scope statements follow'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'i12-l01-q1',
          type: 'mcq',
          prompt: 'Which question is best answered with a watchpoint rather than a breakpoint or hook?',
          options: [
            'What does this method return?',
            'Who writes this memory location, and when?',
            'What classes does the app load?',
            'What does the network send?'
          ],
          answerIndex: 1,
          hint: 'Which instrument fires on data change rather than code execution?',
          explanation:
            'Watchpoints fire when memory changes — provenance ("who wrote this flag") is their exclusive precision. Hooks can approximate by hooking candidate writers; the watchpoint removes the guessing.'
        },
        {
          id: 'i12-l01-q2',
          type: 'truefalse',
          prompt: 'Long LLDB stops on a foreground app are harmless — the app simply waits.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'What does the platform do to foreground apps that stop responding?',
          explanation:
            'False — watchdog termination watches for unresponsive foreground apps; long stops can get the app killed mid-session. Stop on background transitions or keep stops brief; session notes should mention the constraint.'
        },
        {
          id: 'i12-l01-q3',
          type: 'scenario',
          prompt:
            'At a validation breakpoint, po self shows a cached "isAdmin" flag set to true for a non-admin user. What does this evidence support, and what does it not?',
          hint: 'It proves a client-side state fact. What is still open about the server side?',
          explanation:
            'It supports: the client\u2019s decision at this instant runs on a cached flag inconsistent with the user\u2019s real role — a client-trust observation (i15 lead). It does NOT establish that admin functionality is actually accessible — that depends on server enforcement, shown by captures of the subsequent API behavior (the pairing rule again).'
        },
        {
          id: 'i12-l01-q4',
          type: 'mcq',
          prompt: 'Why scope breakpoints to your app\u2019s module when symbols collide?',
          options: [
            'LLDB refuses unscoped breakpoints',
            'SDKs and system frameworks may export identical symbol names — unscoped breakpoints stop in the wrong code and waste sessions',
            'Scoping improves speed only',
            'Unscoped breakpoints crash the debugger'
          ],
          answerIndex: 1,
          hint: 'Whose symbols also live in the process — and what happens when names match?',
          explanation:
            'The process hosts many modules with overlapping symbol names (statically linked SDK functions especially). Scoping ensures the stop is the code you analyzed — the same provenance discipline as artifact hashes, applied to instruction addresses.'
        }
      ],
      references: [
        {
          title: 'LLDB documentation (official)',
          url: 'https://lldb.llvm.org/',
          note: 'Command reference and tutorials for everything in this lesson'
        },
        {
          title: 'Apple Developer — Debugging your app (Xcode/LLDB integration)',
          url: 'https://developer.apple.com/documentation/xcode/debugging',
          note: 'The device plumbing behind platform connect'
        },
        {
          title: 'Apple Developer — ARM64 debugging and registers',
          url: 'https://developer.apple.com/documentation/xcode/writing-arm64-code-for-apple-platforms',
          note: 'Register semantics for the register-read workflow'
        }
      ]
    },
    {
      id: 'i12-l02',
      moduleId: 'i12',
      title: 'LLDB vs Frida: Choosing the Instrument',
      difficulty: 'Advanced',
      minutes: 18,
      prerequisites: ['i12-l01', 'i11-l05'],
      objectives: [
        'Articulate the two instruments\u2019 models (stop-the-world vs live scripting) precisely',
        'Choose per question type, and justify the choice in session notes',
        'Combine both in one engagement without muddling evidence classes'
      ],
      diagram: undefined,
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'By now you own two runtime instruments with different physics. LLDB freezes and interrogates; Frida scripts and observes continuously. Teams that treat them as interchangeable produce muddy sessions; teams that choose per question produce clean evidence chains. This short lesson makes the choice explicit — it is the capstone of the dynamic-analysis tier.'
          }
        ],
        technical: [
          { type: 'h', text: 'The models, precisely' },
          {
            type: 'table',
            headers: ['Dimension', 'LLDB', 'Frida'],
            rows: [
              ['Model', 'Stop the world at exact points', 'Inject a JS engine; script continuously'],
              ['Strength', 'State precision: memory, registers, expressions', 'Flow coverage: hooks, traces, manipulation at scale'],
              ['Cost per session', 'Setup + question-driven stops', 'Script writing; continuous runtime overhead'],
              ['Evidence class', 'Frozen-instant state (registers, objects, writes)', 'Execution traces and argument/return flows'],
              ['Requirement', 'get-task-allow (dev builds)', 'Server (jailbreak) or Gadget (re-signed build)'],
              ['Failure mode', 'Watchdog kills on long stops; wrong-module stops', 'Script errors crash targets; side-effect risk on modification']
            ]
          },
          { type: 'h', text: 'The choice per question type' },
          {
            type: 'list',
            items: [
              '"What does this object hold at decision X?" → LLDB (breakpoint + po) — frozen truth at the instant',
              '"Who writes this flag?" → LLDB watchpoint — provenance by fire-on-change',
              '"What flows through this method across many calls?" → Frida hook — continuous, scripted, parsable',
              '"Does changing this return change system behavior?" → Frida (forge + paired capture) — manipulation with system response',
              '"What calls this across the whole app?" → Frida trace (i11-l03) — breadth LLDB stops cannot economically provide',
              '"Exact instruction-level chain that reached here?" → LLDB backtrace at a well-chosen stop — precision no trace matches'
            ]
          },
          { type: 'h', text: 'Combining without muddling' },
          {
            type: 'p',
            text:
              'Real sessions alternate: Frida traces map a flow broadly; LLDB stops at the interesting instruction for state truth; back to Frida for the manipulation test. Evidence stays clean when each artifact is labeled with its instrument and model ("watchpoint hit — LLDB state evidence" vs "hook transcript — Frida flow evidence"), because reviewers weigh stop-instant and continuous-trace evidence differently. Mixing is not muddling; unlabeled mixing is.'
          }
        ],
        pentestRelevance: [
          {
            type: 'list',
            items: [
              'The instrument choice is a report line: session notes naming model + instrument pre-empt the "your tool changed the behavior" rebuttal class',
              'Question-type recognition is a speed skill: state/provenance → LLDB; flow/manipulation → Frida; mis-assignments waste hours',
              'Environment constraints interact: LLDB needs dev builds (no jailbreak path for store builds); Frida\u2019s gadget path covers dev builds on stock devices — the instrument matrix sits on module i07-l02\u2019s environment matrix',
              'The dynamic tier\u2019s evidence hierarchy (i10-l01) completes here: logs/files/captures → LLDB state → Frida flow → native precision'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Sessions fighting the model (Frida scripts trying to freeze state; LLDB sessions trying to trace flows) — redesign at the instrument level, not the script level',
              'Unlabeled artifacts whose instrument is ambiguous — label retroactively; the evidence bundle (i09-l04) must name models per artifact',
              'Question types misassigned at queue time — i10-l01\u2019s designs get an instrument column from now on',
              'Both instruments attached simultaneously to one process without coordination — debugger/instrumentation conflicts are real; sequence, do not stack'
            ]
          }
        ],
        howToTest: [
          {
            type: 'list',
            ordered: true,
            items: [
              'Take three queue entries and assign instruments by question type; write the one-line justification each',
              'Run one combined session: Frida trace to find the interesting moment → LLDB stop for state → back to Frida for the manipulation test, labeled per artifact',
              'Add the instrument column to your observation-design template (i10-l01) — permanent template change',
              'Write the instrument-choice note for the evidence bundle: which model produced which artifact class in this engagement'
            ]
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'One question, correctly split. "Does the app\u2019s retry loop reuse the expired token?" Frida trace on the token accessor: shows the accessor called four times during retry — flow truth. LLDB stop at the third call: po token shows the same stale string in memory — state truth. Frida forge (fresh-token return) + capture: retry succeeds with the new token — manipulation truth. Verdict: "Retry loop reuses the cached expired token (flow + state); accepts fresh tokens when provided (manipulation) — client-side cache invalidation defect, server tolerant." Three instruments-phases, three artifacts, one airtight finding — the choice discipline\u2019s whole value in one example.'
          }
        ],
        tools: [
          {
            type: 'p',
            text:
              'Both instruments you already own. The addition is procedural: instrument labels on artifacts, an instrument column in observation designs, and the sequence-not-stack rule for combined sessions.'
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Instrument religion ("Frida can do everything") — watchpoint provenance and frozen-state evaluation have no comfortable Frida equivalent',
              'Stacking both instruments on one process concurrently without sequencing — attach conflicts and corrupted state follow',
              'Forgetting the requirement matrix (LLDB = dev builds; Frida paths differ) when scheduling sessions — environment surprises mid-engagement',
              'Evidence without instrument labels — the reviewer\u2019s first question about any dynamic artifact is "with what, and in which model?"'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Run the combined session on your training app with strict labeling, then write the instrument-choice paragraph for your evidence bundle: two sentences naming which question families your current artifacts answer in which model. If any artifact is unlabeled, fix it now — the habit is the lesson.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
            'LLDB = stop-the-world state precision; Frida = live flow coverage and manipulation — different physics, different questions',
            'The choice per question type is learnable and fast: state/provenance → LLDB; flow/manipulation → Frida',
            'Sequence instruments in combined sessions; label every artifact with model and instrument',
            'The dynamic tier\u2019s evidence hierarchy is complete: cheap channels → state precision → flow coverage → native precision'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'i12-l02-q1',
          type: 'mcq',
          prompt: '"Across many login attempts, what does validateUser receive and return?" — which instrument fits?',
          options: [
            'LLDB breakpoints at each attempt',
            'Frida hook with a transcript across the flow',
            'Memory watchpoint on the return value',
            'Static analysis only'
          ],
          answerIndex: 1,
          hint: 'Continuous coverage across many calls — which model is built for that?',
          explanation:
            'Flow questions across many invocations are Frida\u2019s home turf: one hook, parsable transcript, continuous coverage. LLDB stops would need manual repeats and produce no flow record.'
        },
        {
          id: 'i12-l02-q2',
          type: 'truefalse',
          prompt: 'Attaching Frida and LLDB to the same process simultaneously is the recommended way to combine their strengths.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'What does the lesson say about combining — sequence or stack?',
          explanation:
            'False — sequence, do not stack. Both instruments control the same process; concurrent attachment risks conflicts and corrupted state. The pattern is: Frida maps broadly, LLDB stops precisely at the found moment, Frida returns for manipulation.'
        },
        {
          id: 'i12-l02-q3',
          type: 'scenario',
          prompt:
            'Queue entry: "does the retry loop reuse the expired token?" Design the split across instruments with artifacts named.',
          hint: 'Flow truth, state truth, manipulation truth — which instrument delivers each?',
          explanation:
            'Frida hook on the token accessor (artifact: transcript showing call pattern across retries) → LLDB stop at a retry call (artifact: po token showing the stale string) → Frida forge of a fresh token + capture (artifact: wire response showing acceptance). Verdict combines all three — the lesson\u2019s worked example, now your template.'
        },
        {
          id: 'i12-l02-q4',
          type: 'mcq',
          prompt: 'Why must artifacts record their instrument and model?',
          options: [
            'Tool vendors require it',
            'Reviewers weigh evidence differently by model — frozen-instant state and continuous trace have different failure modes and rebuttals',
            'It makes reports longer',
            'Models change the underlying data'
          ],
          answerIndex: 1,
          hint: 'What is the rebuttal class for a stop-instant observation vs a continuous trace?',
          explanation:
            'State evidence invites "a snapshot lies by timing"; trace evidence invites "your hook changed behavior". Labeling tells the reviewer which rebuttal space applies — honest labeling pre-empts rather than survives the attack.'
        }
      ],
      references: [
        {
          title: 'LLDB documentation',
          url: 'https://lldb.llvm.org/',
          note: 'The stop-the-world instrument\u2019s reference'
        },
        {
          title: 'Frida documentation',
          url: 'https://frida.re/docs/home/',
          note: 'The live-scripting instrument\u2019s reference'
        },
        {
          title: 'OWASP MASTG — iOS dynamic analysis tooling',
          url: 'https://mas.owasp.org/MASTG/iOS/',
          note: 'Both instruments\u2019 roles in the guide\u2019s methodology'
        }
      ]
    }
  ]
};
