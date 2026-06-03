- Change log
  - Added an option to sell cards.
  - Added question frequency algorithm that makes correctly answered questions appear less frequently.
 

- Collection pages
   - Add pages button (for N coins)
   - Add number of cards per page.
   - Cost for album pages

- Market
   - Add option to buy one 'daily' card.
   - Starter pack of ~10 cards.
   - Show a pop-up with definition of a new card?
   - Have a pack opening animation.

- Bugs
   - Rarity icon can be dragged out.
   - There is total exp calculation bug. Exp resets on refresh.
   - Purchase button for higher level pack is disabled on reload even if you have exact lvl.

- Code
   - Dealing with multiple instances of the game and LS saving. You can buy card in one window, then buy in another to pick the best rolls etc.
   - Move interval reward check to a separate method.

- Inspection
   - If card was inspected, add it to cards metadata. On placing card into inspector/on hover, show metadata.

- Game design
   - Create formulas as research quests. Add =, >, < signs.
   - Crate interactive physics problems that can be solved by rearranging variables mentioned in the problem.
   - Add rarity match bonuses.
   - Coins as draggable game objects.
   - Haradric cube.
   - Remove card name from card descriptions.
   - Resolve issue with inertia and newtons first law (similar descriptions).

- Research / Upgrade & progression system
   - Uses exp as currency. Exp gained for research completion.
   - Exp can be spent to affect the daily reward or available packs.
   - Sell album ui upgrades.
   - Automatically add new packs instead of data.js packs object.