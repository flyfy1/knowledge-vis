# Deep-track essays (2026-11-11): addendum to BRIEF-BATCH3

Read `/tmp/agent-tasks/essays/BRIEF-BATCH3.md` first and follow all of it (what to read, file layout, the lessons
learned, the hard rules: work only in your directory, no commits, no delete commands, scratch and screenshots in
`/tmp/agent-tasks/essays/<slug>/`). This file changes only the audience and adds a frontier chapter.

## What the owner asked for
"I mainly care about the deeper maths, physics, chemistry and computer science. The goal is that the site lets a
person understand the state of the art in mainstream technology and economics." So this track is not the
everyday-curiosity track. Each essay takes one frontier technology or idea and builds the reader a ladder from
first principles to where the field stands today.

## Audience and depth
- The reader is a capable adult or strong student who will work for it: comfortable with school algebra, willing
  to meet calculus, linear algebra or probability when introduced with a picture. Do not avoid the real equations:
  introduce each one at the moment the reader needs it, show it acting in a model they can push, and say in words
  what each term does. Depth comes from the chain of reasoning being complete, not from jargon.
- The ladder: each chapter must be necessary for the next. If a reader finishes, they should be able to open a
  current technical article or earnings call on the subject and follow the argument, and should know which
  quantities are the ones that matter (the figure of merit of the field) and what limits them.
- Models must be the real thing at small scale: the actual equation, algorithm or simulation the field uses,
  reduced in size, not an analogy with sliders. A reviewer will re-derive every model from the textbook or paper
  you cite. Name the source for each (textbook chapter, paper, standard).
- Link to the site's existing prerequisite pages (find them in `pages.config.js`) instead of re-teaching them, and
  list in your report the prerequisites the site lacks, so they can be commissioned.

## The frontier chapter (required, last or second to last)
- "Where the frontier is": the current records and figures of merit, who holds them, what the open problems are,
  and what would have to be true for the next step. Your training data is out of date for this by construction:
  search the web for the current state as of late 2026, open primary sources (papers, standards bodies, agency and
  company technical reports, reputable trade press for dates), and cross-check any record claim in two places.
- Every frontier fact on the page carries its date ("as of <month year>") and its source in BRIEF.md with the URL
  and the date you opened it. Put these facts in one clearly marked data block in `copy.zh.js`/`models.js` so they
  can be updated later without rewriting prose, and list them in BRIEF.md under "Facts that will go stale".
- Separate three things visibly: what is established physics/mathematics, what has been demonstrated (with by
  whom and when), and what is forecast or claimed by an interested party (label it as a claim, attribute it).
  No investment advice, no predictions of your own, no hype words.
- Where the science or its interpretation is contested, say so and give both positions with sources.

## Report (under 450 words)
As BRIEF-BATCH3 asks, plus: the ladder in one line per chapter; the figure(s) of merit; the frontier facts with
dates and sources; prerequisites the site lacks; and anything you could not verify from a primary source.
