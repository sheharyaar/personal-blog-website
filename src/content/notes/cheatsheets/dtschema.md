---
title: "DTSchema binding conversion to YAMLs"
summary: "Steps to write yamls for Devicetree bindings and test them, used for LFX Mentorship."
date: "May 08 2024"
draft: false
tags:
- Linux Kernel
---

### DTSchema YAMLs and deps

1. First convert a Devicetree '.txt' to yaml. Let's take my patch for example : https://lore.kernel.org/all/20240423115749.15786-1-sheharyaar48@gmail.com/

2. Check which architecture use the related drivers. In my patch the related drivers are (under the compatible) :
```diff
+  compatible:
+    const: nvidia,tegra20-ac97
```
3. Search the `dts` and `dtsi` files where `nvidia,tegra20-ac97` have been used. I use `rg` program ([Github link](https://github.com/BurntSushi/ripgrep)) instead of grep :
```shell
$ rg "nvidia,tegra20-ac97"
sound/soc/tegra/tegra20_ac97.c
441:	{ .compatible = "nvidia,tegra20-ac97", },

...

arch/arm/boot/dts/nvidia/tegra20.dtsi               --> this here is a 'dtsi' file
379:		compatible = "nvidia,tegra20-ac97";
```

The architecture for this dts file is `arm` (from the file path).

> dtsi files are included by other files, so we need to find those files as well

4. Search dts files associated with the dtsi files (if any) :
```bash
$ rg "tegra20.dtsi"

arch/arm/boot/dts/nvidia/tegra20-acer-a500-picasso.dts
9:#include "tegra20.dtsi"

arch/arm/boot/dts/nvidia/tegra20-asus-tf101.dts
9:#include "tegra20.dtsi"

...
```

You can see a lot of files refer to this `dtsi` file. All these files must build without errors for making a correct patch.

### Testing the binding

1. I have `x86_64` but I need to build for `arm`, so I need a cross-compiler. On Arch Linux, I need `aarch64-linux-gnu-gcc` package from AUR for this.

2. After installing the required compiler you need to do the following to cross-compile :
  1. First run : `make clean && make mrproper`
  2. Then run : `export CROSS_COMPILE=aarch64-linux-gnu- ARCH=arm KBUILD_OUTPUT=out/`. This configures `make` to cross compile for `arm` using `aarch64-linux-gnu-` we installed earlier and the output files will be in `out/` folder
  3. Now we need to make sure everything is clean and ready for the new arch, run : `make clean && make mrproper`
  4. Now we need a default config : `make defconfig`

3. Now we are ready to test our binding.

4. First we test our yaml file by :
```bash
# to test a single file
make clean && make -j8 dt_binding_check DT_SCHEMA_FILES=Documentation/devicetree/bindings/sound/nvidia,tegra30-i2s.yaml

# to test a directory
make clean && make dt_binding_check DT_SCHEMA_FILES=Documentation/devicetree/bindings/usb/
```
- I use `make clean` to be sure that my changes are being built. In the term `-j8` replace 8 with the number of threads your cpu has : `lscpu | egrep 'Model name|Socket|Thread|NUMA|CPU\(s\)'`
- Look at DT_SCHEMA_FILES, it should have the path of your yaml file : `DT_SCHEMA_FILES=<path to your yaml>`

5. Now we will test this yaml file against the **dtb** files which will be built using (**Don't run make clean** in the following commands) :
```bash
# to test against all the dtbs
$ make -j8 dtbs_check DT_SCHEMA_FILES=Documentation/devicetree/bindings/sound/nvidia,tegra30-i2s.yaml

# to test only against a directory (here : arch/arm/boot/aspeed)
$ make -j8 dtbs_check DT_SCHEMA_FILES=Documentation/devicetree/bindings/usb/usb-uhci.yaml arch/arm/boot/aspeed 
```

### General Tips
- Explain any new changes or if any variable you may have removed in the commit description
- Sometimes the dts and dtso files may have deprecated labels, you should fix them rather than modifying the yaml.
- Do not add too much examples in the yaml file, a single example is fine.
- Make sure to look around similar yamls for code inspiration and try to follow the pattern.
- When making patches make sure to read the **rules regarding commit message** from the kernel documentation.

### Resources

- A blog by Krzysztof Kozlowski (maintainer of devicetree bindings) : https://www.linaro.org/blog/tips-and-tricks-for-validating-devicetree-sources-with-the-devicetree-schema/
- A blog by Javier Carrasco : https://javiercarrascocruz.github.io/dt-bindings