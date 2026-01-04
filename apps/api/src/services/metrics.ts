interface Metrics {
  requests: {
    total: number;
    byMethod: Record<string, number>;
    byStatus: Record<number, number>;
  };
  errors: {
    total: number;
    byType: Record<string, number>;
  };
  performance: {
    averageResponseTime: number;
    p95ResponseTime: number;
    p99ResponseTime: number;
  };
}

class MetricsCollector {
  private metrics: Metrics = {
    requests: {
      total: 0,
      byMethod: {},
      byStatus: {},
    },
    errors: {
      total: 0,
      byType: {},
    },
    performance: {
      averageResponseTime: 0,
      p95ResponseTime: 0,
      p99ResponseTime: 0,
    },
  };

  private responseTimes: number[] = [];

  recordRequest(method: string, statusCode: number, duration: number): void {
    this.metrics.requests.total++;
    this.metrics.requests.byMethod[method] =
      (this.metrics.requests.byMethod[method] || 0) + 1;
    this.metrics.requests.byStatus[statusCode] =
      (this.metrics.requests.byStatus[statusCode] || 0) + 1;

    this.responseTimes.push(duration);
    if (this.responseTimes.length > 1000) {
      this.responseTimes.shift(); // Keep only last 1000
    }

    this.updatePerformanceMetrics();
  }

  recordError(errorType: string): void {
    this.metrics.errors.total++;
    this.metrics.errors.byType[errorType] =
      (this.metrics.errors.byType[errorType] || 0) + 1;
  }

  private updatePerformanceMetrics(): void {
    if (this.responseTimes.length === 0) return;

    const sorted = [...this.responseTimes].sort((a, b) => a - b);
    const sum = sorted.reduce((a, b) => a + b, 0);

    this.metrics.performance.averageResponseTime = sum / sorted.length;
    this.metrics.performance.p95ResponseTime =
      sorted[Math.floor(sorted.length * 0.95)] || 0;
    this.metrics.performance.p99ResponseTime =
      sorted[Math.floor(sorted.length * 0.99)] || 0;
  }

  getMetrics(): Metrics {
    return JSON.parse(JSON.stringify(this.metrics)); // Deep clone
  }

  reset(): void {
    this.metrics = {
      requests: {
        total: 0,
        byMethod: {},
        byStatus: {},
      },
      errors: {
        total: 0,
        byType: {},
      },
      performance: {
        averageResponseTime: 0,
        p95ResponseTime: 0,
        p99ResponseTime: 0,
      },
    };
    this.responseTimes = [];
  }
}

export const metrics = new MetricsCollector();

