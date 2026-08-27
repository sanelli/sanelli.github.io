---
layout: post
title:  "EML: compiling to C#, F#, VB, and .NET binaries"
date:   2026-08-27 22:00:00 +0100
categories: projects eml ada compiler interpreter
---

This post, and the work it describes, was done with [Cursor](https://cursor.com). A few days after I [wrote up the first version of eml]({% post_url 2026-08-22-EML-an-exp-minus-log-compiler-and-interpreter %}), the compiler can emit C#, F#, Visual Basic, and CIL, and it can ask the .NET SDK to turn generated C# into a DLL or a host-native executable.

The work landed in [`8e1b203`](https://github.com/sanelli/eml/commit/8e1b203edde6dda68b203a09e91e47d221554c29).

## What did not change

The front ends did not move. You still feed it `.mxeml`, `.teml`, `.eml`, or `.beml`, and everything still funnels into `IR_Eml.Node`. The Ada interpreter is the same `eml run` path, and the JavaScript and C emitters are still there. The new backends walk that tree the same way those two already did: nested `eml(...)` calls, no Flatten, no mxeml AST.

I also did not add an Alire crate. The compiler still has no third-party Ada libraries. When it needs to produce a DLL or a published executable, it locates `dotnet` on `PATH` and spawns it with `GNAT.OS_Lib`. If you only want source, or you only want to run the interpreter, you do not need .NET installed.

## Decisions

I dropped the old placeholder `-of cli` rather than pretending one flag could cover a whole family of languages. The spellings are the real ones: `csharp`, `fsharp`, `visualbasic`, `dotil`, and the library and binary variants. Unknown names, including `cli`, `cs`, `vb`, and `il`, stay invalid.

A few other locks, because they keep showing up in the CLI:

- **Numerics.** Generated code uses `System.Numerics.Complex`, with `eml(x, y) = Complex.Exp(x) - Complex.Log(y)`. Leaf `1` is `1+0i`. That is enough to compile, and it is not enough for every expression; more on that below.
- **Enclosing type.** C# and IL use `public static class Eml`. F# uses `module Eml`. Visual Basic uses `Public Module EmlModule`, because VB is case-insensitive and a type named `Eml` cannot sit next to a method named `eml`.
- **`--function-name` / `-fn`.** On the new formats this renames `Compute` (default `Compute`). JavaScript still defaults to `main`, and `clib` still defaults to `compute`. A name that matches `eml` or `Main` case-insensitively is rejected.
- **`--emit-eml` stays clib-only.** On .NET, `eml` is always public.
- **`--framework`.** Long form only, default `net8.0`, lowercase required. Programs accept `net8.0`, `net10.0`, and the same `net`+digits+`.0` shape. Libraries also accept `netstandard2.0` and `netstandard2.1`.
- **Companions.** With `-o`, C# / F# / VB also write a matching `.csproj` / `.fsproj` / `.vbproj` unless you pass `--no-companion-project`. IL has no project file. Stdout without `-o` is source only.
- **No F# / VB / IL DLLs in this round**, and no `ilasm` invocation. Those formats stop at text.

## Compile outputs

The earlier `beml`, `eml`, `js`, `c`, and `clib` targets are unchanged. The new `-of` values are:

| `-of` | `-o` extension | What you get |
|-------|----------------|----------------|
| `csharp` / `csharplib` | `.cs` | C# source: `public static class Eml`, nested `eml(...)`. The program form includes `Main`; the library form does not. Companion `.csproj` when `-o` is set. |
| `fsharp` / `fsharplib` | `.fs` | Same IR walk as C#, as `module Eml`. Companion `.fsproj` when `-o` is set. |
| `visualbasic` /<br>`visualbasiclib` | `.vb` | Same IR walk, as `Public Module EmlModule`. Companion `.vbproj` when `-o` is set. |
| `dotil` / `dotillib` | `.il` | IL text for `ilasm`. `.entrypoint` only on `dotil`. No project file. |
| `csharpdll` /<br>`csharplibdll` | `.dll` | Emit C# into a temp directory, run `dotnet build -c Release`, copy `Program.dll` to `-o`, then delete the temp tree. |
| `csharpexe` | `.exe` or none | Same temp-dir flow, then `dotnet publish` single-file and framework-dependent for the current OS/arch (`osx-arm64`, `linux-x64`, `win-x64`, and the other host RIDs). `-o` must end in `.exe` on Windows and must have no extension on Linux and macOS. The published apphost is copied to `-o`. |

**Generating a DLL or a native executable currently requires the .NET SDK.** `csharpdll`, `csharplibdll`, and `csharpexe` will not write an output file if `dotnet` is missing; they print a diagnostic that points at [https://dotnet.microsoft.com/](https://dotnet.microsoft.com/). Source formats do not need the SDK: you can emit `.cs`, `.fs`, `.vb`, or `.il` on a machine that has never seen `dotnet`. That split is deliberate. I wanted more languages out of the Ada compiler itself, and I did not want to pretend eml can link a .NET binary without Microsoft's toolchain.

Even with that dependency, the surface is now much wider than JavaScript and C. You get four extra source languages, two DLL shapes, and a host-native binary via `dotnet publish`. The native file is not LLVM machine code; it is a published .NET apphost for the machine you compiled on. True native lowering is still on the list.

DLL and exe formats also require `-o`. There is no useful stdout for a binary.

## Examples

The source in these snippets is [`samples/t01_e.teml`](https://github.com/sanelli/eml/blob/8e1b203edde6dda68b203a09e91e47d221554c29/samples/t01_e.teml): `eml(1, 1)`, which is *e* in the paper. I compiled it with `--no-logo` so stdout is only the generated file.

```powershell
./bin/eml --no-logo compile -i samples/t01_e.teml -of csharp
./bin/eml compile -i samples/t01_e.teml -of csharp -o e.cs
./bin/eml compile -i samples/t01_e.teml -of fsharp -o e.fs
./bin/eml compile -i samples/t01_e.teml -of visualbasic -o e.vb
./bin/eml --no-logo compile -i samples/t01_e.teml -of dotil
./bin/eml compile -i samples/t01_e.teml -of csharpdll -o e.dll
./bin/eml compile -i samples/t01_e.teml -of csharpexe -o e
```

On Windows the last one would be `-o e.exe`. The three source commands also write `e.csproj` / `e.fsproj` / `e.vbproj` beside the file unless you pass `--no-companion-project`. Without `-o`, C# / F# / VB go to stdout and no project file is written. The DLL and exe commands need `dotnet` on `PATH`.

C#:

```csharp
// Source: samples/t01_e.teml
// Compiler: eml
// Version: 0.1.0-dev
// Date: 2026-08-27 21:12:05 UTC

using System;
using System.Numerics;

public static class Eml
{
  public static Complex eml(Complex x, Complex y)
  {
    return Complex.Exp(x) - Complex.Log(y);
  }

  public static Complex Compute()
  {
    return eml(new Complex(1.0, 0.0), new Complex(1.0, 0.0));
  }

  public static int Main(string[] args)
  {
    Complex z = Compute();
    Console.WriteLine($"{z.Real}{z.Imaginary:+}i");
    return 0;
  }
}
```

F#:

```fsharp
// Source: samples/t01_e.teml
// Compiler: eml
// Version: 0.1.0-dev
// Date: 2026-08-27 21:12:20 UTC

open System
open System.Numerics

module Eml

let eml (x : Complex) (y : Complex) : Complex =
  Complex.Subtract(Complex.Exp x, Complex.Log y)

let Compute () : Complex =
  eml Complex(1.0, 0.0) Complex(1.0, 0.0)

[<EntryPoint>]
let main (_argv : string[]) : int =
  let z = Compute ()
  printfn $"%f%+.fi" z.Real z.Imaginary
  0
```

Visual Basic:

```vbnet
' Source: samples/t01_e.teml
' Compiler: eml
' Version: 0.1.0-dev
' Date: 2026-08-27 21:12:20 UTC

Imports System
Imports System.Numerics

Public Module EmlModule
  Public Shared Function eml(x As Complex, y As Complex) As Complex
    Return Complex.Subtract(Complex.Exp(x), Complex.Log(y))
  End Function

  Public Shared Function Compute() As Complex
    Return eml(New Complex(1.0, 0.0), New Complex(1.0, 0.0))
  End Function

  Public Sub Main()
    Dim z As Complex = Compute()
    Console.WriteLine($"{z.Real}{z.Imaginary:+}i")
  End Sub
End Module
```

IL (`-of dotil`):

```cil
// Source: samples/t01_e.teml
// Compiler: eml
// Version: 0.1.0-dev
// Date: 2026-08-27 21:19:22 UTC
// TargetFramework: net8.0

.assembly extern System.Runtime
{
  .publickeytoken = (B0 3F 5F 7F 11 D5 0A 3A )
  .ver 8:0:0:0
}
.assembly extern System.Runtime.Numerics
{
  .publickeytoken = (B0 3F 5F 7F 11 D5 0A 3A )
  .ver 8:0:0:0
}
.assembly extern System.Console
{
  .publickeytoken = (B0 3F 5F 7F 11 D5 0A 3A )
  .ver 8:0:0:0
}

.class public auto ansi abstract sealed Eml
       extends [System.Runtime]System.Object
{
  .method public hidebysig static valuetype [System.Runtime.Numerics]System.Numerics.Complex eml(valuetype [System.Runtime.Numerics]System.Numerics.Complex x, valuetype [System.Runtime.Numerics]System.Numerics.Complex y) cil managed
  {
    .maxstack 8
    ldarg.0
    call valuetype [System.Runtime.Numerics]System.Numerics.Complex [System.Runtime.Numerics]System.Numerics.Complex::Exp(valuetype [System.Runtime.Numerics]System.Numerics.Complex)
    ldarg.1
    call valuetype [System.Runtime.Numerics]System.Numerics.Complex [System.Runtime.Numerics]System.Numerics.Complex::Log(valuetype [System.Runtime.Numerics]System.Numerics.Complex)
    call valuetype [System.Runtime.Numerics]System.Numerics.Complex [System.Runtime.Numerics]System.Numerics.Complex::op_Subtraction(valuetype [System.Runtime.Numerics]System.Numerics.Complex, valuetype [System.Runtime.Numerics]System.Numerics.Complex)
    ret
  }

  .method public hidebysig static valuetype [System.Runtime.Numerics]System.Numerics.Complex Compute() cil managed
  {
    .maxstack 8
    ldc.r8 1.0
    ldc.r8 0.0
    newobj instance void [System.Runtime.Numerics]System.Numerics.Complex::.ctor(float64, float64)
    ldc.r8 1.0
    ldc.r8 0.0
    newobj instance void [System.Runtime.Numerics]System.Numerics.Complex::.ctor(float64, float64)
    call valuetype [System.Runtime.Numerics]System.Numerics.Complex Eml::eml(valuetype [System.Runtime.Numerics]System.Numerics.Complex, valuetype [System.Runtime.Numerics]System.Numerics.Complex)
    ret
  }

  .method public hidebysig static int32 Main(string[] args) cil managed
  {
    .entrypoint
    .maxstack 8
    call valuetype [System.Runtime.Numerics]System.Numerics.Complex Eml::Compute()
    pop
    ldc.i4.0
    ret
  }
}
```

Same IR tree in four languages: a public `eml`, a `Compute` that nests one call, and a program entry. C# / F# / VB `Main` prints the complex result; `dotil` emits `.entrypoint` on `Main`. The library `-of` variants omit that entry.

{% include eml-pipeline-dotnet.html %}

## What is still rough

Most of the results I have tried from the C# / F# / VB backends come back as `NaN+NaNi`. `System.Numerics.Complex` is `double`, and that is not enough for the intermediate infinities this operator produces. Ada's interpreter and the C backend, which use a wider float, cope better. The generated programs are structurally right; the type is too thin.

## Next

Still on the list, in roughly this order:

- Generate native code with an LLVM library, instead of shelling out to `dotnet publish`
- Generate Java and bytecode. Java has no native complex type, so that path will need an external library
- Extra parameters on C#, F#, Visual Basic, and the IL variants so you can point them at a different library or NuGet package with better complex support, instead of `System.Numerics.Complex`

The VS Code extension and `wat` / `wasm` targets from the earlier post are still sitting there too.

{% include made-with-cursor.html %}
