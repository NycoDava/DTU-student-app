# Design notes (from Figma, file 5kXWqezL5KWUaOWy3VDNRx)

Work from these notes; do not re-read the frames.

## Shared frame chrome
- 393 x 852, white bg, 5px border `#9b0300` (DTU red), radius 30px. Implemented as `.app-shell` in `src/index.css`.
- Font: Inter (300 / 400 / 700).

## Splash — "open app" (2:8)
- Only the DTU logo image (`public/images/dtu-logo.png`, 540x383), shown at 370 x 263, centered (left 11, top 261).
- Behavior: visible 1 s, then `/login`. Must stay unchanged.

## Login — "log in" (217:1140)
- Column, gap 33px, top 33px, width 384 (inside the border).
  1. Campus photo (`public/images/login-campus.png`), full width, aspect 1191/717.
  2. DTU logo 370 x 142 (same image, cropped center, object-fit cover).
  3. Inputs 319 x 39, 1px black border, no radius; placeholder "User" / "Password", Inter Light 20 `#808080`, padding-left 14; vertical gap 12.
  4. Button "Access" 140 x 39, Inter Bold 20 white, Figma bg blue `#0988ff`.
  5. Help text Inter 12: "DTU Users Can change their password here" (link change_password),
     "Guest.dtu.dk users can change their password here" (link guest login), then bold block
     "Login in the format: / DTU Users: username@dtu.dk / DTU Students: username@dtu.dk / Guest.dtu.dk Users: username@win.dtu.dk".
- Deviations: button and links in DTU red; inputs/button 44px tall (touch target).
