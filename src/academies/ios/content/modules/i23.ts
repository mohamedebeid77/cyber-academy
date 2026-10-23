import type { Module } from '../../../../types';

// LEVEL 9 — STANDARDS & PRO PRACTICE · Module i23: MASTG / MASVS / MASWE Mapping
// Original content synthesizing the OWASP Mobile Application Security project's
// structure (MASVS v2 categories, MASTG test/technique organization, MASWE
// catalog). Identifier discipline: stable category-level ids only; numeric test
// ids are left to the live MASTG site (current-version rule).

export const i23: Module = {
  id: 'i23',
  title: 'MASTG / MASVS / MASWE Mapping',
  level: 9,
  description:
    'The OWASP Mobile Application Security framework as a working tool: what MASVS, MASTG and MASWE each are, how this academy\u2019s curriculum maps onto their categories, and how to use the mapping in reports — with identifier discipline (current-version names, no stale ids).',
  outcomes: [
    'Explain the three artifacts\u2019 roles and how they interlock',
    'Map this academy\u2019s modules onto MASVS v2 categories and MASTG test families',
    'Use the standard in reports: coverage claims, finding citations, version-current references'
  ],
  lessons: [
    {
      id: 'i23-l01',
      moduleId: 'i23',
      title: 'The OWASP MAS Framework: Three Artifacts, One System',
      difficulty: 'Beginner',
      minutes: 18,
      prerequisites: [],
      objectives: [
        'Distinguish MASVS (requirements), MASTG (testing guide) and MASWE (weakness catalog)',
        'Explain how the three interlock in real assessments',
        'Apply the identifier discipline: current versions, stable ids, no stale numbers'
      ],
      diagram: 'ios-masvs-map',
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'The OWASP Mobile Application Security project gives mobile testing its shared language: MASVS defines WHAT good looks like (requirements), MASTG teaches HOW to test it (techniques and tests), MASWE catalogs the named weaknesses (the taxonomy of failures). This academy\u2019s curriculum was built against that system — this module makes the mapping explicit and turns the framework from background into tool.'
          }
        ],
        technical: [
          {
            type: 'diagram',
            id: 'ios-masvs-map',
            caption: 'Interactive: the eight MASVS v2 categories and what a pentester checks in each.'
          },
          { type: 'h', text: 'The three artifacts' },
          {
            type: 'list',
            items: [
              'MASVS (Mobile Application Security Verification Standard): requirement categories — STORAGE, CRYPTO, AUTH, NETWORK, PLATFORM, CODE, RESILIENCE, PRIVACY — with stable category-level ids (MASVS-STORAGE-1 …) that define verification levels',
              'MASTG (Mobile Application Security Testing Guide): the how — techniques (platform-specific methods) and tests (verifiable procedures) per category, for Android and iOS',
              'MASWE (Mobile Application Security Weaknesses): the catalog of named weaknesses mapped to MASVS categories — the vocabulary findings cite',
              'The interlock: a MASTG test verifies a MASVS requirement; its failure is a MASWE weakness; your finding cites all three layers'
            ]
          },
          { type: 'h', text: 'The identifier discipline' },
          {
            type: 'list',
            items: [
              'MASVS category ids are stable (v2 numbering: MASVS-STORAGE-1 etc.) — safe to cite',
              'MASTG test/technique numeric ids evolved across versions (v1\u2019s 0x-style ids renumbered in v2\u2019s MASTG-TEST-00xx scheme) — cite by NAME and category, and link to the live site rather than printing numbers you cannot guarantee',
              'MASWE ids are the catalog\u2019s own numbering — cite them from the live site\u2019s current state',
              'The rule this academy follows everywhere: name the test, link the current URL, never freeze a number the project may renumber — your reports inherit the same discipline'
            ]
          },
          { type: 'h', text: 'The framework as a working tool' },
          {
            type: 'list',
            items: [
              'Coverage spine: the eight categories structure your test plan (module i08-l04\u2019s audit domains map onto them directly)',
              'Finding vocabulary: MASWE names give findings a shared language reviewers and remediation teams recognize',
              'Verification depth: MASVS levels (L1/L2 + R) frame coverage conversations with clients (which level are we verifying?)',
              'Report structure: category-organized sections with per-category MASTG references — the professional shape module i24 formalizes'
            ]
          }
        ],
        pentestRelevance: [
          {
            type: 'list',
            items: [
              'The framework is the engagement\u2019s checklist source — module i08-l04\u2019s four domains were MASVS-PLATFORM/NETWORK/STORAGE/CRYPTO in disguise',
              'Finding citations gain authority: a weakness named in MASWE with a MASTG test reference is hard to dispute',
              'Coverage claims become verifiable: "all MASVS-STORAGE tests executed" is checkable against the live guide',
              'Version currency is a credibility marker: stale ids (v1 MASTG numbers) signal stale methodology'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Older reports (yours or templates) citing v1-era MASTG ids — update the citation habit, not just the numbers',
              'Client RFPs naming MASVS levels — scope conversations start there (L1 vs L2 changes the test depth)',
              'MASWE entries matching your findings (the catalog search per finding — the citation\u2019s last layer)',
              'Gaps between your test plan and the category list — the framework\u2019s coverage check, run on yourself'
            ]
          }
        ],
        howToTest: [
          {
            type: 'list',
            ordered: true,
            items: [
              'Build the mapping table: this academy\u2019s 24 modules → MASVS categories → MASTG test families (by name, linked current)',
              'Take your three strongest findings from the labs and find each one\u2019s MASWE entry — practice the citation chain (finding → weakness → category → test)',
              'Write one finding citation in the full form: description, MASWE reference, MASTG test family (named), MASVS category',
              'Run the coverage check on your own evidence bundle: which categories have artifacts, which are thin?'
            ]
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'The citation chain, assembled. Finding (module i13-l02\u2019s refresh token in preferences). MASWE: the weakness catalog\u2019s storage entries cover sensitive data in unprotected local storage (live site names the current id). MASTG: the iOS data-storage test family (named, linked). MASVS: MASVS-STORAGE-1/2 (stable ids). The citation reads: "Sensitive data stored unencrypted (MASWE-[current], MASVS-STORAGE-2; MASTG iOS data-storage tests). Finding: 30-day refresh token in plaintext preferences (module artifacts)." Four layers, one sentence, review-proof — the framework working as a tool.'
          }
        ],
        tools: [
          {
            type: 'p',
            text:
              'The three live sites (mas.owasp.org\u2019s MASVS/MASTG/MASWE) — bookmarked, not mirrored: the version-currency rule lives in the links. Your mapping table (document) and the evidence bundle (the coverage check\u2019s input).'
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Printing MASTG numeric test ids from memory or old documents — the renumbering trap; cite names and live links',
              'Treating MASVS levels as decoration — L1/L2 scope conversations change test depth and pricing; use them',
              'Citing the framework without artifacts (coverage claims your evidence bundle cannot back) — the coverage check exists to prevent it',
              'Mixing platform content: the iOS MASTG chapters are this academy\u2019s mapping source — Android tests live in their own academy'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Produce the mapping table (24 modules → categories → test families) and the three finding citations in full form. Then run the coverage check on your own bundle and name the thinnest category — that category is your capstone\u2019s revision priority (module i24).'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
            'MASVS = requirements (stable category ids); MASTG = how (techniques/tests); MASWE = named weaknesses — one interlocking system',
            'Identifier discipline: stable category ids, current-version names, live links — never frozen numbers',
            'The framework is a tool: coverage spine, finding vocabulary, verification depth, report structure',
            'The citation chain (finding → MASWE → MASTG → MASVS) is the professional finding\u2019s full form'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'i23-l01-q1',
          type: 'mcq',
          prompt: 'Which artifact defines WHAT good looks like (requirements)?',
          options: ['MASTG', 'MASVS', 'MASWE', 'OWASP ASVS (web)'],
          answerIndex: 1,
          hint: 'Which one is the Verification Standard?',
          explanation:
            'MASVS is the verification standard: requirement categories and levels. MASTG teaches testing (how), MASWE catalogs weaknesses (failures). ASVS is the web sibling — different project.'
        },
        {
          id: 'i23-l01-q2',
          type: 'truefalse',
          prompt: 'It is safe to cite MASTG numeric test ids (e.g. MASTG-TEST-0x53) from memory in reports.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'What did the identifier discipline say about the test-id scheme across versions?',
          explanation:
            'False — MASTG renumbered tests between versions (v1\u2019s 0x-style to v2\u2019s MASTG-TEST-00xx). Cite test NAMES, categories and live links; print numbers only from the current site, verified. The discipline applies to this academy\u2019s content too — you may notice this curriculum follows it.'
        },
        {
          id: 'i23-l01-q3',
          type: 'scenario',
          prompt:
            'A client RFP asks for "MASVS L2 + R verification" of their iOS app. What does that scope conversation cover?',
          hint: 'What do the level and the R suffix mean — and how do they change depth and pricing?',
          explanation:
            'L2 = the deeper verification level (more requirements: defense-in-depth expectations); R = resilience requirements (anti-tamper/anti-analysis — module i21\u2019s domain). The conversation: which tests the level implies (more than L1 across categories), the resilience work\u2019s scope (bypass evaluation on authorized targets), timeline/pricing impact, and the environment constraints (module i20\u2019s boundary). The framework turns scope into specifics.'
        },
        {
          id: 'i23-l01-q4',
          type: 'mcq',
          prompt: 'What does the coverage check (your evidence bundle vs the category list) actually measure?',
          options: [
            'Report length',
            'Which MASVS categories your artifacts actually evidence — and which are thin — i.e., honest coverage of the standard',
            'The number of findings',
            'Client satisfaction'
          ],
          answerIndex: 1,
          hint: 'What makes a coverage claim verifiable rather than decorative?',
          explanation:
            'Artifacts per category: capture counts, hook transcripts, container analyses. The check turns "we tested storage" into "here are the storage artifacts" — verifiable coverage, the standard\u2019s whole point as a tool.'
        }
      ],
      references: [
        {
          title: 'OWASP MASVS v2',
          url: 'https://mas.owasp.org/MASVS/',
          note: 'The requirement categories and levels (stable ids)'
        },
        {
          title: 'OWASP MASTG (current version)',
          url: 'https://mas.owasp.org/MASTG/',
          note: 'The testing guide — cite by name, link live'
        },
        {
          title: 'OWASP MASWE (weakness catalog)',
          url: 'https://mas.owasp.org/MASWE/',
          note: 'The named weaknesses — the citation chain\u2019s middle layer'
        }
      ]
    },
    {
      id: 'i23-l02',
      moduleId: 'i23',
      title: 'The Academy-to-Standard Map',
      difficulty: 'Intermediate',
      minutes: 18,
      prerequisites: ['i23-l01'],
      objectives: [
        'Own the complete mapping: modules → categories → test families → labs',
        'Use the map for revision planning and coverage argumentation',
        'Recognize the standard as the capstone\u2019s organizing skeleton'
      ],
      diagram: 'ios-masvs-map',
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'This academy\u2019s 24 modules were built against the MAS framework; the map makes it explicit — every module\u2019s category, every category\u2019s test families, every lab\u2019s coverage. The map is three tools in one: a revision plan (thin categories name what to revisit), a coverage argument (the report\u2019s methodology skeleton), and the capstone\u2019s organizing principle (module i24\u2019s 22 phases walk the categories).'
          }
        ],
        technical: [
          { type: 'h', text: 'The map' },
          {
            type: 'table',
            headers: ['MASVS category', 'This academy\u2019s modules', 'MASTG iOS families (named)', 'Labs/CTF coverage'],
            rows: [
              ['STORAGE', 'i02, i05, i13', 'Data storage, Keychain, backup, logs', 'L1, L2, L5; C1, C4'],
              ['CRYPTO', 'i18, i05-l02', 'Cryptography, key management', 'L6; C5'],
              ['AUTH', 'i15, i14-l04', 'Local auth, session handling', 'L4, L7; C6'],
              ['NETWORK', 'i14, i07-l03', 'TLS/ATS, interception, pinning', 'L3, L4; C7'],
              ['PLATFORM', 'i16, i17, i04', 'URL schemes, universal links, WebViews, extensions', 'L8; C8'],
              ['CODE', 'i03, i08, i09, i17', 'Code quality, secrets, injection', 'L1, L2; C2, C3'],
              ['RESILIENCE', 'i20, i21, i22, i11', 'Anti-analysis, tampering, obfuscation', 'L8; C1, C8'],
              ['PRIVACY', 'i05-l03, i13-l04', 'Privacy data flows, consent handling', 'L5; C3']
            ]
          },
          { type: 'h', text: 'Three uses of the map' },
          {
            type: 'list',
            items: [
              'Revision planning: your i23-l01 coverage check\u2019s thinnest category names its modules — revisit with the Try-It exercises as the test',
              'Coverage argumentation: the report\u2019s methodology section walks the table (category → tests executed → artifacts) — module i24\u2019s format, data supplied here',
              'Capstone skeleton: the guided assessment\u2019s phases traverse the categories in engagement order — the map is the route',
              'Mastery self-test: for any row, name its modules\u2019 three strongest Try-It exercises — if you cannot, that row is your revision queue'
            ]
          }
        ],
        pentestRelevance: [
          {
            type: 'list',
            items: [
              'The map is the bridge between learning and practice: engagements organize by the same categories you studied',
              'Coverage arguments in reports cite the map\u2019s structure — the standard\u2019s authority, your artifacts\u2019 specificity',
              'Revision via the map targets weaknesses without re-reading everything — the thin-category discipline',
              'The capstone (i24) assumes this module\u2019s map as its skeleton — complete it there or re-derive it under time pressure'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Rows where your artifacts are thin (the honest coverage check\u2019s output — revision priorities)',
              'Test families you have read about but never executed (the Try-It gaps)',
              'Cross-row connections worth citing (resilience × network via pinning; privacy × storage via egress consistency)',
              'The two PLATFORM rows\u2019 breadth (i16/i17/i04) — the surface family\u2019s size justifies its module count'
            ]
          }
        ],
        howToTest: [
          {
            type: 'list',
            ordered: true,
            items: [
              'Copy the map; annotate each row with your own artifact counts from the evidence bundle',
              'Pick the thinnest row; execute its modules\u2019 Try-It exercises you skipped (the revision, done properly)',
              'Write the coverage paragraph for one row in report form (category → tests → artifacts) — rehearsal for i24',
              'Name two cross-row findings from your own work (the integration citations) — or find one now'
            ]
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'A row\u2019s coverage paragraph, report-form. "MASVS-STORAGE: verification performed per MASTG iOS data-storage, keychain and backup test families. Artifacts: 3 container diff pairs (login/feature/logout), keychain decision records (SecItem hook transcripts, 2 sessions), backup parse (unencrypted mode), snapshot and notification visual tests. Findings: 2 (token persistence, PII caching); verified-clean: cookie hygiene, backup exclusion correctness. MASVS-STORAGE-1/2 requirements assessed with current-version references (live-linked)." The paragraph is the module\u2019s deliverable at row scale — the capstone writes eight of them.'
          }
        ],
        tools: [
          {
            type: 'p',
            text:
              'The mapping table (your annotated copy), the live MAS sites (the rows\u2019 links), and the evidence bundle (the artifact counts). The map is a document — its value is the annotation you add.'
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Treating the map as trivia to memorize — it is a working document annotated with your own artifacts',
              'Skipping the thin-row revision (the check\u2019s output ignored — the capstone will surface the gap under pressure)',
              'Coverage paragraphs without artifact counts (the verifiability rule from i23-l01)',
              'Forgetting cross-row citations — the integration findings are where reports stop being lists'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Annotate the full map with artifact counts, execute one thin-row revision, and write one row\u2019s coverage paragraph in report form. Then answer the mastery self-test on two rows of your choosing. The annotated map joins your evidence bundle — it is the bridge document into the capstone.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
            'The map: 8 categories × modules × test families × labs — your curriculum\u2019s structure in the standard\u2019s language',
            'Three uses: revision planning, coverage argumentation, capstone skeleton — plus the mastery self-test',
            'Coverage paragraphs at row scale (category → tests → artifacts → findings) are the capstone\u2019s unit of work',
            'Cross-row citations (resilience × network × privacy) are where integration findings live'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'i23-l02-q1',
          type: 'mcq',
          prompt: 'Which modules map primarily to MASVS-PLATFORM?',
          options: ['i13, i14', 'i16, i17, i04', 'i18, i21', 'i23, i24'],
          answerIndex: 1,
          hint: 'Which category owns URL schemes, universal links, WebViews and extensions?',
          explanation:
            'PLATFORM owns the platform-API surfaces: the attack-surface module (i16), WebViews (i17), and the bundle/Info.plist foundations (i04). The map\u2019s breadth here justifies the module count — the surface family is large.'
        },
        {
          id: 'i23-l02-q2',
          type: 'truefalse',
          prompt: 'The pinning evaluation (module i14-l03) cites only MASVS-NETWORK — resilience has nothing to do with it.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'Which two rows does the cross-row citation connect — and what does pinning resist?',
          explanation:
            'False — pinning is a NETWORK control AND a resilience control (it resists interception tooling — the RESILIENCE row\u2019s anti-interception dimension). Cross-row citations like this are the integration findings i23-l01/l02 taught you to write.'
        },
        {
          id: 'i23-l02-q3',
          type: 'scenario',
          prompt:
            'Your coverage check shows PRIVACY as the thinnest row. What is the revision plan?',
          hint: 'Which modules own the row — and which Try-It exercises were skipped?',
          explanation:
            'PRIVACY\u2019s modules: i05-l03 (TCC matrix) and i13-l04 (backup/pasteboard/notification channels). Plan: execute the four-state permission matrix and the egress-consistency paragraph you skipped, artifact them, then rewrite the row\u2019s coverage paragraph. The thin-row revision is specific and bounded — that is why the check exists.'
        },
        {
          id: 'i23-l02-q4',
          type: 'mcq',
          prompt: 'What makes the annotated map the bridge document into module i24\u2019s capstone?',
          options: [
            'It is the longest document',
            'It supplies the capstone\u2019s skeleton (categories as report sections), the coverage data (artifact counts), and the revision state — the methodology section drafts from it',
            'It replaces the report',
            'It lists the tools'
          ],
          answerIndex: 1,
          hint: 'What does the capstone\u2019s methodology section need that the map already holds?',
          explanation:
            'The capstone walks the categories as engagement phases (the map\u2019s rows) and cites coverage (the map\u2019s annotations). Arrive with the annotated map and the capstone is assembly; arrive without it and you rebuild it under time pressure.'
        }
      ],
      references: [
        {
          title: 'OWASP MASTG — iOS tests (the families in the map\u2019s rows)',
          url: 'https://mas.owasp.org/MASTG/iOS/',
          note: 'The row links, live and current'
        },
        {
          title: 'OWASP MASVS v2 — categories and levels',
          url: 'https://mas.owasp.org/MASVS/',
          note: 'The rows\u2019 requirement backing'
        },
        {
          title: 'OWASP Mobile Application Security (project home)',
          url: 'https://mas.owasp.org/',
          note: 'The project\u2019s entry point — the three artifacts\u2019 home'
        }
      ]
    }
  ]
};
