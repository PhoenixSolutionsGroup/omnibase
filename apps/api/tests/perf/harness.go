package perf

import (
	"fmt"
	"os"
	"sort"
	"strconv"
	"strings"
	"testing"
	"time"

	vegeta "github.com/tsenart/vegeta/v12/lib"
)

type RampProfile struct {
	Rates   []int
	StepDur time.Duration
	StopAt  float64
}

func DefaultRamp() RampProfile {
	return RampProfile{
		Rates:   []int{10, 50, 100, 200, 500, 1000},
		StepDur: 10 * time.Second,
		StopAt:  0.10,
	}
}

type StressStep struct {
	TargetRate int
	ActualRate float64
	P50        time.Duration
	P95        time.Duration
	P99        time.Duration
	ErrRate    float64
	Requests   uint64
}

func Stress(t *testing.T, name string, tgt vegeta.Targeter, p RampProfile) []StressStep {
	t.Helper()
	if len(p.Rates) == 0 {
		p = DefaultRamp()
	}
	var steps []StressStep
	breakpointRate := 0
	baselineP95 := time.Duration(0)
	for _, rate := range p.Rates {
		attacker := vegeta.NewAttacker(vegeta.Timeout(30 * time.Second))
		r := vegeta.Rate{Freq: rate, Per: time.Second}
		var m vegeta.Metrics
		for res := range attacker.Attack(tgt, r, p.StepDur, name) {
			m.Add(res)
		}
		m.Close()
		step := StressStep{
			TargetRate: rate,
			ActualRate: m.Rate,
			P50:        m.Latencies.P50,
			P95:        m.Latencies.P95,
			P99:        m.Latencies.P99,
			ErrRate:    1 - m.Success,
			Requests:   m.Requests,
		}
		steps = append(steps, step)
		if baselineP95 == 0 {
			baselineP95 = step.P95
		}
		slowdown := ""
		if baselineP95 > 0 && step.P95 > baselineP95 {
			slowdown = " (" + timeRatio(step.P95, baselineP95) + " vs baseline)"
		}
		t.Logf("[%s] target=%4d/s actual=%6.1f/s p50=%-10s p95=%-10s%s p99=%-10s err=%6.2f%% %s",
			name, rate, step.ActualRate, step.P50, step.P95, slowdown, step.P99, step.ErrRate*100,
			formatStatusCodes(m.StatusCodes))
		if len(m.Errors) > 0 {
			t.Logf("[%s]   errors: %s", name, formatErrors(m.Errors))
		}
		if step.ErrRate > p.StopAt {
			breakpointRate = rate
			t.Logf("[%s] BREAKPOINT: %d req/s (err=%.2f%% > %.2f%%)", name, rate, step.ErrRate*100, p.StopAt*100)
			break
		}
	}
	if breakpointRate == 0 && len(steps) > 0 {
		last := steps[len(steps)-1]
		t.Logf("[%s] no breakpoint reached — sustained %d req/s (err=%.2f%%, p95=%s)",
			name, last.TargetRate, last.ErrRate*100, last.P95)
	}
	return steps
}

func formatStatusCodes(codes map[string]int) string {
	if len(codes) == 0 {
		return ""
	}
	type kv struct {
		k string
		v int
	}
	kvs := make([]kv, 0, len(codes))
	for k, v := range codes {
		kvs = append(kvs, kv{k, v})
	}
	sort.Slice(kvs, func(i, j int) bool { return kvs[i].v > kvs[j].v })
	var b strings.Builder
	b.WriteString("codes=[")
	for i, kv := range kvs {
		if i > 0 {
			b.WriteString(" ")
		}
		code := kv.k
		if code == "" {
			code = "0"
		}
		b.WriteString(code)
		b.WriteString(":")
		b.WriteString(strconv.Itoa(kv.v))
	}
	b.WriteString("]")
	return b.String()
}

func formatErrors(errs []string) string {
	const max = 3
	if len(errs) <= max {
		return strings.Join(errs, " | ")
	}
	return strings.Join(errs[:max], " | ") + fmt.Sprintf(" | +%d more", len(errs)-max)
}

func timeRatio(current, baseline time.Duration) string {
	if baseline == 0 {
		return "n/a"
	}
	ratio := float64(current) / float64(baseline)
	return strconv.FormatFloat(ratio, 'f', 1, 64) + "x"
}

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
