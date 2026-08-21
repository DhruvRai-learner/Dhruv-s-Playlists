# LMC 8.4 R18 XML — POCO M3 Pro 5G (camellia / camellian)

Hand-tuned configs for **Hasli LMC 8.4 R18 / R18F1** on the **POCO M3 Pro 5G** (same hardware as Redmi Note 10 5G / Note 10T 5G).

There is no universal “best” GCam XML. These two files are built around this phone’s real limits (OV48B + Dimensity 700, no OIS, no Hexagon DSP) instead of copying a Snapdragon flagship config and hoping it sticks.

| File | Use it when |
| --- | --- |
| `LMC8.4_R18_PocoM3Pro5G_Camellia_Quality_v1.0.xml` | **Default.** HDR+ Enhanced, Wiener merge, 12 frames. Best stills. |
| `LMC8.4_R18_PocoM3Pro5G_Camellia_Fast_v1.0.xml` | Kids / street / burst-like shooting. HDRnet, fewer frames, Merge 0. |

Load **Quality** first. Switch to **Fast** only if shutter lag bothers you.

---

## Phone this was built for

| | |
| --- | --- |
| Device | POCO M3 Pro 5G (`camellia` / `camellian`) |
| SoC | MediaTek Dimensity 700 (MT6833), Mali-G57 MC2 |
| RAM | 4 GB or 6 GB — frame counts are conservative so 4 GB survives |
| Main | **OmniVision OV48B** 48 MP, 1/2", 0.8 µm, Quad-Bayer, PDAF, ~26 mm f/1.8–f/1.79. **No OIS.** |
| Binned output | **12 MP (4000×3000)** — this is the quality mode. 4-in-1 binning → 1.6 µm effective pixels |
| Macro | 2 MP Hynix Hi-259, fixed ~4–5 cm — too weak for GCam, **disabled** |
| Depth | 2 MP GalaxyCore GC02M1B mono — not a photo camera, **disabled** |
| Front | **OmniVision OV8856** 8 MP, 1/4", 1.12 µm, f/2.0, fixed focus |
| Video hardware | **1080p @ 30 fps max** (not 4K) |

Stock MIUI on this sensor is smeary, oversaturated, and falls apart after sunset. GCam’s HDR+ merge is the actual upgrade. The 2 MP “triple camera” lenses are marketing; enabling them in LMC is a common crash source on camellia.

---

## Install (LMC 8.4 R18)

1. Use **LMC 8.4 R18F1** (Hasli). Package does not matter for the XML:
   - `LMC8.4_R18F1.apk` (`com.google.android.GoogleCameraLMCR18`) — usual choice
   - Snapcam / Aweme / Scan3D / Iris / Google Lens packages if the default package clashes with another GCam
2. Copy the XML to:

   ```
   Internal storage / LMC8.4 /
   ```

   Create the `LMC8.4` folder at the **root** of internal storage if LMC has not created it yet.
3. Open LMC → **double-tap the black area around the shutter** → pick the XML → OK.
4. If the viewfinder is black or Night Sight crashes, force-close LMC and load the XML again. Then read [Troubleshooting](#troubleshooting).

Configs from R15–R17 also load on R18. These files were authored against **R18** keys.

---

## What is actually tuned (and why)

### 1. 12 MP binned, not 48 MP
OV48B is Quad-Bayer. At 48 MP you get 0.8 µm pixels, huge files, and a Dimensity 700 that chokes. At 12 MP you get 1.6 µm effective pixels, real HDR+ alignment, and cleaner shadows. `pref_48m_key` is **off**. Upscaling is **off**.

### 2. MediaTek-safe processing
Copied Snapdragon XMLs often enable **Hexagon DSP**. This chip does not have it. Hexagon is **off**.

XDA reports for this device / family:

- `camera.cuttle.glpreview` **off** — Night Sight black screen / crash
- `camcorder.covec_video` **off** — video / timelapse / slo-mo crash
- Large YUV / GPU YUV flags **off** — buffer issues on MTK HAL

Operational modes (Pixel session IDs) stay at **0**. Forcing Pixel 6 sessions on Dimensity 700 is a classic green-image / crash path.

### 3. Frame counts the SoC can finish
No OIS + mid SoC = ghosting if you stack 20–27 frames like a Poco F3 config.

| Mode | Quality XML | Fast XML |
| --- | --- | --- |
| HDR+ Enhanced (main) | 12 | 9 |
| HDR+ Enhanced (front) | 9 | 7 |
| ZSL | 9 | 7 |
| Night Sight (main) | 12 | 10 |
| Astro | 6 | 6 |
| Merge | **1 (Wiener)** | **0** |
| HDR mode | Enhanced | HDRnet |

Hold the phone still for Night Sight. The sensor has no gyro-based optical path.

### 4. AWB and the MTK green/yellow tint
Built-in AWB **8 = IMX363 (Pixel 4 / 5)**. That is the most proven “Pixel colour” model for OV48B-class sensors in LMC/SGCam 8.4.

On top of that, per-lens colour coeffs:

- Main: G **0.96**, R **0.99**, B **1.02** (kills the Dimensity yellow-green, keeps sky from going cyan)
- Front: G **0.95**, R **0.97** (OV8856 runs warm)

Colour transform **14** (natural). Vivid profile uses **16**.

If faces look magenta, switch AWB in LMC → Processing to **IMX582** (same 48 MP 1/2" class as OV48B) or **Off** (HAL AWB).

### 5. Noise model
**System noise model (0)** — LMC 8.4 R14+ can read the HAL model. Inventing OV48B A/B coefficients without a measurement on *this* unit is how you get oil-paint skin. Libpatcher then does the real NR work:

- Slightly **more chroma NR** than luma (OV48B’s ugly artefact is coloured speckles in shadows, not luminance grain)
- **LUT noise fix 2.0** in Daily (4.0 ghosts on a non-OIS sensor)
- Night profile uses LUT **4.0** — for static scenes only

### 6. Sharpening that does not halo
OV48B + aggressive `sharpness_a = 1.75–2.0` (typical “DSLR XML”) makes halos on hair and foliage. Daily uses **1.3125** sharpness, **1.125** clarity. Detail is recovered from RAW merge, not from an unsharp mask.

### 7. Black level 64
OV48B is a 10-bit sensor. Black level **64** on all four RGGB planes. Dynamic black level **off** (it hunts on some MTK HALs).

### 8. Video capped at 1080p30
The ISP cannot do 4K. 4K / 60 fps / heavy EIS in GCam on this phone is a crash. Slo-mo, motion photos (Kepler), Micro video, and Catshark are **off**.

### 9. Cameras 0 + 1 only
IDs **0 = main**, **1 = front**. Macro/depth IDs are not in the list. If you really want the 2 MP macro, add ID `2` (sometimes `3` on custom ROMs) under *Additional cameras* and switch libpatcher to profile **3 Macro 2MP**.

---

## Libpatcher profiles

LMC starts on **profile 0** for the main lens and **profile 8** for the front camera.

Change profile: LMC settings → **Libpatcher** → profile list (or the on-screen profile button if you enable it).

| # | Name | When to use |
| --- | --- | --- |
| 0 | **Daily Natural** | Default. Accurate colour, moderate detail, no crunch. |
| 1 | **Night Sight** | After sunset, indoors dark. More NR, less sharpening, LUT 4. Hold still. |
| 2 | **Vivid Social** | Instagram / WhatsApp. Extra sat, contrast, a hint of vignette. |
| 3 | **Macro 2MP** | Only if you enable the macro ID. Heavy NR + sharpness on a 2 MP sensor. |
| 4 | **Portrait** | People. Mild skin NR, light vignette, restrained sat. |
| 5 | **Max Detail** | Tripod / bright daylight / textures. Lowest NR, highest clarity. |
| 6 | **Landscape Sky** | Blues and greens pushed, slightly stronger HDR. |
| 7 | **Indoor Mixed** | Tungsten + window. Stronger green-tint kill, more chroma NR. |
| 8 | **Selfie Natural** | Default front. OV8856 is noisy — NR up, sharpening down. |
| 9 | **Selfie Beauty** | Smoother skin. Not a FaceApp filter; it just blurs more. |
| 10 | **Document** | Whiteboard / paper. High contrast and edge sharpness, sat down. |
| 11 | **Leica Contrast** | Deeper blacks, vignette 0.375, flatter colour. |

---

## Recommended shooting

- **Daylight:** Quality XML, HDR+ Enhanced, profile 0. Tap to focus, half-press is not a thing — wait for the circle.
- **High contrast (sky + subject):** stay on Enhanced, do **not** expose for the sky only. HDR+ needs a mid-tone tap.
- **Night:** Night Sight, profile 1, brace against a wall. 12 frames × no OIS = blur if you pulse the phone.
- **Selfie:** flip camera (auto profile 8). Beauty is profile 9.
- **Fast action:** load the Fast XML or tap HDRnet in the R18 top bar.
- **Do not** enable 48 MP, 4K, or a random `.so` library unless you know it is for 8.4 on MTK.

JPEG quality is **97**. 100 only inflates size.

Antibanding is set to **50 Hz** (India / EU / most of Asia). If indoor lights band in the US, Japan, or other 60 Hz regions: Settings → Processing / Advanced → Antibanding → 60 Hz.

---

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| App crash on open / lens switch | Confirm only IDs 0 and 1 are enabled. Custom ROM users: IDs can differ — check with **Camera2 API Probe**. |
| Night Sight crash or black preview | `camera.cuttle.glpreview` is already off in this XML. Clear LMC app data, reload XML. |
| Video crash | Keep 1080p30. Do not enable 4K or slo-mo. |
| Green / yellow photos | Processing → AWB → try **IMX582**, then **Off**. Indoor mixed-light: profile 7. |
| Magenta faces | AWB Off, or lower blue coeff in libpatcher. |
| Oil-paint / plastic skin | You are on profile 9 or LUT 4 in daylight. Go back to profile 0. |
| Soft photos | Profile 5, good light, HDR+ Enhanced, hold still. Do not crank sharpness above ~1.6 on this sensor. |
| Slow shutter | Load Fast XML, or drop frames in Processing. 4 GB RAM will always be slower. |
| Front camera crash | Set picture size to whatever the HAL lists (sometimes 1920×1440, not 3264×2448). |
| Aux button does nothing | By design. Macro/depth are disabled. |

Developer flags in this XML that you should **not** re-enable on this phone: Hexagon, OIS, 48 MP, Kepler/motion photos, `camera.cuttle.glpreview`, `camcorder.covec_video`.

---

## How this compares to a random Telegram XML

Most “best XML” files for LMC are exported from **Snapdragon** phones (Poco F3, Realme 3 Pro, etc.): Hexagon on, 27 frames, sharpness 2.0, LUT 4 everywhere, UW/tele IDs, 4K, custom `gcastartup` libs you do not have.

This pack:

- Does not load a custom `.so`
- Does not spoof Pixel 6 hardware
- Does not enable lenses that are 2 MP depth/macro
- Uses system noise model + measured-style black level for OV48B
- Keeps LUT low in Daily because you have **no OIS**
- Caps video at what the ISP can record

Your existing personal XML is still worth keeping. If you like its colours more, steal only the AWB index and colour coeffs from it and leave the stability flags from this pack.

---

## Load path reminder

```
/sdcard/LMC8.4/LMC8.4_R18_PocoM3Pro5G_Camellia_Quality_v1.0.xml
```

Double-tap around the shutter. APK: Hasli **LMC8.4_R18F1**.
