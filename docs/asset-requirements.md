# Art direction and production asset requirements

## Current demo asset disclosure

The repository arrived without product images or 3D models. The current hero is a procedural Three.js **concept solitaire** built from parametric ring geometry, a faceted demonstration stone, PBR metal material and procedural environment lighting. It is a functional camera/scroll study, not a photographed or workshop-approved product. It does **not** claim 18K purity, a real diamond, a verified finish, a SKU, a weight, a certificate or availability. The catalog uses clearly labeled concept studies and non-production concept codes.

The collection archive uses original inline vector studies as low-weight editorial placeholders; they are not product photography. Replace them with approved media before product publication.

## Required assets before launch

### Featured ring CAD / real-time viewer

- Workshop-approved CAD or GLB for the exact ring; confirm band cross-section, setting, prong count, stone size/cut, dimensions and approved metal color.
- Deliver `.glb` with transforms applied, origin at the ring center, scale documented, sane topology, named meshes/materials, and no hidden parts. Keep an uncompressed source file outside the public web bundle.
- PBR base color/metalness/roughness/normal maps only when they represent the real surface; export optimized KTX2 textures and meshopt/Draco compression after visual QA.
- Real gemstone optical parameters or an approved product rendering strategy. Validate transparency/refraction on actual target GPUs; do not use a generic diamond shader as evidence of stone authenticity.
- Turntable or approved HDRI studio environment (licensed for redistribution), with highlights placed to describe—not conceal—the real geometry.
- Test the exact model against product photography and a physical sample at front, three-quarter, side and macro angles.

### Photography and sequence frames

- Approved macro photography for the real piece: front/three-quarter, side/setting, band profile, clasp/closure where applicable, scale/detail and packaging only if included in the sale.
- Color-managed master files with neutral reference, consistent lighting, accurate gemstone hue and a crop-safe subject. Supply sRGB web exports in AVIF/WebP plus a JPEG fallback and descriptive Persian/English alt text.
- If using a rendered scroll image sequence, render the exact approved CAD and camera path at 24–30 fps equivalent (typically 120–180 optimized frames for a long hero), test mobile decode cost, and retain a still fallback. No image sequence is present in this repository yet.

### Brand typography / identity

- Current Persian face: Vazirmatn Variable (open-source, locally bundled). Current English faces: Manrope Variable and Cormorant Garamond (open-source, locally bundled).
- Supply final TALA wordmark, approved Persian logotype, brand spacing rules, legal mark use and any additional licensed fonts if the brand commissions them.

## Visual acceptance gate

Do not publish a product until the business confirms exact metal purity, net weight, size range, color variants, stone details/certification if applicable, SKU, inventory, final images, product copy, price policy and return/care instructions. The current asset must remain labeled a concept until replaced.
