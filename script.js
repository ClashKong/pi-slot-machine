document.addEventListener("DOMContentLoaded", async () => {
    const symbols = ["🍒", "🍋", "🍊", "🍉", "⭐"];
    const reels = [
        document.getElementById("reel1"),
        document.getElementById("reel2"),
        document.getElementById("reel3")
    ];
    const spinButton = document.getElementById("spin");
    const resultText = document.getElementById("result");
    const loginButton = document.getElementById("login-button");

    // 🔥 Pi Network SDK einbinden & initialisieren
    if (typeof Pi === "undefined") {
        console.error("❌ Pi SDK konnte nicht geladen werden!");
        return;
    }

    console.log("✅ Pi SDK erfolgreich geladen");

    try {
        await Pi.init({ version: "2.0" });
        console.log("✅ Pi SDK wurde erfolgreich initialisiert!");
    } catch (error) {
        console.error("❌ Fehler bei der Initialisierung des Pi SDK:", error);
    }

    const appId = "DEIN_APP_ID"; // Ersetze mit deiner App-ID von developers.minepi.com
    let user = null;

    // 🔹 Pi Wallet Login
    loginButton.addEventListener("click", async () => {
        console.log("🔹 Login-Button geklickt!");
        try {
            const scopes = ["payments"];
            user = await Pi.authenticate(scopes, appId, (result) => {
                console.log("🔹 Pi Authenticate Callback:", result);
            });

            if (user) {
                console.log("✅ Eingeloggt als:", user.user.uid);
                loginButton.textContent = `Eingeloggt als ${user.user.username}`;
                loginButton.disabled = true;
            } else {
                console.log("⚠️ Kein Authentifizierungs-Objekt erhalten.");
            }
        } catch (error) {
            console.error("❌ Login fehlgeschlagen:", error);
        }
    });

    // 🔥 Spin-Button Event
    spinButton.addEventListener("click", async () => {
        if (!user) {
            alert("Bitte zuerst mit der Pi Wallet anmelden!");
            return;
        }

        resultText.textContent = "🎰 Spinning...";
        spinButton.disabled = true;

        let spins = [0, 0, 0];

        // 🔹 Zahlung (1 Pi Einsatz)
        const betAmount = 1; 
        const betSuccess = await processPayment(betAmount, "Bet");

        if (!betSuccess) {
            resultText.textContent = "❌ Zahlung fehlgeschlagen!";
            spinButton.disabled = false;
            return;
        }

        console.log("💰 1 Pi Einsatz gezahlt - Spiel beginnt!");

        // 🔹 Animation mit Verzögerung für jede Rolle
        reels.forEach((reel, index) => {
            setTimeout(() => {
                let randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];
                reel.textContent = randomSymbol;
                spins[index] = randomSymbol;

                // Wenn alle Rollen gedreht haben, überprüfe das Ergebnis
                if (index === reels.length - 1) {
                    checkResult(spins);
                    spinButton.disabled = false;
                }
            }, (index + 1) * 500);
        });
    });

    // 🔹 Ergebnis prüfen und Gewinn auszahlen
    async function checkResult(spins) {
        if (spins[0] === spins[1] && spins[1] === spins[2]) {
            const winAmount = 3; // Gewinn: 3 Pi
            console.log("🎉 JACKPOT! Du gewinnst:", winAmount, "Pi");

            const winSuccess = await processPayment(winAmount, "Win");
            if (winSuccess) {
                resultText.textContent = `🎉 JACKPOT! ${winAmount} Pi gewonnen!`;
            } else {
                resultText.textContent = "❌ Auszahlung fehlgeschlagen!";
            }
        } else {
            resultText.textContent = "❌ Leider verloren, versuch es nochmal!";
        }
    }

    // 🔹 Zahlung über Pi Wallet abwickeln
    async function processPayment(amount, action) {
        try {
            const payment = await Pi.createPayment({
                amount: amount, 
                memo: `Slot Machine ${action}`,
                metadata: { reason: action },
                to_address: "DEINE_PI_WALLET_ADRESSE"  // Ersetze mit deiner Pi Wallet Adresse
            });

            console.log(`✅ Zahlung erfolgreich: ${payment.txid}`);
            return true;
        } catch (error) {
            console.error("❌ Zahlung fehlgeschlagen:", error);
            return false;
        }
    }
});
