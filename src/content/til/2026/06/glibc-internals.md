---
title: "glibc Internals — The Foundation Beneath Everything"
date: 2026-06-13
tags: ["systems", "c", "linux", "glibc", "malloc"]
description: "Exploring the GNU C Library — what it is, how it handles multiple CPU architectures, its malloc implementation, and how it relates to the rest of the software stack."
---

## glibc is not a package — it's the OS runtime

Unlike a Python package you `pip install`, glibc is the **C standard library that ships with Linux**. It's the API layer between user programs and the kernel. Every program that calls `malloc`, `read`, `write`, `fork`, or `printf` goes through glibc.

Python's `os.read()` calls glibc's `read()`. CPython's memory allocator calls glibc's `malloc()`. Even Rust and Go link against it by default. It's the foundation beneath virtually every language runtime on Linux.

## What it provides

- Memory management — `malloc`, `free`
- File I/O — `open`, `read`, `write`, `close`
- Process control — `fork`, `exec`, `exit`
- Threading — `pthread_create`, mutexes
- Networking — `socket`, `connect`, `send`
- DNS resolution — `getaddrinfo`
- String/math — `strlen`, `sin`, `sqrt`

## Multi-architecture support — not like Python wheels

Python wheels are the same source compiled separately per platform, downloaded at install time. glibc takes a completely different approach: **all architecture code lives in one repo**, and a directory override system picks the right implementation at build time.

The key is the `sysdeps/` directory (~11k files), organized as a layered hierarchy:

```
sysdeps/
  generic/           ← portable C fallback
  unix/sysv/linux/   ← Linux-specific overrides
  x86_64/            ← x86-64 hand-tuned assembly
  aarch64/           ← ARM64 optimized
```

When building on x86-64, the build system searches most-specific first. If `sysdeps/x86_64/memcpy.S` exists, it wins over `sysdeps/generic/memcpy.c`. It's like method override in OOP — the most specific directory "overrides" the generic implementation.

Not every folder in `sysdeps/` is an architecture. It mixes CPU architectures (`x86_64`, `aarch64`, `riscv`), OS families (`unix`, `gnu`), standards (`ieee754`, `posix`), threading models (`nptl`, `htl`), and word sizes (`wordsize-32`, `wordsize-64`).

glibc supports essentially every architecture that runs Linux: x86-64, ARM64, ARM, RISC-V, PowerPC, s390, MIPS, SPARC, LoongArch, and several niche/legacy ones.

## malloc — the allocator everyone uses

glibc's malloc is based on **ptmalloc2** (derived from dlmalloc). The core is in `malloc/malloc.c`.

Three allocation strategies by size:

- **< ~64 bytes** → **Tcache**: per-thread cache, no locking, fastest path
- **Small/medium** → **Bins** (fast, small, large, unsorted): linked lists of free chunks in an arena
- **Very large (≥128KB)** → **mmap**: directly mapped from kernel, bypasses the arena

Thread scalability comes from **arenas** — instead of one global heap with a single lock, each thread gets its own arena.

The malloc **backend** is how it gets raw memory from the OS: `sbrk()` extends the heap linearly (used for the main arena), and `mmap()` maps arbitrary pages (used for large allocations and non-main arenas).

## Alternatives to glibc's malloc

You can swap glibc's malloc for alternatives via `LD_PRELOAD`:

- **jemalloc** — used by FreeBSD, Firefox, Redis
- **tcmalloc** — from Google
- **snmalloc** — from Microsoft Research, uses message-passing for cross-thread frees and stores metadata out-of-band for security

## The software stack

```
Your program (Python, C, Rust, etc.)
    ↓
libstdc++ / libc++  (C++ standard library, if C++)
    ↓
glibc               (C standard library)
    ↓
Linux kernel
```

`libstdc++` (GCC's C++ standard library) sits on top of glibc — `std::vector` calls `malloc`, `std::cout` calls `write`, `std::thread` calls `pthread_create`.

## Contributing to glibc

It's one of the harder open source projects to contribute to: email-based patch workflow (no GitHub PRs), FSF copyright assignment required, extremely rigorous review, and long review cycles. Even a one-line fix can have system-wide ABI implications.