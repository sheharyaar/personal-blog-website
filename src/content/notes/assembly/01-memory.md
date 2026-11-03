---
title: Memory
---

## Memory Addressing Modes

It is the way that the CPU finds a value of an instruction

-   **Immediate Mode**: When the value is already in the instruction. `movq $5, %rax` . The `$` denotes that
    immediate value has to be used.
-   **Register Mode**: When the value is present in a register.
-   **Direct memory mode**: When the value is at an address (even addresses bookmarked by labels — if we add
    `$` in front of the label, we can get the numerical address).
-   **Register Indirect Mode**: Register holds the value of the address to access. It is accessed using `()` ,
    example - `(%rbx)` .

All the access modes come from the **General Addressing Mode** syntax: `VALUE( BASEREG, IDXREG, MULTIPLIER)`

-   So $$ address= value + base\_reg + idx\_reg * multiplier $$
    -   **base_reg** and **idx_reg** are registers.
    -   **value** is a fixed value
    -   **multiplier** is a fixed multiplier
-   If any part is left out it is assumed to be $0$, except the multiplier is assumed to be $1$.

This mode gives rise to the following modes as well:

-   **Indexed Mode**:
    -   The _base_ is **empty**.
    -   _value_ is the address of the array.
    -   _idx_reg_ is the index.
    -   _multiplier_ is the size of element of the array.
    -   `myarray( , %rbx, 8)` for an array of quad words, and 0 as the value of `rbx` to start. This is
        similar to `myarray[0], myarr[1], etc` .
-   **Base Pointer Mode** or **Displacement Mode**:
    -   _base_reg_ is provided.
    -   _value_ is a **fixed-offset** from the _base_reg_ both positive and negative are supported.
-   **Base Pointer Indexed Mode**:
    -   Uses all the fields of the general addressing mode
-   **Program Counter (PC) — relative addressing mode**

## Memory instructions

-   `mov[l/b/w/q] src, dst`_,_ here operands can be: immediate values, registers or memory addresses. But both
    the operands **cannot be** memory addresses (why ??). You need to store one in an intermediate register.
-   The initial assembly had **word** as **16-bits**, but as the architecture improved, we still the same
    naming convention, so now **32-bit** is called **double word or long** and **64-bit** is called **quad
    word**. In essence,
    -   Byte — 8-bit
    -   Word — 16-bit
    -   Double or Long — 32-bit
    -   Quad Word — 64-bit
-   `lea[b/w/l/q] src, dst`_,_ load-effective address
    -   It uses the general addressing format.
    -   It is better to use than `movq` to load addresses, since a person reading address may miss the `$`
        used to load the memory address, use of `lea` makes it more obvious.

## Blocks of memory

-   `movsq` uses the address stored in **rsi** register as the source (source index register) and copies the
    quad to the address specified in **rdi**. After the data is moved, **rsi** and **rdi** are **incremented**
    to the next memory location. If the **Direction Flag** is set, then the memory locations are
    **decremented**. This can be paired with `rep` instruction to perform this with the **rcx** as the
    counter. **This copying is very fast as multiple steps are packed in 1 instruction**.

```asm
.section .data
source:
    .quad 9, 23, 55, 1, 3
dest:
    .quad 0, 0, 0, 0, 0
.section .text
_start:
    movq $source, %rsi
    movq $dest, %rdi
		movq $3, %rcx
    rep movsq
```

-   `cmpsq` compares the quads at addresses pointed by **rsi** with **rdi** and sets the status flags
-   `rep` variants like `repe` can be used to compare values continuously until a different value occurs or
    the counter ends. This is also fast for comparing large bytes.
-   To scan blocks of memory, we can use `scansq` , loads the value in **rdi** and compares with the value in
    **rax**, moves in the direction as dictated by the **direction flag**.

## Structs

-   Labels are also constants, so doing `labelA-labelB` , gives the number of bytes between them. This can be
    used to check the number of entries in an array : `(end-start)/ELEM_SIZE` .
-   You can use `.equ` to declare constants, remember to access the value of a constant you need
    `$CONST_LABLEL` , which is different from labels from `.data` section, for that you just use `DATA_LABEL`
    and omit the `$` .
