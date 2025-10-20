---
title: Assembler Directives
---

-   `.section`, `.ascii`, `.quad`, `.equ` are some common directives
-   `.string` is an alternative to .ascii, here it automatically appends the null byte. `.asciz` is a synonym
    for .string
-   `.skip`, `.space` and `.zero` are used to reserve space with zero or set values of bytes.
-   For 64-bit systems, speed is fast if access is done on addresses multiple of **8**. Some functions use
    vector instructions which require **16-byte (128-bit)** alignment.
    -   `.balign <num>` can align the **next instruction** to the requested number. By default, the spacing
        will be **zero** if you are in a **data section** or filled with the `nop` instruction if you are in a
        **code** section. You can also specify, via another parameter, what value to use in the skipped space.
    -   `.p2align` is similar to `.balign`, but takes in the number of bits used for alignment. So for 8
        bytes, it would `.p2align 3` since $2^3=8$.

### Section directives

-   `.text` and `.data` are very common, so you can omit `.section` for these.
-   `.rodata`, contains data that cannot be modified. Any attempt to modify these values will cause the
    program to abort.
-   `.bss` contains uninitialised data. You merely specify the size of the data using `.space` or `.zero`.
    This saves space in the executable. The OS initialises the bss segment variables to 0.

### Local and Global Values

-   `.lcomm` is a local directive (local to the file), that can help to initialise a **size** space with a
    given **label**: `.lcomm myvar, 8`, reserves space in the **.bss** section and sets _myvar_ to be the
    address of the start of this memory.
-   `.comm` is used for same purpose as `.lcomm` but it is available to other files as well.
-   `.external` helps you to document that a value is external and the GAS won’t give you error. By default
    any undefined values is treated as `.global` by GAS.

### Including other code

-   `.include "filename"` directly includes a file into the source code. Note that the included file should
    not contain any code or data that are marked as .globl, as that will cause problems when files are linked.
    Usually, included files don’t contain any code or data at all.
-   `.incbin "file"` directly includes a file as binary. Commonly used to embedded things like images, other
    binaries, bootloaders, fonts, etc.

### Annotating directive

-   `.type` lets the linker know what kind of symbol is, that is marked by `.globl`.

```asm
.globl myvar, myfunc
.type myvar, @object
.type myfunc, @function
```
