---
lang: en
title: Why a USB Drive Never Hits Its Label · a long essay you can play with
desc: Why does a 7 GB/s NVMe SSD in a USB enclosure measure a few hundred MB/s to two or three GB/s, and what do “Gen 2×2” and “40Gbps” on the box mean? Nine models you can drag: the USB 2.0 microframe, from a name to the line rate, Bulk-Only’s one-at-a-time exchange, UASP’s queue, the bottleneck along the bridge chain, thermal throttling, the PCIe tunnel of Thunderbolt and USB4, and the few dies inside a flash drive.
---

::: strings
nav.back: ← Knowledge index
nav.lang: Language
toc.label: Contents
toc.title: Contents
u.pct: {v}%
u.us: {v} µs
u.ms: {v} ms
u.s: {v} s
u.min: {v} min
u.MBps: {v} MB/s
u.Gbps: {v} Gb/s
u.B: {v} bytes
u.KiB: {v} KiB
u.MiB: {v} MiB
u.C: {v} °C
u.x: ×{v}
u.iops: {v} IOPS
u.none: —
:::

# Why a USB Drive Never Hits Its Label {#hero}

::: strings
kicker: Computing · Systems · a long essay you can play with
:::

An NVMe SSD rated at 7,250 MB/s goes into a USB enclosure.<br>Why does it then measure only a few hundred MB/s to two or three GB/s? {.sub}

The second question follows: what do “USB 3.2 Gen 2×2” and “40Gbps” printed on the box actually mean? Below, we follow one copy from the computer to the flash: who decides on the USB wire, how a name maps to a line rate, how a read command is packed into 31 bytes, why doing one thing at a time is slow, what the chip in the enclosure translates, why a drive slows down partway through a copy, which route Thunderbolt and USB4 take instead, and finally flash drives and memory cards. **Each model is either a rule from a specification, a table from one, or a textbook result**, scaled down to run in a web page. {.lead}

An AI wrote this page. The numbers from the specifications (frame formats, tables, rates) are taken from the original texts of USB 2.0, USB 3.2, USB4 and the mass storage class specifications. **Where a value is marked “tuned parameter”, it was chosen so the model can be computed, not measured**, and the text says how far the conclusion moves when that value is halved or doubled. This page covers mechanisms and specifications only, and **does not rate any enclosure or drive as a purchase**. {.note}

## Where it sits on the map {#ch1}

::: strings
toc: Where it sits on the map
:::

A “USB portable drive” is really two storage devices joined end to end: the computer sees a USB device that speaks SCSI, and the drive sees a host that speaks SATA or NVMe. The bridge chip in the middle has to speak both. {.law}

Put an M.2 SSD into an enclosure and the computer does not recognise “this is an NVMe drive”. It sees a USB device whose interface descriptor says: I am a mass storage class device, my command set is SCSI, and my transport is Bulk-Only or UASP. The computer’s USB driver uses it as a SCSI disk. The real drive sits at the other end of the enclosure, attached to a bridge chip; to that drive, the bridge chip is its host, speaking SATA frames or NVMe queues over PCIe.

::: diagram dg-stack keys=dg.stack
cap: A USB drive is two storage devices joined end to end. Grey is the software in the computer, cyan the bridge chip in the box, violet the drive; the green line is USB, the cyan line the chip's SATA or PCIe link to the drive. The codes in brackets are the protocol codes in the interface descriptor (MSC Overview 1.4). Schematic, not to scale.
aria: Diagram: the two halves of a USB drive. On the left, the software layers in the computer: apps and file system, the SCSI disk driver, the USB storage driver and the USB host controller. A USB cable runs to the bridge chip in the box; its USB device side takes the SCSI commands, translates them to ATA or NVMe, and its host side sends them to the drive over SATA or PCIe
pc: Computer
br: Bridge chip (in the box)
dr: Drive
app: Apps and file system
sd: SCSI disk driver
ms: USB storage driver: Bulk-Only ({bot}) or UASP ({uas})
hc: USB host controller
dev: USB device side: mass storage class, SCSI command set
xl: Translates SCSI → ATA or NVMe
host: Host side: a SATA host, or an NVMe host over PCIe
ctl: Drive controller: takes ATA (SATA drive) or NVMe (NVMe drive)
nand: Flash
usb: USB
link: SATA or PCIe
sees1: What the computer sees: a USB device that speaks SCSI
both: The chip has to speak both sides' languages
sees2: What the drive sees: a host
:::

The sister essay <a href='../what-a-drive-is-made-of/'>“What a Drive Is Made Of”</a>, <a href='../what-a-drive-is-made-of/#ch7'>Chapter 7</a>, maps the whole storage stack in five layers: form factor, interface, electrical signals, transport and command set. A USB portable drive takes up not one column of that map but two, joined in the middle by a bridge chip:

::: html ch1-html
th.layer: Layer
th.what: What it covers
th.who: Who defines it
th.ch: This essay
r.cmd: Command set
r.cmd.what: How “read this many blocks from block N” is written as bytes: the SCSI CDB
r.cmd.who: T10 (part of INCITS)
r.cmd.ch: Chapters 4 and 6
r.tr: Transport
r.tr.what: How commands, data and status queue up on USB: Bulk-Only or UASP
r.tr.who: USB-IF Mass Storage Class working group; UAS is also in T10
r.tr.ch: Chapters 4 and 5
r.usb: USB protocol and link
r.usb.what: How the host schedules each transfer, how packets are cut, how errors are retried
r.usb.who: USB-IF / USB 3.0 Promoter Group
r.usb.ch: Chapter 2
r.phy: Electrical signals
r.phy.what: How many pairs of wires, how many times per second, how 0s and 1s are encoded
r.phy.who: As above (the USB 2.0, USB 3.2 and USB4 specifications)
r.phy.ch: Chapter 3
r.br: Bridge chip
r.br.what: Translates SCSI commands into ATA or NVMe, then sends them out on the drive’s side
r.br.who: Chip makers, using T10’s SAT or the NVMe SCSI translation reference
r.br.ch: Chapters 6 and 7
r.ff: Form factor
r.ff.what: Type-C or Type-A plug; inside the enclosure, an M.2 or 2.5-inch drive bay
r.ff.who: USB-IF; M.2 by PCI-SIG
r.ff.ch: —
:::

So a slow portable drive can go wrong in at least five places: how fast the wire itself can run (Chapters 2 and 3), how many round trips one command takes (Chapters 4 and 5), how many paths the chip opens towards the drive (Chapter 6), whether the drive slows itself down when hot (Chapter 7), and how fast the drive is in the first place. Thunderbolt and the PCIe tunnel of USB4 take a different route, which removes the whole middle column (Chapter 8).

This table leaves out USB hubs, USB power delivery (PD) and any encryption chip in the enclosure. These affect whether something works, and rarely decide how fast it runs. {.take}

## The host decides {#ch2}

::: strings
toc: The host decides
:::

No device on USB can speak up on its own. Every transfer is first scheduled by the host and then requested from the device; in USB 2.0 the schedule turns over every 125 microseconds, and one slot holds at most {mf} bytes. {.law}

Plug in a USB flash drive and it cannot say “I have data for you”. USB has a master–slave structure from the start: the host controller in the computer is the only scheduler, and every device hangs below it in a tree. In USB 2.0 high-speed mode the host divides time into 125-microsecond “microframes”. Several transfers are scheduled in each one, and each begins with a token packet sent by the host: “device 3, endpoint 1, give me your data”. Only then does the device return data, and the host sends back an acknowledgement. If the device cannot keep up, it can only answer “not ready yet” (NAK), and the host asks again next time.

::: diagram dg-mframe keys=dg.mframe
cap: Above: the three packets of one bulk read; every transaction starts with the host (schematic). Below: one {mf}-byte microframe drawn to scale in bytes: {u2n} transactions, each 512 bytes of data (gold) plus 55 bytes of overhead (red), and {u2left} bytes left (grey) that cannot hold another one.
aria: Diagram: above, one bulk read: the host sends an IN token, the device returns a data packet, the host returns an ACK; a device that is not ready answers NAK. Below, one 125-microsecond microframe to scale: 13 transactions, each 512 bytes of data plus 55 bytes of overhead, with 129 bytes left over
host: Host
dev: Device
tok: IN token
data: Data packet, {pay} bytes
ack: ACK
nak: NAK: not yet
nakn: A device that is not ready answers NAK (not yet), and the host asks again later.
mf: One microframe: {us} µs = {mf} bytes
fill: {n} × ({pay} + {oh}) bytes, {left} left
lgd: Data
lgo: Token, packet headers, CRC, handshake and gaps: {oh} bytes per transaction
lgl: The {left} bytes left over cannot hold another transaction
:::

480 Mb/s multiplied by 125 microseconds is {mf} bytes, the full capacity of one microframe. Every bulk transfer pays for more than its data: the token, the packet header, the checks, the acknowledgement and the gaps between packets. Table 5-10 in Chapter 5 of the specification fixes that bill at 55 bytes. The model below is that table:

::: lab ch2-model
model.title: Model · how many bulk transfers fit in one microframe (USB 2.0 Table 5-10)
model.how: Drag **data per packet** to see how many transfers fit into a 7,500-byte microframe, how much of it is data, how much is overhead, and what scraps are left over.
model.aria: Byte allocation in one USB 2.0 microframe: data, protocol overhead, remainder
leg.data: Data
leg.oh: 55 bytes of overhead per transfer
leg.left: Leftover scraps too small for another transfer
ctl.p: Data per packet
read.n: Transfers per microframe
read.useful: Data per microframe
read.bw: Maximum bulk rate
read.eff: Share that is data
cv.x: One microframe (125 µs, 7,500 bytes)
cv.n: {n} transfers
say.max: {p} bytes per packet is the largest the high-speed bulk endpoint allows: one microframe holds {n} transfers, carrying {useful} bytes of data, and {left} bytes are left over, too few for another. At 8,000 microframes a second, that gives {bw}. This is the ceiling for bulk transfers on USB 2.0, and no flash drive gets past it.
say.mid: At {p} bytes per packet, one microframe holds {n} transfers; data is {eff} of it, for a maximum of {bw}. Larger packets spread the fixed 55-byte overhead more thinly.
say.small: With only {p} bytes per packet, one microframe holds {n} transfers, but data is just {eff} of it: most of the time goes on tokens, headers and acknowledgements, and the maximum is only {bw}.
:::

The model reproduces every row of specification Table 5-10. At 512 bytes per packet, one microframe holds {u2n} transfers, with {u2left} bytes left over; that is {u2max} MB/s, and data is {u2eff} of the total. At 64 bytes per packet, it holds {u2n64} transfers and reaches only {u2mb64} MB/s. So USB 2.0’s “480 Mb/s” is {u2raw} MB/s in bytes, bulk transfers reach at most {u2max} MB/s, and once the command round trips that Chapter 4 explains are added, real drives get less: the same model in Chapter 9 gives {stu2} MB/s for Bulk-Only on USB 2.0 at 128 KiB per command, before counting a host controller that does not fill every microframe (see the end of this chapter).

USB 3 changed two things. First, sending and receiving each have their own pair of wires and run at the same time, with no taking turns. Second, the host no longer asks over and over: a device that is not ready replies NRDY, and when it is ready it sends an ERDY itself to say “go ahead”, and the host then schedules it. In the specification’s own words, “USB 2.0 style polling has been replaced with asynchronous notifications.” But the ERDY is only a raised hand: when the data moves is still decided by the host, and the USB 3.2 comparison table still describes the traffic flow as “host directed”.

Table 5-10 is a theoretical ceiling: the specification itself says, below the table, that a host controller may not manage to fit this many transfers into every microframe. The model also does not count the time taken by other devices on the same tree. {.take}

## The numbers on the box {#ch3}

::: strings
toc: The numbers on the box
:::

“USB 3.0”, “USB 3.1 Gen 1” and “USB 3.2 Gen 1” are three names for the same 5 Gb/s link. A name says how many times per second the wire switches, but not how much is left once encoding, headers and protocol are taken off. {.law}

One interface was called USB 3.0 in 2008. In 2013 USB 3.1 arrived and added a 10 Gb/s tier; the old tier was renamed USB 3.1 Gen 1 and the new one called Gen 2. In 2017 USB 3.2 added a tier that uses two pairs of wires, so the names became Gen 1×1, Gen 2×1, Gen 1×2 and Gen 2×2. The revision history of the specification records three dates: 12 November 2008, 26 July 2013 and 22 September 2017. USB-IF itself found the result confusing. Its naming guide of January 2024 recommends that packaging and marketing use only speed names, “USB 5Gbps”, “USB 10Gbps”, “USB 20Gbps”, “USB 40Gbps” or “USB 80Gbps”, and says plainly that the specification names USB 3.2 and USB4 are not meant for product names or packaging.

Getting from the name to a usable speed takes three steps. The first is encoding: the 5 Gb/s tier uses 8b/10b, so only 8 of every 10 bits are data (the sister essay <a href='../how-sata-works/#ch3'>“Why SATA Has Lasted Over Twenty Years”, Chapter 3</a>, explains this encoding). The 10 Gb/s tier switches to 128b/132b, where 128 of 132 bits are data. The second step is packets: a full packet carries 1,024 bytes of data, with a header in front and a checksum and end marker behind. The third is flow control and protocol round trips, and for this the specification gives only a single whole number.

::: diagram dg-pkt keys=dg.pkt
cap: Above: the packet behind the accounting in chapter 3 (USB 3.2 §7.2.1): 1,024 bytes of data with 32 bytes of overhead; the widths of the fields are schematic, not to scale. Below: how much of each encoding is data, to scale: gold is data, red the encoding's cost (8b/10b maps 8 bits to a 10-bit symbol; it does not append 2 bits).
aria: Diagram: a full USB 3 Gen 1 data packet: a 20-byte header packet, then the data payload packet: a 4-byte start, 1,024 bytes of data, a 4-byte CRC-32 and a 4-byte end. Below, the two encodings: 8b/10b carries 8 data bits in every 10, 128b/132b carries 128 in every 132
title: One full data packet (Gen 1)
hdr: Header
start: Start
data: Data
crc: CRC-32
end: End
bytes: {n} bytes
dpp: Data payload packet (DPP)
note: The first field is the header packet; the four after it are the data payload packet (DPP).
enc: Encoding: how many line bits are data
enc8: 8b/10b (the 5 Gb/s rate)
enc128: 128b/132b (the 10 Gb/s rate)
lgd: Data bits
lgo: Overhead
:::

::: lab ch3-model
model.title: Model · from the name on the box to usable bytes
model.how: Pick a **name printed on the box** to see how many pairs of wires it uses, how many Gb/s each pair carries, and which encoding applies. Four bars then subtract, in turn, the encoding, the packet headers and the protocol overhead the specification allows for.
model.aria: Line rate, rate after encoding, rate after headers, and the effective rate given by the specification for the chosen USB name
ctl.label: Name on the box
lab.usb20: USB 2.0
lab.usb30: USB 3.0
lab.usb31g1: USB 3.1 Gen 1
lab.usb32g1: USB 3.2 Gen 1
lab.usb5: USB 5Gbps
lab.usb31g2: USB 3.1 Gen 2
lab.usb32g2: USB 3.2 Gen 2
lab.usb10: USB 10Gbps
lab.usb32g1x2: USB 3.2 Gen 1×2
lab.usb32g2x2: USB 3.2 Gen 2×2
lab.usb20g: USB 20Gbps
lab.usb4_20: USB4 20Gbps
lab.usb4_40: USB4 40Gbps
lab.usb80: USB 80Gbps
read.mode: Name in the specification
read.line: Line rate
read.raw: After encoding
read.spec: Effective value from the specification
bar.line: Line rate ÷ 8
bar.enc: After encoding
bar.pkt: After headers (this page’s accounting)
bar.spec: Effective value from the specification
bar.na: Not applicable
mode.hs: USB 2.0 high speed
mode.g1x1: Gen 1×1
mode.g2x1: Gen 2×1
mode.g1x2: Gen 1×2
mode.g2x2: Gen 2×2
mode.u4g2: USB4 Gen 2×2
mode.u4g3: USB4 Gen 3×2
mode.u4g4: USB4 Gen 4
modefmt: {name} ({enc})
enc.hs: One pair, half duplex
enc.g1x1: One pair each way, 8b/10b
enc.g2x1: One pair each way, 128b/132b
enc.g1x2: Two lanes, 8b/10b
enc.g2x2: Two lanes, 128b/132b
enc.u4g2: Two lanes, 64b/66b
enc.u4g3: Two lanes, 128b/132b
enc.u4g4: Two lanes, three-level PAM3
say.usb2: USB 2.0 has one pair of wires; 480 Mb/s comes to {raw}, and bulk transfers reach at most {spec} (Table 5-10 in the previous chapter).
say.usb3: This name is {mode}: line rate {line}, {raw} after encoding, and {framed} once a full packet’s header is taken off. The effective value the specification gives, counting flow control and protocol, is about {spec} or less. Under the 2024 guideline, packaging is advised to print “USB {market}Gbps”.
say.usb10: Following the guide, “USB 10Gbps” states only the speed. The most common product is Gen 2×1 (line rate {line}, {raw} after encoding, specification effective value about {spec}), but Gen 1×2, which runs two 5 Gb/s lanes together, is also 10 Gb/s. The name alone cannot tell them apart.
say.g1x2: Gen 1×2 runs two 5 Gb/s lanes together, for a combined line rate of {line}; after 8b/10b it is {raw}, and the specification says its effective value is twice that of Gen 1, about {spec}. It and Gen 2×1 are both called “USB 10Gbps”, but their encodings differ.
say.usb4: This is {mode}: two lanes with a combined line rate of {line}, about {raw} after encoding. USB4 does not carry storage commands directly; it carries USB 3, PCIe and DisplayPort inside itself as tunnels. Which tunnel storage uses is explained in Chapter 8.
:::

A few numbers are worth remembering. 5 Gb/s after 8b/10b is {g1raw} MB/s, which the specification itself gives as “500 MB/sec”. A full packet’s header, frame boundaries and checksum take a little more (this page’s accounting: 1,024 bytes of data for 32 bytes of overhead, leaving {g1pe}), giving {g1fr} MB/s. The specification says that, counting flow control and protocol, the application receives “450 MB/sec or less”. 10 Gb/s after 128b/132b is {g2raw} MB/s (specification: about 1.2 GB/s), and after a full packet (24-byte header, leaving {g2pe}) it is {g2fr} MB/s; the specification’s effective value is about 1.1 GB/s. Gen 2×2, with two lanes together, is {g22raw} MB/s after encoding.

USB4 uses a different encoding. The 40Gbps tier runs each lane at 20 Gb/s with 128b/132b, so two lanes together come to about {u4g3raw} Gb/s after encoding. The 80Gbps tier switches to three-level signalling: 25.6 billion symbols a second, with 11 bits carried in every 7 symbols, which gives about {u4g4lane} Gb/s per lane. But the storage commands carried over USB4 are not placed directly into these bits, and Chapter 8 returns to this.

The “after headers” bar is this page’s accounting for a full 1,024-byte data packet (the packet structure in USB 3.2 §7.2.1). It leaves out SKP symbols and other periodically inserted symbols, and the acknowledgement packets going the other way. The 450 MB/s and about 1.1 GB/s figures are the specification’s own numbers, which the model quotes. The forward error correction overhead of USB4 Gen 4 is not included. {.take}

## One thing at a time {#ch4}

::: strings
toc: One thing at a time
:::

Bulk-Only transport is like a counter with one window that serves one customer at a time: take the form, do the business, give the receipt, then the next. Each command has a fixed round-trip time that is paid whether you read a little or a lot, so the less you read, the worse off you are. {.law}

The first rules for USB mass storage were written in the 1999 Bulk-Only Transport 1.0 (its cover is dated “September 31, 1999”, a day that does not exist; the date is reproduced as printed). It uses only two bulk endpoints, one in and one out, and a command takes three steps. The host first sends a 31-byte **Command Block Wrapper (CBW)** containing a SCSI command of up to 16 bytes; then the data; and last, the device returns a 13-byte **Command Status Wrapper (CSW)**. The specification requires the device to return the CSW for this command before the host may send the next CBW.

::: diagram dg-bot keys=dg.bot
cap: Bulk-Only has one command on the wire at a time: red is the wrappers (CBW, CSW) and the waiting, gold is the data. The less each command reads, the more of the time is red. Widths schematic, not to scale.
aria: Diagram: a Bulk-Only timeline. The host sends a 31-byte CBW on the OUT endpoint, waits for the chip and the flash, the data comes back on the IN endpoint, then a 13-byte CSW; only after the CSW does the host send the next CBW
out: Host → box (OUT endpoint)
in: Box → host (IN endpoint)
o: OUT
i: IN
data: Data
wait: Wait: the chip handles the command, the flash finds the first byte
waitS: Wait
cbw: CBW, {cbw} bytes
csw: CSW, {csw} bytes
next: Next CBW
one: One command, three steps: the CBW (carrying one SCSI command of up to {cdb} bytes), the data, the CSW. The next CBW cannot go until the CSW is back.
:::

First we look at each of these two wrappers byte by byte, then at what “one at a time” means for speed.

::: lab ch4-model
model.title: Model · the CBW and CSW of one READ command (BOT 1.0 Tables 5.1 and 5.2)
model.how: Choose **READ(10) or READ(16)**, then drag the **starting block** and the **number of blocks** to see how each part of the 31 bytes changes. Multi-byte fields are little-endian (low byte first); the SCSI command inside is big-endian.
ctl.op: SCSI command
op.read10: READ(10)
op.read16: READ(16)
ctl.blocks: Number of blocks
ctl.lba: Starting block
hex.aria: Hexadecimal bytes of the CBW and CSW
:::

The signature 55 53 42 43 is “USBC” in ASCII, and the 55 53 42 53 in the CSW is “USBS”. The specification uses these four bytes so that both sides can confirm that what arrived is a wrapper and not a fragment of data. The tag is written by the host at will, and the device copies it back in the CSW so the receipt can be matched to its command. In Bulk-Only the tag is almost pointless, because only one command is ever on the wire.

::: lab ch4-lab
model2.title: Model · speed with one command at a time (asymptotic bound for a closed queue, N = 1)
model2.how: Drag **how much each command reads**, switch the **link**, and drag the **fixed round trip per command** (a tuned parameter) to see how far the curve sits from the link’s ceiling.
model2.aria: Bulk-Only throughput with one command at a time, against block size
read.x: Throughput
cv.cap: Effective ceiling of the link
ctl.link: Link
link.hs: USB 2.0
link.g1x1: 5 Gb/s
link.g2x1: 10 Gb/s
link.g2x2: 20 Gb/s
ctl.size: How much each command reads
ctl.tcmd: Fixed round trip per command
read.iops: Commands per second
read.share: Link utilisation
read.wait: Time per command with no data moving
hex.cbw: CBW (31 bytes, host → device)
hex.data: Data phase: {len} bytes, device → host
hex.csw: CSW (13 bytes, device → host)
hex.sig: Signature “USBC”
hex.tag: Tag
hex.len: Bytes to transfer
hex.flags: Direction: read
hex.lun: LUN
hex.cblen: Command length
hex.cdb: SCSI command (CDB)
hex.sig2: Signature “USBS”
hex.res: Residue
hex.st: Status: 0 = success
say.fit: This {op} reads {blocks} blocks from block {lba}, and the CBW’s “bytes to transfer” field says {len}.
say.over: This block number is beyond READ(10)’s 32-bit address (up to block 4,294,967,295, about 2 TiB at 512 bytes a block), so the host must switch to READ(16). The display above already uses READ(16)’s layout, and the CDB becomes 16 bytes.
cv.x: Read size per command (log scale)
cv.y: MB/s
say.wait: Each command of {size}: data moves for only {tData}, but the wait is {wait}, so the link sits idle for most of the time and reaches only {X} ({share}).
say.mid: Each command of {size}: {tData} of data movement, {wait} of waiting; reaches {X}, using {share} of the link.
say.full: Each command of {size}: data takes {tData} to move, and the fixed wait of {wait} is spread thin; it reaches {X}, using {share} of the link. The larger the block, the less the one-at-a-time limit shows.
:::

The model splits one command’s time into three parts: the fixed round trip for the CBW and CSW, handled by the host and bridge chip; the wait before the flash emits its first byte; and the time the data itself takes on the link. On a 10 Gb/s link (specification effective value about 1,100 MB/s), reading 4 KiB per command reaches only {b4} MB/s, or {b4iops} commands a second; reading 128 KiB gives {b128} MB/s; only at 1 MiB does it reach {b1m} MB/s. To use nine-tenths of the link, a command must read about {b90} KiB.

This is the special case, for “only one command at a time”, of the asymptotic bound for a closed queueing system (Lazowska et al., Quantitative System Performance (1984), Chapter 5): throughput equals block size divided by the total time of one command. It is the same thing as Little’s law, which <a href='../why-nvme-is-fast/#ch2'>“Why NVMe Is So Fast”, Chapter 2</a>, covered. The overview at the start of the 2009 UASP specification gives a comparison: Bulk-Only’s overhead is “about 20%”, and an analysis at 5 Gb/s puts Bulk-Only at “approximately 250 MB/s”. At 5 Gb/s with 64 KiB per command, the model gives {b64g1} MB/s, the same order of magnitude; the parameters were not tuned to match it.

Tuned parameters: a fixed round trip of 50 microseconds and a flash first-byte wait of 50 microseconds. Halve the fixed round trip and the 4 KiB speed becomes {b4h} MB/s; double it and {b4d} MB/s. The block size needed to use nine-tenths of the link changes from {b90h} KiB to {b90d} KiB. The conclusion, that small-block reads sit far below the link and larger blocks come closer, does not change with them. The model assumes the bridge chip forwards data as it arrives, rather than storing a whole block first. {.take}

## UASP: bringing the queue to USB {#ch5}

::: strings
toc: UASP: bringing the queue to USB
:::

UASP splits one window into four dedicated lanes: commands, status, read data and write data each travel separately, and every command carries a tag. Dozens of commands can be on the way at once, so waiting overlaps and the link always has work to do. {.law}

On 24 June 2009, USB-IF published USB Attached SCSI Protocol (UASP) 1.0. It defines four pipes: the host sends command information units on the **command pipe**, the device returns status on the **status pipe**, and data travels on the **read** or **write data pipe**. Every command carries a tag, and data and status are claimed by that tag. On USB 3, the tag is used directly as the stream number of a bulk endpoint. The USB 3.2 specification says that streams raise the number of host buffers an endpoint can use from 1 to as many as 65,533, and one use it names is command queuing for mass storage.

::: diagram dg-uas keys=dg.uas
cap: UASP splits Bulk-Only's single window into four pipes, with several commands on the way at once. This is a read over USB 3: the data comes back in the order the drive has it ready, claimed by its tag. Schematic, not to scale.
aria: Diagram: the four UASP pipes. Four tagged commands, 1 to 4, go out back to back on the command pipe; the data comes back on the data-in pipe in the order 2, 1, 3, 4, each followed by a status with the same tag on the status pipe; the data-out pipe is idle during reads
cmd: Command pipe (OUT)
st: Status pipe (IN)
din: Data-in pipe (IN)
dout: Data-out pipe (OUT)
idle: Idle during reads
tag: Each command carries a tag (the number in the box); data and status are claimed by tag and may come back in a different order. Over USB 3 the tag is the stream ID, up to {streams} of them.
:::

This is the same idea as the queue depth in <a href='../why-nvme-is-fast/#ch2'>the NVMe essay</a>: when N commands are on the way, while one command waits for flash, another’s data is moving on the wire. The model below is the one from the previous chapter, but now N may be greater than 1:

::: lab ch5-model
model.title: Model · Bulk-Only and UASP at different queue depths (the same asymptotic bound)
model.how: Choose the **number of commands on the way**, drag **how much each command reads**, and switch the **link**. The grey line is Bulk-Only; the gold line is UASP.
model.aria: Throughput of Bulk-Only and UASP at the chosen queue depth, against block size
read.bot: Bulk-Only
read.uas: UASP
ctl.n: Commands on the way
read.gain: UASP ÷ Bulk-Only
read.knee: Commands needed to fill the link
cv.bot: Bulk-Only (N = 1)
cv.uas: UASP (N = {n})
say.q1: With only one command on the way, UASP and Bulk-Only are the same: both reach {X}. The four pipes cannot help, because there is no second command to overlap with.
say.lat: With {n} commands on the way, UASP reaches {X}, which is {gain} times Bulk-Only. But it has not yet filled the link; about {knee} commands are needed to do that.
say.link: With {n} commands on the way, UASP has reached the ceiling of the link (or the drive), {X}, which is {gain} times Bulk-Only. Adding more commands will not make it faster.
say.cpu: With {n} small commands on the way, the link still has spare capacity, but the bridge chip takes some time over each command (a tuned parameter), capping throughput at {iops} a second, which is {X}. Small random reads are limited by the chip, not the wire.
:::

The model’s conclusions: at 128 KiB per command, only about {knee128} commands on the way are needed to fill a 10 Gb/s link, and at 4 commands UASP is already at {u128q4} MB/s. At 4 KiB per command about {knee4} are needed, with {u4q8} MB/s at 8 commands and {u4q32} MB/s at 32. That is about {u4q32k} thousand commands a second, and at that point the limit is no longer the wire but the time the bridge chip takes over each command. The overview in the UASP specification says the same thing: by “utilizing the full duplex capability” of USB 3 it allows transfers “in excess of 400MB/s”.

To use UASP, both ends must support it: the chip in the enclosure, and the computer’s driver. Take Linux as an example. Its uas driver asks for up to 256 streams on USB 3 and sets the SCSI queue depth to the number granted minus two, {linQd}; on USB 2.0, which has no streams, it falls back to 32. The Linux source also contains a list of enclosures whose UASP implementations are faulty and need a patch, or else fall back to Bulk-Only. A combination without UASP support quietly uses Bulk-Only; the enclosure still works, but it is slower, on the curve from the previous chapter.

Tuned parameter: the bridge chip takes 4 microseconds per command. Halved, the chip’s cap for 4 KiB commands becomes {cpuH} MB/s, wider than the 10 Gb/s link, so 32 small commands are then limited by the link instead; doubled, it is {cpuD} MB/s. So the sentence “small blocks are limited by the chip” depends on this value and is only a possibility, not backed by a measurement; “a deeper queue is faster until it meets some ceiling” does not depend on it. The model gives an upper bound: a real drive has its own internal parallelism (<a href='../why-nvme-is-fast/#ch5'>Chapter 5 of the NVMe essay</a>) and its own queueing, and the bridge chip may also shorten the queue. {.take}

## The translation in the box, and the narrowest stretch {#ch6}

::: strings
toc: The translation in the box, and the narrowest stretch
:::

The bridge chip receives SCSI and sends ATA or NVMe to the drive. That decides three things: how many paths open towards the drive, which commands can be translated at all, and where a copy finally stops. {.law}

A SCSI command is a fixed-format string of bytes, used for SAS drives, <a href='../storage-over-a-network/#ch3'>iSCSI</a> and USB storage alike (its origins and layout are in this series’ <a href='../how-sas-works/#ch2'>“Why Server Drives Use SAS”, Chapter 2</a>). The drive inside the enclosure does not speak SCSI: a SATA drive speaks ATA, and an NVMe drive speaks NVMe. So the chip must translate command by command. On the SATA side there is T10’s SCSI/ATA Translation standard (SAT, from ANSI INCITS 431-2007); on the NVMe side there is the SCSI Translation Reference published by the NVM Express organisation. These are the most common commands and how they map:

::: html ch6-html
th.scsi: SCSI command
th.ata: What a SATA drive receives
th.nvme: What an NVMe drive receives
r.read: READ(10) / READ(16)
r.read.ata: A read command, such as READ FPDMA QUEUED (60h); the block address and count carry over unchanged
r.read.nvme: Read (02h); the block count is reduced by one, because NVMe counts from 0
r.unmap: UNMAP, or WRITE SAME(16) with the UNMAP bit set
r.unmap.ata: DATA SET MANAGEMENT (TRIM)
r.unmap.nvme: Dataset Management (deallocate)
r.log: LOG SENSE (health, temperature)
r.log.ata: Read the SMART log
r.log.nvme: Get Log Page, Get Features
r.ata16: ATA PASS-THROUGH(16), 85h
r.ata16.ata: Passed straight to the drive: any ATA command, including full SMART
r.ata16.nvme: No standard equivalent; each chip maker uses its own vendor commands
:::

The last row matters most. When a SATA drive sits in an enclosure, disk-checking tools can pass SMART commands straight through to the drive with ATA PASS-THROUGH; the manual of the open-source tool smartmontools calls this the “SAT” device type. An NVMe drive has no such standard route, so smartmontools must write a separate vendor channel for each chip maker. Likewise, telling the drive that blocks are no longer in use (<a href='../why-nvme-is-fast/#ch6'>Chapter 6 of the NVMe essay</a> explains why this matters) relies on the chip translating UNMAP into TRIM or Dataset Management. The three chip product briefs this page consulted all state that they support TRIM, but whether the translation works, and whether the computer sends the command at all, depends on the particular chip, firmware and system.

::: diagram dg-chain keys=dg.chain
cap: The box from the chapter 6 model with a 20 Gb/s chip and PCIe 3.0 ×2 to the drive. Each pipe is as thick as the MB/s it carries, the numbers come from the model, and the narrowest is about {c20x2} MB/s; the lengths of boxes and pipes are schematic.
aria: Diagram: the chain of a large copy: an NVMe drive at 7,250 MB/s, the bridge chip's PCIe 3.0 ×2 link to the drive at about 1,674 MB/s, USB 20 Gb/s at about 2,200 MB/s, then the computer; each pipe is drawn as thick as its speed, and the thinnest is the chip's link to the drive
drv: NVMe drive
br: Bridge chip SCSI → NVMe
pc: Computer
vd: Drive: {drive} MB/s
vb: Chip to drive, PCIe 3.0 ×2: {bridge} MB/s
vu: USB 20 Gb/s: {usb} MB/s
x: The whole chain runs at its narrowest link: about {x} MB/s, set by the chip's link to the drive.
:::

The translation itself is fast. The slow part lies elsewhere: in how many paths the chip opens towards the drive. The chips’ product briefs are clear: a 10 Gb/s NVMe bridge chip has a PCIe 3.0 ×2 downstream link, and a 20 Gb/s chip’s downstream link is also only PCIe 3.0 ×2. Here is one large-file copy, strung together as a chain:

::: lab ch6-model
model.title: Model · from flash to computer: the narrowest stretch on one chain
model.how: Change the **drive**, the **bridge chip’s downstream link**, the **enclosure** and the **computer port** to the USB tiers they support, then change the **transfer mode**. The shortest bar sets the ceiling; the gold number is what actually runs after protocol overhead.
model.aria: Ceilings and actual throughput of the drive, bridge downstream link and USB link
ctl.drive: Drive
drive.sata: SATA SSD
drive.nvme: NVMe SSD
ctl.proto: Transfer mode
proto.bot: Bulk-Only
proto.uas: UASP
ctl.bridge: Bridge downstream link
br.sata: SATA 6 Gb/s
br.p3x2: PCIe 3.0 ×2
br.p3x4: PCIe 3.0 ×4
ctl.box: Enclosure
usb.g1x1: 5 Gb/s
usb.g2x1: 10 Gb/s
usb.g2x2: 20 Gb/s
ctl.host: Computer port
read.x: Actual throughput
read.neck: Narrowest stretch
read.mode: Link actually negotiated
read.share: Share of the drive’s rated speed
st.drive: Drive sequential read
st.bridge: Bridge downstream link
st.usb: USB link
st.tunnel: PCIe tunnel
st.final: Actual (after protocol)
cv.nofit: Drive and chip do not match
say.nofit: This drive and this chip do not match: a SATA drive needs a SATA downstream link, and an NVMe drive needs a PCIe one. It may fit the M.2 slot but will not be recognised (layer three of the <a href='../what-a-drive-is-made-of/#ch7'>five-layer map</a> is wrong).
say.usb: The narrowest stretch is the USB link ({mode}, about {cap}): the drive and the chip both have spare capacity, so the actual throughput is {X}, only {share} of the drive’s rated speed.
say.bridge: The narrowest stretch is the bridge chip’s path towards the drive, about {cap}, which is narrower than the USB link. The speed printed on the box cannot be used in full; actual {X}.
say.drive: The narrowest stretch is the drive itself ({cap}): the link and the chip are both wider than it, so actual {X}. A faster enclosure will not make it faster.
say.fallback: The enclosure and the computer port have negotiated {mode} (USB 3.2 Table 7-14: the highest tier both sides support), not the tier printed on the box; actual {X}.
:::

This is much of the answer to the opening question. A 7,250 MB/s drive in a 10 Gb/s enclosure has USB as the narrowest point of the chain: with UASP it actually reaches {c10} MB/s, and with Bulk-Only {c10bot} MB/s. In a 20 Gb/s enclosure with a PCIe 3.0 ×4 downstream link, plugged into a port that supports 20 Gb/s, it reaches {c20} MB/s. But the same enclosure in a port that supports only 10 Gb/s negotiates Gen 2×1 on both sides, per Table 7-14, and falls back to {c20on10} MB/s. The most overlooked stage is the downstream link: a 20 Gb/s chip with PCIe 3.0 ×2 makes the chip’s own side the narrowest, at about {c20x2} MB/s. A SATA SSD in any 10 Gb/s enclosure is capped at the drive’s own {cSata} MB/s.

The raw rate of one PCIe lane is computed with 128b/130b encoding: PCIe 3.0 gives about {lane3} MB/s per lane (the 985 MB/s that the SD Association lists for SD Express is this same figure). ×2 and ×4 then multiply by a packet efficiency, giving {p3x2} and {p3x4} MB/s.

Tuned parameters and assumptions: PCIe packet efficiency taken as 0.85; copies counted as 1 MiB each, with 4 running at once under UASP; the USB stage uses the specification’s effective values (5 Gb/s 450, 10 Gb/s 1,100 and 20 Gb/s 2,200 MB/s, the last being the specification’s doubled figure). The chip in the enclosure may have its own ceiling; there is no data for it, so it is not in the model. {.take}

## Slowing down as it copies {#ch7}

::: strings
toc: Slowing down as it copies
:::

The heat from the drive and chip has to leave a small box. Temperature climbs exponentially towards an equilibrium; if that equilibrium is above the drive’s protection temperature, the drive slows itself down after a few minutes, and its average speed drops with it. {.law}

Copy a large file: the first few minutes are fast, then it suddenly slows, and the enclosure is hot to the touch. This is most likely the drive protecting itself: at a certain temperature the firmware lowers the speed and restores it once cooler. The datasheet gives only an operating temperature range; for example, this PCIe 4.0 drive is rated 0–70 °C, and the 4 TB version draws 5.5 W when reading. Once it is inside an enclosure, where the heat goes depends on the enclosure.

The simplest thermal model is a lump of heat capacity behind a thermal resistance (the “lumped capacitance” of heat transfer, Newton’s law of cooling): C·dT/dt = P − (T − T_ambient)/R. Without throttling, temperature approaches T_ambient + R·P exponentially, with time constant R·C.

::: diagram dg-heat keys=dg.heat
cap: The chapter 7 model is the circuit drawing: the heat of the drive and the chip first warms the heat capacity C, then leaves through the case's thermal resistance R into the air. The larger the resistance, the higher the temperature it settles at. Schematic, not to scale.
aria: Diagram: on the left, a cross-section of an enclosure; the drive and the chip make heat, which leaves through the case into the air. On the right, the lumped model it becomes: power P flows into a node at temperature T that carries a heat capacity C and connects through a thermal resistance R to the ambient temperature
air: Air (ambient temperature)
drv: Drive
chip: Chip
p: Heat: drive and chip power P
case: Case: the heat leaves through it into the air; plastic passes it worse than metal
src: Power P
t: Temperature T
c: Heat capacity C
ta: Ambient
r: Thermal resistance R
rv: R: plastic case {rp} K/W, metal case {ra} K/W (tuned)
eq: C·dT/dt = P − (T − T_ambient)/R; at equilibrium T = T_ambient + R·P
:::

::: lab ch7-model
model.title: Model · temperature and speed during one long copy (lumped capacitance, with throttling and a hysteresis band)
model.how: Choose the **enclosure** (it sets how fast the drive runs, the result of the previous chapter), the **shell** (which sets the thermal resistance, a tuned parameter), and drag the **ambient temperature**. Press **play** to watch {durMin} minutes of copying, sped up.
model.aria: Drive temperature and speed over time during a long copy
cv.t: Temperature °C
cv.r: Speed MB/s
ctl.box: Enclosure
box.g2x1: 10 Gb/s
box.g2x2: 20 Gb/s
box.tb5: Thunderbolt 5
ctl.shell: Shell
shell.al: Metal, with thermal pad
shell.plastic: Plastic, no thermal pad
ctl.ta: Ambient temperature
btn.play: Play
btn.reset: Restart
read.tinf: Equilibrium temperature without throttling
read.tfirst: First slowdown
read.avg: Average speed over the whole run
read.slow: Share of time throttled
btn.pause: Pause
cv.x: Time (minutes)
cv.thr: Throttling threshold {v} °C
never: Never
say.cool: The equilibrium temperature for this combination is {Tinf}, below the {thr} threshold, so it runs at {rate} throughout.
say.throttle: The equilibrium temperature would reach {Tinf}, above {thr}. After about {tFirst} it first slows down, then hovers around the threshold, spending {slow} of the time in the slow mode. The whole-run average is {avg}, against a rated {rate}.
:::

One interesting result from the model: the slower the link, the cooler the drive. In a 10 Gb/s enclosure the drive runs at only {avg10p} MB/s, the drive and chip together draw about {P10} W, and in a plastic shell it settles at about {T10p} °C without throttling. The same drive at full speed would draw {Pfull} W. In a 20 Gb/s plastic enclosure the equilibrium is {T20p} °C, and throttling starts after about {ts20p} minutes, averaging {avg20p} MB/s over {durMin} minutes. In a Thunderbolt 5 plastic enclosure the equilibrium rises to {T5p} °C, and throttling starts after about {ts5p} seconds, leaving an average of only {avg5p} MB/s. With a metal shell it settles at {T5a} °C and runs at {avg5a} MB/s throughout.

So a benchmark’s “first 30 seconds are very fast” and the average over {durMin} minutes of continuous copying can differ greatly, and both are real. The model’s time constant for a plastic shell is R·C ≈ {tau} minutes: an enclosure that shows no problem for a few minutes reveals it only after ten or more.

All tuned parameters: thermal resistance (metal 6, plastic 14 K/W), heat capacity 25 J/K, chip 1 W, the drive’s background draw 1.5 W, speed after throttling 30%, the threshold borrowed from the datasheet’s 70 °C operating limit, and a hysteresis of 5 °C. Thermal resistance is the most sensitive: for the 20 Gb/s plastic enclosure the equilibrium is {T20lo} °C when the resistance is halved and {T20hi} °C when it is doubled, which flips whether it throttles at all. Heat capacity moves only the timing, not the equilibrium: with it halved this enclosure starts throttling after about {ts20h} minutes, and with it doubled after {ts20d} minutes, longer than the {durMin}-minute copy, though a longer copy would still throttle. Only the direction is robust: the faster it runs, the hotter it gets, and the poorer the cooling, the sooner it throttles. {.take}

## Thunderbolt and USB4: the route with no translation {#ch8}

::: strings
toc: Thunderbolt and USB4: the route with no translation
:::

Thunderbolt and USB4 with a PCIe tunnel do not treat the drive as a SCSI device: they carry a PCIe link inside the cable, and the drive connects directly to the computer’s NVMe driver. There is no translation and no Bulk-Only; the ceiling becomes the PCIe bandwidth allotted to the tunnel. {.law}

The USB4 specification describes itself as a <a href='../how-thunderbolt-works/#ch2'>multi-protocol tunnelling scheme</a>: one cable carries USB 3, DisplayPort and PCIe together, each with its own share of the bandwidth. If the enclosure holds a <a href='../how-pcie-works/#ch1'>PCIe switch chip</a> instead of a USB bridge chip, the computer sees a genuine NVMe drive, using the same driver and the same queues as the one on the motherboard (<a href='../why-nvme-is-fast/#ch2'>the NVMe essay</a>). SMART, deallocation commands and firmware updates all pass straight through.

::: diagram dg-tunnel keys=dg.tunnel
cap: Two roads to the same NVMe drive. On the left a bridge chip translates, and the computer sees the drive as a SCSI device; on the right the cable carries a stretch of PCIe link and nothing in the box translates. Green is the cable, cyan the chip in the box and its PCIe link to the drive, violet the drive. Schematic.
aria: Diagram: two enclosures side by side. Left, a USB bridge box: SCSI disk driver and USB storage driver, USB host controller, USB cable, a bridge chip translating SCSI to NVMe, PCIe, NVMe drive. Right, a PCIe tunnel box: NVMe driver, PCIe root port and host router, tunnel packets on a Thunderbolt or USB4 cable, device router and PCIe switch, PCIe, NVMe drive
at: USB bridge box
a1: SCSI disk driver, USB storage driver
a2: USB host controller
al: USB cable: SCSI commands inside Bulk-Only or UASP
a3: Bridge chip: SCSI → NVMe
bt: Thunderbolt / USB4 PCIe tunnel box
b1: NVMe driver (the same as for the drive on the board)
b2: PCIe root port → host router
bl: Thunderbolt or USB4 cable: PCIe in tunnel packets
b3: Device router → PCIe switch
pcie: PCIe
drv: NVMe drive
an: The computer treats the drive as a SCSI device, and every command is translated.
bn: The computer sees an NVMe drive directly, with no translation, provided both ends have PCIe tunnelling on.
:::

But this route has two conditions. First, the USB4 specification says that a USB4 host may choose to support PCIe tunnelling; it is not required. On a computer without it, an enclosure that also carries a USB 3 bridge (some chips do both) falls back to its USB 3 side; a PCIe-only Thunderbolt enclosure does not work on such a port at all. Second, how much PCIe bandwidth the tunnel gets is set by the <a href='../how-thunderbolt-works/#ch9'>Thunderbolt specification</a>: Intel’s Thunderbolt 5 technology brief lists the data requirements for the computer, with Thunderbolt 4 at 32 Gb/s of PCIe and Thunderbolt 5 at 64 Gb/s (PCIe 4.0). Below is the same chain as in Chapter 6, with the USB stage replaced by the tunnel:

::: lab ch8-model
model.title: Model · the same chain, with a PCIe tunnel instead
model.how: Choose the **computer port**, and drag the **packet efficiency** (a tuned parameter) to see where the narrowest stretch moves. Inside the enclosure is a PCIe 4.0 ×4 downstream link; the drive is still the one rated at 7,250 MB/s.
model.aria: Ceilings of the drive, downstream link and tunnel along the PCIe tunnel path
ctl.host: Computer port
host.usb4np: USB4, without PCIe tunnelling
host.tb4: Thunderbolt 4 / USB4 with PCIe
host.tb5: Thunderbolt 5
ctl.eta: Packet efficiency
read.x: Model ceiling
read.neck: Narrowest stretch
read.rep: Reported in reviews
rep.none: —
say.nopcie: This computer’s USB4 port does not open a PCIe tunnel; assuming the enclosure also has a USB 3 bridge, it falls back to that side (the Thunderbolt 4 and 5 minimum for the computer is 10 Gb/s of USB 3, with Thunderbolt 5 noting up to 20 Gb/s; the model uses 10 Gb/s), and it becomes the chain from Chapter 6 again: about {X}.
say.tunnel: The narrowest stretch is the share of PCIe that the tunnel provides: about {X}. The drive and the downstream link both still have spare capacity.
say.bridge: The tunnel is already wider than the enclosure’s PCIe 4.0 ×4 downstream link, so the narrowest point returns to the enclosure itself: about {X}.
:::

The model gives: 32 Gb/s for Thunderbolt 4, in bytes, is {tunRaw4} MB/s; with packet efficiency applied it is about {t4} MB/s (between {t4lo} and {t4hi} MB/s for efficiencies from 0.80 to 0.92). But in reviews and in users’ own measurements, NVMe enclosures on Thunderbolt 3 and 4 commonly reach about {rep34} MB/s, somewhat below the model. I have not found a first-hand explanation for the gap, so here I say only that the model is a ceiling and measured results are lower. The Thunderbolt 5 tunnel is 64 Gb/s, and its narrowest point returns to the enclosure’s PCIe 4.0 ×4, about {t5} MB/s. Published reviews report sequential reads between {rep5lo} and {rep5hi} MB/s, depending on the computer and the drive. On a USB4 port without PCIe tunnelling, the same enclosure reaches about {tnp} MB/s.

So the same 40Gbps enclosure has a model ceiling of about {t4} MB/s on a port with the PCIe tunnel open, and falls back to USB 3 at about {tnp} MB/s on a USB4 port without it: a factor of three. The number printed on the box is the same; what matters is whether both ends have the PCIe tunnel open.

Tuned parameter: packet efficiency defaults to 0.85, as in Chapter 6. The figures of about {rep34} MB/s for Thunderbolt 3 and 4, and {rep5lo}–{rep5hi} MB/s for Thunderbolt 5, come from reviews and forums, not from the vendors’ specifications; the sources are listed in BRIEF.md. Tunnel scheduling and PCIe switch chip latency are not in the model. {.take}

## Flash drives and memory cards {#ch9}

::: strings
toc: Flash drives and memory cards
:::

A USB flash drive or memory card is a controller plus one or two flash chips. Write speed is the number of chips multiplied by how fast each one writes, and then the smaller of that and the bus wins. With too few chips, no interface can save it. {.law}

An NVMe SSD is fast because its controller drives dozens of flash chips at once (<a href='../why-nvme-is-fast/#ch5'>Chapter 5 of the NVMe essay</a>). A flash drive has no such room: a controller the size of a fingernail, with one or two flash chips beside it, and often Bulk-Only. Each flash chip has a ceiling on how fast it can write. At the 2023 ISSCC, SK hynix presented a 1 Tb three-bit-per-cell flash chip with more than 300 layers, whose title gives “194MB/s Write Throughput”; IEEE Spectrum, quoting SK hynix, reported it as the highest write throughput then presented for three-bit flash. Manufacturers generally do not publish which generation of flash a cheap drive uses, or how fast it is.

::: diagram dg-stick keys=dg.stick
cap: Write speed is the number of dies times how fast each writes, or the bus, whichever is smaller. A flash drive has one or two dies; an NVMe SSD has dozens working at once. The channels and dies on the right are schematic.
aria: Diagram: on the left a flash drive: USB plug, one controller, one or two flash dies, the fastest published die writing 194 MB/s; on the right an NVMe SSD: one controller with many channels of flash dies (drawn as four channels of eight)
at: Flash drive: one controller, one or two dies
usb: USB
ctl: Controller
die: Flash die
die2: Second die
per: Fastest published die: writes {die} MB/s
bus: The bus end: 5 Gb/s, Bulk-Only, 128 KiB per command: about {bus} MB/s
bt: NVMe SSD: the controller drives dozens of dies at once
ctl2: Controller
many: Dozens of dies written at once over several channels (the counts vary by drive)
:::

::: lab ch9-model
model.title: Model · sequential write of one flash drive or card (the Chapter 4 model, times the number of chips)
model.how: Choose the **number of flash chips**, drag **how fast each chip writes**, and switch the **bus**. The USB bus uses the model from Chapters 4 and 5 at 128 KiB per command; memory cards use the maximum bus speeds given by the SD Association.
model.aria: Total write capability of the flash against the capability of the bus
st.flash: Flash combined
st.bus: Bus and protocol
ctl.dies: Number of flash chips
ctl.die: Write speed per chip
ctl.bus: Bus
bus.u2bot: USB 2.0, Bulk-Only
bus.u5bot: 5 Gb/s, Bulk-Only
bus.u5uas: 5 Gb/s, UASP
bus.uhs1: SD UHS-I
bus.uhs2: SD UHS-II
bus.ex7: SD Express 7.0
read.x: Sequential write
read.flash: Flash combined
read.bus: Bus capacity
read.need: Chips needed to fill the bus
say.flash: The flash combined can write {flash}, but the bus can carry {bus}: the flash is the bottleneck, and writes at {X}. About {need} chips like this are needed to fill the bus.
say.bus: The flash combined can write {flash}, but the bus and protocol can carry only {bus}: the bus is the bottleneck, and writes at {X}.
:::

The model gives: one 194 MB/s flash chip in a 5 Gb/s Bulk-Only flash drive writes at {st1} MB/s, limited by the flash. With two chips the limit becomes the bus and Bulk-Only, at {st2} MB/s; the same two chips on USB 2.0 manage only {stu2} MB/s. In other words, on 5 Gb/s Bulk-Only, 128 KiB per command can carry {stBus} MB/s, and about {stDies} of the fastest flash chips are enough to feed it. Beyond that, the protocol and bus must change.

Memory cards use a different bus, not USB. In the SD Association’s specifications, the UHS-I bus reaches 104 MB/s at most, and UHS-II, half duplex, 312 MB/s. SD Express carries PCIe and NVMe to the card: version 7.0 uses PCIe 3.0 ×1 at 985 MB/s, and version 8.0 uses PCIe 4.0 ×2 at 3,940 MB/s. If the card reader is a USB device, the card is followed by the chain from Chapter 6: card, reader chip, USB, and whichever is narrowest decides.

The model covers only the steady state of sequential writes. It does not count the single-bit cache in the flash (fast until full, then slower), garbage collection, or small random writes. The 194 MB/s is the best figure in a paper’s title, not a typical figure for USB flash drives, so it is made a draggable parameter. The SD bus has no protocol model; it uses the SD Association’s published bus ceilings. {.take}

## Where the frontier is (as of November 2026) {#ch10}

::: strings
toc: Where the frontier is
:::

Links keep getting faster: 80 Gb/s is already in the specification and in products. But for the storage stage, what matters is whether both ends have the PCIe tunnel open, and how many paths the chip in the enclosure opens towards the drive. {.law}

Below are three kinds: what is fixed in the specifications, what has been built and measured by others, and what is only one party’s claim. The dates are when I checked them; sources are in BRIEF.md.

### Already fixed in the specifications {#h.est .sub3}

- <span class='tag h'>Spec</span>USB4 version 2.0 was released on 18 October 2022 (USB-IF press release). It adds 80 Gb/s (three-level signalling) and asymmetric 120/40 Gb/s modes. The latest consolidated version in the USB-IF document library includes the errata up to 19 November 2025. {#e1}
- <span class='tag h'>Spec</span>The latest revision of USB 3.2 is version 1.1, of June 2022. The naming guide of January 2024 recommends just five consumer names: USB 5Gbps, 10Gbps, 20Gbps, 40Gbps and 80Gbps. {#e2}
- <span class='tag h'>Spec</span>The PCIe tunnel on a USB4 host is optional. Thunderbolt 4 requires 32 Gb/s of PCIe, and Thunderbolt 5 requires 64 Gb/s (Intel’s technology brief of September 2023). SD Express 8.0 defines up to 3,940 MB/s. {#e3}

### Built and measured by others {#h.demo .sub3}

- <span class='tag m'>Demonstrated</span>Thunderbolt 5 NVMe enclosures report sequential reads of about {rep5lo}–{rep5hi} MB/s in published reviews. The upper end requires a Thunderbolt 5 computer and a drive of PCIe 4.0 or faster. {#d1}
- <span class='tag m'>Demonstrated</span>Thunderbolt 3 and 4 NVMe enclosures in measurements usually stall at about {rep34} MB/s, below the ceiling calculated for a 32 Gb/s tunnel (Chapter 8). {#d2}
- <span class='tag m'>Demonstrated</span>20 Gb/s (Gen 2×2) bridge chips have been in volume production for some time, but some chip product briefs show a downstream link of only PCIe 3.0 ×2 (Chapter 6). Ports that support Gen 2×2 on the computer side are also not widespread; when one cannot be matched, the link falls back to 10 Gb/s, per Table 7-14. {#d3}

### One party’s claim, which I could not verify {#h.claim .sub3}

- <span class='tag l'>Unverified</span>A vendor’s web page says that from 2026 USB-IF requires packaging to use only speed names such as “USB 80Gbps”. I found this only on third-party sites and found no original from USB-IF, so I treat it as hearsay. {#c1}
- <span class='tag l'>Unverified</span>Forums often say that Thunderbolt 3 and 4 measurements fall short of the tunnel ceiling because the controller allots only about 22 Gb/s to PCIe data. I have not found Intel’s original statement. {#c2}
- <span class='tag l'>Claim</span>The “fastest” figures in reviews were all measured on a particular computer and a particular drive, over a short time. With another computer, or a longer copy (Chapter 7), the figures change. {#c3}

The next things to watch are not line speeds but three questions: whether more computers open PCIe tunnels by default; whether the downstream links of USB bridge chips keep up with their upstream; and whether small enclosures can dissipate the 6–7 W of heat.

The facts in this chapter will go out of date. They are all kept in the FRONTIER data block of models.js, with dates beside them, so they can be updated later. {.take}

## Three questions to ask of the box {#ch11}

::: strings
toc: Three questions to ask of the box
:::

How fast a portable drive can run is set by the narrowest stretch on its chain; the number on the box describes only one stretch of it. {.law}

{.plain .qs}
1. **What is the line rate of this name, and can the two ends agree on it?** Convert “Gen 2×2” or “USB 3.1 Gen 1” into 5, 10, 20, 40 or 80 Gb/s (Chapter 3), then check which tiers the computer port supports: the highest tier both sides support is the one used (Chapter 6). {#q1}
2. **Which stretch is the narrowest?** Compare, one stage at a time, the drive’s sequential read, the bridge chip’s downstream link (how many PCIe lanes of which generation), USB’s effective value, and Bulk-Only or UASP (Chapters 4–6), and take the smallest. For a long copy, add heat as well (Chapter 7). {#q2}
3. **Does it go through a USB bridge, or a PCIe tunnel?** The former translates SCSI, so SMART and deallocation depend on the chip (Chapter 6). The latter has no translation, but requires the computer to open a PCIe tunnel (Chapter 8). {#q3}

Back to the opening: a 7,250 MB/s drive in a USB enclosure manages only a few hundred to two or three thousand MB/s, because it passes several narrow gates on the way. *The name* gives the line rate, and after encoding, headers and protocol the specification’s effective value keeps only {g1share} of it at 5 Gb/s and {g2share} at 10 Gb/s; *Bulk-Only* does one thing at a time, so small-block reads fall far below the line rate; *UASP* stacks the waiting with a queue; *the bridge chip* often opens only two PCIe lanes towards the drive; and *heat* makes a long copy slow down as it goes. Thunderbolt and the PCIe tunnel of USB4 remove the translation, and the ceiling jumps from one or two thousand MB/s on USB to several thousand. {#sum .sum tag=div}

Further reading: <a href='../what-a-drive-is-made-of/'>“What a Drive Is Made Of”</a> maps the whole storage stack; <a href='../how-sata-works/'>“Why SATA Has Lasted Over Twenty Years”</a> covers the SATA drive on the other side of the enclosure; and <a href='../why-nvme-is-fast/'>“Why NVMe Is So Fast”</a> covers PCIe and NVMe queues. The SCSI commands themselves are covered in Chapter 2 of this series’ <a href='../how-sas-works/#ch2'>“Why Server Drives Use SAS”</a>. The same SCSI commands sent across a network are in <a href='../storage-over-a-network/#ch3'>Chapter 3 of “Drives Across a Wire”</a>. {#links style="margin-top:2em"}

::: footer
**Sources.** Universal Serial Bus Specification Revision 2.0 (USB-IF, file package of 24 February 2023): §5.3.3, Table 5-10. Universal Serial Bus 3.2 Specification Revision 1.1 (June 2022): revision history, Table 3-1, §4.3.1.1, §4.4.6.4, §4.4.11, §7.2.1, Tables 7-14 and 7-15. USB4 Specification Version 2.0 (consolidated version of November 2025): revision history, §2.2.10.3, §3.1.1.2, §3.2, §4.3.1, §11. USB-IF: USB 80Gbps press release (18 October 2022); USB Data Performance Language Usage Guidelines (January 2024). USB Mass Storage Class Bulk-Only Transport Revision 1.0 (1999); Mass Storage Specification Overview 1.4 (19 February 2010); USB Attached SCSI Protocol Revision 1.0 (24 June 2009). NVM Express: SCSI Translation Reference 1.1. smartctl(8) manual of smartmontools (SAT and NVMe bridge device types). Linux kernel drivers/usb/storage/uas.c, unusual_uas.h, drivers/ata/libata-scsi.c, include/scsi/scsi_proto.h (read 14 November 2026). JMicron JMS583, JMS581D and JMS586A product briefs. Intel Thunderbolt 5 technology brief (September 2023). SD Association bus speed pages. Samsung 990 EVO Plus data sheet version 1.0 and 870 EVO data sheet version 1.1. E. D. Lazowska et al., Quantitative System Performance (1984), Chapter 5. Incropera and DeWitt, Fundamentals of Heat and Mass Transfer, §5.2. SK hynix, ISSCC 2023 paper 28.2. The reviews and news used in the frontier chapter are listed in BRIEF.md.

Written by an AI. The models are simplified, and the text marks which parameters are tuned. This is not a purchase recommendation.
:::
