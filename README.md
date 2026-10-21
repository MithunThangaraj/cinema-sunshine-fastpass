# Cinema Sunshine Fastpass

A small browser script for getting into Cinema Sunshine bookings when the site is busy. It refreshes the current page every 10 seconds and stops when seat selection opens.

Made for [Grand Cinema Sunshine Ikebukuro](https://www.cinemasunshine.co.jp/theater/gdcs/). No movie, date or booking link is hardcoded. Related project: [109 Cinemas Seat Sniper](https://github.com/MithunThangaraj/109Cinemas-Seat-Sniper).

<img src="assets/grand-cinema-sunshine.png" alt="Grand Cinema Sunshine Ikebukuro building" width="420">

Building image from [Cinema Sunshine's official introduction](https://www.cinemasunshine.co.jp/pages/gdcs). © Cinema Sunshine. Used here as a theatre reference.

## Membership and booking times

The current membership is **moviegoer's CLUB**, which replaced Cinema Sunshine Rewards in February 2026. It costs **¥500 per year including tax**. Register online before trying the member booking window. [Official membership page](https://www.cinemasunshine.co.jp/pages/moviegoers-club/)

| Membership | Online booking opens, Japan time |
| --- | --- |
| Platinum | 3 days before the screening, **20:30** |
| Bronze / Gold | 3 days before the screening, **21:00** |
| Non-member | 2 days before the screening, **00:00** |

For a Friday screening, Platinum opens Tuesday at 20:30, Bronze/Gold Tuesday at 21:00, and general booking Wednesday at midnight. Some special screenings have different sale times. Check the screening notice. [Official booking FAQ](https://www.cinemasunshine.co.jp/qa/)

### How Platinum works

Ranks update on the **1st of each month**, based on eligible visits during the previous three months:

| Rank | Visits |
| --- | --- |
| Bronze | 0–2 |
| Gold | 3–5 |
| Platinum | 6 or more |

Platinum's 20:30 window has a **two-ticket limit**. Membership alone does not immediately give Platinum. The normal purchase limit is six tickets. Early access does not guarantee tickets. [Membership rules](https://www.cinemasunshine.co.jp/pages/moviegoers-club/) · [Ticket limits](https://www.cinemasunshine.co.jp/qa/)

Log in before purchasing so eligible visits count. Free reward tickets and invitation tickets do not count towards rank. All ranks get the Thursday ¥1,300 member price, three-point ¥1,300 coupons and six-point free tickets. IMAX, special seats and other premium formats can cost extra. [Benefits](https://www.cinemasunshine.co.jp/pages/moviegoers-club/) · [Extra charges](https://www.cinemasunshine.co.jp/qa/)

Rules checked on **21 October 2026**. Use the official pages for changes and screening exceptions.

## Install in Chrome

1. Install [Tampermonkey](https://www.tampermonkey.net/).
2. Open `chrome://extensions`, find Tampermonkey, open **Details**, and enable **Allow User Scripts**. If that option is missing, see [Tampermonkey's setup instructions](https://www.tampermonkey.net/faq.php#Q209).
3. In Tampermonkey, choose **Create a new script**.
4. Open [cinema-retry.user.js](cinema-retry.user.js), copy its contents, replace the editor contents and save with `Cmd+S` or `Ctrl+S`.
5. Reload your booking tab. The retry controls should appear at the bottom right on `transaction.ticket-cinemasunshine.com`.

If downloading JavaScript is awkward, [cinema-retry.txt](cinema-retry.txt) has exactly the same code.

## Use it

1. Log in normally, choose the cinema, movie, date and screening on the official site, and open its booking link.
2. On the transaction page, click **Start retries**. Leave the optional start time empty to retry immediately, every 10 seconds.
3. To wait for the opening time, enter its date and time first. This input always means **Japan time (JST)**, even if your computer uses another timezone. The first refresh is scheduled for that time, then every 10 seconds.
4. Keep the tab open and your computer awake. Click **Pause retries** whenever needed.
5. At `#/purchase/seat`, refreshing stops and the script requests a notification. Choose your seats and finish booking yourself.

The 30-minute limit starts at the chosen start time, or when you start immediately. A normal refresh keeps the run active in that tab. Closing the tab ends the run.

### When it pauses

- A recognised waiting-room or queue message tells you to wait.
- Login, verification, CAPTCHA or an expired-session message appears.
- The URL reaches another purchase step.
- You press Pause or the time limit expires.

Follow the page instructions when it pauses. After logging in again, return to the booking page and check the controls before restarting.

This refreshes an entry page. It cannot jump a queue or guarantee first place. It does not choose seats or pay. A browser network-error page cannot run the script, and changed routes or unfamiliar messages may need a script update. Notifications depend on browser permissions, and background tabs can delay timers.

The congestion-page behaviour has not been tested live. Local tests cover retry timing, reload persistence, scheduling and stop conditions. No full booking URL or member token is stored by the script.

## Movies watched

[My watch history](WATCHED.md)

The tracker saves the movie, date, time, cinema, screen, seat, format and notes. It is a personal log, entered manually after watching. It does not sync with your membership account or calculate your official rank.

With Python 3, run this from the repository folder (replace the example with your visit):

```bash
python3 tracker.py add --movie "Movie title" --date 2026-10-30 --time 19:00 --screen 12 --seat "N-20" --format "IMAX GT"
```

The cinema defaults to Grand Cinema Sunshine Ikebukuro. Use `--cinema` for another location, and `--notes` for anything you want to remember.

```bash
python3 tracker.py list
python3 tracker.py edit 1 --seat "N-21" --notes "Good view"
python3 tracker.py delete 1
```

Each change updates [data/watched.csv](data/watched.csv) and [WATCHED.md](WATCHED.md). You can also edit the CSV and run `python3 tracker.py export`. Nothing uploads automatically. Commit those two files when you want the log updated on GitHub.

## Checks

```bash
node --test tests/retry.test.cjs
python3 -m unittest discover -s tests
```

Independent personal helper, not affiliated with Cinema Sunshine. Follow the cinema's instructions and booking rules.
