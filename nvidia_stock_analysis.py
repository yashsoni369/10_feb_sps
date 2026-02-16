#!/usr/bin/env python3
"""
NVIDIA (NVDA) Stock Trend Analysis - Last Week (Feb 9-13, 2026)
Generates multiple chart images and a comprehensive PDF report.
"""

import pandas as pd
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
import matplotlib.ticker as mticker
import mplfinance as mpf
import seaborn as sns
from datetime import datetime
from reportlab.lib.pagesizes import letter, landscape
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Image, Spacer, Paragraph, Table, TableStyle, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.colors import HexColor, black, white
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from PIL import Image as PILImage
import os

OUTPUT_DIR = "/vercel/sandbox/nvidia_charts"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# ─── NVIDIA Stock Data: Feb 9–13, 2026 ───
data = {
    'Date': ['2026-02-09', '2026-02-10', '2026-02-11', '2026-02-12', '2026-02-13'],
    'Open':   [184.26, 191.38, 192.45, 193.03, 187.48],
    'High':   [193.66, 192.48, 193.26, 193.61, 187.50],
    'Low':    [183.95, 188.12, 188.77, 186.51, 181.59],
    'Close':  [190.04, 188.54, 190.05, 186.94, 182.81],
    'Volume': [196387400, 136764800, 144192700, 189932500, 161647400],
}

df = pd.DataFrame(data)
df['Date'] = pd.to_datetime(df['Date'])
df.set_index('Date', inplace=True)
df['Change%'] = df['Close'].pct_change() * 100
df['DayLabel'] = ['Mon\nFeb 9', 'Tue\nFeb 10', 'Wed\nFeb 11', 'Thu\nFeb 12', 'Fri\nFeb 13']

# Color palette
NVIDIA_GREEN = '#76B900'
DARK_BG = '#1a1a2e'
CARD_BG = '#16213e'
ACCENT_1 = '#0f3460'
ACCENT_2 = '#e94560'
TEXT_COLOR = '#e0e0e0'
GRID_COLOR = '#2a2a4a'
UP_COLOR = '#00e676'
DOWN_COLOR = '#ff1744'

print("=" * 60)
print("  NVIDIA (NVDA) Stock Trend - Week of Feb 9-13, 2026")
print("=" * 60)
print(f"\n  Weekly Open:  ${df['Open'].iloc[0]:.2f}")
print(f"  Weekly Close: ${df['Close'].iloc[-1]:.2f}")
print(f"  Weekly High:  ${df['High'].max():.2f}")
print(f"  Weekly Low:   ${df['Low'].min():.2f}")
net_change = ((df['Close'].iloc[-1] - df['Close'].iloc[0]) / df['Close'].iloc[0]) * 100
print(f"  Net Change:   {net_change:+.2f}%")
print(f"  Total Volume: {df['Volume'].sum():,.0f}")
print("=" * 60)


# ═══════════════════════════════════════════════════════════
# CHART 1: Closing Price Trend Line
# ═══════════════════════════════════════════════════════════
def create_closing_price_chart():
    fig, ax = plt.subplots(figsize=(14, 7), facecolor=DARK_BG)
    ax.set_facecolor(DARK_BG)

    dates = range(len(df))
    closes = df['Close'].values
    labels = df['DayLabel'].values

    # Gradient fill under the line
    ax.fill_between(dates, closes, min(closes) - 1, alpha=0.15, color=NVIDIA_GREEN)
    ax.plot(dates, closes, color=NVIDIA_GREEN, linewidth=3.5, marker='o',
            markersize=12, markerfacecolor='white', markeredgecolor=NVIDIA_GREEN,
            markeredgewidth=2.5, zorder=5)

    # Annotate each point
    for i, (x, y) in enumerate(zip(dates, closes)):
        change = df['Change%'].iloc[i]
        color = UP_COLOR if (pd.isna(change) or change >= 0) else DOWN_COLOR
        change_text = f"{change:+.2f}%" if not pd.isna(change) else ""
        ax.annotate(f'${y:.2f}\n{change_text}',
                    xy=(x, y), xytext=(0, 25),
                    textcoords='offset points', ha='center', va='bottom',
                    fontsize=11, fontweight='bold', color=color,
                    bbox=dict(boxstyle='round,pad=0.4', facecolor=CARD_BG,
                              edgecolor=color, alpha=0.9))

    ax.set_xticks(dates)
    ax.set_xticklabels(labels, fontsize=11, color=TEXT_COLOR)
    ax.set_ylabel('Closing Price (USD)', fontsize=13, color=TEXT_COLOR, fontweight='bold')
    ax.set_title('NVIDIA (NVDA) — Closing Price Trend\nWeek of Feb 9–13, 2026',
                 fontsize=18, color='white', fontweight='bold', pad=20)

    ax.yaxis.set_major_formatter(mticker.FormatStrFormatter('$%.2f'))
    ax.tick_params(axis='y', colors=TEXT_COLOR, labelsize=11)
    ax.grid(True, alpha=0.2, color=GRID_COLOR, linestyle='--')
    ax.set_xlim(-0.5, len(dates) - 0.5)
    ax.set_ylim(min(closes) - 2, max(closes) + 4)

    # Add weekly summary box
    summary = (f"Weekly: ${df['Open'].iloc[0]:.2f} → ${df['Close'].iloc[-1]:.2f}  "
               f"({net_change:+.2f}%)  |  High: ${df['High'].max():.2f}  |  Low: ${df['Low'].min():.2f}")
    fig.text(0.5, 0.02, summary, ha='center', fontsize=11, color=NVIDIA_GREEN,
             fontweight='bold', style='italic',
             bbox=dict(boxstyle='round,pad=0.5', facecolor=CARD_BG, edgecolor=NVIDIA_GREEN, alpha=0.8))

    plt.tight_layout(rect=[0, 0.06, 1, 1])
    path = os.path.join(OUTPUT_DIR, "01_closing_price_trend.png")
    fig.savefig(path, dpi=300, bbox_inches='tight', facecolor=DARK_BG)
    plt.close(fig)
    print(f"  ✓ Saved: {path}")
    return path


# ═══════════════════════════════════════════════════════════
# CHART 2: Candlestick Chart (OHLC)
# ═══════════════════════════════════════════════════════════
def create_candlestick_chart():
    mc = mpf.make_marketcolors(
        up=UP_COLOR, down=DOWN_COLOR,
        edge={'up': UP_COLOR, 'down': DOWN_COLOR},
        wick={'up': UP_COLOR, 'down': DOWN_COLOR},
        volume={'up': UP_COLOR, 'down': DOWN_COLOR},
    )
    s = mpf.make_mpf_style(
        marketcolors=mc,
        facecolor=DARK_BG,
        edgecolor=GRID_COLOR,
        gridcolor=GRID_COLOR,
        gridstyle='--',
        gridaxis='both',
        y_on_right=False,
        rc={
            'axes.labelcolor': TEXT_COLOR,
            'xtick.color': TEXT_COLOR,
            'ytick.color': TEXT_COLOR,
            'font.size': 11,
        }
    )

    fig, axes = mpf.plot(
        df, type='candle', style=s, volume=True,
        title='\nNVIDIA (NVDA) — Candlestick Chart\nWeek of Feb 9–13, 2026',
        ylabel='Price (USD)',
        ylabel_lower='Volume',
        figsize=(14, 8),
        returnfig=True,
        tight_layout=True,
    )

    axes[0].set_title('NVIDIA (NVDA) — Candlestick Chart\nWeek of Feb 9–13, 2026',
                       fontsize=18, color='white', fontweight='bold', pad=15)

    path = os.path.join(OUTPUT_DIR, "02_candlestick_chart.png")
    fig.savefig(path, dpi=300, bbox_inches='tight', facecolor=DARK_BG)
    plt.close(fig)
    print(f"  ✓ Saved: {path}")
    return path


# ═══════════════════════════════════════════════════════════
# CHART 3: Volume Bar Chart
# ═══════════════════════════════════════════════════════════
def create_volume_chart():
    fig, ax = plt.subplots(figsize=(14, 7), facecolor=DARK_BG)
    ax.set_facecolor(DARK_BG)

    dates = range(len(df))
    volumes = df['Volume'].values / 1e6  # in millions
    labels = df['DayLabel'].values
    changes = df['Change%'].values
    colors = [UP_COLOR if (pd.isna(c) or c >= 0) else DOWN_COLOR for c in changes]

    bars = ax.bar(dates, volumes, color=colors, width=0.6, edgecolor='white',
                  linewidth=0.8, alpha=0.85, zorder=3)

    # Add value labels on bars
    for i, (bar, vol) in enumerate(zip(bars, volumes)):
        ax.text(bar.get_x() + bar.get_width() / 2, bar.get_height() + 2,
                f'{vol:.1f}M', ha='center', va='bottom',
                fontsize=12, fontweight='bold', color='white')

    avg_vol = np.mean(volumes)
    ax.axhline(y=avg_vol, color=NVIDIA_GREEN, linestyle='--', linewidth=2, alpha=0.7, zorder=2)
    ax.text(len(dates) - 0.5, avg_vol + 1.5, f'Avg: {avg_vol:.1f}M',
            fontsize=11, color=NVIDIA_GREEN, fontweight='bold', ha='right')

    ax.set_xticks(dates)
    ax.set_xticklabels(labels, fontsize=11, color=TEXT_COLOR)
    ax.set_ylabel('Volume (Millions)', fontsize=13, color=TEXT_COLOR, fontweight='bold')
    ax.set_title('NVIDIA (NVDA) — Daily Trading Volume\nWeek of Feb 9–13, 2026',
                 fontsize=18, color='white', fontweight='bold', pad=20)
    ax.tick_params(axis='y', colors=TEXT_COLOR, labelsize=11)
    ax.grid(True, axis='y', alpha=0.2, color=GRID_COLOR, linestyle='--')
    ax.set_ylim(0, max(volumes) + 25)

    plt.tight_layout()
    path = os.path.join(OUTPUT_DIR, "03_volume_chart.png")
    fig.savefig(path, dpi=300, bbox_inches='tight', facecolor=DARK_BG)
    plt.close(fig)
    print(f"  ✓ Saved: {path}")
    return path


# ═══════════════════════════════════════════════════════════
# CHART 4: Price Range (High-Low) with Open/Close markers
# ═══════════════════════════════════════════════════════════
def create_price_range_chart():
    fig, ax = plt.subplots(figsize=(14, 7), facecolor=DARK_BG)
    ax.set_facecolor(DARK_BG)

    dates = range(len(df))
    labels = df['DayLabel'].values

    for i in dates:
        high = df['High'].iloc[i]
        low = df['Low'].iloc[i]
        opn = df['Open'].iloc[i]
        close = df['Close'].iloc[i]
        color = UP_COLOR if close >= opn else DOWN_COLOR

        # High-Low range bar
        ax.plot([i, i], [low, high], color=color, linewidth=6, alpha=0.4, solid_capstyle='round')
        # Open-Close thicker bar
        ax.plot([i, i], [min(opn, close), max(opn, close)], color=color, linewidth=14,
                alpha=0.7, solid_capstyle='round')
        # Open marker
        ax.plot(i - 0.15, opn, 's', color='white', markersize=8, zorder=5)
        # Close marker
        ax.plot(i + 0.15, close, 'D', color=NVIDIA_GREEN, markersize=8, zorder=5)

        # Annotate range
        spread = high - low
        ax.text(i, high + 0.5, f'${high:.2f}', ha='center', va='bottom',
                fontsize=9, color=TEXT_COLOR, fontweight='bold')
        ax.text(i, low - 0.5, f'${low:.2f}', ha='center', va='top',
                fontsize=9, color=TEXT_COLOR, fontweight='bold')
        ax.text(i + 0.35, (high + low) / 2, f'Δ${spread:.2f}', ha='left', va='center',
                fontsize=9, color=color, fontweight='bold', alpha=0.8)

    ax.set_xticks(dates)
    ax.set_xticklabels(labels, fontsize=11, color=TEXT_COLOR)
    ax.set_ylabel('Price (USD)', fontsize=13, color=TEXT_COLOR, fontweight='bold')
    ax.set_title('NVIDIA (NVDA) — Daily Price Range (High-Low)\nWeek of Feb 9–13, 2026',
                 fontsize=18, color='white', fontweight='bold', pad=20)
    ax.yaxis.set_major_formatter(mticker.FormatStrFormatter('$%.2f'))
    ax.tick_params(axis='y', colors=TEXT_COLOR, labelsize=11)
    ax.grid(True, alpha=0.2, color=GRID_COLOR, linestyle='--')

    # Legend
    from matplotlib.lines import Line2D
    legend_elements = [
        Line2D([0], [0], marker='s', color='w', markerfacecolor='white', markersize=8, label='Open', linestyle='None'),
        Line2D([0], [0], marker='D', color='w', markerfacecolor=NVIDIA_GREEN, markersize=8, label='Close', linestyle='None'),
        Line2D([0], [0], color=UP_COLOR, linewidth=4, alpha=0.7, label='Bullish Day'),
        Line2D([0], [0], color=DOWN_COLOR, linewidth=4, alpha=0.7, label='Bearish Day'),
    ]
    ax.legend(handles=legend_elements, loc='upper right', fontsize=10,
              facecolor=CARD_BG, edgecolor=GRID_COLOR, labelcolor=TEXT_COLOR)

    ax.set_xlim(-0.6, len(dates) - 0.4)
    plt.tight_layout()
    path = os.path.join(OUTPUT_DIR, "04_price_range_chart.png")
    fig.savefig(path, dpi=300, bbox_inches='tight', facecolor=DARK_BG)
    plt.close(fig)
    print(f"  ✓ Saved: {path}")
    return path


# ═══════════════════════════════════════════════════════════
# CHART 5: Daily Returns Bar Chart
# ═══════════════════════════════════════════════════════════
def create_daily_returns_chart():
    fig, ax = plt.subplots(figsize=(14, 7), facecolor=DARK_BG)
    ax.set_facecolor(DARK_BG)

    # Calculate daily returns from previous close
    daily_changes = [2.50, -0.79, 0.80, -1.64, -2.21]  # from web search data
    labels = ['Mon\nFeb 9', 'Tue\nFeb 10', 'Wed\nFeb 11', 'Thu\nFeb 12', 'Fri\nFeb 13']
    colors = [UP_COLOR if c >= 0 else DOWN_COLOR for c in daily_changes]

    bars = ax.bar(range(len(daily_changes)), daily_changes, color=colors, width=0.55,
                  edgecolor='white', linewidth=0.8, alpha=0.85, zorder=3)

    for i, (bar, val) in enumerate(zip(bars, daily_changes)):
        y_pos = bar.get_height() + 0.08 if val >= 0 else bar.get_height() - 0.08
        va = 'bottom' if val >= 0 else 'top'
        ax.text(bar.get_x() + bar.get_width() / 2, y_pos,
                f'{val:+.2f}%', ha='center', va=va,
                fontsize=13, fontweight='bold', color='white')

    ax.axhline(y=0, color='white', linewidth=1, alpha=0.5)
    ax.set_xticks(range(len(labels)))
    ax.set_xticklabels(labels, fontsize=11, color=TEXT_COLOR)
    ax.set_ylabel('Daily Change (%)', fontsize=13, color=TEXT_COLOR, fontweight='bold')
    ax.set_title('NVIDIA (NVDA) — Daily Returns\nWeek of Feb 9–13, 2026',
                 fontsize=18, color='white', fontweight='bold', pad=20)
    ax.tick_params(axis='y', colors=TEXT_COLOR, labelsize=11)
    ax.grid(True, axis='y', alpha=0.2, color=GRID_COLOR, linestyle='--')

    # Net weekly return annotation
    net = sum(daily_changes)
    fig.text(0.5, 0.02, f'Net Weekly Return: {net_change:+.2f}%',
             ha='center', fontsize=13, color=DOWN_COLOR, fontweight='bold',
             bbox=dict(boxstyle='round,pad=0.5', facecolor=CARD_BG, edgecolor=DOWN_COLOR, alpha=0.8))

    plt.tight_layout(rect=[0, 0.06, 1, 1])
    path = os.path.join(OUTPUT_DIR, "05_daily_returns.png")
    fig.savefig(path, dpi=300, bbox_inches='tight', facecolor=DARK_BG)
    plt.close(fig)
    print(f"  ✓ Saved: {path}")
    return path


# ═══════════════════════════════════════════════════════════
# CHART 6: Comprehensive Dashboard (Multi-panel)
# ═══════════════════════════════════════════════════════════
def create_dashboard():
    fig = plt.figure(figsize=(20, 14), facecolor=DARK_BG)
    fig.suptitle('NVIDIA (NVDA) — Weekly Stock Dashboard\nFeb 9–13, 2026',
                 fontsize=24, color='white', fontweight='bold', y=0.98)

    gs = fig.add_gridspec(2, 3, hspace=0.35, wspace=0.3,
                          left=0.06, right=0.97, top=0.91, bottom=0.06)

    dates = range(len(df))
    labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']

    # ── Panel 1: Closing Price ──
    ax1 = fig.add_subplot(gs[0, 0:2])
    ax1.set_facecolor(CARD_BG)
    ax1.fill_between(dates, df['Close'].values, min(df['Close']) - 1, alpha=0.15, color=NVIDIA_GREEN)
    ax1.plot(dates, df['Close'].values, color=NVIDIA_GREEN, linewidth=3, marker='o',
             markersize=10, markerfacecolor='white', markeredgecolor=NVIDIA_GREEN, markeredgewidth=2)
    for i, v in enumerate(df['Close'].values):
        ax1.annotate(f'${v:.2f}', (i, v), textcoords='offset points', xytext=(0, 14),
                     ha='center', fontsize=10, color='white', fontweight='bold')
    ax1.set_xticks(dates)
    ax1.set_xticklabels(labels, color=TEXT_COLOR, fontsize=10)
    ax1.set_title('Closing Price Trend', fontsize=14, color='white', fontweight='bold', pad=10)
    ax1.yaxis.set_major_formatter(mticker.FormatStrFormatter('$%.0f'))
    ax1.tick_params(colors=TEXT_COLOR)
    ax1.grid(True, alpha=0.15, color=GRID_COLOR, linestyle='--')

    # ── Panel 2: Weekly Stats ──
    ax2 = fig.add_subplot(gs[0, 2])
    ax2.set_facecolor(CARD_BG)
    ax2.axis('off')
    stats = [
        ('Open', f'${df["Open"].iloc[0]:.2f}'),
        ('Close', f'${df["Close"].iloc[-1]:.2f}'),
        ('High', f'${df["High"].max():.2f}'),
        ('Low', f'${df["Low"].min():.2f}'),
        ('Avg Vol', f'{df["Volume"].mean()/1e6:.1f}M'),
        ('Net Chg', f'{net_change:+.2f}%'),
    ]
    ax2.set_title('Weekly Summary', fontsize=14, color='white', fontweight='bold', pad=10)
    for i, (label, value) in enumerate(stats):
        y = 0.88 - i * 0.155
        color = DOWN_COLOR if 'Chg' in label and net_change < 0 else NVIDIA_GREEN
        ax2.text(0.1, y, label, fontsize=13, color=TEXT_COLOR, fontweight='bold',
                 transform=ax2.transAxes)
        ax2.text(0.9, y, value, fontsize=14, color=color, fontweight='bold',
                 transform=ax2.transAxes, ha='right')
        if i < len(stats) - 1:
            ax2.plot([0.05, 0.95], [y - 0.06, y - 0.06], color=GRID_COLOR,
                     linewidth=0.5, transform=ax2.transAxes, clip_on=False)

    # ── Panel 3: Volume ──
    ax3 = fig.add_subplot(gs[1, 0])
    ax3.set_facecolor(CARD_BG)
    volumes = df['Volume'].values / 1e6
    daily_changes = [2.50, -0.79, 0.80, -1.64, -2.21]
    colors = [UP_COLOR if c >= 0 else DOWN_COLOR for c in daily_changes]
    ax3.bar(dates, volumes, color=colors, width=0.55, alpha=0.85, edgecolor='white', linewidth=0.5)
    for i, v in enumerate(volumes):
        ax3.text(i, v + 2, f'{v:.0f}M', ha='center', fontsize=9, color='white', fontweight='bold')
    ax3.set_xticks(dates)
    ax3.set_xticklabels(labels, color=TEXT_COLOR, fontsize=10)
    ax3.set_title('Trading Volume', fontsize=14, color='white', fontweight='bold', pad=10)
    ax3.tick_params(colors=TEXT_COLOR)
    ax3.grid(True, axis='y', alpha=0.15, color=GRID_COLOR, linestyle='--')

    # ── Panel 4: Daily Returns ──
    ax4 = fig.add_subplot(gs[1, 1])
    ax4.set_facecolor(CARD_BG)
    colors_ret = [UP_COLOR if c >= 0 else DOWN_COLOR for c in daily_changes]
    ax4.bar(dates, daily_changes, color=colors_ret, width=0.55, alpha=0.85,
            edgecolor='white', linewidth=0.5)
    for i, v in enumerate(daily_changes):
        y_pos = v + 0.08 if v >= 0 else v - 0.08
        va = 'bottom' if v >= 0 else 'top'
        ax4.text(i, y_pos, f'{v:+.2f}%', ha='center', va=va,
                 fontsize=10, color='white', fontweight='bold')
    ax4.axhline(y=0, color='white', linewidth=0.8, alpha=0.5)
    ax4.set_xticks(dates)
    ax4.set_xticklabels(labels, color=TEXT_COLOR, fontsize=10)
    ax4.set_title('Daily Returns (%)', fontsize=14, color='white', fontweight='bold', pad=10)
    ax4.tick_params(colors=TEXT_COLOR)
    ax4.grid(True, axis='y', alpha=0.15, color=GRID_COLOR, linestyle='--')

    # ── Panel 5: Intraday Range ──
    ax5 = fig.add_subplot(gs[1, 2])
    ax5.set_facecolor(CARD_BG)
    for i in dates:
        high = df['High'].iloc[i]
        low = df['Low'].iloc[i]
        opn = df['Open'].iloc[i]
        close = df['Close'].iloc[i]
        color = UP_COLOR if close >= opn else DOWN_COLOR
        ax5.plot([i, i], [low, high], color=color, linewidth=4, alpha=0.4, solid_capstyle='round')
        ax5.plot([i, i], [min(opn, close), max(opn, close)], color=color, linewidth=10,
                 alpha=0.7, solid_capstyle='round')
    ax5.set_xticks(dates)
    ax5.set_xticklabels(labels, color=TEXT_COLOR, fontsize=10)
    ax5.set_title('Price Range (OHLC)', fontsize=14, color='white', fontweight='bold', pad=10)
    ax5.yaxis.set_major_formatter(mticker.FormatStrFormatter('$%.0f'))
    ax5.tick_params(colors=TEXT_COLOR)
    ax5.grid(True, alpha=0.15, color=GRID_COLOR, linestyle='--')

    path = os.path.join(OUTPUT_DIR, "06_dashboard.png")
    fig.savefig(path, dpi=300, bbox_inches='tight', facecolor=DARK_BG)
    plt.close(fig)
    print(f"  ✓ Saved: {path}")
    return path


# ═══════════════════════════════════════════════════════════
# PDF REPORT
# ═══════════════════════════════════════════════════════════
def create_pdf_report(chart_paths):
    pdf_path = os.path.join(OUTPUT_DIR, "NVIDIA_NVDA_Weekly_Report_Feb9-13_2026.pdf")
    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=landscape(letter),
        topMargin=0.5 * inch,
        bottomMargin=0.5 * inch,
        leftMargin=0.5 * inch,
        rightMargin=0.5 * inch,
    )

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'CustomTitle', parent=styles['Title'],
        fontSize=28, textColor=HexColor('#76B900'),
        spaceAfter=6, alignment=TA_CENTER,
        fontName='Helvetica-Bold',
    )
    subtitle_style = ParagraphStyle(
        'CustomSubtitle', parent=styles['Normal'],
        fontSize=14, textColor=HexColor('#888888'),
        spaceAfter=20, alignment=TA_CENTER,
    )
    section_style = ParagraphStyle(
        'SectionTitle', parent=styles['Heading2'],
        fontSize=16, textColor=HexColor('#76B900'),
        spaceBefore=10, spaceAfter=8, alignment=TA_LEFT,
        fontName='Helvetica-Bold',
    )

    elements = []

    # Title page
    elements.append(Spacer(1, 1.5 * inch))
    elements.append(Paragraph("NVIDIA (NVDA)", title_style))
    elements.append(Paragraph("Weekly Stock Trend Report", subtitle_style))
    elements.append(Paragraph("February 9 – 13, 2026", subtitle_style))
    elements.append(Spacer(1, 0.5 * inch))

    # Summary table
    table_data = [
        ['Metric', 'Value'],
        ['Weekly Open', f'${df["Open"].iloc[0]:.2f}'],
        ['Weekly Close', f'${df["Close"].iloc[-1]:.2f}'],
        ['Weekly High', f'${df["High"].max():.2f}'],
        ['Weekly Low', f'${df["Low"].min():.2f}'],
        ['Net Change', f'{net_change:+.2f}%'],
        ['Total Volume', f'{df["Volume"].sum():,.0f}'],
        ['Avg Daily Volume', f'{df["Volume"].mean():,.0f}'],
    ]
    table = Table(table_data, colWidths=[2.5 * inch, 2.5 * inch])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), HexColor('#76B900')),
        ('TEXTCOLOR', (0, 0), (-1, 0), white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 13),
        ('BACKGROUND', (0, 1), (-1, -1), HexColor('#f8f9fa')),
        ('TEXTCOLOR', (0, 1), (-1, -1), black),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 12),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('GRID', (0, 0), (-1, -1), 0.5, HexColor('#dee2e6')),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [HexColor('#ffffff'), HexColor('#f1f3f5')]),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ]))
    elements.append(table)
    elements.append(PageBreak())

    # Chart pages
    chart_titles = [
        "Closing Price Trend",
        "Candlestick Chart (OHLC with Volume)",
        "Daily Trading Volume",
        "Daily Price Range (High-Low)",
        "Daily Returns (%)",
        "Comprehensive Weekly Dashboard",
    ]

    page_width = landscape(letter)[0] - 1 * inch
    page_height = landscape(letter)[1] - 2 * inch

    for i, (chart_path, title) in enumerate(zip(chart_paths, chart_titles)):
        elements.append(Paragraph(title, section_style))
        elements.append(Spacer(1, 0.1 * inch))

        img = PILImage.open(chart_path)
        img_w, img_h = img.size
        aspect = img_h / img_w

        display_w = page_width
        display_h = display_w * aspect
        if display_h > page_height:
            display_h = page_height
            display_w = display_h / aspect

        elements.append(Image(chart_path, width=display_w, height=display_h))

        if i < len(chart_paths) - 1:
            elements.append(PageBreak())

    # Footer
    elements.append(Spacer(1, 0.3 * inch))
    footer_style = ParagraphStyle(
        'Footer', parent=styles['Normal'],
        fontSize=9, textColor=HexColor('#999999'),
        alignment=TA_CENTER,
    )
    elements.append(Paragraph(
        f"Generated on {datetime.now().strftime('%B %d, %Y at %H:%M')} | "
        "Data sources: Yahoo Finance, Investing.com, StockAnalysis.com",
        footer_style
    ))

    doc.build(elements)
    print(f"  ✓ Saved: {pdf_path}")
    return pdf_path


# ═══════════════════════════════════════════════════════════
# MAIN EXECUTION
# ═══════════════════════════════════════════════════════════
if __name__ == '__main__':
    print("\nGenerating charts...")
    chart_paths = []

    chart_paths.append(create_closing_price_chart())
    chart_paths.append(create_candlestick_chart())
    chart_paths.append(create_volume_chart())
    chart_paths.append(create_price_range_chart())
    chart_paths.append(create_daily_returns_chart())
    chart_paths.append(create_dashboard())

    print("\nGenerating PDF report...")
    pdf_path = create_pdf_report(chart_paths)

    print("\n" + "=" * 60)
    print("  ALL FILES GENERATED SUCCESSFULLY!")
    print("=" * 60)
    print(f"\n  Output directory: {OUTPUT_DIR}/")
    print(f"  Charts: {len(chart_paths)} PNG images (300 DPI)")
    print(f"  Report: {os.path.basename(pdf_path)}")
    print("\n  Files:")
    for f in sorted(os.listdir(OUTPUT_DIR)):
        fpath = os.path.join(OUTPUT_DIR, f)
        size_kb = os.path.getsize(fpath) / 1024
        print(f"    • {f} ({size_kb:.1f} KB)")
    print()
