import type { CheatSheet } from '../types';

// Original command cheat sheets. Entries are copy-friendly; the UI adds a
// copy button per row.

export const cheatsheets: CheatSheet[] = [
  {
    id: 'cs-adb',
    title: 'ADB Cheat Sheet',
    description: 'The daily-driver adb commands for device control, package inspection, logs and data access.',
    category: 'Tools',
    entries: [
      { cmd: 'adb devices -l', desc: 'List connected devices/emulators' },
      { cmd: 'adb install -t target.apk', desc: 'Install APK (allow test packages)' },
      { cmd: 'adb uninstall com.example.app', desc: 'Remove an app' },
      { cmd: 'adb shell pm list packages -3', desc: 'List third-party packages' },
      { cmd: 'adb shell pm path com.example.app', desc: 'Locate the installed APK' },
      { cmd: 'adb pull /data/app/.../base.apk .', desc: 'Extract the APK for analysis' },
      { cmd: 'adb shell dumpsys package com.example.app', desc: 'Permissions, components, signatures' },
      { cmd: 'adb shell pm grant pkg android.permission.CAMERA', desc: 'Grant a runtime permission' },
      { cmd: 'adb shell pm revoke pkg android.permission.CAMERA', desc: 'Revoke for denial-path testing' },
      { cmd: 'adb logcat -c', desc: 'Clear the log buffer' },
      { cmd: 'adb logcat --pid=$(adb shell pidof pkg)', desc: 'Scoped live log for one process' },
      { cmd: 'adb logcat -d | grep -iE "token|pass|secret"', desc: 'Hunt sensitive strings in logs' },
      { cmd: 'adb shell am start -n pkg/.MainActivity', desc: 'Start an activity explicitly' },
      { cmd: 'adb shell am start -a android.intent.action.VIEW -d "scheme://path"', desc: 'Fire a deep link' },
      { cmd: 'adb shell am broadcast -a pkg.ACTION --es key value', desc: 'Send a broadcast with extras' },
      { cmd: 'adb shell content query --uri content://pkg.provider/table', desc: 'Query a content provider' },
      { cmd: 'adb shell run-as pkg ls shared_prefs/', desc: 'App-private files (debuggable builds)' },
      { cmd: 'adb shell run-as pkg cat shared_prefs/user.xml', desc: 'Read plaintext prefs' },
      { cmd: 'adb shell screencap /sdcard/s.png && adb pull /sdcard/s.png', desc: 'Screenshot evidence' },
      { cmd: 'adb forward tcp:27042 tcp:27042', desc: 'Tunnel for frida-server' },
      { cmd: 'adb shell getprop ro.build.version.release', desc: 'OS version of the target' },
      { cmd: 'adb shell getprop ro.debuggable', desc: 'Is this build debuggable (1 = yes)' }
    ]
  },
  {
    id: 'cs-jadx',
    title: 'JADX Cheat Sheet',
    description: 'Decompile, navigate and search decompiled Java effectively.',
    category: 'Tools',
    entries: [
      { cmd: 'jadx-gui app.apk', desc: 'Open APK in the GUI' },
      { cmd: 'jadx -d out/ app.apk', desc: 'Decompile to disk' },
      { cmd: 'jadx --deobf -d out/ app.apk', desc: 'Rename obfuscated identifiers' },
      { cmd: 'jadx --show-bad-code -d out/ app.apk', desc: 'Keep partially-decompiled methods' },
      { cmd: 'jadx -j 8 -d out/ app.apk', desc: 'More decompile threads (big apps)' },
      { cmd: 'Ctrl+Shift+F', desc: 'Full-text search (code + resources)' },
      { cmd: 'Ctrl+N', desc: 'Go to class by name' },
      { cmd: 'Ctrl+click', desc: 'Jump to declaration' },
      { cmd: 'Right-click → Find Usage', desc: 'All references to a method/field' },
      { cmd: 'File → Save as Gradle project', desc: 'Export a browsable project' },
      { cmd: 'grep -rn "SecretKey" out/sources/', desc: 'Grep the exported sources' },
      { cmd: 'Tools → Deobfuscation options', desc: 'Tune rename/packaging heuristics' }
    ]
  },
  {
    id: 'cs-apktool',
    title: 'apktool Cheat Sheet',
    description: 'Decode, edit and rebuild APK resources and Smali.',
    category: 'Tools',
    entries: [
      { cmd: 'apktool d app.apk', desc: 'Decode resources + Smali' },
      { cmd: 'apktool d -s app.apk', desc: 'Resources only (keep dex raw)' },
      { cmd: 'apktool d -r app.apk', desc: 'Smali only (keep resources raw)' },
      { cmd: 'apktool b app/ -o patched.apk', desc: 'Rebuild into an APK' },
      { cmd: 'apktool d --only-main-classes app.apk', desc: 'Fast decode of large multidex apps' },
      { cmd: 'apktool d --use-aapt2 app.apk', desc: 'Force AAPT2 resource processing' },
      { cmd: 'cat app/AndroidManifest.xml', desc: 'Manifest as readable XML' },
      { cmd: 'ls app/smali/com/example/', desc: 'Browse Smali packages' },
      { cmd: 'grep -rn "const-string" app/smali/ | grep -i http', desc: 'Find URL strings in bytecode' },
      { cmd: 'zipalign -p 4 patched.apk aligned.apk', desc: 'Align before signing' },
      { cmd: 'apksigner sign --ks test.keystore patched.apk', desc: 'Re-sign after rebuild' },
      { cmd: 'adb install -t patched.apk', desc: 'Install the patched build' }
    ]
  },
  {
    id: 'cs-frida',
    title: 'Frida Cheat Sheet',
    description: 'CLI essentials plus the hook patterns you reuse in every engagement.',
    category: 'Tools',
    entries: [
      { cmd: 'pip install frida-tools', desc: 'Install host tools' },
      { cmd: 'adb push frida-server /data/local/tmp/ && adb shell chmod 755 /data/local/tmp/frida-server', desc: 'Deploy server' },
      { cmd: 'adb shell "/data/local/tmp/frida-server &"', desc: 'Run server on device' },
      { cmd: 'frida-ps -U', desc: 'List processes (USB/emulator)' },
      { cmd: 'frida-ps -Ua', desc: 'List running applications' },
      { cmd: 'frida -U -f com.example.app -l hook.js', desc: 'Spawn with script' },
      { cmd: 'frida -U com.example.app', desc: 'Attach to running app (REPL)' },
      { cmd: 'frida-trace -U -f com.example.app -j "com.example.*!*"', desc: 'Trace Java methods by pattern' },
      { cmd: 'Java.perform(function(){ ... })', desc: 'Wrap all Java hooks' },
      { cmd: 'Java.use("com.example.Cls").method.implementation = function(a){ return this.method(a); }', desc: 'Hook + delegate to original' },
      { cmd: 'send("msg") / console.log()', desc: 'Emit output from the agent' },
      { cmd: 'Interceptor.attach(Module.getExportByName(null, "open"), { onEnter(args){...} })', desc: 'Hook a native function' },
      { cmd: 'adb forward tcp:27042 tcp:27042', desc: 'Use TCP if USB device list fails' }
    ]
  },
  {
    id: 'cs-objection',
    title: 'Objection Cheat Sheet',
    description: 'Runtime exploration REPL commands — no scripting required.',
    category: 'Tools',
    entries: [
      { cmd: 'pip install objection', desc: 'Install' },
      { cmd: 'objection patchapk -s app.apk', desc: 'Embed Frida gadget (no root needed)' },
      { cmd: 'objection explore', desc: 'Start REPL on the current app' },
      { cmd: 'android hooking list activities', desc: 'Enumerate activities' },
      { cmd: 'android hooking list services', desc: 'Enumerate services' },
      { cmd: 'android hooking list classes', desc: 'All loaded classes' },
      { cmd: 'android hooking search_classes keyword', desc: 'Find classes by name' },
      { cmd: 'android hooking watch class com.example.Foo', desc: 'Trace every method of a class' },
      { cmd: 'android hooking watch class_method com.example.Foo.bar --dump-args --dump-return', desc: 'Watch one method with I/O' },
      { cmd: 'android storage list', desc: 'Storage locations the app can use' },
      { cmd: 'android intent launch_activity com.example.Secret', desc: 'Start any activity' },
      { cmd: 'android keystore list', desc: 'Keystore entries' },
      { cmd: 'memory list modules', desc: 'Loaded native modules' }
    ]
  },
  {
    id: 'cs-manifest',
    title: 'AndroidManifest Cheat Sheet',
    description: 'The attributes and flags that matter during a security review.',
    category: 'App structure',
    entries: [
      { cmd: 'android:exported="true"', desc: 'Component callable by other apps/adb — audit it' },
      { cmd: 'android:exported="false"', desc: 'Private (still reachable via same-UID/adb edge cases)' },
      { cmd: 'android:debuggable="true"', desc: 'Full debugger/run-as access — never ship' },
      { cmd: 'android:allowBackup="true"', desc: 'Private data included in backup/restore' },
      { cmd: 'android:networkSecurityConfig="@xml/nsc"', desc: 'Points to the network security config' },
      { cmd: 'android:usesCleartextTraffic="true"', desc: 'Permits plaintext HTTP globally' },
      { cmd: 'android:permission="com.example.PERM"', desc: 'Custom permission guarding a component' },
      { cmd: 'android:protectionLevel="signature"', desc: 'Only same-signature apps can hold the permission' },
      { cmd: 'android:launchMode="singleTask"', desc: 'Task re-use — check taskAffinity tricks' },
      { cmd: 'android:taskAffinity=""', desc: 'Empty affinity hardens against task hijack' },
      { cmd: 'android:grantUriPermissions="true"', desc: 'Provider content can be granted to others' },
      { cmd: 'android:filterTouchesWhenObscured="true"', desc: 'Mitigates tapjacking on a view' },
      { cmd: 'android:sharedUserId="com.example.uid"', desc: 'Merges two apps into one sandbox (legacy)' },
      { cmd: 'android:minSdkVersion', desc: 'Old floors = weaker platform defaults' },
      { cmd: 'android:targetSdkVersion', desc: 'Drives which platform behaviors apply' }
    ]
  },
  {
    id: 'cs-smali',
    title: 'Smali Cheat Sheet',
    description: 'Read (and lightly write) Dalvik bytecode: registers, types and invokes.',
    category: 'App structure',
    entries: [
      { cmd: 'v0..vN / p0..pN', desc: 'Local registers / method parameters (p0 = this)' },
      { cmd: 'Lpackage/Class;', desc: 'JVM-style type descriptor for a class' },
      { cmd: 'invoke-virtual {p0, p1}, Lpkg/Cls;->bar(Ljava/lang/String;)V', desc: 'Call a virtual method' },
      { cmd: 'invoke-static {p1}, Lpkg/Util;->check(I)Z', desc: 'Call a static method' },
      { cmd: 'invoke-direct {p0}, Lpkg/Cls;-><init>()V', desc: 'Constructor call' },
      { cmd: 'iget-object v0, p0, Lpkg/Cls;->field:Ljava/lang/String;', desc: 'Read an instance field' },
      { cmd: 'iput-object v0, p0, Lpkg/Cls;->field:Ljava/lang/String;', desc: 'Write an instance field' },
      { cmd: 'const-string v0, "hello"', desc: 'Load a string constant' },
      { cmd: 'const/4 v0, 0x1', desc: 'Load a small integer (true = 1)' },
      { cmd: 'if-eqz v0, :cond_false', desc: 'Branch if zero (false/null)' },
      { cmd: 'return-object v0', desc: 'Return a reference' },
      { cmd: '.method public check(I)Z ... .end method', desc: 'Method block boundaries' }
    ]
  },
  {
    id: 'cs-checklist',
    title: 'Android Pentesting Checklist',
    description: 'Condensed end-to-end methodology — what to do and what to record at each phase.',
    category: 'Methodology',
    entries: [
      { cmd: '1. Recon: enumerate app entry points (store listing, deep links, docs)', desc: 'Note versions, permissions requested, backend domains' },
      { cmd: '2. Understand the app: map features, user roles, data flows', desc: 'List what "sensitive" means for this app' },
      { cmd: '3. Acquire the APK: pm path + pull, or your own build', desc: 'Record exact version/commit under test' },
      { cmd: '4. Static triage: MobSF + manifest review', desc: 'Flag debuggable/backup/exported/cleartext' },
      { cmd: '5. Decompile with JADX and read entry components', desc: 'Save sources; grep for secrets and endpoints' },
      { cmd: '6. Hunt secrets: keys, tokens, URLs, PII in resources', desc: 'Verify each finding is not a test placeholder' },
      { cmd: '7. Audit exported components + intent handling', desc: 'For each: who can call it, with what data' },
      { cmd: '8. Audit WebViews and deep links', desc: 'JS bridges, file access, URL validation' },
      { cmd: '9. Dynamic setup: emulator, proxy, CA, logcat', desc: 'Snapshot the emulator before testing' },
      { cmd: '10. Data storage audit: prefs, DBs, external, logs, backups', desc: 'Screenshot each plaintext secret found' },
      { cmd: '11. Crypto review: algorithms, keys, IVs, hashing', desc: 'Note static keys and weak primitives' },
      { cmd: '12. Network: intercept traffic, map API endpoints', desc: 'Save flows (HAR/Burp state) as evidence' },
      { cmd: '13. API testing: auth, tokens, BOLA, business logic', desc: 'Two-account testing for object access' },
      { cmd: '14. Runtime: Frida/objection — verify hypotheses', desc: 'Record hooked methods and observed behavior' },
      { cmd: '15. Resilience: root/anti-tamper evaluation (if in scope)', desc: 'Measure whether defenses raise real cost' },
      { cmd: '16. Documentation: findings with repro steps + severity', desc: 'Map each finding to MASVS/MASWE' },
      { cmd: '17. Report + retest', desc: 'Executive summary first; retest after fixes' }
    ]
  },
  {
    id: 'cs-burp-android',
    title: 'Burp + Android Checklist',
    description: 'Step-by-step: get an emulator\u2019s app traffic flowing through Burp.',
    category: 'Methodology',
    entries: [
      { cmd: '1. Proxy → Options → Add listener 8080 (All interfaces)', desc: 'Burp accepts LAN traffic' },
      { cmd: '2. Host IP: ipconfig / ifconfig', desc: 'Find your workstation IP' },
      { cmd: '3. Emulator Wi-Fi → modify network → manual proxy', desc: 'Set <host-ip>:8080' },
      { cmd: '4. Emulator browser → http://burp', desc: 'Download the CA certificate' },
      { cmd: '5. Install CA (user credentials)', desc: 'Works for apps trusting user CAs' },
      { cmd: '6. If app targets API 24+: move CA to system store (rooted emulator)', desc: 'Android 7+ ignores user CAs by default' },
      { cmd: '7. Or rely on the app\u2019s debug-overrides NSC', desc: 'Some debug builds trust user CAs' },
      { cmd: '8. Exercise the app fully', desc: 'Login, every feature, offline/online' },
      { cmd: '9. Review HTTP history + site map', desc: 'Note endpoints, tokens, unusual headers' },
      { cmd: '10. Repeater: replay modified requests', desc: 'Confirm findings server-side' },
      { cmd: '11. Save state / export evidence', desc: 'Screenshots + request/response pairs' },
      { cmd: '12. If nothing flows: check pinning, NSC, proxy reachability', desc: 'adb shell settings can verify proxy state' }
    ]
  }
];
