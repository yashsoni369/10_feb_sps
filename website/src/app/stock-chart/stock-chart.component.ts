import { Component, OnInit } from '@angular/core';
import { StockService } from '../services/stock.service';

@Component({
  selector: 'app-stock-chart',
  templateUrl: './stock-chart.component.html',
  styleUrls: ['./stock-chart.component.scss']
})
export class StockChartComponent implements OnInit {
  stockData: any[] = [];
  chartImageUrl: string = '';
  loading: boolean = true;
  error: string = '';

  constructor(private stockService: StockService) { }

  ngOnInit(): void {
    this.loadStockData();
  }

  loadStockData(): void {
    this.loading = true;
    this.error = '';

    this.stockService.getNvidiaStockData().subscribe({
      next: (response) => {
        if (response.success) {
          this.stockData = response.data;
          this.chartImageUrl = this.stockService.getNvidiaChartImageUrl();
          this.loading = false;
        } else {
          this.error = response.message || 'Failed to load stock data';
          this.loading = false;
        }
      },
      error: (err) => {
        this.error = 'Error loading stock data. Please try again later.';
        this.loading = false;
        console.error('Error:', err);
      }
    });
  }

  refreshData(): void {
    this.loadStockData();
  }

  getPercentageChange(item: any): number {
    if (!item) return 0;
    const change = ((item.close - item.open) / item.open) * 100;
    return parseFloat(change.toFixed(2));
  }

  isPositiveChange(item: any): boolean {
    return this.getPercentageChange(item) >= 0;
  }

  downloadChart(): void {
    const link = document.createElement('a');
    link.href = this.chartImageUrl;
    link.download = 'nvidia-stock-chart.png';
    link.click();
  }
}
