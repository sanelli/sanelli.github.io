---
layout: post
title:  "👷‍♀️ Pretty Code string builder"
date:   2023-09-30 16:21:03 +0100
categories: projects csharp nuget
---
[PrettyCode.StringBuilder](https://github.com/sanelli/PrettyCode.StringBuilder) is String builder wrapper that helps in generating pretty code 💄.
Supported features are:
- Indentation;
- Curly braces code blocks;
- Pragma warning directive;
- Nullable directive;
- Region directive.

All code blocks introduced using the builder will be automatically
reverted to their original status using the `IDisposable`
pattern.

## Examples

### Indent blocks
```csharp
var builder = new PrettyCode.StringBuilder();
builder.AppendLine("def main():");
using (builder.Indent())
{
    builder.AppendLine("print('Hello world!')");
}

builder.AppendLine("# The function ended here!");
Console.WriteLine(builder.ToString());
```

Generated output:
```
def main():
   print('Hello world!')
# The function ended here!
```

### Curly braces block
```csharp
var builder = new PrettyCode.StringBuilder();
builder.AppendLine("struct cplusplus");
using (builder.CurlyBracesBlock(indent: false))
{
    builder.AppendLine("private:");
    builder.AppendLine("int foo;");
}

Console.WriteLine(builder.ToString());
```

Generated output:
```
struct cplusplus
{
private:
int foo;
}
```

### Pragma warning directive
```csharp
var builder = new PrettyCode.StringBuilder();
builder.AppendLine("try");
using (builder.CurlyBracesBlock())
{
    builder.AppendLine("/* Do something */");
}

builder.AppendLine("catch (Exception e)");
using (builder.PragmaWarningDirective("CA2200"))
using (builder.CurlyBracesBlock())
{
    builder.AppendLine("throw e;");
}

Console.WriteLine(builder.ToString());
```

Generated output:
```
try
{
   /* Do something */
}
catch (Exception e)
#pragma warning disable CA2200
{
   throw e;
}
#pragma warning restore CA2200
```

### Nullable directive
```csharp
var builder = new PrettyCode.StringBuilder();
using (builder.NullableDirective())
{
    builder.AppendLine("int? foo = null;");
}

Console.WriteLine(builder.ToString());
```

Generated output:
```
#nullable enable
int? foo = null;
#nullable restore
```

### Region directive
```csharp
var builder = new PrettyCode.StringBuilder();
using (builder.RegionDirective("My class"))
{
    builder.AppendLine("class MyClass { }");
}

Console.WriteLine(builder.ToString());
```

Generated output:
```
#region My class
class MyClass { }
#endregion // My class
```