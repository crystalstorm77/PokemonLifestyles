# AGENTS.md

## Scope

These instructions apply repo-wide unless a deeper `AGENTS.md` overrides them.

Codex works directly in the local checked-out repository. These rules are for local inspection and editing, not chat copy-paste delivery.

## Source Of Truth

1. The local checked-out workspace is the active source of truth for inspection and editing.
2. If the user provides a latest commit name, hash, tag, branch tip, or commit URL, treat it as an optional baseline reference for confirming the intended snapshot.
3. Use the local workspace for navigation, inspection, editing, and verification.
4. Do not ask the user to paste code or provide raw file URLs when the needed files are already present locally.
5. If the local workspace appears out of sync with the user's stated baseline reference, say so plainly before risky edits.
6. If the baseline cannot be confirmed well enough for a risky change, pause rather than guess.

## Working Style

1. Assume the user may describe desired behavior, bugs, or outcomes rather than naming files or code locations.
2. Codex must determine which files and which segments are relevant.
3. Only inspect, restructure, or edit the smallest relevant set of files needed for the current task.
4. Do not perform unrelated cleanup, style normalization, naming rewrites, or marker-system conversions in unrelated files.
5. If an older unrelated file uses older marker styles such as `SECTION` instead of `SEGMENT`, leave it alone unless that file is relevant to the current task.

## Plan First For Risky Work

For complex, ambiguous, or high-risk tasks, Codex should plan before editing.

Use a brief plan-first pause when the task includes things like:

1. cross-project changes
2. schema or migration changes
3. dependency changes
4. build or solution configuration changes
5. one-time restructuring passes
6. unclear requirements with non-obvious consequences

The plan should identify the likely files involved, the risky parts, and the intended verification approach before edits begin.

## Approval Before Certain Changes

Codex should ask before doing any of the following, unless the user's request clearly requires it:

1. adding, removing, or upgrading dependencies or packages
2. editing project, solution, or build configuration files
3. deleting files
4. performing a one-time restructuring pass to establish or repair the segment system

If the need becomes clear only after inspection, explain why and pause for approval.

## Protected Instruction File

1. Codex must not modify `AGENTS.md` itself unless the user explicitly asks.
2. If the user asks for a revision to `AGENTS.md`, treat that as a focused documentation/config task and avoid unrelated code edits in the same turn unless also requested.

## No Extra Artifacts

1. Do not create helper docs, scratch files, temp notes, sidecar instruction files, downloadable archives, or other non-source artifacts unless the user explicitly asks.
2. Do not create workaround files just to explain planned edits when a normal response will do.
3. If a non-source artifact is truly required for the task, pause and confirm unless the user already requested it.

## Official Edit Units

Codex edits files directly, but for structured file types below, the official edit unit remains the full segment, full region, or full file defined by these rules.

When Codex changes a structured file, it must preserve the segment system and edit at the official unit level, not as arbitrary partial fragments inside that unit, unless the file type rules explicitly make the full file the only allowed unit.

## Rule 3A: Region Directives For Languages That Support Them

Use real collapsible regions wherever the language supports them.

### C#

Use:

```csharp
#region SEGMENT A — <short title>
...
#endregion // SEGMENT A — <short title>
```

### Visual Basic

Use:

```vb
#Region "SEGMENT A - Title"
...
#End Region ' SEGMENT A - Title
```

Rules:

1. Use the same segment letter and title at both the start and end.
2. These region blocks are the official edit units.
3. If a language does not support these directives, follow the non-region rules below.

## Rule 3B: No Nested Replacement Segments

1. No replacement segment may contain another replacement segment.
2. No C# `#region` may contain another C# `#region`.
3. No Visual Basic `#Region` may contain another Visual Basic `#Region`.
4. No JavaScript `//#region` may contain another JavaScript `//#region`.
5. No `SEGMENT START / SEGMENT END` block may contain another `SEGMENT START / SEGMENT END` block.
6. A single replacement segment may contain one complete code block or multiple consecutive complete code blocks, as long as the whole segment remains a clean edit unit.
7. Do not wrap an entire file, namespace, or class in a replacement segment if more replacement segments will live inside it.
8. Namespace and class declarations should normally sit outside replacement segments.
9. If a relevant file is not yet structured into safe non-nested replacement segments, the first edit to that file may be a one-time restructuring pass, but only with user approval unless the request clearly requires it.

## Marker Style Preservation

1. In a relevant file, preserve that file's existing marker system and naming style unless the task explicitly requires a one-time restructuring pass.
2. Do not convert `SECTION` to `SEGMENT` in a relevant file unless that restructuring is actually required.
3. Do not rename markers, segment titles, or region labels just for consistency.
4. If a one-time restructuring pass is required, keep the change limited to that file and report it clearly.

## Rule 3C: Marker Formats For File Types Without Rule 3A Directives

For files that do not use Rule 3A directives, use the file type's official marker format as the official edit unit.

General rules:

1. Use the exact marker format required by the file type.
2. The marker must be on its own line.
3. The official unit is the full marker-wrapped segment or region, from the opening marker line through the matching closing marker line.
4. Never treat a partial fragment from inside a marked segment as a standalone edit unit.
5. Use the same segment letter and title at both the start and end.

### .js

```js
//#region SEGMENT A - Title
...
//#endregion SEGMENT A - Title
```

### .css

```css
/* SEGMENT A START - Title */
...
/* SEGMENT A END - Title */
```

### .cshtml

```cshtml
@* SEGMENT A START - Title *@
...
@* SEGMENT A END - Title *@
```

### .html / .xml / .xaml

```html
<!-- SEGMENT A START - Title -->
...
<!-- SEGMENT A END - Title -->
```

### .sql

```sql
-- SEGMENT A START - Title
...
-- SEGMENT A END - Title
```

### .md

```md
<!-- SEGMENT A START - Title -->
...
<!-- SEGMENT A END - Title -->
```

### .csproj / .props / .targets

Do not use segment markers. The only allowed edit unit is the full file.

### .sln / .slnx

Do not use segment markers. The only allowed edit unit is the full file.

### .json

Do not use segment markers. The only allowed edit unit is the full file.

## Rule 3C1: Unknown File Types Require A Declaration

If the current task involves a file type that does not already have explicit rules in this document, Codex must stop before making code changes.

Codex must not guess.

Codex must respond with this exact format:

`DECLARATION: <file type> file type does not have clear rules and as per Rule 3C1, I must pause here before continuing.`

After that declaration, explicit rules for that file type must be established before editing proceeds.

## Rule 3D: Marker Placement Boundaries

In files that use marker-based segments or comment-region segments instead of Rule 3A directives, markers must be placed only on lines that sit between whole code blocks for that file type.

General rules:

1. An opening marker line must be immediately above the first whole code block in the segment or region.
2. A closing marker line must be immediately below the last whole code block in the segment or region.
3. A marker must never be placed inside a code block.
4. A marker must never split a code block into pieces.

### .js

A marker may be placed only:

1. above or below one or more consecutive full top-level declarations at file scope
2. above or below one or more consecutive full top-level executable statements or blocks at file scope
3. above or below one or more consecutive full top-level declarations inside one existing top-level file wrapper body
4. above or below one or more consecutive full top-level executable statements or blocks inside one existing top-level file wrapper body

A marker must never be placed:

1. around only part of a declaration
2. around only part of a variable declaration block
3. around only part of an executable statement or block
4. around only part of an object literal
5. around only part of an array literal
6. around only part of a class declaration or class body
7. inside a nested function body other than the file's one existing top-level file wrapper body
8. inside a method body
9. inside an object literal
10. inside an array literal
11. inside a class body
12. inside an `if / else` block
13. inside a `switch` block
14. inside a loop
15. inside a `try / catch / finally` block
16. across a top-level file wrapper boundary

### .css

A marker may be placed only:

1. above or below a full CSS header segment
2. above or below a full top-level special at-rule segment
3. above or below a full top-level `@media all { ... }` shell block

A marker must never be placed:

1. inside a selector block
2. inside an `@media all` shell block
3. inside an `@media` block
4. inside an `@supports` block
5. inside an `@container` block
6. inside an `@font-face` block
7. inside an `@keyframes` block
8. inside an `@page` block
9. inside an `@property` block
10. inside an `@counter-style` block
11. inside an `@font-feature-values` block
12. inside an `@layer` block
13. inside any other CSS block

### .cshtml

A marker may be placed only:

1. above or below a full top-level markup block
2. above or below a full form
3. above or below a full section
4. above or below a full script block
5. above or below a full Razor block

A marker must never be placed:

1. inside an HTML element
2. inside a Razor expression
3. inside a Razor code block

### .html / .xml / .xaml

A marker may be placed only:

1. above or below a full element
2. above or below a full top-level structural block

A marker must never be placed inside an element.

### .sql

A marker may be placed only:

1. above or below a full `CREATE VIEW` statement
2. above or below a full `CREATE PROCEDURE` statement
3. above or below a full `CREATE FUNCTION` statement
4. above or below a full `CREATE TRIGGER` statement
5. above or below a full standalone DML block

A marker must never be placed:

1. inside one of those statements
2. inside a `BEGIN / END` block
3. inside a conditional block
4. inside a loop

If the SQL file contains a construct not covered here, follow Rule 3C1 before proceeding.

### .md

A marker may be placed only:

1. above or below a full heading section
2. above or below a full fenced code block
3. above or below a full HTML block

A marker must never be placed:

1. inside a fenced code block
2. inside an HTML block
3. inside a table
4. inside a list item

If the Markdown file contains a structure not covered here, follow Rule 3C1 before proceeding.

### .csproj / .props / .targets

Do not use markers. The only allowed edit unit is the full file.

### .sln / .slnx

Do not use markers. The only allowed edit unit is the full file.

### .json

Do not use markers. The only allowed edit unit is the full file.

## Rule 3E: Whole-Block Segment Content

In marker-based files, each segment or region must contain one or more whole code blocks, with no partial blocks.

1. A segment or region may contain one whole block or multiple whole blocks.
2. Every block inside the segment or region must be included from its own beginning to its own end.
3. A segment or region must not begin halfway through a block.
4. A segment or region must not end halfway through a block.
5. A segment or region must not rely on an outer wrapper that contains multiple segments or regions, unless a later file-type-specific rule explicitly allows that structure.
6. If a file currently depends on an outer wrapper that would force multiple segments or regions to sit inside it, and no later rule explicitly allows that structure, the first edit to that file must be a one-time restructuring pass.

### CSS Header Segment

1. This segment is optional.
2. If present, it must be the first segment in the file.
3. It may contain only consecutive top-level header at-rules in this order:
   1. optional `@charset`
   2. zero or more `@import` rules
   3. zero or more `@namespace` rules
4. It must not contain selector blocks.
5. It must not contain block at-rules.
6. It must not be wrapped in `@media all`.

### CSS Top-Level Special At-Rule Segment

1. This segment is optional and may appear more than once in a file.
2. It may contain one or more consecutive top-level special at-rules that remain outside the normal shell.
3. Examples include:
   1. `@font-face`
   2. `@keyframes`
   3. `@page`
   4. `@property`
   5. `@counter-style`
   6. `@font-feature-values`
   7. `@custom-media`
   8. `@layer` statement form
   9. `@layer` block form
4. The markers must wrap these full at-rule block(s) or statement(s) directly.
5. It must not be wrapped in `@media all`.

### CSS Normal Segment

1. This is the default segment type for ordinary CSS.
2. It must contain exactly one top-level `@media all { ... }` shell block.
3. Inside that shell there may be one or more whole selector blocks and/or one or more whole nested conditional blocks such as:
   1. `@media`
   2. `@supports`
   3. `@container`
4. No selector block may appear directly between the segment markers outside the shell.
5. No top-level block at-rule may appear directly between the segment markers outside the shell.

Any top-level CSS at-rule not explicitly covered above must be placed in its own full CSS top-level special at-rule segment outside any `@media all` shell.

## Rule 3E1: JavaScript Segment Structure Is Strict

### JS Header Region

1. This region is optional.
2. If present, it must be the first region in the file.
3. It must exist at file scope.
4. It may contain only consecutive file-scope header statements in this order:
   1. zero or more directive prologue statements such as `"use strict"`
5. It must not contain import declarations.
6. It must not contain export declarations.
7. It must not contain function declarations.
8. It must not contain class declarations.
9. It must not contain variable declarations.
10. It must not contain executable statements other than directive prologue statements.
11. It must not be placed inside a wrapper.

### JS Normal Region

1. This is the default region type for ordinary JavaScript.
2. It must be exactly one `//#region ... //#endregion` pair.
3. It may contain one or more consecutive whole top-level declarations and/or one or more consecutive whole top-level executable statements or blocks.
4. It may exist at file scope or inside one existing top-level file wrapper body.
5. It must not contain the wrapper opening line or the wrapper closing line.

### JS Wrapper-Aware File Structure

1. A `.js` file may contain zero or one existing top-level file wrapper block outside the regions.
2. Examples include:
   1. a single IIFE
   2. a single file-spanning bootstrap wrapper
3. The wrapper opening line and wrapper closing line must stay outside all regions.
4. If a wrapper exists, all regions inside it must be siblings in that one wrapper body.
5. No region may cross the wrapper boundary.
6. No region may contain another region.
7. No second top-level file wrapper may sit beside or around the first wrapper.
8. If a change needs to edit the wrapper opening line, the wrapper closing line, or move code across the wrapper boundary, that change is a one-time restructuring pass and may require a full-file edit.

### JS Module-Only Constructs

If a `.js` file contains top-level import declarations, top-level export declarations, top-level await, or another module-only top-level construct not explicitly covered above, Codex must pause before editing that file and explicit rules for that structure must be established first.

## Segment Size

1. Keep segments small enough to replace easily.
2. Ideal segment size is 150 lines.
3. Hard cap is 300 lines unless truly unavoidable.
4. A segment may contain one whole code block or multiple whole code blocks, but should still stay within a practical replacement size.
5. If needed, split large segments into new segments at clean boundaries.
6. If a segment is split, clearly report the previous segment name and the updated segment names.

## Full-Segment Integrity

1. Never omit closing braces, parentheses, brackets, semicolons, or trailing lines at the end of a segment or region.
2. Never stop early.
3. Never cut off the bottom of a segment or region.
4. Before finalizing an edit, verify that each changed segment or region is complete and balanced.

## Stable Names

1. Keep identifiers and segment names stable.
2. Do not rename files, classes, methods, variables, or section headers unless necessary.
3. If a segment must be renamed, split, merged, or moved, clearly report that and include all affected units in the change summary.

## New Files

When creating a new file from scratch:

1. If the language supports `#region` or an equivalent real region directive, add segment regions immediately using the exact syntax defined in Rule 3A.
2. If the language does not use Rule 3A directives, add the file type's official marker format immediately using the exact syntax defined in Rule 3C.
3. Place markers only according to Rules 3D, 3E, and 3E1.
4. If the file type does not already have explicit rules in this document, follow Rule 3C1 before proceeding.

## Repo-Specific Boundaries

1. Prefer editing source files under:
   1. `LifestyleCore`
   2. `LifestylesDesktop`
   3. `LifestylesWeb`
2. Do not edit generated outputs under `bin/` or `obj/` unless the user explicitly asks.
3. Do not edit vendored assets under `LifestylesWeb/wwwroot/lib/` unless the task specifically requires it.
4. Treat `Data Export Tests/` as fixture or sample-data material, not as the default place for code changes.
5. This repository already contains mixed marker naming such as `SECTION` and `SEGMENT`. Do not normalize unrelated files just for consistency.

## Verification And Done

When work is finished, verify using the smallest relevant set of commands for the task.

### Standard build commands

Use these when the affected scope makes them relevant:

```powershell
dotnet build LifestyleCore/LifestyleCore.csproj
dotnet build LifestylesDesktop/LifestylesDesktop.csproj
dotnet build LifestylesWeb/LifestylesWeb.csproj
```

### Run commands when relevant

If the task affects runtime behavior, UI behavior, startup wiring, or app flow, run the relevant app when practical:

```powershell
dotnet run --project LifestylesDesktop/LifestylesDesktop.csproj
dotnet run --project LifestylesWeb/LifestylesWeb.csproj
```

### Verification rules

1. Verify the smallest relevant scope first.
2. If only one project was affected, start with that project's build.
3. If shared code in `LifestyleCore` was changed, build both dependent apps when relevant.
4. If desktop UI code changed, desktop runtime or manual checking is usually relevant.
5. If web pages, `Program.cs`, static assets, or browser-facing logic changed, web runtime or manual checking is usually relevant.
6. No dedicated automated test project was detected in this repository, so manual testing is still required where behavior changed.
7. If verification was not run, or could not be completed, say so clearly.

### Final Report Requirements

In the final report after edits, Codex must state:

1. exact relative file paths changed
2. exact segment or region names changed, or explicitly say `full file`
3. what verification was run
4. what verification was not run
5. whether any restructuring pass occurred
6. whether any segment or region was split, moved, or renamed

## If A Rule Conflicts With A Task

If a requested change would require breaking these rules, pause and explain the conflict plainly before editing.
