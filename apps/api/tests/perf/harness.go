package perf

import (
	"os"
	"strconv"
	"testing"
	"time"

	vegeta "github.com/tsenart/vegeta/v12/lib"
)

func RequirePerf(t *testing.T) {
	t.Helper()
	if os.Getenv("PERF") != "1" {
		t.Skip("set PERF=1 to run perf tests")
	}
}

func Rate() vegeta.Rate {
	n, err := strconv.Atoi(os.Getenv("PERF_RATE"))
	if err != nil || n <= 0 {
		n = 10
	}
	return vegeta.Rate{Freq: n, Per: time.Second}
}

func Duration() time.Duration {
	s := os.Getenv("PERF_DURATION")
	if s == "" {
		s = "10s"
	}
	d, err := time.ParseDuration(s)
	if err != nil || d <= 0 {
		d = 10 * time.Second
	}
	return d
}

type Thresholds struct {
	MaxErrorRate float64
	MaxP95       time.Duration
	MaxP99       time.Duration
}

func Attack(t *testing.T, name string, tgt vegeta.Targeter, th Thresholds) vegeta.Metrics {
	t.Helper()
	attacker := vegeta.NewAttacker(vegeta.Timeout(30 * time.Second))
	var metrics vegeta.Metrics
	for res := range attacker.Attack(tgt, Rate(), Duration(), name) {
		metrics.Add(res)
	}
	metrics.Close()

	errRate := 1 - metrics.Success
	t.Logf("[%s] hits=%d rate=%.1f/s p95=%s p99=%s success=%.2f%% err=%.2f%%",
		name, metrics.Requests, metrics.Rate,
		metrics.Latencies.P95, metrics.Latencies.P99,
		metrics.Success*100, errRate*100)

	if th.MaxErrorRate > 0 && errRate > th.MaxErrorRate {
		t.Errorf("[%s] error rate %.2f%% exceeds max %.2f%%", name, errRate*100, th.MaxErrorRate*100)
	}
	if th.MaxP95 > 0 && metrics.Latencies.P95 > th.MaxP95 {
		t.Errorf("[%s] p95 %s exceeds max %s", name, metrics.Latencies.P95, th.MaxP95)
	}
	if th.MaxP99 > 0 && metrics.Latencies.P99 > th.MaxP99 {
		t.Errorf("[%s] p99 %s exceeds max %s", name, metrics.Latencies.P99, th.MaxP99)
	}
	return metrics
}
