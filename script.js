/**
 * Setup
 */
const debugEl = document.getElementById('debug'),
  balanceEl = document.getElementById('balance'), // Element pro zobrazení balancu
  winEl = document.getElementById('win'), // Element pro zobrazení celkových výher
  currentWinEl = document.getElementById('currentWin'), // Element pro zobrazení výhry z momentálního hodu
  iconMap = ["banán", "sedm", "třešeň", "pluma", "pomeranč", "zvon", "bar", "citron", "meloun"],
  icon_width = 79,
  icon_height = 79,
  num_icons = 9,
  time_per_icon = 100,
  indexes = [0, 0, 0],
  rollCost = 10,
  rollIntervalTime = 3000;

let rollInterval, balance = 100, win = 0, currentWin = 0, isSpinning = false;

/** 
 * Hozeni
 */
const roll = (reel, offset = 0) => {
  isSpinning = true; // Začni otáčení

  const delta = (offset + 2) * num_icons + Math.round(Math.random() * num_icons);

  return new Promise((resolve, reject) => {

    const style = getComputedStyle(reel),
      backgroundPositionY = parseFloat(style["background-position-y"]),
      targetBackgroundPositionY = backgroundPositionY + delta * icon_height,
      normTargetBackgroundPositionY = targetBackgroundPositionY % (num_icons * icon_height);

    setTimeout(() => {
      reel.style.transition = `background-position-y ${(8 + 1 * delta) * time_per_icon}ms cubic-bezier(.41,-0.01,.63,1.09)`;
      reel.style.backgroundPositionY = `${backgroundPositionY + delta * icon_height}px`;
    }, offset * 150);

    setTimeout(() => {
      reel.style.transition = `none`;
      reel.style.backgroundPositionY = `${normTargetBackgroundPositionY}px`;
      resolve(delta % num_icons);
    }, (8 + 1 * delta) * time_per_icon + offset * 150);

  });
};

/**
 * Hod všemi
 */
function rollAll() {
  if (!isSpinning) {
    clearInterval(rollInterval);

    // Ověřit, zda má hráč dostatek peněz pro hod
    if (balance >= rollCost) {
      balance -= rollCost;

      debugEl.textContent = 'točím...';

      const reelsList = document.querySelectorAll('.slots > .reel');

      Promise.all([...reelsList].map((reel, i) => roll(reel, i)))
        .then(deltas => {
          deltas.forEach((delta, i) => indexes[i] = (indexes[i] + delta) % num_icons);
          debugEl.textContent = indexes.map(i => iconMap[i]).join(' - ');

          // Výhry
          if (indexes[0] == indexes[1] && indexes[1] == indexes[2]) {
            const winCls = "win3";
            document.querySelector(".slots").classList.add(winCls);
            setTimeout(() => document.querySelector(".slots").classList.remove(winCls), 2000);

            const currentRoundWin = rollCost * 20; // Zdesetinásobit výhru
            currentWin = currentRoundWin; // Nastav výhru z aktuálního kola
            win += currentRoundWin;
            balance += currentRoundWin;
            updateBalanceAndWin();
          } else if (indexes[0] == indexes[1] || indexes[1] == indexes[2]) {
            const winCls = indexes[0] == indexes[2] ? "win2" : "win1";
            document.querySelector(".slots").classList.add(winCls);
            setTimeout(() => document.querySelector(".slots").classList.remove(winCls), 2000);

            const currentRoundWin = indexes[0] == indexes[2] ? rollCost * 2 : rollCost;
            currentWin = currentRoundWin * 4; // Nastav výhru z aktuálního kola
            win += currentRoundWin * 4;
            balance += currentRoundWin * 4;
            updateBalanceAndWin();
          } else {
            // Pokud není výhra, pouze aktualizuj balanc
            currentWin = 0; // Nastav výhru z aktuálního kola na 0
            updateBalanceAndWin();
          }

          isSpinning = false; // Skonči otáčení po dokončení hodu
        });
    } else {
      debugEl.textContent = 'Not enough balance for another roll!';
    }
  }
}

// Nastavit automatické házení každých rollIntervalTime ms
rollInterval = setInterval(rollAll, rollIntervalTime);

// Přidat posluchače pro tlačítko
const rollButton = document.getElementById('rollButton');
rollButton.addEventListener('click', () => {
  rollAll();
  updateBalanceAndWin();
});

// Funkce pro aktualizaci zobrazení balancu a výher
function updateBalanceAndWin() {
  balanceEl.textContent = `${balance} Kč`;
  winEl.textContent = `${win} Kč`;
  currentWinEl.textContent = `${currentWin} Kč`;
}
