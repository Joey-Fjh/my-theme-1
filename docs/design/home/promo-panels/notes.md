# Home `promo-bannder` redesign (batch 6-S9)

Local design inputs (images are Git-ignored): `desktop.png`, `mobile.png`, `reference-loiseau.png` (https://loiseau.framer.website/, the "Skin care" stacked panels).

Stacked full-screen panels, main image half / text half, alternating sides. Each panel sticks (`position: sticky; top: 0`) and the next one slides up over it. The main image eases from scale 1.2 to 1 in about 0.6s when its panel enters the viewport, and back to 1.2 when it leaves (in-view toggle, not scroll scrub). Mobile stacks image above text with no sticky stacking.
