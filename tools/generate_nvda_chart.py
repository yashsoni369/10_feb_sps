#!/usr/bin/env python3
"""
Fetch NVDA last-week prices, try Yahoo then stooq fallback, generate SVG/PNG.
Only plots the last 7 calendar days of data.
"""
import sys, time, datetime, csv
try:
    from urllib.request import urlopen, Request
except Exception:
    from urllib2 import urlopen, Request


def fetch_yahoo(symbol, period1, period2, interval='1d'):
    url = f"https://query1.finance.yahoo.com/v7/finance/download/{symbol}?period1={period1}&period2={period2}&interval={interval}&events=history&includeAdjustedClose=true"
    req = Request(url, headers={"User-Agent": "python-urllib"})
    with urlopen(req, timeout=15) as resp:
        return resp.read().decode('utf-8')


def parse_csv(data):
    reader = csv.DictReader(data.splitlines())
    rows = []
    for row in reader:
        if not row.get('Close') or row.get('Close').lower()=='null':
            continue
        try:
            dt = datetime.datetime.strptime(row['Date'], "%Y-%m-%d").date()
            close = float(row['Close'])
        except Exception:
            continue
        rows.append((dt, close))
    # sort ascending
    rows.sort()
    return rows


def try_matplotlib_plot(dates, closes, out_png, out_svg):
    try:
        import matplotlib
        matplotlib.use('Agg')
        import matplotlib.pyplot as plt
        import matplotlib.dates as mdates
    except Exception:
        return False
    plt.figure(figsize=(10,4))
    plt.plot(dates, closes, marker='o', linestyle='-', color='#1f77b4')
    plt.fill_between(dates, closes, [min(closes)]*len(closes), color='#1f77b4', alpha=0.08)
    plt.title('NVDA - Last Week Close Price')
    plt.ylabel('Price (USD)')
    plt.grid(alpha=0.3)
    plt.gca().xaxis.set_major_formatter(mdates.DateFormatter('%b %d'))
    plt.gcf().autofmt_xdate()
    plt.tight_layout()
    try:
        plt.savefig(out_png, dpi=150)
    except Exception:
        pass
    plt.savefig(out_svg)
    plt.close()
    return True


def simple_svg_plot(dates, closes, out_svg, width=1000, height=360):
    if not dates:
        raise ValueError('No data to plot')
    margin = 60
    w = width
    h = height
    minp = min(closes)
    maxp = max(closes)
    span = maxp - minp if maxp!=minp else 1.0
    def x_pos(i):
        return margin + (w-2*margin) * (i/(len(dates)-1 if len(dates)>1 else 1))
    def y_pos(val):
        return margin + (h-2*margin) * (1 - (val-minp)/span)
    points = [(x_pos(i), y_pos(closes[i])) for i in range(len(closes))]
    lines = []
    lines.append(f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}">')
    lines.append('<style>text{font-family:Arial,Helvetica,sans-serif;font-size:12px;fill:#222}</style>')
    lines.append(f'<rect x="0" y="0" width="{w}" height="{h}" fill="white"/>')
    lines.append(f'<line x1="{margin}" y1="{h-margin}" x2="{w-margin}" y2="{h-margin}" stroke="#ccc"/>')
    lines.append(f'<line x1="{margin}" y1="{margin}" x2="{margin}" y2="{h-margin}" stroke="#eee"/>')
    # grid and y labels
    for i in range(5):
        y = margin + (h-2*margin) * (i/4.0)
        val = maxp - (span)*(i/4.0)
        lines.append(f'<line x1="{margin}" y1="{y:.1f}" x2="{w-margin}" y2="{y:.1f}" stroke="#f5f5f5"/>')
        lines.append(f'<text x="{10}" y="{y+4:.1f}" fill="#666">{val:.2f}</text>')
    # polyline
    pts_str = ' '.join(f'{x:.1f},{y:.1f}' for x,y in points)
    lines.append(f'<polyline points="{pts_str}" fill="none" stroke="#1f77b4" stroke-width="2"/>')
    # area fill
    area_pts = pts_str + ' ' + f'{points[-1][0]:.1f},{h-margin:.1f} ' + f'{points[0][0]:.1f},{h-margin:.1f}'
    lines.append(f'<polygon points="{area_pts}" fill="#1f77b4" opacity="0.08"/>')
    # x labels
    for i,d in enumerate(dates):
        x = x_pos(i)
        lines.append(f'<text x="{x:.1f}" y="{h-10:.1f}" text-anchor="middle">{d.strftime("%b %d")}</text>')
    # title
    lines.append(f'<text x="{w/2:.1f}" y="20" text-anchor="middle" font-size="16">NVDA - Last Week Close Price</text>')
    lines.append('</svg>')
    with open(out_svg, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines))


def main():
    symbol = 'NVDA'
    now = int(time.time())
    week_ago = now - 7*24*3600
    week_ago_date = datetime.date.fromtimestamp(week_ago)
    period1 = week_ago
    period2 = now + 24*3600
    out_png = 'outputs/nvda_trend.png'
    out_svg = 'outputs/nvda_trend.svg'
    csv_text = None
    # try yahoo
    try:
        csv_text = fetch_yahoo(symbol, period1, period2)
    except Exception as e:
        print('Yahoo fetch failed:', e, file=sys.stderr)
    rows = []
    if csv_text:
        rows = parse_csv(csv_text)
    else:
        try:
            url = f"https://stooq.com/q/d/l/?s=nvda.us&i=d"
            req = Request(url, headers={"User-Agent": "python-urllib"})
            with urlopen(req, timeout=15) as resp:
                csv_text = resp.read().decode('utf-8')
            rows = parse_csv(csv_text)
        except Exception as e:
            print('Fallback fetch failed:', e, file=sys.stderr)
            rows = []
    # filter to last 7 calendar days (inclusive)
    filtered = [(d,p) for (d,p) in rows if d >= week_ago_date]
    if not filtered:
        # if nothing in last week, try to take the latest 7 rows
        filtered = rows[-7:]
    if not filtered:
        print('No data available to plot', file=sys.stderr)
        sys.exit(3)
    dates, closes = zip(*filtered)
    dates = list(dates)
    closes = list(closes)
    made_png = try_matplotlib_plot(dates, closes, out_png, out_svg)
    if not made_png:
        simple_svg_plot(dates, closes, out_svg)
    print('Wrote:', out_svg + (', ' + out_png if made_png else ''))

if __name__ == '__main__':
    main()
