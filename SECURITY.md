# Security Policy

## Supported versions

Security fixes are applied to the latest published `0.1.x` line. Development
snapshots and unreleased branches are supported on a best-effort basis.

## Reporting a vulnerability

Do not open a public issue for a suspected vulnerability. Use the repository's
private GitHub security advisory flow, or contact a maintainer privately through
the repository's listed maintainer channels.

Include:

- affected version or commit;
- browser and manifest version;
- reproduction steps or a minimal example;
- expected and observed behavior;
- impact assessment, including whether permissions or host access are involved.

## Security boundaries

`@addonova/browser` is a thin API adapter. It does not:

- request or grant permissions automatically;
- bypass browser security restrictions or extension CSP;
- execute remote code;
- expose privileged APIs to content scripts;
- create or weaken host permissions;
- emulate missing APIs.

Report issues that could cause an adapter to cross these boundaries, leak
privileged data, normalize a permission failure into success, or misrepresent
API availability.

## Disclosure

Maintainers will acknowledge a report, investigate it, and coordinate a fix and
disclosure timeline with the reporter. Please avoid public disclosure until a
fix or mitigation is available.
