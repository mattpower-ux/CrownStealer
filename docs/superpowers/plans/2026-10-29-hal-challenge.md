# Hal 2000 challenge

Replace Hal's normal boss battle with a saved game choice: Blackjack, Trivial Pursuit, Ship Engineering. Both quiz choices provide original impossible questions and no correct offered answer. Failure deals exactly 500 damage and ejects the adventurer as a cube. Return to the landing site on the same alien planet; lethal damage uses normal defeat recovery without granting an unauthorized trip home.

Blackjack: no wager, shuffled unique cards, player must reach 17 to stand. Hal draws to 17; the first bust loses. If neither busts, deal another hand. Victory enters an explosion phase and grants existing boss loot once after the animation. Ordinary attacks and items cannot bypass the challenge.

1. Tests for choices, quiz loss, hit bust, Hal bust, no-bust redeal, save integrity and one-time rewards.
2. Isolated hal-challenge module, engine guard and save validation.
3. Landscape full-screen challenge UI, captions, questions/cards, panic shake/smoke/explosion and cube-ejection illustration. Optimize new raster assets.
4. Update old Hal combat tests to match replacement behavior; browser-test choices and animations in separate fixtures; deploy web build. No APK rebuild unless requested.
