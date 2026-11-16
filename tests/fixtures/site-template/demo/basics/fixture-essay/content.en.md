---
lang: en
title: A Sample Essay · for tests
desc: A fixture for the template build.
---

::: strings
nav.back: ← Index
nav.lang: Language
toc.label: Contents
toc.title: Contents
u.ms: {v} ms
:::

# A Sample Essay {#hero}

::: strings
kicker: Test · Fixture
:::

A subtitle.<br>Second line. {.sub}

This page exists for tests only. {.lead}

## Layers {#ch1}

::: strings
toc: Layers
:::

Structure first. {.law}

A storage system has an upper and a lower layer; see [[fixture-target#ch2|chapter 2 of the cited page]] and [[concept:缓存行]].

::: diagram dg-stack keys=dg.stack
cap: Figure 1. Two layers (schematic, not to scale).
aria: Diagram: the upper and the lower layer
top: Upper layer
bottom: Lower layer
:::

Chapter 2 of this page: [[#ch2|next chapter]]. **Bold** and *emphasis* work as usual; a literal asterisk is \*.

## Waiting {#ch2}

::: strings
toc: Waiting
:::

The average seek is {=ch2.seek} ms, about {=ch2.iops} operations per second.

::: diagram dg-flow keys=dg.flow
cap: Figure 2. The steps of one read (schematic).
step1: Seek
step2: Rotate
:::

::: lab ch2-model
model.title: One random read
model.aria: Bar chart: seek and rotational wait
say.full: Seek {s} ms, rotation {r} ms.
:::

### Established {#h.est .sub3}

- First item {#e1}
- Second item {#e2}

Where the model stops. {.take}

::: footer
A Sample Essay · test fixture.

Sources: see BRIEF.
:::
