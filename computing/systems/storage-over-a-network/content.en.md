---
lang: en
title: Drives Across a Wire · a long essay you can play with
desc: Why can your computer use a disk that sits in another machine as if it were its own? How do NAS and SAN differ, and why do data centres put NVMe on the network? Nine models you can drag: what changing one byte costs at three levels, small files and round trips, iSCSI's R2T, Fibre Channel credits, the latency of each hop, the cost of a lost packet, NVMe-oF's messages, queueing on two paths, and replication versus erasure coding.
---

::: strings
nav.back: ← Knowledge index
nav.lang: Language
toc.label: Contents
toc.title: Contents
u.pct: {v}%
u.ns: {v} ns
u.us: {v} µs
u.ms: {v} ms
u.s: {v} s
u.B: {v} B
u.KiB: {v} KiB
u.MiB: {v} MiB
u.GiB: {v} GiB
u.MBps: {v} MB/s
u.Gbps: {v} Gb/s
u.kiops: {v} thousand per second
u.iops: {v} per second
u.km: {v} km
u.x: {v}×
u.n: {v}
u.nines: {v} nines
u.h: {v} h
u.gb1: 1 Gb/s
u.gb10: 10 Gb/s
u.gb25: 25 Gb/s
u.gb100: 100 Gb/s
u.gb400: 400 Gb/s
:::

# Drives Across a Wire {#hero}

::: strings
kicker: Computing · Systems · a long essay you can play with
:::

Your drive sits in another machine, so why can your computer treat it as its own?<br>Both are called network storage, so why is one called NAS and the other SAN, and why do data centres move NVMe onto the network? {.sub}

Three questions are really one: **once a drive leaves its enclosure and a network sits in between, what becomes expensive?** The expensive part is the round trip. Every question waits for an answer, every lost packet has to be sent again, and every broken path needs another to take over. Starting from “what exactly are you asking the other side for?”, we go up layer by layer and see how each protocol spreads these costs: file-level NAS, block-level iSCSI and Fibre Channel, latency at every hop, TCP and RDMA, NVMe-oF, multipath, and finally cutting data into pieces spread across many machines. **Each model is either a real rule from a specification, a measurement with its conditions stated, or a textbook result**, scaled down to run in a web page. {.lead}

An AI wrote this page. Byte counts and defaults are taken directly from the specifications (RFC 7143, NVMe/TCP 1.1 and others); latencies come from published measurements that state their hardware and software versions. **Where a value is marked “tuned parameter”, it was chosen so the model can be computed, not measured**, and the text says how far the conclusion moves when that value is doubled or halved. This page covers mechanisms and specifications only, and **does not rate any product as a purchase**. Earlier essays in this series: <a href='../what-a-drive-is-made-of/'>“What a Drive Is Made Of”</a>, <a href='../how-sata-works/'>“Why SATA Has Lasted Over Twenty Years”</a>, <a href='../how-sas-works/'>“Why Server Drives Use SAS”</a> and <a href='../why-nvme-is-fast/'>“Why NVMe Is So Fast”</a>. Where this essay needs them, it only points back. {.note}

## Blocks, files, objects: what you ask for {#ch1}

::: strings
toc: Blocks, files, objects: what you ask for
:::

Network storage starts with one question: does the client ask for “block number N”, for “byte K of a file”, or for “a whole object”? The lower the level, the more the client manages itself, and the less can be shared. {.law}

A home NAS and a SAN in a machine room both look like “a machine full of disks, connected by a network cable”. The difference is not the hardware but the question being asked. When you connect to a NAS, your computer says “open <code>photos/2025/IMG_0412.jpg</code> and read the first 64 KiB”. File names, directories and who may read are all managed by that machine, and what you see is a **shared folder**. When you connect to a SAN, your computer says “read block 123456”. The far side is just a numbered row of blocks, like a disk inside your own machine (see <a href='../what-a-drive-is-made-of/#ch1'>“What a Drive Is Made Of”, Chapter 1</a>). Building a file system on top, and keeping track of which file sits in which blocks, is entirely your computer’s job, and what you see is a **new disk**. Cloud object storage is a third kind of question: “give me the whole thing called <code>photos/0412</code>” or “replace the whole thing”. There is no directory tree, and you cannot change a few bytes in the middle.

::: diagram dg-level keys=dg.level
cap: Three ways of asking, which differ in who keeps the file system. The grey frames above are your computer, the green frames below are the storage end; the arrows are what you ask for, in the same colours as the three bars in the model below. Schematic.
aria: Diagram: three ways to ask for storage. Block level: your computer keeps the file system and asks for block number so-and-so; the far side is just a row of numbered blocks. File level: your computer's NFS or SMB client asks for some bytes of a file; the file system lives on the server. Object level: whole objects are fetched and stored over HTTP; the far side keeps objects by name, with no directory tree
block: Block (SAN: iSCSI, Fibre Channel, NVMe-oF)
file: File (NAS: NFS, SMB)
obj: Object (S3 and the like)
app: Apps
fsC: The file system is on your side: folders, permissions, which blocks hold which file
nfsc: NFS or SMB client
http: HTTP client
qblock: Read block 123456
qfile: Open a file, read the first 64 KiB
qobj: GET or PUT: the whole object
lun: A row of numbered blocks, like a local drive
fsS: The file system is on the server
disk: Drives
store: Whole objects stored and fetched by name, no directory tree
seeblock: What you see: a new drive
seefile: What you see: a shared folder
seeobj: What you see: named objects
:::

So block storage can be formatted with any file system and can run a database, but two computers cannot safely mount the same disk at once. Each file system assumes it is the only one making changes, and they overwrite each other’s writes (unless a dedicated cluster file system is used). File storage is shared by design, at the cost of asking the far side every time a file is opened. Object storage removes “change” altogether, leaving only whole-object writes and reads, which lets it span thousands of machines. The table below places common protocols on the map, in the same spirit as the layers in <a href='../what-a-drive-is-made-of/#ch7'>“What a Drive Is Made Of”, Chapter 7</a>: what the command says, what carries it, and which wire it runs on.

::: html ch1-html
th.name: Protocol
th.level: Asks for
th.cmd: Command language
th.tr: Carried by
th.wire: Wire
th.ch: In this essay
r.nfs: NFS
r.nfs.level: Files
r.nfs.cmd: NFS operations (OPEN, READ, WRITE …)
r.nfs.tr: RPC over TCP
r.nfs.wire: Ethernet
r.nfs.ch: <a href='#ch2'>Chapter 2</a>
r.smb: SMB
r.smb.level: Files
r.smb.cmd: SMB2 commands (CREATE, READ, CLOSE …)
r.smb.tr: TCP (port 445)
r.smb.wire: Ethernet
r.smb.ch: <a href='#ch2'>Chapter 2</a>
r.iscsi: iSCSI
r.iscsi.level: Blocks
r.iscsi.cmd: SCSI commands (CDB)
r.iscsi.tr: TCP (port 3260)
r.iscsi.wire: Ethernet
r.iscsi.ch: <a href='#ch3'>Chapter 3</a>
r.fcp: FC (FCP)
r.fcp.level: Blocks
r.fcp.cmd: SCSI commands (CDB)
r.fcp.tr: Fibre Channel’s own frames and credits
r.fcp.wire: Fibre Channel
r.fcp.ch: <a href='#ch4'>Chapter 4</a>
r.nvmeof: NVMe-oF
r.nvmeof.level: Blocks
r.nvmeof.cmd: NVMe commands (64 bytes)
r.nvmeof.tr: TCP (port 4420), RDMA or Fibre Channel
r.nvmeof.wire: Ethernet, InfiniBand, Fibre Channel
r.nvmeof.ch: <a href='#ch7'>Chapter 7</a>
r.s3: Object interface (S3-style)
r.s3.level: Whole objects
r.s3.cmd: HTTP PUT, GET, DELETE
r.s3.tr: TCP (often with TLS)
r.s3.wire: Ethernet
r.s3.ch: <a href='#ch9'>Chapter 9</a>
:::

::: lab ch1-model
model.title: Model 1 · Change a few bytes in the middle of a file: how much each way of asking moves
model.how: Drag “bytes changed”, change the file size, and tick “client already caches the data”. Read the three bars: block level moves whole blocks, file level moves only the changed bytes, and object level replaces the whole object. The horizontal axis is logarithmic.
model.aria: Bytes sent over the wire for a few changed bytes, under three ways of asking
lv.block: Block
lv.file: File
lv.object: Object
ctl.k: Bytes changed
ctl.size: File size
size.64k: 64 KiB
size.8m: 8 MiB
size.1g: 1 GiB
ctl.cached: Client already caches the data
read.block: Block level: bytes on the wire<br>(in 4 KiB blocks)
read.file: File level: bytes on the wire
read.object: Object level: bytes on the wire
cv.x: Bytes on the wire (log)
say.cold: Changing only {k}, block level must first read the whole block and then write it back, a total of *{b}*, which is {ab} the size of the change. Object level must fetch the object and put the whole thing back, *{o}*. Only file level sends {f}: the job of assembling the block is done on the server.
say.cached: The block is already in the client’s cache, so block level only writes the whole block back, a total of *{b}* ({ab} the size of the change). Object level still puts the whole object back, *{o}*. File level sends only {f}.
say.aligned: The change falls exactly on whole blocks, so block level moves no extra data: *{b}*. Object level still sends the whole object, *{o}*, which is {ao} the size of the change.
say.whole: The whole file has changed, so the three ways of asking move about the same amount: block {b}, file {f}, object *{o}*. The difference only shows up when changing a small piece.
say.objSmall: The object is smaller than one block, so object level, which puts back the whole object ({o}), moves less than block level ({b}).
:::

The default case is changing 1 byte in an 8 MiB file with no client cache. Block level moves {blk1} bytes (it reads one block and writes one block back; with a cache it is {blk1c}), file level moves 1 byte, and object level moves {obj1} MiB (it fetches the object and puts the whole thing back; with a cache it is {obj1c} MiB). This is how the three split the work. **Block level keeps the file system on the client**, so it is the most flexible and the hardest to share. **File level moves the file system to the server**, so only “which file, which bytes” crosses the network. **Object level simply does not allow in-place change**, and in return it needs no locking and can scale out without limit.

Most of the later chapters are about block level. iSCSI, Fibre Channel and NVMe-oF all treat a drive far away as if it were local, and they compare whose round trips are fewer, who never drops a packet, and who recovers fastest when a link breaks. File level has only Chapter 2, and object level closes the essay in Chapter 9.

This model leaves out protocol headers, metadata and journals (changing one byte in a file system often also writes a journal and updates the modification time), and assumes the change starts on a block boundary. The object interface has multipart upload, and some services add append writes, but “PUT replaces the whole thing” is its basic meaning. {.take}

## NAS: asking about every file {#ch2}

::: strings
toc: NAS: asking about every file
:::

File-level protocols leave the server to answer “does this file exist, may I read it, has it changed?”. Every answer costs one round trip, so copying a thousand small files spends its time on round trips, not on data. {.law}

Copying a 1 GB video from a NAS to your computer, the progress bar moves quickly. Copying a folder full of small photos, of the same total size, is much slower. The reason is that each file needs a few exchanges with the server first: look up the name, open the file (and get its attributes on the way), read it, and close it. Each exchange waits for an answer, and that wait is one **round-trip time** (RTT). On a home wired LAN the RTT is around a millisecond; over a VPN or between cities, tens of milliseconds. Why a network has round-trip time, and what makes it up, is covered in <a href='../tcp-congestion/#step1'>“Network Flow · A Message’s Journey”</a>.

::: diagram dg-nas keys=dg.nas
cap: Drawn to scale in time, at this chapter's model defaults: a 0.5 ms round trip, 3 round trips per file, 64 KiB files, gigabit Ethernet. Only three files are drawn; a thousand files repeat the upper line.
aria: Diagram: two timelines drawn to scale. Above, three 64 KiB files copied one after another: each waits for three round trips before its data moves. Below, the same bytes as one file: three round trips once, then the data back to back, in about half the time
a: {files} small files of {s} KiB, one after another
ta: {tA} ms
b: The same bytes as one file
tb: {tB} ms
lr: One round trip, {rtt} ms
ld: {s} KiB on gigabit Ethernet, {dat} ms
:::

The two main file protocols both try to bundle several requests into one exchange. Every NFSv4 request is a COMPOUND, which can carry “look up the name, open, read” together (RFC 7530). SMB2 also allows several commands to be chained into one compound request (Microsoft MS-SMB2). But “ask once when opening” is the rule behind NFS consistency: When the server has not delegated the file to the client, RFC 7530 §10.3.1 requires the client to check the file’s change marker after OPEN (the rule is mandatory only for some kinds of open, but clients may and often do check on every open), and to write changed data back to the server before CLOSE. This is called **close-to-open consistency**. Once A closes the file, a later open by B will see what A wrote. But if two people have the same file open at once, nothing is guaranteed.

::: lab ch2-model
model.title: Model 2 · A thousand files: where the time goes
model.how: Drag the file size and the round-trip time, and change “round trips per file” and “copied at once”. The gold line is the total time to copy a thousand files; the cyan line is the same amount of data packed into one large file. Where the two lines separate, the time is being spent on round trips.
model.aria: Total copy time for a thousand files against file size, compared with one large file
leg.many: A thousand small files
leg.big: One large file (same data)
ctl.s: File size
ctl.rtt: Round-trip time
ctl.k: Round trips per file
k.1: 1 (all bundled into one)
k.2: 2
k.3: 3 (look up, open, read, once each)
k.4: 4
ctl.p: Copied at once
ctl.g: Link
read.T: Total time for a thousand files
read.big: Packed into one large file
read.ratio: Slower by
read.util: Link used
cv.x: File size (log)
cv.y: Total time (log)
say.rtt: Now the round trips set the pace: each file waits for {k} round trips, and the link is only {util} used. A thousand files take *{T}*. The same data as one file takes only {big}, so the small files are {ratio} slower.
say.rttBad: Round trips eat all the time: a thousand files take *{T}*, while one file takes only {big}, so the small files are *{ratio}* slower. Below a file size of about {sStar}, waiting for replies takes longer than sending the data.
say.bwNear: The files are big enough (or enough of them are copied at once) that it is almost as fast as one large file: *{T}* against {big}.
:::

The default is a thousand 64 KiB files, 0.5 ms round trips, 3 round trips per file, one file at a time, on gigabit Ethernet. Each file takes {nasD} ms, the total is {nasT} seconds, and the same data as one file takes only {nasBig} seconds, so the small files are {nasR}× slower. Raise the round trip to 30 ms (for example, connecting to a home NAS from outside), and the total becomes {nasWT} seconds, while the large file still takes only {nasWBig} seconds. This model uses the simplest **asymptotic bound** from queueing theory (Lazowska et al., 1984, Chapter 5): throughput cannot exceed “requests in flight ÷ time per request”, nor the capacity of the link itself. The product of round-trip time and link rate decides how large a file must be before a transfer is worth its round trips. Under the defaults that point is about {nasStar} KiB; at 30 ms it moves to about {nasStarW} KiB.

There are two ways to hide the round trips. One is to send many at once: at 30 ms, copying 16 files at a time brings the total down to {nasW16} seconds, and merging each file’s three round trips into one gives {nasW1} seconds. The other is to ask less often. The Linux NFS client caches file attributes for a while (by default 3 to 60 seconds for regular files, and 30 to 60 seconds for directories; see the nfs(5) manual), and while the cache is valid it does not ask again. The cost is exactly consistency: during those tens of seconds, a change someone else makes may not be visible to you.

This treats every round trip as the same length, and leaves out the time for the server to look up directories and read the disk, as well as the TCP slow start at the beginning of a connection. “Round trips per file” is a dial, not a count measured from any particular client; different systems and mount options differ widely. {.take}

## iSCSI: SCSI commands inside TCP {#ch3}

::: strings
toc: iSCSI: SCSI commands inside TCP
:::

iSCSI places the same 16-byte command that a SAS drive listens for, unchanged, into a 48-byte header, and runs it over ordinary TCP. Reads are cheap. A write must wait for the far side to say “go ahead”. Over a short distance this barely matters; over a long one, the waiting is the whole cost. {.law}

The SCSI command (CDB) itself has nothing to do with the wire, as <a href='../how-sas-works/#ch2'>“Why Server Drives Use SAS”, Chapter 2</a> already worked out byte by byte: the same CDB placed in a SAS frame, or in iSCSI’s 48-byte **basic header segment** (BHS), means exactly the same thing. iSCSI (RFC 7143, the consolidated version of April 2014) adds only three things: giving each device a globally unique name, of the form <code>iqn.2001-04.com.example:storage.disk2.sys1.xyz</code> (iqn, the year and month the domain was registered, the domain name written backwards, and a suffix chosen by the owner); **logging in** after connecting, during which the two sides negotiate a set of parameters; and then sending commands, data and status back and forth over one or more TCP connections (default port 3260).

On a read, the command goes out, and the data and status come back together (the last data packet can carry the status): one round trip. A write is harder, because the target must set aside a buffer before it can accept your data. The rules are the parameters agreed at login (RFC 7143 §13). By default **InitialR2T=Yes**, so the first batch of data also waits for the far side to send “ready to receive” (R2T). But by default **ImmediateData=Yes**, so the command packet can carry a first piece of data, up to 8192 bytes (the default MaxRecvDataSegmentLength). For the rest, each R2T covers at most 262144 bytes (MaxBurstLength), and by default only one R2T can be in flight at a time (MaxOutstandingR2T).

::: diagram dg-iscsi keys=dg.iscsi
cap: The default case of this chapter's model: a 1 MiB write under the RFC 7143 default keys. Each R2T comes only after the previous burst has arrived (by default only 1 R2T may be outstanding), so each R2T and the data after it cost a round trip. Schematic, not to scale.
aria: Diagram: the round trips of a 1 MiB iSCSI write. The initiator sends the SCSI command with 8 KiB of immediate data; the target sends an R2T for 256 KiB and the initiator answers with 32 Data-Out PDUs; this repeats until R2T 4 asks for 248 KiB and gets 31 Data-Out PDUs; finally the target sends the SCSI response. 5 round trips in all
ini: Initiator (host)
tgt: Target (storage)
cmd: SCSI Command: write {W} MiB, with {imm} KiB of immediate data
r2t: R2T {i}: send {b} KiB
dout: Data-Out × {c}, {mr} KiB each
rsp: SCSI Response: done
rt: round trip {i}
:::

::: lab ch3-model
model.title: Model 3 · One iSCSI write: how many “go ahead” replies it waits for
model.how: Drag the write size and the round-trip time, and change the parameters agreed at login and the link rate. In the time bar, red is the wait for R2T round trips and gold is the time the data spends on the wire.
model.aria: Makeup of one iSCSI write’s time: waiting for round trips and transfer on the wire
cv.wait: R2T round-trip wait
cv.data: Data on the wire
ctl.w: Write size
ctl.rtt: Round-trip time
ctl.prof: Parameters agreed at login
prof.rfc: RFC defaults
prof.noimm: No immediate data
prof.unsol: First batch without R2T
prof.big: Largest in one go
ctl.g: Link
read.rt: Round trips
read.pdu: iSCSI PDUs
read.T: Completion time
read.MB: Speed of this write
cv.rt: Round trip {n}
say.one: One round trip finishes the write: all the data travels inside the command, or the first batch does not wait for R2T. Time *{T}*, {MBps}.
say.wait: It takes *{rt}* round trips, {r2t} of them waiting for an R2T, and waiting takes *{wait}* of the time. However fast the wire, this write manages only {MBps}.
say.wire: It takes {rt} round trips, but they are short, so waiting takes only {wait}. Most of the time is the data itself on the wire: {MBps}.
:::

The default is a 1 MiB write over a 0.1 ms round trip (within one data centre), a 10 Gb Ethernet link and RFC defaults. First 8 KiB goes with the command, and the rest needs {i0r} R2Ts: {i0rt} round trips and {i0pdu} iSCSI packets in total, taking {i0T} ms, of which {i0w} ms is data on the wire. Counting all the headers, the efficiency is {iEff}. Raise the round trip to 10 ms (for example, a remote copy to a second data centre in the same city), and the same write takes {iWT} ms, with waiting {iWs} of the time, and the speed falls to {iWMB} MB/s. Switch to “largest in one go” (the first batch without R2T, and a burst limit of 16 MiB), and only {iWbrt} round trips remain, taking {iWbT} ms, at {iWbMB} MB/s. A 4 KiB small write under the defaults takes {i4rt} round trips, or {i4nrt} when immediate data is not allowed.

This is why iSCSI deployments across distance need these parameters tuned, and why small writes done one at a time, as databases do, are so sensitive to round-trip time. Why TCP is reliable in the first place, and why it slows itself down, is covered in <a href='../tcp-congestion/#step4'>the congestion-control step of “Network Flow · A Message’s Journey”</a>. This page counts only the waits that iSCSI adds on top.

The model assumes a TCP window large enough and a link that never drops packets, and it adds the waiting and the transfer end to end (in practice some of them overlap). TCP, IP and Ethernet overheads beyond the iSCSI header are counted at 1448 bytes of payload per segment. Header and data checksums (CRC32C, 4 bytes each) are off by default and are not counted here. {.take}

## Fibre Channel: credits instead of drops {#ch4}

::: strings
toc: Fibre Channel: credits instead of drops
:::

Fibre Channel never lets a frame be thrown away because the far side has nowhere to put it. The far side has a number of free buffers, and you may send only that many frames. That is why it never drops frames, and it gives distance a price: the longer the link, the more frames are on the way, and the more credits are needed. {.law}

An Ethernet switch that is overloaded simply drops packets and leaves TCP to resend them. Fibre Channel (FC) was designed for SCSI and takes another path. At login, the two ends tell each other how many receive buffers they have. This is called **buffer-to-buffer credit** (BB_Credit). Send a frame and the credit goes down by one; when the far side frees a buffer, it returns a signal called R_RDY, and the credit goes up by one. When credits run out, the sender waits and never pushes on regardless. So frames on FC are not discarded because of congestion, and SCSI commands almost never need resending.

A frame is at most 2148 bytes: a 24-byte header, up to 2112 bytes of data, plus start and end markers and a checksum. These figures come from the FC-FS standard; this page relies on secondary sources and did not open the original. The trouble is distance. Light in fibre travels about {fcUs} microseconds per kilometre, and a frame going out, arriving, and its R_RDY coming back covers twice the distance. During that time the sender must always have a credit available, or the link sits idle. This is a standard **sliding window** problem (Stallings, Data and Computer Communications, Chapter 7): utilisation = min(1, credits × frame transmit time ÷ (frame transmit time + round-trip propagation time)).

::: diagram dg-fc keys=dg.fc
cap: Credits: the sender may have as many frames on the way as it holds credits; the longer the fibre, the more frames must be in flight. The frame fields below are from FC-FS (quoted via secondary sources; the standard was not opened); widths schematic, not to scale.
aria: Diagram: Fibre Channel credits. The sending port keeps a credit counter; full frames travel down the fibre with several in flight; the receiving port answers each freed buffer with an R_RDY. Below, a frame: start of frame 4 bytes, header 24 bytes, data up to 2112 bytes, CRC 4 bytes, end of frame 4 bytes, and 24 bytes of idle between frames
tx: Sending port: credit counter
rx: Receiving port: free buffers
fwd: Full frames travel out, several in flight
fibre: Fibre: {uskm} µs per km one way
back: R_RDY travels back: a buffer has been freed
credit: Each frame sent takes a credit; each R_RDY received returns one; with no credits left the sender stops and waits; it never sends without one.
ft: One frame (at most {fmax} bytes)
sof: SOF
hdr: Header
pay: Data
crc: CRC
eof: EOF
idle: Idle
b: {n} bytes
bmax: up to {n} bytes
:::

::: lab ch4-model
model.title: Model 4 · One fibre link: how many credits keep it full
model.how: Change the generation and the frame size, and drag the distance and the number of credits. Above is the link: gold is the frames on the way, and cyan is the R_RDY coming back (the animation is slowed down; one round trip takes about three seconds). Below is utilisation against distance, with the dot marking the current position.
model.aria: Frames and credits on a Fibre Channel link, and utilisation against distance
leg.frame: Frames on the way
leg.rrdy: R_RDY coming back
ctl.g: Generation
ctl.d: Distance
ctl.c: Credits
ctl.f: Data per frame
f.2112: 2112 bytes (full frame)
f.1024: 1024 bytes
f.512: 512 bytes
read.need: Credits needed to fill the link
read.util: Utilisation
read.good: Actual data rate
read.reach: Distance these credits can fill
cv.tx: Sender
cv.rx: Receiver
cv.credit: Credits left {n}
cv.x: Distance (km, log)
cv.y: Utilisation
say.full: Enough credits: {cr} credits can fill this link, out to {reach}. Data rate *{good}*.
say.part: Not quite enough credits: {need} are needed, only {cr} are there, so utilisation is *{util}* and the data rate {good}.
say.starve: Far too few credits: *{need}* are needed to fill the link, and only {cr} are there. For most of the time the sender waits for R_RDY, and utilisation is only *{util}*.
:::

The default is 16GFC (1600 MB/s in each direction), full frames, 50 km and 40 credits. A frame takes {fcTf} microseconds to send, each kilometre needs about {fcPerKm} credits, and filling the link needs {fcNeed}. With only 40, utilisation is {fcUtil}, and the actual rate is only {fcGood} MB/s. These 40 credits can fill only {fcReach} km. Smaller frames are worse: at 8GFC and 100 km, full frames need {fc8} credits, and 512-byte frames need {fc8s}. A rule of thumb from switch vendors is about “rate ÷ 2” credits per kilometre for full frames (at 8GFC, about {fcBro8} per 100 km), which is within about a tenth of this model’s figure.

So in a machine room, a few metres or tens of metres of cable needs only a few dozen credits. For a metro disaster-recovery link of tens or hundreds of kilometres, the switch must reserve over a thousand buffers for that port. Newer generations send frames faster, so the same distance needs more credits: at 32GFC over 10 km with 40 credits, utilisation falls to only {fc32}. FC doubles with each generation: 1GFC (launched 1997), 16GFC (2011), 32GFC (2016), 64GFC (2020). 128GFC switches were announced in November 2025 (Chapter 10). Credits solve the problem for one link between two ends. How congestion spreads through a whole network, and how it is isolated, is a topic of its own in Fibre Channel fabrics, and is not expanded here.

The model leaves out the time for the receiver to process a frame and the other primitives between frames, and assumes frames follow one another at the same size. The rates of each generation are taken from the FCIA speed roadmap, quoted through a table compiled on Wikipedia; the FCIA original was not opened. The 12425 MB/s for 128GFC is the figure in that table. {.take}

## The latency bill, hop by hop {#ch5}

::: strings
toc: The latency bill, hop by hop
:::

The time for one read request is the drive itself plus the time each layer adds along the way. While the drive is slow, nobody cares about a few tens of microseconds of network. Once the drive answers in tens of microseconds, the network is the biggest item on the bill. {.law}

This is the same point as in <a href='../why-nvme-is-fast/#ch1'>“Why NVMe Is So Fast”, Chapter 1</a>, carried onto the wire. There, faster media exposed the tens of microseconds of SATA and AHCI; here, once the drive leaves the enclosure, a stretch of network is added. We look at the hardest case: queue depth 1, a 4 KiB read, with the next request sent only after the previous one returns.

::: diagram dg-path keys=dg.path
cap: Where one remote read goes. The colours match the model's bar below: gold the drive, red the protocol stacks and network cards at both ends (from measured round trips), violet the fibre, cyan the switches. Schematic, not to scale.
aria: Diagram: the path of one remote read: the host's application, protocol stack and network card, through switches and fibre, to the target's network card, protocol stack and drive. The colours match the four parts of the model below: the drive, the stacks and cards at both ends, the fibre, the switches
host: Host
tgt: Target
app: Application
stack: Protocol stack (kernel or user space)
nic: Network card
disk: Drive
sw: Switch
fibre: Fibre, d km
twice: The request goes out and the data comes back: fibre and switches count twice
lm: Drive: flash, about {nand} µs (one of three presets)
lf: Stacks and cards at both ends: measured round trip from {fLo} µs (RDMA, user space) to {fHi} µs (TCP, kernel)
lp: Fibre: {uskm} µs per km one way
ls: Switch: {sw} µs per switch each way (tuned)
:::

For the network stretch we use published measurements. The SPDK 24.05 performance report used two Xeon Gold 6348 servers, Mellanox ConnectX-5 100 GbE network cards and a direct point-to-point link with no switch. The target served a **null device** (null bdev), which stores no data and answers at once. It measured queue-depth-1 4 KiB random reads: NVMe/RDMA added 4.72 µs in user space and 12.10 µs in the Linux kernel, across both ends; NVMe/TCP added 17.50 µs in user space and 21.39 µs in the kernel. Because the far side has no real drive, these numbers are the entire extra time the network adds. Another measurement (a 2021 Chelsio white paper, with real drives, remote minus local) found that kernel NVMe/TCP adds 21.46 µs, almost the same as SPDK’s figure.

::: lab ch5-model
model.title: Model 5 · The bill for one 4 KiB read
model.how: Change the kind of drive and how the network is built, and drag the distance and the number of switches in between. Each bar is drawn to scale; watch “share taken by the network”.
model.aria: Latency of one 4 KiB random read: media, network stack, fibre propagation and switches
leg.media: The drive itself
leg.fabric: Network stack (measured)
leg.prop: Fibre propagation
leg.sw: Switches (tuned parameter)
ctl.m: Drive
m.hdd: Hard disk
m.nand: NVMe SSD
m.ull: Ultra-low-latency SSD
ctl.t: Network
t.local: Local PCIe
t.rdmaSpdk: RDMA user space
t.rdmaKernel: RDMA kernel
t.tcpSpdk: TCP user space
t.tcpKernel: TCP kernel
ctl.d: Distance
ctl.h: Switches
read.total: Total time for one read
read.net: Time added by the network
read.share: Share taken by the network
read.iops: Per second at depth 1
cv.net: Network {v}
cv.x: Time for one read
say.local: The drive is local, so there is no network item, and distance and switches do not apply. Total *{total}*.
say.tiny: The network adds {net}, which is only *{share}*. The drive itself is so slow that the network hides in the margin of error.
say.mid: The network adds {net}, *{share}* of the total. At depth 1 that is {iops}.
say.dom: The network dominates: it adds *{net}*, *{share}* of the total, more than the drive itself. At depth 1 it manages only {iops}.
:::

The three drive classes reuse the figures from [[why-nvme-is-fast#ch1|Chapter 1 of “Why NVMe Is So Fast”]]. With kernel NVMe/TCP, the network takes {bhS} of the total for a hard disk, {bnS} for an NVMe SSD (a total of {bnT} µs, or {bnI} per second at depth 1), and {buS} for an ultra-low-latency SSD. Switching to user-space NVMe/RDMA brings the NVMe SSD share down to {brnS}, and the ultra-low-latency SSD to {bruS}. Distance counts too: 10 km of fibre adds {bkProp} µs for the round trip, and with two switches added a read takes {bkT} µs. Each switch is counted as 1 µs one way; this is a tuned parameter. With three switches, halving or doubling that figure keeps the total between {bswLo} and {bswHi} µs, and the conclusion does not change.

This is why data centres moved NVMe onto the network, and why they chose the transport they did. In the hard-disk era, iSCSI being tens of microseconds slower mattered to nobody. In the flash era, the network stack itself became the thing to optimise. The savings do not come mainly from the wire (4 KiB on 100 GbE takes a fraction of a microsecond), but from **the software at the two ends**: the kernel protocol stack, interrupts and copies. The next chapter looks at how RDMA removes them, and what that costs.

Measured values come from particular network cards, processors and software versions; different hardware gives different numbers. The null-device measurement also includes the host’s own I/O software stack (which a local read pays too, a few microseconds) and a very small amount of processing at the target, so “time added by the network” is slightly overstated. With deep queues, latency can be hidden by parallelism (Little’s law, [[why-nvme-is-fast#ch2|Chapter 2 of “Why NVMe Is So Fast”]]); here only depth 1 is examined. {.take}

## The cost of one lost packet: TCP, RDMA and lossless Ethernet {#ch6}

::: strings
toc: The cost of one lost packet: TCP, RDMA and lossless Ethernet
:::

RDMA lets the network card place data straight into the other side’s memory, bypassing both operating systems, and it saves those dozen-odd microseconds. The price is that its network cards cope worst with loss: if one packet is lost, everything sent after it must be sent again. So RDMA demands an Ethernet that does not drop packets, and Ethernet naturally drops them. {.law}

Every byte of TCP passes through the operating system: it is copied from the application’s memory into the kernel, checksummed, segmented, and its acknowledgements are processed, and the far side does the same in reverse. **RDMA** (Remote Direct Memory Access) hands this work to the network card. The application registers a block of memory in advance, and the far side’s card can write into it directly, without the CPU and without copying (queue pairs and one-sided writes inside the card: <a href='../how-a-nic-moves-packets/#ch11'>“How a Network Card Moves Packets”, Chapter 11</a>). This is called **kernel bypass** and **zero copy** (the ways of bypassing the kernel inside one machine: <a href='../how-the-os-talks-to-hardware/#ch12'>“How the OS Talks to Hardware”, Chapter 12</a>). RDMA originally ran over InfiniBand. **RoCE v2** wraps InfiniBand’s transport headers in UDP (port 4791, registered with IANA in 2014), so it runs over ordinary Ethernet.

::: diagram dg-rdma keys=dg.rdma
cap: What RDMA saves is the red block: the copy and the protocol work in the kernel. The queues inside an RDMA card are in chapter 11 of <a href='../how-a-nic-moves-packets/#ch11'>“How a Network Card Moves Packets”</a>. Schematic.
aria: Diagram: above, TCP: the data is copied from the application's buffer into the kernel, which segments, checksums and acknowledges it, then hands it to the network card; the far side does it all in reverse. Below, RDMA: memory the application registered in advance, read and written by the card directly with DMA, with no copy and no kernel; the far card writes straight into the other machine's memory
tcp: TCP: every byte passes through the operating system
buf: Application buffer
copy: copy
kern: Kernel: socket buffers; TCP/IP segments, checksums, acknowledgements (the CPU does this)
nic: Network card
peer: The far side does it all again in reverse
rd: RDMA (RoCE v2: the InfiniBand transport header inside UDP, port {port})
reg: Registered memory (with a key, rkey)
dma: The card reads and writes it with DMA: no copy, no kernel
rnic: RDMA card: the transport lives in the card
peer2: The far card writes straight into memory
note: The cost: common RoCE cards handle loss with go-back-N, so one lost packet means resending a run of them (next diagram).
:::

The problem is what happens when a packet is lost. When TCP loses one packet, the receiver tells the sender “I am missing this one”, and only that one is resent (selective acknowledgement). Common RoCE cards, however, use **go-back-N**: from the lost packet onwards, everything already sent is sent again (Mittal et al., SIGCOMM 2018). The more packets in flight in one round trip, the bigger the cost of a single loss. The textbook result (Stallings, Chapter 7) is that go-back-N utilisation = (1−p)/(1+(W−1)p), where W is the number of packets that can be sent in one round trip and p is the loss rate. TCP has its own cost: it treats loss as a sign of congestion and slows itself down. The classic upper bound from Mathis et al. (1997) is: rate ≤ (maximum segment size ÷ round-trip time) × √(3/2) ÷ √p.

::: diagram dg-gbn keys=dg.gbn
cap: The same single loss: go-back-N resends everything sent after it, selective repeat fills in just that one. The more packets are in flight per round trip, the more go-back-N resends for each loss. Schematic: only 8 packets drawn.
aria: Diagram: 8 packets sent, the 3rd lost. Go-back-N resends everything from the 3rd on, 3 to 8; selective repeat resends only the 3rd
sent: Packets sent; the 3rd is lost
gbn: Go-back-N: resend everything from the lost one on
sr: Selective repeat: resend only the lost one
lr: Resent
lk: Already received, kept
:::

::: lab ch6-model
model.title: Model 6 · Loss rates from one in ten million to one in ten
model.how: Drag the loss rate and the round-trip time, and change the link rate. There are three curves: red is RDMA with go-back-N, cyan is the ideal case where only the lost packet is resent, and purple is the ceiling of TCP (Reno), which slows itself down in response to loss.
model.aria: Effective rate of go-back-N, selective retransmission and TCP at different loss rates
leg.gbn: RDMA (go-back-N)
leg.sr: Resend only the lost one
leg.tcp: TCP rate ceiling (Mathis)
ctl.p: Loss rate
ctl.r: Round-trip time
ctl.g: Link
read.W: Packets per round trip
read.gbn: RDMA (go-back-N)
read.sr: Resend only the lost
read.tcp: TCP ceiling
cv.x: Loss rate (log)
cv.y: Effective rate as a share of the link
say.fine: At loss rates this low, all three approach full speed: go-back-N {gbn}, TCP {tcp}.
say.gbnWorse: With {W} packets in flight, go-back-N has to resend a long run whenever one is lost, and it drops to *{gbn}*. Resending only the lost packet gives {sr}.
say.tcpWorse: Go-back-N still reaches {gbn}, but TCP treats loss as congestion and slows itself to *{tcp}*. Inside a data centre, TCP also fears loss.
:::

The default is 100 Gb/s, a 20 µs round trip and a loss rate of one in a thousand. {lW} 4 KiB packets are in flight in one round trip, and go-back-N still reaches {l3g}; raise the loss rate to one in a hundred, and it drops to {l2g}. Raise the round trip to 200 µs (a large, queued network), {l3fW} packets are in flight, and a loss rate of one in a thousand drops it to {l3fg}. To keep go-back-N at nine-tenths of the link, the loss rate must be below {pg} at 20 µs, and below {pgf} at 200 µs. The TCP line is steeper: at one in a thousand loss, a Reno-style TCP ceiling is only about {l3t} Gb/s, and to hold nine-tenths the loss rate must be below {pt}.

So deployments of RoCE must make Ethernet **lossless**. They turn on **PFC** (priority-based flow control, IEEE 802.1Qbb), which makes the upstream pause when a switch buffer is nearly full: the same idea as Fibre Channel’s credits in Chapter 4. They also add **ECN** marking, with congestion control such as DCQCN, so the sender slows down before the buffers fill. PFC has troubles of its own. One paused port also halts innocent traffic upstream (head-of-line blocking), and a poor configuration can make traffic wait on itself until it deadlocks (Guo et al., SIGCOMM 2016, recorded these problems in a large deployment). Mittal et al. (2018) argue instead for letting the network card learn to resend only the lost packets, which would make PFC optional. The Ultra Ethernet work in Chapter 10 also follows this line.

All three curves assume losses are independent and random. Real losses often arrive in bursts (buffer overflow), and go-back-N and TCP would both behave differently. The constant √(3/2) in the Mathis formula is derived for periodic loss with every packet acknowledged; the same paper gives about 1.31 for random loss and less (about 0.87) with delayed acknowledgements, which moves the TCP line down by up to about 30% or up by under 10%, but at the defaults it stays far below go-back-N. The Mathis formula describes Reno-style congestion control; CUBIC, BBR, DCTCP and others react to loss differently. It is used here only to show that loss makes TCP slow itself down, and it does not represent any system’s measured performance. {.take}

## NVMe-oF: moving the queue onto the wire {#ch7}

::: strings
toc: NVMe-oF: moving the queue onto the wire
:::

NVMe-oF does not translate commands. The 64-byte submission entry and 16-byte completion entry of a local NVMe drive are carried unchanged, in “capsules”, over TCP, RDMA or Fibre Channel to a queue on the far side. What it saves is the SCSI layer; what it cannot save is the round trips. {.law}

A local NVMe drive has a pair of submission and completion queues. The host places a 64-byte command in the queue and rings a doorbell, and the drive puts a 16-byte completion entry back when the work is done (<a href='../why-nvme-is-fast/#ch4'>“Why NVMe Is So Fast”, Chapter 4</a>). NVMe over Fabrics stretches that pair of queues across the network: commands travel in **command capsules**, and completions in **response capsules**. Each CPU core can have its own queue pair running all the way to the far side, rather than queuing behind a single session as iSCSI does (why many queues matter is covered in <a href='../why-nvme-is-fast/#ch3'>Chapter 3 of the same essay</a>).

Over TCP, the NVMe/TCP specification (version 1.1, 5 August 2024) defines several packet types. Each begins with an 8-byte common header. A command packet’s header is 72 bytes (8 plus the 64-byte command), a response packet 24 bytes, and data and R2T packets are also 24 bytes; the connection-setup handshake packet is 128 bytes. When read data comes back, the last data packet can carry the SUCCESS flag, saving a response packet. Writes, as with iSCSI, either carry the data inside the command (**in-capsule data**) or wait for the far side to send R2T. Over RDMA, commands and completions are sent with SEND. For reads, the target writes the data directly into host memory with RDMA WRITE; for writes, it fetches the data directly from host memory with RDMA READ.

::: diagram dg-caps keys=dg.caps
cap: From top to bottom, the layers around one command. Cyan is the command itself, grey the transport's own header, violet the network. The extra bytes on the wire hardly differ (see the model below); what differs is who handles the layers underneath. Schematic, not to scale.
aria: Diagram: how three transports wrap one command. iSCSI: the SCSI command inside the 48-byte iSCSI header, over TCP, IP and Ethernet. NVMe/TCP: the 64-byte NVMe command inside a 72-byte command PDU header, over TCP, IP and Ethernet. NVMe/RDMA: the 64-byte NVMe command sent with SEND, under a 12-byte InfiniBand transport header, UDP, IP and Ethernet
ti: iSCSI
tt: NVMe/TCP
tr: NVMe/RDMA (RoCE v2)
cdb: SCSI command (a {cdb}-byte CDB field)
bhs: iSCSI header (BHS) {bhs} bytes, the CDB inside
sqe: NVMe command, {sqe} bytes
pdu: Command PDU header: {ch}-byte common header, {cmd} bytes with the command
send: NVMe command, {sqe} bytes, sent with SEND
bth: InfiniBand transport header (BTH) {bth} bytes
tcp: TCP (header {tcp} bytes or more)
udp: UDP (header {udp} bytes, port {port})
ip: IP (header {ip} bytes)
eth: Ethernet (header {eth} bytes)
ni: The command is SCSI
nt: The command is NVMe as is, no translation; the host's stack handles TCP/IP
nr: The command is NVMe as is, no translation; the card handles the transport
:::

::: lab ch7-model
model.title: Model 7 · The round trips of one I/O
model.how: Change the transport, read or write, whether the data is carried inside the command, and the size of the transfer. Each arrow in the diagram is one message, and time runs from top to bottom. The readouts give the number of messages, the round trips, and the efficiency on the wire (not counting pure acknowledgements).
model.aria: Message sequence of a read or write over iSCSI, NVMe/TCP and NVMe/RDMA
ctl.t: Transport
t.iscsi: iSCSI
t.tcp: NVMe/TCP
t.rdma: NVMe/RDMA (RoCE v2)
ctl.o: Operation
o.read: Read
o.write: Write
ctl.s: Transfer size
s.4k: 4 KiB
s.64k: 64 KiB
ctl.icd: Data carried in the command
read.m: Messages
read.rt: Round trips
read.hdr: Headers and overhead
read.eff: Efficiency on the wire
cv.host: Host
cv.target: Target
cv.more: … {n} more
cv.lab: {m} · {b}
m.iscsi.cmd: SCSI command packet
m.iscsi.din: Data (Data-In)
m.iscsi.dout: Data (Data-Out)
m.iscsi.r2t: R2T: go ahead
m.iscsi.rsp: SCSI status
m.tcp.cmd: Command capsule
m.tcp.c2h: Data (C2HData)
m.tcp.h2c: Data (H2CData)
m.tcp.r2t: R2T: go ahead
m.tcp.rsp: Response capsule
m.rdma.send: SEND: command capsule
m.rdma.write: RDMA WRITE: data into host memory
m.rdma.readreq: RDMA READ request
m.rdma.readresp: RDMA READ response: data
m.rdma.sendc: SEND: response capsule
say.one: {msgs} messages; round trips: *{rt}*; efficiency on the wire {eff}.
say.two: The data is not carried in the command, so one more wait is needed: {msgs} messages; round trips: *{rt}*; efficiency on the wire {eff}.
:::

For a 4 KiB read, NVMe/TCP takes {ctM} messages and {ctRt} round trips, with {ctH} bytes of packet headers and Ethernet overhead, an efficiency of {ctE}. iSCSI carries {ciH} bytes of overhead, an efficiency of {ciE}, almost the same. NVMe/RDMA takes {crM} messages, {crH} bytes of overhead, an efficiency of {crE}. At 64 KiB, the three efficiencies are {cr64E}, {ct64E} and {ci64E}. **The bytes on the wire hardly differ**, and neither do the round trips: a read takes one round trip. A write with the data not inside the command takes {cwtRt} round trips over NVMe/TCP and {cwrRt} over NVMe/RDMA; with the data inside, {cwiRt}. The difference lies in the “network stack” line of Chapter 5’s bill: the same messages, but who handles them, whether they enter the kernel, and whether they are copied.

NVMe also runs over Fibre Channel (FC-NVMe, defined by the T11 committee of INCITS). It uses FC frames and the credits of Chapter 4. This page did not open its specification, and does not draw its messages. The NVMe command set itself is maintained by the NVM Express organisation, and since NVMe 2.0 in 2021, each network transport has been a separate specification.

The model does not draw pure acknowledgements (TCP’s ACKs, and the acknowledgements of an RDMA reliable connection). It assumes a read’s data travels in a single C2HData packet, an RDMA MTU of 4096 bytes, and TCP over 1500-byte Ethernet frames. Jumbo frames would raise the efficiency of the two TCP-based transports by a few percentage points. {.take}

## Two paths: multipath and failover {#ch8}

::: strings
toc: Two paths: multipath and failover
:::

A storage network always connects two paths. In normal times requests go only down the good path, and only spill onto the poorer one when the good path is overloaded. The real danger is when the good path fails: every request piles onto the poorer path, which cannot cope, and the queue grows without limit. {.law}

<a href='../how-sas-works/#ch4'>“Why Server Drives Use SAS”, Chapter 4</a> worked out the availability of dual paths: the chance that two independent paths fail together is small. Network storage is the same. The host has two network cards (or two HBAs), crosses two switches, and reaches the storage’s two controllers. But the two paths are often not equally good: a drive (or a volume) is usually owned by one controller, and reaching it through the other means an extra hop over the internal link between controllers. SCSI uses **ALUA** (Asymmetric Logical Unit Access), and NVMe uses **ANA** (Asymmetric Namespace Access), to mark each path as “optimised”, “non-optimised” or “unavailable”. The host’s multipath software chooses paths accordingly.

::: diagram dg-mp keys=dg.mp
cap: Storage networks always wire two paths, but the two are rarely equal: a volume belongs to one controller, and coming in through the other means a detour. ALUA (SCSI) and ANA (NVMe) mark each path, and the host's multipath software picks by those marks. Schematic.
aria: Diagram: a host connected through two switches to the two controllers of an array. The volume belongs to controller A: through switch 1 to controller A is the optimized path; through switch 2 to controller B, then across the link between the controllers to A, is the non-optimized path
host: Host: two network cards or HBAs, multipath software picks
sw1: Switch 1
sw2: Switch 2
ca: Controller A
cb: Controller B
vol: Volume: owned by controller A
ic: Link between the controllers
opt: Green: the optimized path (marked optimized by ALUA / ANA)
non: Red dashes: the non-optimized path, with an extra hop between the controllers
:::

What is the best way to split? Treat each path as a queueing server (an M/M/1 queue; Kleinrock, Queueing Systems, Volume 1). Path 1 can serve μ1 requests per second, path 2 only μ2; λ requests arrive each second and are split in proportion. The mean response time = p/(μ1−pλ) + (1−p)/(μ2−(1−p)λ). The split that minimises it has an elegant form, called the **square-root rule**: each path’s spare capacity is proportional to the square root of its speed.

::: lab ch8-model
model.title: Model 8 · Two paths of unequal speed: how requests are split
model.how: Drag the requests per second and “how fast the non-optimised path is”. The four curves are the mean latency of four ways of splitting. The dashed line is the latency when “the optimised path has failed and only the non-optimised one is left”, which shoots up at the capacity of the poorer path.
model.aria: Mean latency against load for different ways of splitting across two paths
leg.opt: Optimised path only
leg.rr: Alternate between the two
leg.prop: Split in proportion to speed
leg.best: Square-root rule (best)
leg.fail: Optimised path failed
ctl.l: Requests per second
ctl.q: Speed of the non-optimised path
read.opt: Optimised path only
read.best: Best split
read.pb: Share on optimised path, best split
read.fail: After the optimised path fails
cv.x: Requests per second (thousands)
cv.y: Mean latency (µs)
unit.q: {v} of the optimised path
say.optOnly: Load is light, so using only the optimised path is best: *{opt}*. If the optimised path fails, the poorer path copes, and the latency becomes {fail1}.
say.spill: Using both paths is better: {pb} on the optimised path and the rest on the poorer one gives a mean of *{best}*. The optimised path alone gives {opt}, and alternating gives {rr}. If the optimised path fails, the latency becomes {fail1}.
say.noFail: Putting {pb} on the optimised path and the rest on the poorer one gives a mean of *{best}* (optimised path only is {opt}). But if the optimised path fails, the one left cannot carry this many requests, and *the queue grows without limit*.
say.noFailOpt: Using only the optimised path is best: *{opt}*. But if it fails, the capacity of the remaining path is not enough, and *the queue grows without limit*.
say.over: There are too many requests for the optimised path alone, so both paths must share the load. The best split is *{best}*. If either path fails, the other cannot cope.
say.overAll: More requests arrive than both paths together can serve: no split copes, and *the queue grows without limit*.
:::

The default is an optimised path that handles {mpMu1} requests per second, a non-optimised path half as fast ({mpMu2} per second), and {mpLam} requests arriving each second. The optimised path alone averages {mpOpt} µs. Alternating between the two gives {mpRr} µs (the poorer path is overloaded). Splitting in proportion to speed gives {mpProp} µs. The square-root rule sends {mpPb} of the requests to the optimised path, for {mpBest} µs. When the load drops to {mpLamLow} requests per second, the square-root rule sends {mplPb} of the requests to the optimised path ({mplOpt} µs). This is exactly the default of ALUA and ANA, which use the optimised path and keep the others as standby. But at the default load, if the optimised path fails, the poorer path cannot cope, and requests pile up. To survive a failover, spare capacity must be kept in normal times: at {mpLamSafe} requests per second, the mean latency after failover is {mp45F} µs.

Switching also takes time, and in seconds, six orders of magnitude more than the microseconds used here. First the host has to notice that the path has failed. By default, the Linux NVMe-oF host uses a 5-second keep-alive timeout and sends a keep-alive command every 2.5 seconds, reconnects every 10 seconds after a disconnect, and tries for at most 600 seconds before giving up on the controller. open-iscsi by default sends a NOP-Out probe every 5 seconds with a 5-second timeout, and holds the error for 120 seconds after the session drops before passing it up. (Once it reaches the multipath software, that software switches I/O to the other path at once.) During these waits, the application sees a stall.

The rate ratio of the two paths is a tuned parameter; in reality the extra latency of a non-optimised path is mostly fixed delay, not just a lower rate. M/M/1 assumes requests arrive at random and service times are exponential, whereas real storage requests are more regular. The Linux timeouts are default settings; distributions and storage vendors often recommend different values. {.take}

## Cut into pieces: three replicas or erasure coding {#ch9}

::: strings
toc: Cut into pieces: three replicas or erasure coding
:::

Drives will fail. Keeping three copies survives two failures and costs three times the space. Cutting data into 10 blocks plus 4 blocks of parity survives four failures for only 40% extra space, at the cost of reading ten blocks to repair one. {.law}

Object stores and distributed file systems do not depend on any single machine: the data is cut apart and scattered across many drives on many machines. The simplest method is **replication**: keep three copies, on different machines. The space-saving method is **erasure coding**: cut the data into k blocks, compute m blocks of parity, and any m lost blocks can be recomputed from the remaining k. Reed–Solomon codes are one such family (how the code works is a separate subject; only its results are used here). Facebook’s HDFS clusters used RS(10,4): 10 blocks of data and 4 of parity (Sathiamoorthy et al., VLDB 2013). For how replicas keep in step, see <a href='../distributed-systems/#step0'>“Distributed Systems · How Replicas Behave Like One Value”</a>.

::: diagram dg-ec keys=dg.ec
cap: Each box is one piece on a separate machine. The counts are exact, the sizes schematic. The crossed-out piece has failed: three replicas copy it back from another copy; RS(10,4) reads one piece from each of 10 machines and computes it.
aria: Diagram: above, three replicas: the same data stored three times on three machines. Below, RS(10,4): the data cut into 10 fragments plus 4 computed parity fragments, 14 fragments on 14 machines; rebuilding a lost one (the crossed-out fragment) reads one fragment from each of 10 other machines
rt: Three replicas: the same data stored {rep} times
copy: Copy
rn: {rov}× the space, survives 2 failures; rebuilding one reads it from another copy
et: RS(10,4): cut into {ek} data fragments, plus {em} parity fragments
dk: {ek} data
pm: {em} parity
en: {ov}× the space, survives {em} failures; the cost: rebuilding one fragment reads one from each of {ek} machines
:::

The space cost and the number of failures survived are exact: with n blocks, of which k hold data, the space is n/k times the data, and it survives n−k failures. Whether data is lost depends on how fast drives fail and how long repair takes. In Backblaze’s published statistics for 2025, the equivalent of {bbDY} drives running for a full year produced {bbF} failures, an annual failure rate of {afr}. The standard estimate is a Markov model: the drives in a group fail independently, a failed drive starts being repaired, and data is lost only if, before a repair completes, more than n−k drives have failed.

::: lab ch9-model
model.title: Model 9 · How much space buys how many nines
model.how: Choose a layout, and drag the annual failure rate and how long it takes to repair one drive. On the left, how many times the data’s size the space takes; on the right, the probability of losing this group of data in one year, converted into “nines”.
model.aria: Space overhead and yearly probability of data loss for four redundancy schemes
ctl.s: Layout
s.mirror: Two copies
s.rep3: Three copies
s.rs63: RS(6,3)
s.rs104: RS(10,4)
ctl.a: Annual failure rate
ctl.m: Time to repair one
read.o: Space
read.m: Drive failures survived
read.n: No loss in a year
read.r: Blocks read to repair one
cv.o: Space (×)
cv.n: Nines, one year
say.rep: Replicas: space *{o}*; it survives losing {m} of its drives at once, and repairing a drive reads only {reads} block, from another replica. The chance that this group of data survives a year without loss is about *{nines}*.
say.ec: Erasure coding: space only *{o}*; it survives losing {m} of its drives at once, about *{nines}*. The price is that repairing a drive reads {reads} blocks, and reading a damaged block means computing it on the fly.
:::

With an annual failure rate of {afr} and a 24-hour repair, three replicas take {e3o}× the space and give about {e3n} nines. RS(10,4) takes only {e10o}× the space and gives about {e10n} nines. Two copies give about {e2n} nines, and RS(6,3) takes {e63o}× the space for about {e63n} nines. Repair time is a tuned parameter. At 48 hours, three replicas drop to about {e3nh} nines and RS(10,4) to about {e10nh}, and the ordering does not change. Erasure coding looks both cheaper and more reliable, but **its cost is in repair and small writes**. Repairing one lost block means reading one block from each of 10 machines to recompute it. The XORing Elephants paper estimates that in a Facebook cluster of 3,000 nodes, repair traffic accounts for 10 to 20% of the roughly 2 PB of network traffic the whole cluster generates each day. Changing one object means recomputing its parity, and while a drive is down, reading its data means computing it on the fly. So many systems keep hot data on replicas and cold data on erasure codes.

These “nines” are only the output of the model. It assumes that drives fail independently, but real failures often come in batches: the same production lot, a rack losing power, the same firmware bug. Greenan, Plank and Wylie (HotStorage 2010) specifically criticised the mean-time-to-data-loss (MTTDL) calculation, arguing that it seriously overstates reliability. The “11 nines” that vendors quote in marketing is the vendor’s own claim, not something this kind of model can verify.

The model is a Markov approximation that requires repair to be much faster than failure. It computes one group of n drives, while a cluster has thousands of groups, so the overall probability of loss must be multiplied by the number of groups. The model leaves out the effect of network bandwidth on repair time, and latent sector errors on the drives. {.take}

## Where the frontier is (as of November 2026) {#ch10}

::: strings
toc: Where the frontier is
:::

The network storage specifications are steadily being updated, and NVMe/TCP is already in the mainstream operating systems. What is changing is the network itself: faster Fibre Channel, Ethernet transports redesigned for AI, and CXL, which puts memory rather than drives on the far side of the network. {.law}

The facts below are dated, and their sources are listed in BRIEF.md. They fall into three groups: those written into specifications; those built and released; and those claimed by a company or organisation but not yet delivered.

### Already written into specifications {#h.est .sub3}

- NVM Express released the NVMe 2.4 set of specifications on **4 August 2026**, including updates to the TCP and RDMA transport specifications. The NVMe/TCP header sizes used on this page come from version 1.1 of 5 August 2024; I have not opened the version within the 2.4 set. {#e1}
- The iSCSI standard is still RFC 7143 of April 2014. The default parameters in Chapter 3 of this page all come from it. {#e2}
- The Ultra Ethernet Consortium (UEC) released version 1.0 of its specification on **11 June 2025**. It is aimed at AI and high-performance computing, covers network cards, switches and cables, and calls itself “modern RDMA for Ethernet and IP”. The CXL Consortium released CXL 4.0 on **18 November 2025**, doubling the speed to 128 GT/s per lane. {#e3}

### Released and delivered {#h.demo .sub3}

- Linux has included NVMe/TCP host and target code since **version 5.0 (3 March 2019)**; the kernel measurements in Chapter 5 of this page come from it. On **13 March 2026** Microsoft announced that the Windows Server Insider preview includes a built-in NVMe-oF initiator (supporting TCP and RDMA). The released Windows Server 2025 does not include this feature. {#d1}
- On **19 November 2025** Broadcom released 128G Fibre Channel directors and switches (the switch has 56 ports at 128G), calling it the industry’s first 128G FC platform. I have not found a shipping 128G HBA (the host-side card). {#d2}
- Measurements cited in Chapter 5: the SPDK 24.05 report (2024) and the Chelsio white paper (2021). They show how much latency NVMe/RDMA and NVMe/TCP add on particular hardware, and do not represent all systems. {#d3}

### Claimed, not yet delivered {#h.claim .sub3}

- UEC claims its specification can scale to “millions of endpoints”, and that implementations and compliance tests are under way. It uses a transport that does not depend on a lossless network, which is the route of Chapter 6. This is the consortium’s claim; I have seen no independent data from large-scale deployments. {#c1}
- The CXL 4.0 announcements emphasise wider **memory pooling**, letting several servers share one pool of memory. It addresses memory, not storage: it is lost at power-off, its latency is in the hundreds of nanoseconds, and it is not the same thing as the drives on this page. For why it matters, see <a href='../why-compute-waits-for-memory/#ch10'>“Why Compute Waits for Memory”, Chapter 10</a>. {#c2}
- The FCIA roadmap lists 256GFC (FC-PI-9) as the next generation. This is a standards body’s plan, and there is no standard or product yet. For storage paths that feed data directly to GPUs (GPUDirect Storage and similar), see <a href='../why-nvme-is-fast/#ch8'>“Why NVMe Is So Fast”, Chapter 8</a>. {#c3}

For network storage to take another step forward, the “network stack” line of the Chapter 5 bill has to keep shrinking, without requiring the whole network to be lossless (Chapter 6). The routes differ in their bets: RDMA with lossless Ethernet, TCP implemented in the network card, or a redesigned transport as UEC proposes. I do not predict which will win.

The facts in this chapter will go out of date. For claims such as “how much of the market NVMe-oF already has”, I found only vendor and analyst estimates and no verifiable statistics, so none are given. {.take}

## Three questions when you see “network storage” {#ch11}

::: strings
toc: Three questions when you see “network storage”
:::

First ask whether it lends you blocks, files or objects. Then ask how many round trips a request takes, and how long each one is. Finally ask whether the remaining path can carry the load if one path fails. {.law}

{.plain .qs}
1. **What are you being lent?** A NAS lends a folder, which several computers can use together, but every file opened has to be asked about again (Chapter 2). iSCSI, Fibre Channel and NVMe-oF lend a drive, which only one machine can format and mount (Chapter 1). Object storage lends whole items that cannot be changed in the middle (Chapter 9). The answer to “what protocol does a NAS use” is SMB or NFS; “SAN” usually means one of the block-level family. {#q1}
2. **How many round trips does a request take, and how long is each?** For a nearby NVMe SSD, the largest item on the bill is the software at the two ends (Chapter 5). For a distant link, it is the round trip itself (R2T in Chapter 3, credits in Chapter 4). For workloads with many small files, it is the round trips of metadata (Chapter 2). A quoted “speed” usually means large sequential reads, which may have little to do with your workload. {#q2}
3. **What happens if one path fails?** A load carried by two paths together cannot be carried by one (Chapter 8). Detecting a broken link can take seconds, and during that time applications stall. Packet loss is also a kind of failure: whether an RDMA network needs a lossless configuration is one of the first questions to ask when deploying it (Chapter 6). {#q3}

Back to the opening question. Your computer can treat a drive in someone else’s machine as its own because SCSI and NVMe commands *do not care which wire they travel on*; iSCSI, Fibre Channel and NVMe-oF simply change the envelope. The difference between NAS and SAN lies in which side keeps the file system. On the server, you can share, but every file must be asked about again. On the client, you have a disk, which is fast, but it cannot easily be shared. Data centres moved NVMe onto the network because, once flash is fast enough that tens of microseconds matter, *the network and the software at both ends become the largest items on the bill*. An NVMe queue can run all the way to the far side, with one fewer translation and fewer queues to wait in. The costs that remain are physical: light takes about five microseconds to travel a kilometre, lost packets must be resent, and when a path breaks, another must take over. {#sum .sum tag=div}

Next, read: from this series, <a href='../what-a-drive-is-made-of/'>“What a Drive Is Made Of”</a> covers platters, flash and the interface map; <a href='../how-sata-works/'>“Why SATA Has Lasted Over Twenty Years”</a>; <a href='../how-sas-works/'>“Why Server Drives Use SAS”</a> covers SCSI commands, dual ports and end-to-end checks; <a href='../why-nvme-is-fast/'>“Why NVMe Is So Fast”</a> covers the local part of the path. <a href='../how-usb-drives-talk/'>“Why a USB Drive Never Hits Its Label”</a> covers USB portable drives; how the same SCSI commands are translated inside an enclosure is in its <a href='../how-usb-drives-talk/#ch6'>Chapter 6</a>. For the network itself: <a href='../tcp-congestion/'>“Network Flow · A Message’s Journey”</a>. For replica consistency: <a href='../distributed-systems/'>“Distributed Systems · How Replicas Behave Like One Value”</a>. {#links style="margin-top:2em"}

::: footer
**Sources.** RFC 7143 (iSCSI, April 2014): §4.2.7.4, §11.2.1, §13.1, §13.10–13.17. RFC 7530 (NFSv4, March 2015): §10.3.1. NVM Express TCP Transport Specification 1.1 (5 August 2024): figures 11, 25, 26, 30–34, §3.3.1.1. Linux kernel include/rdma/ib_pack.h, drivers/infiniband/sw/rxe/rxe_hdr.h, include/linux/nvme-tcp.h, drivers/nvme/host/fabrics.h and nvme.h (read 14 November 2026); open-iscsi’s iscsid.conf; Linux nfs(5) manual. IANA port registry (3260, 4420, 4791, 8009). SPDK NVMe-oF TCP and RDMA performance report, version 24.05 (Mellanox ConnectX-5). Chelsio: 100G Kernel and User Space NVMe/TCP Using Chelsio Offload (2021). The FCIA speed table in the Wikipedia entry “Fibre Channel”. W. Stallings, Data and Computer Communications, Chapter 7. M. Mathis et al., CCR 27(3), 1997. R. Mittal et al., “Revisiting Network Support for RDMA”, SIGCOMM 2018. C. Guo et al., “RDMA over Commodity Ethernet at Scale”, SIGCOMM 2016. L. Kleinrock, Queueing Systems Vol. 1 (1975). E. D. Lazowska et al., Quantitative System Performance (1984), Chapter 5. M. Sathiamoorthy et al., “XORing Elephants”, PVLDB 6(5), 2013. K. Greenan, J. Plank and J. Wylie, “Mean time to meaningless”, HotStorage 2010. Backblaze Drive Stats for 2025 (12 February 2026). News sources for the frontier chapter are listed in BRIEF.md.

Written by an AI. The models are simplified reductions, and they mark which parameters were tuned. Not a purchasing recommendation.
:::
