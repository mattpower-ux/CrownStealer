# Rulers and Gladiators Implementation Plan

Goal: Individual palace leaders respond to Praise, Threaten, Attack and Bribe, and every town has an accessible arena. Some rulers sentence the character to ten gladiator victories before returning equipment and freedom.

Architecture: Pure ruler profiles in ruler-personalities.js feed castle actions. gladiator-arena.js owns sentence, loan equipment, opponents, victory/recovery and save validation. Engine integrates lifecycle hooks. Existing town entry and combat UI are reused, with a focused arena panel and map building.

Constraints: Preserve player saves and stable town entrances. Keep existing King quest reports and Princess dialogue. No APK builds. Deploy through GitHub/Render and verify exact sources. No Sites.

- [x] Ruler tests first: all12 personal response profiles, interaction range, bribe affordability/cost, no repeated reward farming, guard aggression and imprisonment callbacks.
- [x] Arena tests first: imprisonment captures equipment without loss, town arena entry,10 actual victories, defeat returns to holding cell, save/reload at each phase, escape paths cannot bypass sentence, restoration once only.
- [x] Per user followup, qualifying basic leather/nonmagical weapon ten-fight run grants permanent +2 Strength and +2 Dexterity; test eligibility, persistence, actual base stats and reward once.
- [x] Every town arena reachable without blocking old entrances. Visible building and panel with win count, equipment terms, next opponent and freedom/perk progress. Browser-check actual interactions and restored inventory.
- [x] Generate/bundle arena art, register modules/assets in offline cache, increment web release/cache only.
- [x] Full test suite, build site, focused review, commit/push main, exact live verification, offline update check.

Review focus: involuntary death/flee/teleports, unique/cursed charged gear restoration, save roundtrip during combat, repeated callbacks/reward exploits, governor/King and town-entry regressions.

User additions: first-person illustrated arena combat backdrop /assets/gladiator-ring.webp; stepping directly onto library books automatically opens cover/title READ or IGNORE, with dismissal until leaving/reentering the tile.

Latest scope additions: realistic chest atlas with correct row crops; exacttile ROB/LEAVEIT lock roll scaling with treasure; guards JUST VISITING/IGNORE/ATTACK with saved8second consultation and movementprovokedduel; trophies smaller on interiorfoyerwall; fixMothbridge casino's invisible west collisionoverhang. Optimizeall113WebP assets with unchanged dimensions/alpha.

Main story supersedes prior royal trials: bring500gold; courier toSaltChoir(region2),return; Dragonstone fromFiredrakebottom,return; defeatBalrogatBottomlessPitbottom,return; fourchoicesmarriage/farmer/captain/hero. Hero remainsplayable, monstersflee noreward andpeoplebow/refusedialogue. Legacyactivecampaign migration preservesitems andprisonescapes. Currentquest andUI hints must match; testeachstage/evidence/gates andallendings.

Final correction: no royal seal or hero gate exemptions. Forward borders require both relics of the preceding region or a riding dragon. Optional border guard fights and tiny form no longer bypass. Offshore boat travel retains boat requirement; dragon can fly across. Public character label Other preserves existing internal saved identity. Final full suite:550passed.
