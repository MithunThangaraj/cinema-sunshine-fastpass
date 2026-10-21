# Cinema Sunshine Fastpass

Refresh a busy Cinema Sunshine booking page every 10 seconds. Stop when the seat map opens.

**[Get the script](cinema-retry.user.js)** · **[Setup & troubleshooting](docs/guide.md)** · **[My movies](WATCHED.md)**

## Get started

1. Install [Tampermonkey](https://www.tampermonkey.net/). In Chrome, open **Extensions → Tampermonkey → Details → Allow User Scripts**.
2. Open [the script as text](cinema-retry.txt), copy everything, and paste it into Tampermonkey → **Create a new script**. Save.
3. Log in on the [cinema website](https://www.cinemasunshine.co.jp/theater/gdcs/), open your screening's booking page, and click **Start retries** at the bottom right.

That's it. For a timed start, expand **Start at opening time**, enter the date and time in **JST**, then click Start. Keep the tab open and the computer awake.

It stops at seat selection and alerts you. Pick your seats and finish booking yourself. It pauses on recognised queues, login and verification screens, and stops after 30 minutes of retries. It cannot skip a queue or guarantee tickets. [Full guide](docs/guide.md#use-it)

## When booking opens

**moviegoer's CLUB costs ¥500 per year.** Join before the member sale starts.

| Your membership | Booking opens (Japan time) |
| --- | --- |
| Platinum | **3 days before, 20:30** — up to 2 tickets in the earliest window |
| Bronze / Gold | **3 days before, 21:00** |
| Non-member | **2 days before, 00:00** |

For a Friday show: Tuesday evening for members, Wednesday midnight for general sale. Special screenings may differ.

Platinum needs **6 eligible visits in the previous 3 months**. Gold needs 3–5, Bronze 0–2. Ranks update on the 1st of each month.

[Official membership rules](https://www.cinemasunshine.co.jp/pages/moviegoers-club/) · [Booking FAQ](https://www.cinemasunshine.co.jp/qa/) — checked 21 October 2026.

## Why Theatre 12?

Grand Cinema Sunshine Ikebukuro's IMAX GT screen can show the tall **1.43:1** image when a film supports it. The comparison below shows the extra picture area.

![Standard screen and IMAX with Laser image comparison](assets/imax-comparison-english.png)

Image: [Cinema Sunshine press release](https://prtimes.jp/main/html/rd/p/000000026.000006849.html). Japanese label replaced with English.

## Where to sit

**My pick for the most immersive experience: the centre of row H or J**, around seats **20–21**. The screen fills more of your view here. If you prefer seeing the whole frame with less looking up, try farther back.

![Theatre 12 seating chart](assets/theatre-12-seats.png)

Seat map from [eco's Theatre 12 guide](https://note.com/cinema_apple0520/n/n5c33d4e39519?hl=en), kept unchanged. The author's own favourite is row P; H/J is my immersion-first recommendation. This is a static reference; its shading is not live seat availability. Check the booking page before choosing.

## Keep track of your visits

Download or clone the repo, then run:

```bash
python3 tracker.py
```

Choose **Add a movie** and answer the questions: movie, date, time, cinema, screen, seat, format and notes. You can view, edit or delete entries from the same menu. Python 3 is required.

On Mac, you can also double-click **Open Movie Tracker.command** from the downloaded folder.

Your entries go into [data/watched.csv](data/watched.csv) and the readable [My movies table](WATCHED.md). Nothing syncs or uploads automatically. [Command-line options](docs/guide.md#movies-watched)

---

Related: [109 Cinemas Seat Sniper](https://github.com/MithunThangaraj/109Cinemas-Seat-Sniper). Independent personal project. The live congestion page still needs testing.
