'use client';

import React, { useEffect, useRef } from 'react';
import { createChart, ColorType, IChartApi, ISeriesApi } from 'lightweight-charts';

interface ChartProps {
  symbol: string;
  currentPrice: number;
}

export default function MT5Chart({ symbol, currentPrice }: ChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#12161c' },
        textColor: '#8899a6',
      },
      grid: {
        vertLines: { color: '#1a222d' },
        horzLines: { color: '#1a222d' },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderColor: '#263140',
      },
      rightPriceScale: {
        borderColor: '#263140',
      },
      crosshair: {
        vertLine: { color: '#4a5d78', width: 1, style: 2 },
        horzLine: { color: '#4a5d78', width: 1, style: 2 },
      },
    });

    const candleSeries = chart.addCandlestickSeries({
      upColor: '#2979ff',
      downColor: '#ff3b30',
      borderVisible: false,
      wickUpColor: '#2979ff',
      wickDownColor: '#ff3b30',
    });

    // Sentetik Geçmiş Mum Verisi Üretimi (30 Mum)
    const baseP = currentPrice || 25000;
    const initialData = [];
    const now = Math.floor(Date.now() / 1000) - 30 * 60;
    let p = baseP;

    for (let i = 0; i < 30; i++) {
      const time = (now + i * 60) as any;
      const variation = (Math.random() - 0.49) * (baseP * 0.002);
      const open = p;
      const close = p + variation;
      const high = Math.max(open, close) + Math.random() * (baseP * 0.001);
      const low = Math.min(open, close) - Math.random() * (baseP * 0.001);
      p = close;
      initialData.push({ time, open, high, low, close });
    }

    candleSeries.setData(initialData);

    chartRef.current = chart;
    seriesRef.current = candleSeries;

    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        });
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [symbol]);

  // Canlı fiyat değişiminde son mumu güncelle
  useEffect(() => {
    if (!seriesRef.current || !currentPrice) return;
    const now = (Math.floor(Date.now() / 1000)) as any;
    try {
      seriesRef.current.update({
        time: now,
        open: currentPrice,
        high: currentPrice + 0.5,
        low: currentPrice - 0.5,
        close: currentPrice,
      });
    } catch (e) {
      // time sequence toleransı
    }
  }, [currentPrice]);

  return <div ref={chartContainerRef} className="w-full h-full min-h-[300px]" />;
}
